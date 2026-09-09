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
//  - Capacity is enforced server-side (available = capacity − confirmed).
//  - The booking is created as `pending`; it only becomes `confirmed` from
//    the verified Tranzila notify (see tranzila-notify.js).
//  - The notify URL carries a server-only secret token so a forged callback
//    is rejected.
//
// Config (Cloudflare project env/secrets on `icypower`, Production+Preview):
//  - NOTION_TOKEN             (required; reads the workshop from Notion — same secret sessions.js uses)
//  - TRANZILA_TERMINAL        (required to enable payments; the terminal/supplier name)
//  - TRANZILA_NOTIFY_SECRET   (required; shared token echoed on the notify URL)
//  - TRANZILA_TRANMODE        (optional; defaults to 'AK' = authorize+capture)
// Until TRANZILA_TERMINAL + TRANZILA_NOTIFY_SECRET are set, this endpoint
// returns 503 payment_not_configured and creates nothing.

import {
  json, errorJson, nowISO, newId, cleanStr, isEmail, isPhone, todayISO, ticketAmount,
} from './_lib.js';

const MAX_QTY = 10;
const CAPACITY = 20; // fixed per open workshop; enforced silently, never shown
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

  if (!sessionId) return errorJson('workshopId required');
  if (name.length < 2) return errorJson('name required');
  if (!isPhone(phone)) return errorJson('valid phone required');
  if (!isEmail(email)) return errorJson('valid email required');
  if (!Number.isInteger(qty) || qty < 1) qty = 1;
  if (qty > MAX_QTY) return errorJson('too many participants');

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

  // Keep a D1 workshops row for this session id, refreshed from Notion. This
  // satisfies the bookings→workshops foreign key and lets tranzila-notify.js
  // read the workshop details for the confirmation/automation without another
  // Notion call. It is a cache written on demand — not a background sync.
  const ts = nowISO();
  await env.DB.prepare(
    `INSERT INTO workshops
       (id, name, date, folder_url, created_at, type, start_time, end_time,
        price, capacity, location, city, subtitle, bookable)
     VALUES (?, ?, ?, '', ?, ?, '', '', ?, ?, '', ?, '', 1)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, date=excluded.date, type=excluded.type,
       price=excluded.price, capacity=excluded.capacity, city=excluded.city,
       bookable=1`
  ).bind(sessionId, w.name, w.date, ts, type, Math.round(Number(single)), CAPACITY, CITY).run();

  // Server-side capacity check (available = capacity − confirmed).
  const cnt = await env.DB.prepare(
    `SELECT COALESCE(SUM(num_participants),0) AS taken
       FROM bookings WHERE workshop_id = ? AND status = 'confirmed'`
  ).bind(sessionId).first();
  const taken = Number(cnt && cnt.taken) || 0;
  const available = Math.max(0, CAPACITY - taken);
  if (available <= 0) return errorJson('workshop is full', 409);
  if (qty > available) return errorJson('not enough places left', 409);

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO bookings
       (id, workshop_id, name, phone, email, num_participants, amount, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
  ).bind(id, sessionId, name, phone, email, qty, amount, ts).run();

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
