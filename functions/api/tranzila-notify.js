// POST/GET /api/tranzila-notify?token=... — Tranzila's server-to-server payment
// callback for the J5 flow. This is the ONLY place a booking is captured, voided
// or failed. The browser redirect is NOT trusted; only this verified notify is.
//
// STATE MACHINE (only this file advances a booking past `pending`):
//   pending --J5 approved--> authorized --seat ok--> confirmed  (FORCE = money captured)
//                                        --seat gone--> voided   (REVERSAL = hold released)
//            --J5 declined--> failed
//            --amount mismatch--> REVERSAL then failed
//   Transient claim states `capturing`/`voiding` guarantee FORCE/REVERSAL run
//   at most once even under duplicate/concurrent notifies (D1 serialises writes,
//   so the conditional UPDATE that sets the claim is an atomic mutex).
//
// SECURITY / SAFETY:
//   - Shared secret token required on the URL (blocks forged callbacks).
//   - Matched by our own booking_id; charged `sum` checked against the stored amount.
//   - PAN/CVV never touch us. We use only the card TOKEN + expiry that Tranzila
//     returns, which is what FORCE/REVERSAL require.
//   - Idempotent: duplicate/late/out-of-order notifies never double-capture,
//     double-void, or re-fire Make.
//   - Always returns 200 once the token is valid, so Tranzila's own retry loop
//     doesn't hammer us; unresolved cases are left for the reconcile job.

import { nowISO } from './_lib.js';
import { forceCapture, reversal, getTransactionByBookingId } from './_tranzila.js';

const CAP = 20;

