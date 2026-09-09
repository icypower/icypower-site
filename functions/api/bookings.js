// POST /api/bookings — start a booking for an OPEN workshop and hand back a
// server-built Tranzila hosted-iframe payment URL.
//
// SOURCE OF TRUTH = NOTION. The booking page's session id is
// `<notionPageId>:<ticketType>` (see sessions.js). This endpoint reads that
// exact workshop straight from the Notion Workshops database — it never
// trusts a price or workshop coming from the client. D1 is used only to
// record the booking itself (and to count seats); the workshop *catalog*
// lives in Notion, so there is no background sync.
//
// SECURITY MODEL (payments):
//  - Card data NEVER touches this server. Payment happens entirely inside
//    Tranzila's hosted iframe (PCI SAQ-A). We only ever see a txid + masked,
//    non-sensitive response, and only via the server-to-server notify.
//  - The amount is computed HERE from the workshop's Notion price × the
//    couple-ticket rule — never taken from the client.
//  - The booking is created as `pending`; it only becomes `confirmed` from
//    the verified Tranzila notify (see tranzila-notify.js).
//
// TWO PRE-TRANZILA SAFETY GUARANTEES (see db/migrations/0005 + the audit):
//  1. IDEMPOTENCY (no duplicate payment sessions): the client sends an
//     `idempotencyKey` that is unique per booking *attempt*. A repeat request
//     with the same key returns the SAME booking + SAME iframe instead of
//     creating a second one (double-click, refresh, retry-after-timeout,
//     repeated POST, two concurrent identical requests). A UNIQUE index on the
//     key makes the concurrent case race-safe: one INSERT wins, the loser is
//     served the winner's booking.
//  2. CAPACITY as an atomic reservation (no overbooking / no "pay then find
//     no seat"): a pending booking RESERVES its seats for HOLD_MINUTES. The
//     seat count is enforced inside a single `INSERT ... SELECT ... WHERE
//     (count + qty <= capacity)` statement — SQLite serialises writes, so two
//     concurrent buyers cannot both reserve the last seats. Abandoned pendings
//     simply age out of the count after HOLD_MINUTES (no cleanup job needed);
//     confirmed bookings count forever.
//
// Config (Cloudflare project env/secrets on `icypower`, Production+Preview):
//  - NOTION_TOKEN             (required; reads the workshop from Notion)
//  - TRANZILA_TERMINAL        (required to enable payments; terminal/supplier name)
//  - TRANZILA_NOTIFY_SECRET   (required; shared token echoed on the notify URL)
//  - TRANZILA_TRANMODE        (optional; defaults to 'AK' = authorize+capture)
// Until TRANZILA_TERMINAL + TRANZILA_NOTIFY_SECRET are set, this endpoint
// returns 503 payment_not_configured and creates nothing.

import {
  json, errorJson, nowISO, newId, cleanStr, isEmail, isPhone, todayISO, ticketAmount,
} from './_lib.js';

const MAX_QTY = 10;
const CAPACITY = 20;      // fixed per open workshop; enforced silently, never shown
const HOLD_MINUTES = 15;  // how long a pending booking reserves its seats
const CITY = 'סביון';
const NOTION_VERSION = '2025-09-03';

// Ticket type → the Notion number column that holds its per-person price.
const PRICE_PROP = {
  wellness: 'מחיר - בוקר וולנס',
  extended: 'מחיר - בוקר וולנס מורחב',
};

// A Notion page id, dashed or bare (32 hex).
function isNotionId(v) {
  return typeof v === 'string' && /^[0-9a-fA-F-]{32,36}$/.test(v) && v.replace(/-/g, '').length === 32;
}

function titleText(prop) {
  const arr = prop && Array.isArray(prop.title) ? prop.title : [];
  return arr.map((t) => (t && t.plain_text) || '').join('').trim();
}

