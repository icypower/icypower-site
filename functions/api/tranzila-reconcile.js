// GET/POST /api/tranzila-reconcile?token=... — recovery for the rare case a
// notify was lost or a FORCE/REVERSAL didn't complete. Tranzila already retries
// the notify 5×, so this is a belt-and-suspenders sweep; run it manually first
// (and optionally on a schedule later).
//
// Token-gated with the same TRANZILA_NOTIFY_SECRET. For each unsettled booking:
//   * `authorized` (capture/void never finished): re-decide from stored token/auth.
//   * `pending` older than the hold window: query the Reports API by booking_id.
//       - a J5 exists  -> gather fields, then capture (seat ok) or reversal.
//       - none, expired -> mark `expired`.

import { nowISO } from './_lib.js';
import { forceCapture, reversal, getTransactionByBookingId } from './_tranzila.js';

const CAP = 20;
const HOLD_MINUTES = 15;

function deny() { return new Response('forbidden', { status: 403 }); }
function json(o) { return new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } }); }

async function confirmedSeats(env, workshopId, exceptId) {
  const r = await env.DB.prepare(
    `SELECT COALESCE(SUM(num_participants),0) AS taken FROM bookings
       WHERE workshop_id=? AND status='confirmed' AND id<>?`
  ).bind(workshopId, exceptId).first();
  return Number(r && r.taken) || 0;
}
async function claim(env, id, from, to) {
  const r = await env.DB.prepare('UPDATE bookings SET status=? WHERE id=? AND status=?').bind(to, id, from).run();
  return Number(r && r.meta && r.meta.changes) > 0;
}
async function logEvent(env, type, entityId, payload) {
  try {
    await env.DB.prepare(
      'INSERT INTO events (event_type, entity_type, entity_id, payload, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(type, 'booking', entityId, JSON.stringify(payload || {}), nowISO()).run();
  } catch { /* best-effort */ }
}

// Given a booking known to hold a valid J5 with stored/known inputs, capture or void it.
async function settle(env, b, inputs) {
  const ts = nowISO();
  const taken = await confirmedSeats(env, b.workshop_id, b.id);
  const seatOk = taken + Number(b.num_participants) <= CAP;
  if (seatOk) {
    if (!(await claim(env, b.id, 'authorized', 'capturing'))) return 'busy';
    const res = await forceCapture(env, inputs).catch((e) => ({ ok: false, error: String(e) }));
    if (!res || !res.ok) {
      await claim(env, b.id, 'capturing', 'authorized');
      await logEvent(env, 'booking.force_failed', b.id, { via: 'reconcile', detail: (res && res.data) || res });
      return 'force_failed';
    }
    await env.DB.prepare("UPDATE bookings SET status='confirmed', confirmed_at=? WHERE id=? AND status='capturing'").bind(ts, b.id).run();
    return 'confirmed';
  }
  if (!(await claim(env, b.id, 'authorized', 'voiding'))) return 'busy';
  const rev = await reversal(env, inputs).catch((e) => ({ ok: false, error: String(e) }));
  if (!rev || !rev.ok) {
    await claim(env, b.id, 'voiding', 'authorized');
    await logEvent(env, 'booking.reversal_failed', b.id, { via: 'reconcile', detail: (rev && rev.data) || rev });
    return 'reversal_failed';
  }
  await env.DB.prepare("UPDATE bookings SET status='voided', voided_at=? WHERE id=? AND status='voiding'").bind(ts, b.id).run();
  return 'voided';
}

export async function onRequest(context) {
  const { env, request } = context;
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!env.TRANZILA_NOTIFY_SECRET || token !== env.TRANZILA_NOTIFY_SECRET) return deny();
  if (!env.TRANZILA_TERMINAL || !env.TRANZILA_API_APP_KEY || !env.TRANZILA_API_SECRET) {
    return json({ error: 'not_configured' });
  }

  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000).toISOString();
  const stuckCutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const out = { authorized_settled: [], pending_checked: [], expired: [], needs_manual_check: [] };

  // Surface (do NOT auto-act on) bookings stuck mid-capture/void: a crash could
  // leave `capturing` AFTER a successful FORCE, so blindly re-forcing risks a
  // double charge. These are rare; inspect them in the Reports API by hand.
  const stuck = await env.DB.prepare(
    "SELECT id, status, tranzila_reference_txn_id FROM bookings WHERE status IN ('capturing','voiding') AND created_at < ?"
  ).bind(stuckCutoff).all();
  for (const b of (stuck.results || [])) {
    out.needs_manual_check.push({ id: b.id, status: b.status, reference_txn_id: b.tranzila_reference_txn_id });
  }

  // 1) authorized bookings whose capture/void never finished.
  const auths = await env.DB.prepare(
    `SELECT * FROM bookings WHERE status='authorized'
       AND tranzila_token IS NOT NULL AND tranzila_auth_number IS NOT NULL
       AND tranzila_reference_txn_id IS NOT NULL AND card_expiry IS NOT NULL`
  ).all();
  for (const b of (auths.results || [])) {
    const exp = String(b.card_expiry);
    const inputs = {
      referenceTxnId: b.tranzila_reference_txn_id, authorizationNumber: b.tranzila_auth_number,
      token: b.tranzila_token, expMonth: exp.slice(0, 2), expYear: exp.slice(2),
    };
    out.authorized_settled.push({ id: b.id, result: await settle(env, b, inputs) });
  }

  // 2) stale pending: ask the Reports API whether a J5 actually happened.
  const pends = await env.DB.prepare("SELECT * FROM bookings WHERE status='pending' AND created_at < ?")
    .bind(holdCutoff).all();
  for (const b of (pends.results || [])) {
    const t = await getTransactionByBookingId(env, b.id).catch(() => null);
    if (t && (t.credit_card_token && t.authorization_number)) {
      const inputs = {
        referenceTxnId: String(t.transaction_id || t.index || ''),
        authorizationNumber: String(t.authorization_number),
        token: t.credit_card_token,
        expMonth: String(t.expiration_month || ''), expYear: String(t.expiration_year || ''),
      };
      const ts = nowISO();
      await env.DB.prepare(
        `UPDATE bookings SET status='authorized', tranzila_token=?, tranzila_auth_number=?,
            tranzila_reference_txn_id=?, card_expiry=?, authorized_at=COALESCE(authorized_at,?)
          WHERE id=? AND status='pending'`
      ).bind(inputs.token, inputs.authorizationNumber, inputs.referenceTxnId,
             `${inputs.expMonth}${inputs.expYear}`, ts, b.id).run();
      const fresh = await env.DB.prepare('SELECT * FROM bookings WHERE id=?').bind(b.id).first();
      out.pending_checked.push({ id: b.id, result: await settle(env, fresh, inputs) });
    } else {
      // No J5 ever landed and the hold lapsed -> mark expired (frees nothing extra;
      // it already stopped counting toward capacity when the hold window passed).
      await env.DB.prepare("UPDATE bookings SET status='expired' WHERE id=? AND status='pending'").bind(b.id).run();
      out.expired.push(b.id);
    }
  }

  return json({ ok: true, ...out });
}