function ok(text = 'OK') {
  return new Response(text, { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
function deny() { return new Response('forbidden', { status: 403 }); }

async function collectParams(request) {
  const url = new URL(request.url);
  const params = {};
  for (const [k, v] of url.searchParams) params[k] = v;
  if (request.method === 'POST') {
    const ct = (request.headers.get('content-type') || '').toLowerCase();
    try {
      if (ct.includes('application/json')) Object.assign(params, await request.json());
      else {
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

function safeSubset(p) {
  const keep = ['Response', 'index', 'transaction_id', 'ConfirmationCode', 'sum', 'currency',
    'cardtype', 'booking_id', 'tranmode', 'TranzilaTK', 'authorization_number'];
  const out = {};
  for (const k of keep) if (p[k] != null) out[k] = String(p[k]);
  return out;
}

// Everything FORCE/REVERSAL need: token + reference + authorization_number + expiry.
// Prefer the notify's own fields; fall back to the Reports API (queried by our
// booking_id) for anything the notify didn't include. Returns null if a required
// field still can't be obtained (then we leave the booking authorized for reconcile).
async function collectForceInputs(env, p, bookingId) {
  let token = p.TranzilaTK || p.token || '';
  let referenceTxnId = String(p.transaction_id || p.index || '');
  let authorizationNumber = String(p.authorization_number || p.auth_number || p.authnr || '');
  let expMonth = String(p.expmonth || p.exp_month || p.expire_month || '');
  let expYear = String(p.expyear || p.exp_year || p.expire_year || '');

  if (!token || !authorizationNumber || !expMonth || !expYear || !referenceTxnId) {
    const t = await getTransactionByBookingId(env, bookingId).catch(() => null);
    if (t) {
      token = token || t.credit_card_token || '';
      referenceTxnId = referenceTxnId || String(t.transaction_id || t.index || '');
      authorizationNumber = authorizationNumber || String(t.authorization_number || '');
      expMonth = expMonth || String(t.expiration_month || '');
      expYear = expYear || String(t.expiration_year || '');
    }
  }
  if (!token || !authorizationNumber || !expMonth || !expYear || !referenceTxnId) return null;
  return { token, referenceTxnId, authorizationNumber, expMonth, expYear };
}

// Seats consumed by *confirmed* bookings other than this one.
async function confirmedSeats(env, workshopId, exceptId) {
  const row = await env.DB.prepare(
    `SELECT COALESCE(SUM(num_participants),0) AS taken FROM bookings
       WHERE workshop_id=? AND status='confirmed' AND id<>?`
  ).bind(workshopId, exceptId).first();
  return Number(row && row.taken) || 0;
}

// Atomic claim: flip status only if it is still `from`. changes===1 => we own it.
async function claim(env, id, from, to) {
  const r = await env.DB.prepare('UPDATE bookings SET status=? WHERE id=? AND status=?')
    .bind(to, id, from).run();
  return Number(r && r.meta && r.meta.changes) > 0;
}

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  const token = url.searchParams.get('token') || '';
  if (!env.TRANZILA_NOTIFY_SECRET || token !== env.TRANZILA_NOTIFY_SECRET) return deny();

  const p = await collectParams(request);
  const bookingId = String(p.booking_id || '').slice(0, 60);
  if (!bookingId) return ok('no booking');

  const booking = await env.DB.prepare(
    `SELECT b.*, w.name AS workshop_name, w.date AS workshop_date, w.type AS workshop_type,
            w.start_time AS start_time, w.city AS city
       FROM bookings b JOIN workshops w ON w.id = b.workshop_id
      WHERE b.id = ?`
  ).bind(bookingId).first();
  if (!booking) return ok('unknown booking');

  // Idempotency: terminal states are done.
  if (['confirmed', 'voided', 'failed', 'refunded', 'expired'].includes(booking.status)) {
    return ok(`already ${booking.status}`);
  }

  const raw = JSON.stringify(safeSubset(p));
  const ts = nowISO();

  // --- Declined J5 -> failed. ---
  if (!isApproved(p)) {
    const txid = String(p.transaction_id || p.index || '');
    await env.DB.prepare("UPDATE bookings SET status='failed', tranzila_txid=?, tranzila_raw=? WHERE id=? AND status IN ('pending','authorized')")
      .bind(txid, raw, bookingId).run();
    await logEvent(env, 'booking.failed', bookingId, { reason: 'not_approved' });
    return ok('recorded failure');
  }

  // --- Amount check: the held sum must equal what we computed. ---
  const charged = Math.round(parseFloat(p.sum));
  if (Number.isFinite(charged) && charged !== Number(booking.amount)) {
    // A wrong amount was authorized — release it and fail. (Best-effort reversal.)
    const inputs = await collectForceInputs(env, p, bookingId).catch(() => null);
    if (inputs) await reversal(env, inputs).catch(() => {});
    await env.DB.prepare("UPDATE bookings SET status='failed', tranzila_raw=? WHERE id=? AND status IN ('pending','authorized')")
      .bind(raw, bookingId).run();
    await logEvent(env, 'booking.amount_mismatch', bookingId, { expected: Number(booking.amount), charged });
    return ok('amount mismatch recorded');
  }

  // --- Gather the fields FORCE/REVERSAL need (notify first, Reports API fallback). ---
  const inputs = await collectForceInputs(env, p, bookingId).catch(() => null);
  if (!inputs) {
    // Can't act safely without token/auth/expiry — leave authorized for reconcile.
    await env.DB.prepare("UPDATE bookings SET status='authorized', tranzila_raw=?, authorized_at=COALESCE(authorized_at,?) WHERE id=? AND status='pending'")
      .bind(raw, ts, bookingId).run();
    await logEvent(env, 'booking.needs_reconcile', bookingId, { reason: 'missing_force_inputs' });
    return ok('authorized, pending reconcile');
  }

  // --- Persist authorization details + move pending -> authorized (idempotent). ---
  await env.DB.prepare(
    `UPDATE bookings
        SET status = CASE WHEN status='pending' THEN 'authorized' ELSE status END,
            tranzila_token=?, tranzila_auth_number=?, tranzila_reference_txn_id=?,
            card_expiry=?, tranzila_txid=?, tranzila_raw=?, authorized_at=COALESCE(authorized_at,?)
      WHERE id=? AND status IN ('pending','authorized')`
  ).bind(inputs.token, inputs.authorizationNumber, inputs.referenceTxnId,
         `${inputs.expMonth}${inputs.expYear}`, inputs.referenceTxnId, raw, ts, bookingId).run();

  // --- Decide capture vs release, re-checking the seat on confirmed bookings. ---
  const taken = await confirmedSeats(env, booking.workshop_id, bookingId);
  const seatOk = taken + Number(booking.num_participants) <= CAP;

  if (seatOk) {
    // Claim the capture (mutex). Only the winner calls FORCE.
    if (!(await claim(env, bookingId, 'authorized', 'capturing'))) return ok('capture already in progress/done');
    const res = await forceCapture(env, {
      referenceTxnId: inputs.referenceTxnId, authorizationNumber: inputs.authorizationNumber,
      token: inputs.token, expMonth: inputs.expMonth, expYear: inputs.expYear,
    }).catch((e) => ({ ok: false, error: String(e) }));
    if (!res || !res.ok) {
      await claim(env, bookingId, 'capturing', 'authorized'); // revert for reconcile/retry
      await logEvent(env, 'booking.force_failed', bookingId, { detail: (res && res.data) || res });
      return ok('capture failed, will reconcile');
    }
    await env.DB.prepare("UPDATE bookings SET status='confirmed', confirmed_at=? WHERE id=? AND status='capturing'")
      .bind(ts, bookingId).run();
    await logEvent(env, 'booking.confirmed', bookingId, { amount: Number(booking.amount) });
    await fireMake(env, booking, inputs.referenceTxnId, ts);
    return ok('confirmed');
  }

  // Seat gone (late payment after hold expired + resold) -> release, don't charge.
  if (!(await claim(env, bookingId, 'authorized', 'voiding'))) return ok('void already in progress/done');
  const rev = await reversal(env, {
    referenceTxnId: inputs.referenceTxnId, authorizationNumber: inputs.authorizationNumber,
    token: inputs.token, expMonth: inputs.expMonth, expYear: inputs.expYear,
  }).catch((e) => ({ ok: false, error: String(e) }));
  if (!rev || !rev.ok) {
    await claim(env, bookingId, 'voiding', 'authorized');
    await logEvent(env, 'booking.reversal_failed', bookingId, { detail: (rev && rev.data) || rev });
    return ok('reversal failed, will reconcile');
  }
  await env.DB.prepare("UPDATE bookings SET status='voided', voided_at=? WHERE id=? AND status='voiding'")
    .bind(ts, bookingId).run();
  await logEvent(env, 'booking.voided_no_seat', bookingId, { confirmed_taken: taken, capacity: CAP });
  await fireMake(env, booking, inputs.referenceTxnId, ts, 'booking_seat_lost');
  return ok('voided (seat unavailable, not charged)');
}

async function fireMake(env, booking, txid, ts, event = 'booking_confirmed') {
  if (!env.MAKE_WEBHOOK_URL) return;
  try {
    await fetch(env.MAKE_WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event, bookingId: booking.id, txid,
        amount: Number(booking.amount), participants: Number(booking.num_participants),
        customer: { name: booking.name, phone: booking.phone, email: booking.email },
        workshop: {
          id: booking.workshop_id, name: booking.workshop_name, type: booking.workshop_type,
          date: booking.workshop_date, start_time: booking.start_time, city: booking.city,
        },
        confirmed_at: ts,
      }),
    });
  } catch (e) {
    await logEvent(env, 'booking.make_failed', booking.id, { error: String(e).slice(0, 200) });
  }
}

async function logEvent(env, type, entityId, payload) {
  try {
    await env.DB.prepare(
      'INSERT INTO events (event_type, entity_type, entity_id, payload, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(type, 'booking', entityId, JSON.stringify(payload || {}), nowISO()).run();
  } catch { /* best-effort */ }
}