// Fetch one workshop straight from Notion and return the normalized fields we
// need, or null if it can't be read.
async function fetchNotionWorkshop(env, pageId) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
    },
  });
  if (!res.ok) return null;
  const page = await res.json();
  const p = (page && page.properties) || {};
  return {
    name: titleText(p.Workshop) || titleText(p.Name) || 'סדנה',
    type: (p.Type && p.Type.select && p.Type.select.name) || '',
    date: (p.Date && p.Date.date && p.Date.date.start ? String(p.Date.date.start).slice(0, 10) : ''),
    priceWellness: p[PRICE_PROP.wellness] && p[PRICE_PROP.wellness].number,
    priceExtended: p[PRICE_PROP.extended] && p[PRICE_PROP.extended].number,
  };
}

// Build the Tranzila hosted-iframe URL. Same output for the first request and
// for any idempotent replay of the same booking, so a retry can't diverge.
function buildIframeUrl(env, origin, { amount, email, phone, pdesc, bookingId }) {
  const params = new URLSearchParams({
    sum: String(amount),
    currency: '1',            // 1 = ILS
    cred_type: '1',           // regular charge
    tranmode: env.TRANZILA_TRANMODE || 'AK',
    email,
    phone,
    pdesc,
    booking_id: bookingId,    // custom passthrough — returned to us on notify
    success_url_address: `${origin}/booking-success.html?b=${bookingId}`,
    fail_url_address: `${origin}/booking.html?pay=fail`,
    notify_url_address: `${origin}/api/tranzila-notify?token=${encodeURIComponent(env.TRANZILA_NOTIFY_SECRET)}`,
  });
  return `https://direct.tranzila.com/${encodeURIComponent(env.TRANZILA_TERMINAL)}/iframenew.php?${params.toString()}`;
}

// Look up a booking by its idempotency key (+ enough to rebuild its iframe).
async function findByIdempotencyKey(env, key) {
  if (!key) return null;
  return env.DB.prepare(
    `SELECT b.id, b.amount, b.status, b.email, b.phone,
            w.name AS wname, w.date AS wdate
       FROM bookings b LEFT JOIN workshops w ON w.id = b.workshop_id
      WHERE b.idempotency_key = ?`
  ).bind(key).first();
}

// Serve an already-created booking (idempotent replay).
function replay(env, origin, existing) {
  if (existing.status === 'pending') {
    const iframeUrl = buildIframeUrl(env, origin, {
      amount: existing.amount,
      email: existing.email,
      phone: existing.phone,
      pdesc: `${existing.wname || 'סדנה'} (${existing.wdate || ''})`,
      bookingId: existing.id,
    });
    return json({ bookingId: existing.id, amount: existing.amount, iframeUrl, idempotent: true }, 200);
  }
  if (existing.status === 'confirmed') {
    return json({ error: 'already_confirmed', bookingId: existing.id }, 409);
  }
  // 'failed' (only possible once payments are live): a new attempt needs a new key.
  return json({ error: 'previous_attempt_failed', bookingId: existing.id }, 409);
}

