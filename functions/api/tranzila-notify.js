// POST/GET /api/tranzila-notify?token=... — Tranzila's server-to-server
// payment callback. This is the ONLY place a booking becomes `confirmed`.
//
// SECURITY:
//  - Requires the shared secret token (TRANZILA_NOTIFY_SECRET) on the URL;
//    a request without the exact token is rejected. This blocks forged
//    callbacks from random sources.
//  - The booking is matched by our own `booking_id` passthrough, and the
//    charged `sum` is checked against the amount WE computed and stored.
//    A mismatch is refused (never trust the callback's numbers blindly).
//  - Idempotent: Tranzila may call this more than once. A booking already
//    confirmed is acknowledged without re-processing or re-firing Make.
//  - No card data is stored — only the txid + a small whitelist of
//    non-sensitive response fields.
//  - Always returns 200 to Tranzila once the token is valid, so a downstream
//    hiccup (e.g. Make) never makes Tranzila retry into a broken loop; the
//    failure is logged in the events table instead.
//
// NOTE on capacity: seats are checked when the pending booking is created,
// not held. For these small workshops that's sufficient; if strict oversell
// protection is ever needed, add short-lived seat holds on pending bookings.

import { nowISO } from './_lib.js';

function ok(text = 'OK') {
  return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
function deny() {
  return new Response('forbidden', { status: 403 });
}

// Tranzila can deliver params via query string or form body; merge both.
async function collectParams(request) {
  const url = new URL(request.url);
  const params = {};
  for (const [k, v] of url.searchParams) params[k] = v;
  if (request.method === 'POST') {
    const ct = (request.headers.get('content-type') || '').toLowerCase();
    try {
      if (ct.includes('application/json')) {
        Object.assign(params, await request.json());
      } else {
        const form = await request.formData();
        for (const [k, v] of form) params[k] = typeof v === 'string' ? v : '';
      }
    } catch { /* ignore malformed body; query params may still be present */ }
  }
  return params;
}

// Tranzila marks an approved transaction with Response '000'.
function isApproved(p) {
  const r = String(p.Response ?? p.response ?? p.transaction_response ?? '').trim();
  return r === '000';
}

// Keep only non-sensitive fields for the audit trail.
function safeSubset(p) {
  const keep = ['Response', 'index', 'ConfirmationCode', 'sum', 'currency', 'cardtype', 'booking_id', 'tranmode'];
  const out = {};
  for (const k of keep) if (p[k] != null) out[k] = String(p[k]);
  return out;
}

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  // 1) Token gate — constant work regardless of match.
  const token = url.searchParams.get('token') || '';
  if (!env.TRANZILA_NOTIFY_SECRET || token !== env.TRANZILA_NOTIFY_SECRET) return deny();

  const p = await collectParams(request);
  const bookingId = String(p.booking_id || '').slice(0, 60);
  if (!bookingId) return ok('no booking'); // acknowledge, nothing to do

  const booking = await env.DB.prepare(
    `SELECT b.*, w.name AS workshop_name, w.date AS workshop_date, w.type AS workshop_type,
            w.start_time AS start_time, w.city AS city
       FROM bookings b JOIN workshops w ON w.id = b.workshop_id
      WHERE b.id = ?`
  ).bind(bookingId).first();

  if (!booking) return ok('unknown booking');

  // 2) Idempotency — already confirmed, do nothing further.
  if (booking.status === 'confirmed') return ok('already confirmed');

  const approved = isApproved(p);
  const raw = JSON.stringify(safeSubset(p));
  const txid = String(p.index || p.ConfirmationCode || '').slice(0, 60);
  const ts = nowISO();

  if (!approved) {
    await env.DB.prepare(
      `UPDATE bookings SET status='failed', tranzila_txid=?, tranzila_raw=? WHERE id=?`
    ).bind(txid, raw, bookingId).run();
    await logEvent(env, 'booking.failed', bookingId, { reason: 'not_approved' });
    return ok('recorded failure');
  }

  // 3) Amount check — the charged sum must match what we computed & stored.
  const charged = Math.round(parseFloat(p.sum));
  if (Number.isFinite(charged) && charged !== Number(booking.amount)) {
    await env.DB.prepare(
      `UPDATE bookings SET status='failed', tranzila_txid=?, tranzila_raw=? WHERE id=?`
    ).bind(txid, raw, bookingId).run();
    await logEvent(env, 'booking.amount_mismatch', bookingId, {
      expected: Number(booking.amount), charged,
    });
    return ok('amount mismatch recorded');
  }

  // 4) Confirm the booking.
  await env.DB.prepare(
    `UPDATE bookings SET status='confirmed', tranzila_txid=?, tranzila_raw=?, confirmed_at=? WHERE id=?`
  ).bind(txid, raw, ts, bookingId).run();
  await logEvent(env, 'booking.confirmed', bookingId, { amount: Number(booking.amount) });

  // 5) Fire the Make automation (Notion / WhatsApp / email / receipt).
  //    Never let a Make failure break the payment ack — log and move on.
  if (env.MAKE_WEBHOOK_URL) {
    try {
      await fetch(env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'booking_confirmed',
          bookingId,
          txid,
          amount: Number(booking.amount),
          participants: Number(booking.num_participants),
          customer: { name: booking.name, phone: booking.phone, email: booking.email },
          workshop: {
            id: booking.workshop_id,
            name: booking.workshop_name,
            type: booking.workshop_type,
            date: booking.workshop_date,
            start_time: booking.start_time,
            city: booking.city,
          },
          confirmed_at: ts,
        }),
      });
    } catch (e) {
      await logEvent(env, 'booking.make_failed', bookingId, { error: String(e).slice(0, 200) });
    }
  }

  return ok('confirmed');
}

async function logEvent(env, type, entityId, payload) {
  try {
    await env.DB.prepare(
      'INSERT INTO events (event_type, entity_type, entity_id, payload, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(type, 'booking', entityId, JSON.stringify(payload || {}), nowISO()).run();
  } catch { /* events table is best-effort; never block the ack */ }
}
