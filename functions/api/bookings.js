// POST /api/bookings — start a booking for a workshop and hand back a
// server-built Tranzila hosted-iframe payment URL.
//
// SECURITY MODEL (payments):
//  - Card data NEVER touches this server. Payment happens entirely inside
//    Tranzila's hosted iframe (PCI SAQ-A). We only ever see a txid + masked,
//    non-sensitive response, and only via the server-to-server notify.
//  - The amount is computed HERE from the workshop's DB price × quantity —
//    never taken from the client. A tampered client amount is impossible
//    because the client doesn't supply one.
//  - Capacity is enforced server-side (available = capacity − confirmed).
//  - The booking is created as `pending`; it only becomes `confirmed` from
//    the verified Tranzila notify (see tranzila-notify.js). A pending row is
//    not a reserved seat until paid.
//  - The notify URL carries a server-only secret token so a forged callback
//    from a random source is rejected.
//
// Config (Cloudflare project env/secrets on `icypower`, Production+Preview):
//  - TRANZILA_TERMINAL        (required to enable payments; the terminal/supplier name)
//  - TRANZILA_NOTIFY_SECRET   (required; shared token echoed on the notify URL)
//  - TRANZILA_TRANMODE        (optional; defaults to 'AK' = authorize+capture)
// Until TRANZILA_TERMINAL + TRANZILA_NOTIFY_SECRET are set, this endpoint
// returns 503 payment_not_configured and creates nothing.

import { json, errorJson, nowISO, newId, cleanStr, isEmail, isPhone, todayISO } from './_lib.js';

const MAX_QTY = 10;

export async function onRequestPost(context) {
  const { env, request } = context;

  // Payments must be configured before we take any booking.
  if (!env.TRANZILA_TERMINAL || !env.TRANZILA_NOTIFY_SECRET) {
    return json({ error: 'payment_not_configured' }, 503);
  }

  // Guard the body size / shape.
  let body;
  try {
    const raw = await request.text();
    if (raw.length > 4000) return errorJson('payload too large', 413);
    body = JSON.parse(raw);
  } catch {
    return errorJson('invalid JSON');
  }

  const workshopId = cleanStr(body.workshopId, 60);
  const name = cleanStr(body.name, 120);
  const phone = cleanStr(body.phone, 30);
  const email = cleanStr(body.email, 254);
  let qty = parseInt(body.qty, 10);

  if (!workshopId) return errorJson('workshopId required');
  if (name.length < 2) return errorJson('name required');
  if (!isPhone(phone)) return errorJson('valid phone required');
  if (!isEmail(email)) return errorJson('valid email required');
  if (!Number.isInteger(qty) || qty < 1) qty = 1;
  if (qty > MAX_QTY) return errorJson('too many participants');

  // Load the workshop and verify it's genuinely bookable & in the future.
  const w = await env.DB.prepare(
    `SELECT id, name, type, date, start_time, end_time, price, capacity, bookable
       FROM workshops WHERE id = ?`
  ).bind(workshopId).first();

  if (!w || w.bookable !== 1 || w.price == null || w.capacity == null) {
    return errorJson('workshop not available', 404);
  }
  if (w.date < todayISO()) return errorJson('workshop has passed', 410);

  // Server-side capacity check (available = capacity − confirmed).
  const cnt = await env.DB.prepare(
    `SELECT COALESCE(SUM(num_participants),0) AS taken
       FROM bookings WHERE workshop_id = ? AND status = 'confirmed'`
  ).bind(workshopId).first();
  const taken = Number(cnt && cnt.taken) || 0;
  const available = Math.max(0, Number(w.capacity) - taken);
  if (available <= 0) return errorJson('workshop is full', 409);
  if (qty > available) return errorJson('not enough places left', 409);

  // Amount is authoritative from the DB price — never the client.
  const amount = Number(w.price) * qty;
  if (!Number.isFinite(amount) || amount <= 0) return errorJson('pricing error', 500);

  const id = newId();
  const ts = nowISO();
  await env.DB.prepare(
    `INSERT INTO bookings
       (id, workshop_id, name, phone, email, num_participants, amount, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(id, workshopId, name, phone, email, qty, amount, ts).run();

  // Build the Tranzila hosted-iframe URL server-side. The card form lives
  // inside Tranzila; we only pass amount + return URLs + our booking id
  // (echoed back on notify as a passthrough field).
  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    sum: String(amount),
    currency: '1',            // 1 = ILS
    cred_type: '1',           // regular charge
    tranmode: env.TRANZILA_TRANMODE || 'AK',
    email,
    phone,
    pdesc: `${w.name} (${w.date})`,
    booking_id: id,           // custom passthrough — returned to us on notify
    success_url_address: `${origin}/booking-success.html?b=${id}`,
    fail_url_address: `${origin}/booking.html?pay=fail`,
    notify_url_address: `${origin}/api/tranzila-notify?token=${encodeURIComponent(env.TRANZILA_NOTIFY_SECRET)}`,
  });
  const iframeUrl = `https://direct.tranzila.com/${encodeURIComponent(env.TRANZILA_TERMINAL)}/iframenew.php?${params.toString()}`;

  return json({ bookingId: id, amount, iframeUrl }, 201);
}