export async function onRequestPost(context) {
  const { env, request } = context;

  // Payments must be configured before we take any booking.
  if (!env.TRANZILA_TERMINAL || !env.TRANZILA_NOTIFY_SECRET) {
    return json({ error: 'payment_not_configured' }, 503);
  }
  // We read the workshop from Notion — same secret the booking page uses.
  if (!env.NOTION_TOKEN) {
    return json({ error: 'catalog_not_configured' }, 503);
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

  const sessionId = cleanStr(body.workshopId, 80); // `<notionPageId>:<type>`
  const name = cleanStr(body.name, 120);
  const phone = cleanStr(body.phone, 30);
  const email = cleanStr(body.email, 254);
  let qty = parseInt(body.qty, 10);
  // Idempotency key: unique per booking attempt. If a (well-behaved) client
  // omits it we generate one, which degrades gracefully to "no cross-request
  // dedupe for this one request" while capacity safety still holds.
  const idemKey = cleanStr(body.idempotencyKey, 80) || `srv_${newId()}`;

  if (!sessionId) return errorJson('workshopId required');
  if (name.length < 2) return errorJson('name required');
  if (!isPhone(phone)) return errorJson('valid phone required');
  if (!isEmail(email)) return errorJson('valid email required');
  if (!Number.isInteger(qty) || qty < 1) qty = 1;
  if (qty > MAX_QTY) return errorJson('too many participants');

  const origin = new URL(request.url).origin;

  // --- P1-A idempotency fast path: a repeat of an already-created attempt
  // returns the same booking + iframe, never a second payment session. ---
  const prior = await findByIdempotencyKey(env, idemKey);
  if (prior) return replay(env, origin, prior);

  // Split `<pageId>:<type>` (a Notion id never contains a colon).
  const sep = sessionId.lastIndexOf(':');
  const pageId = sep > 0 ? sessionId.slice(0, sep) : '';
  const type = sep > 0 ? sessionId.slice(sep + 1) : '';
  if (!isNotionId(pageId) || !PRICE_PROP[type]) {
    return errorJson('workshop not available', 404);
  }

  // Read the workshop straight from Notion and validate it is genuinely an
  // open, future workshop with this ticket priced.
  const w = await fetchNotionWorkshop(env, pageId);
  if (!w) return errorJson('workshop not available', 404);
  if (w.type.toLowerCase() !== 'open') return errorJson('workshop not available', 404);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(w.date)) return errorJson('workshop not available', 404);
  if (w.date < todayISO()) return errorJson('workshop has passed', 410);

  const single = type === 'extended' ? w.priceExtended : w.priceWellness;
  if (single == null || Number(single) <= 0) return errorJson('workshop not available', 404);

  // Amount is authoritative from Notion price + the couple-ticket rule.
  const amount = ticketAmount(type, single, qty);
  if (!Number.isFinite(amount) || amount <= 0) return errorJson('pricing error', 500);

  const id = newId();
  const ts = nowISO();
  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000).toISOString();

  // Two statements in ONE atomic batch (a D1 transaction):
  //  (1) upsert the D1 workshops cache row from Notion — the bookings FK
  //      target + the fields tranzila-notify reads. Written on demand, not a
  //      background sync.
  //  (2) INSERT the pending booking ONLY IF seats remain. The seat count is
  //      confirmed bookings + still-held pendings; the whole check+insert is
  //      one statement, so concurrent buyers can't both take the last seats.
  const upsert = env.DB.prepare(
    `INSERT INTO workshops
       (id, name, date, folder_url, created_at, type, start_time, end_time,
        price, capacity, location, city, subtitle, bookable)
     VALUES (?, ?, ?, '', ?, ?, '', '', ?, ?, '', ?, '', 1)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, date=excluded.date, type=excluded.type,
       price=excluded.price, capacity=excluded.capacity, city=excluded.city,
       bookable=1`
  ).bind(sessionId, w.name, w.date, ts, type, Math.round(Number(single)), CAPACITY, CITY);

  const reserve = env.DB.prepare(
    `INSERT INTO bookings
       (id, workshop_id, name, phone, email, num_participants, amount, status, created_at, idempotency_key)
     SELECT ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?
      WHERE (
        SELECT COALESCE(SUM(num_participants), 0) FROM bookings
         WHERE workshop_id = ?
           AND ( status = 'confirmed'
              OR (status = 'pending' AND created_at > ?) )
      ) + ? <= ?`
  ).bind(id, sessionId, name, phone, email, qty, amount, ts, idemKey,
         sessionId, holdCutoff, qty, CAPACITY);

  let reserved = false;
  try {
    const results = await env.DB.batch([upsert, reserve]);
    reserved = Number(results[1] && results[1].meta && results[1].meta.changes) > 0;
  } catch (e) {
    // Race: another request with the same idempotency key won the INSERT
    // between our fast-path SELECT and here. Serve that winner's booking.
    const raced = await findByIdempotencyKey(env, idemKey);
    if (raced) return replay(env, origin, raced);
    return errorJson('booking failed', 500);
  }

  // No row inserted => the capacity WHERE was false => sold out for this qty.
  if (!reserved) return errorJson('workshop is full', 409);

  const iframeUrl = buildIframeUrl(env, origin, {
    amount, email, phone, pdesc: `${w.name} (${w.date})`, bookingId: id,
  });
  return json({ bookingId: id, amount, iframeUrl }, 201);
}
