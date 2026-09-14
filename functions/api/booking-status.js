// GET /api/booking-status?b=<bookingId> — returns ONLY the booking's status.
// Used by booking-success.html: the browser is redirected here by Tranzila the
// moment the J5 is approved, but the real outcome (captured vs released) is
// decided server-side afterwards, so the page must read the true status rather
// than assume success. No PII is returned — just the state string.

import { json } from './_lib.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const id = new URL(request.url).searchParams.get('b') || '';
  if (!id) return json({ error: 'missing_id' }, 400);
  const row = await env.DB.prepare('SELECT status FROM bookings WHERE id=?').bind(id).first();
  if (!row) return json({ status: 'unknown' }, 404);
  return json({ status: row.status });
}
