// POST /api/sync-workshops — one-way sync of OPEN, future workshops from the
// Notion Workshops database into the D1 `workshops` table that powers the
// public booking page (booking.html → GET /api/sessions).
//
// WHY THIS EXISTS:
//  - Eldar/Oron manage workshops in Notion (their source of truth). The
//    booking page needs price/capacity/availability enforced server-side
//    (atomic, rate-limit-free), which is what D1 already gives the existing
//    booking + Tranzila flow. So Notion is mirrored INTO D1, one way.
//  - The mirror is driven by a Make scenario (it already holds the Notion
//    connection) on a schedule. To keep that scenario trivial, Make just
//    forwards Notion's RAW /v1/databases/<id>/query response here; all the
//    filtering and property parsing happens below, where it's testable.
//
// MODEL: each Notion workshop whose Type = "Open" and whose Date is today or
// later becomes TWO bookable D1 rows — a "wellness" ticket and an "extended"
// ticket — so the booking page shows two cards (בוקר וולנס / בוקר וולנס
// מורחב) for the same date. Row ids are derived from the Notion page id so
// re-syncs upsert instead of duplicating:
//   nw_<notionId>_wellness   nw_<notionId>_extended
//
// RECONCILE: rows this endpoint manages (id LIKE 'nw\_%') that are NOT in the
// current open/future set are set bookable=0 (hidden) rather than deleted —
// never drop a row a booking's foreign key points at. Manually-created
// bookable rows (ids without the nw_ prefix) are never touched.
//
// SECURITY: gated by a bearer token (SYNC_TOKEN, a Cloudflare secret on the
// `icypower` project). Without it the endpoint returns 503 and changes
// nothing. No personal data flows through here — only public workshop info.

import { json, errorJson, nowISO, todayISO } from './_lib.js';

// Fixed pricing for open workshops (per person). Couple-ticket pricing
// (450 / 630) is applied later at checkout, not here.
const PRICE_WELLNESS = 250;
const PRICE_EXTENDED = 350;
const CAPACITY = 20;

const TICKETS = [
  { suffix: 'wellness', type: 'wellness', price: PRICE_WELLNESS, defEnd: '10:00' },
  { suffix: 'extended', type: 'extended', price: PRICE_EXTENDED, defEnd: '11:00' },
];

// --- Notion property readers (defensive: any shape may be missing) ---
function richText(prop) {
  const arr = prop && Array.isArray(prop.title) ? prop.title
            : prop && Array.isArray(prop.rich_text) ? prop.rich_text
            : [];
  return arr.map((t) => (t && t.plain_text) || '').join('').trim();
}
function selectName(prop) {
  return (prop && prop.select && prop.select.name) || '';
}
function dateStart(prop) {
  const s = prop && prop.date && prop.date.start;
  return typeof s === 'string' ? s.slice(0, 10) : '';
}

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.SYNC_TOKEN) return json({ error: 'sync_not_configured' }, 503);
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== env.SYNC_TOKEN) return new Response('forbidden', { status: 403 });

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 500000) return errorJson('payload too large', 413);
    body = JSON.parse(raw);
  } catch {
    return errorJson('invalid JSON');
  }

  // Accept Notion's native query response ({results:[...]}) or a bare array.
  const pages = Array.isArray(body) ? body
              : Array.isArray(body.results) ? body.results
              : Array.isArray(body.workshops) ? body.workshops
              : null;
  if (!pages) return errorJson('results array required');

  const today = todayISO();
  const ts = nowISO();
  const statements = [];
  const liveIds = [];
  let considered = 0;

  for (const page of pages) {
    const props = (page && page.properties) || {};
    const notionId = String((page && page.id) || '').replace(/[^a-zA-Z0-9]/g, '');
    const name = richText(props.Workshop) || richText(props.Name);
    const date = dateStart(props.Date);
    const type = selectName(props.Type);

    if (!notionId || !name) continue;
    if (type.toLowerCase() !== 'open') continue;      // only open workshops
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today) continue; // future only
    considered++;

    const city = selectName(props.Location);
    const address = richText(props.Address);

    for (const t of TICKETS) {
      const id = `nw_${notionId}_${t.suffix}`;
      liveIds.push(id);
      statements.push(
        env.DB.prepare(
          `INSERT INTO workshops
             (id, name, date, folder_url, created_at, type, start_time, end_time,
              price, capacity, location, city, subtitle, bookable)
           VALUES (?, ?, ?, '', ?, ?, '08:00', ?, ?, ?, ?, ?, '', 1)
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, date=excluded.date, type=excluded.type,
             end_time=excluded.end_time, price=excluded.price,
             capacity=excluded.capacity, location=excluded.location,
             city=excluded.city, bookable=1`
        ).bind(id, name, date, ts, t.type, t.defEnd, t.price, CAPACITY, address, city)
      );
    }
  }

  // Hide previously-synced rows no longer open/future. Never delete — a
  // booking's foreign key may reference the row; sessions.js filters bookable=1.
  if (liveIds.length) {
    const ph = liveIds.map(() => '?').join(',');
    statements.push(
      env.DB.prepare(
        `UPDATE workshops SET bookable=0
           WHERE id LIKE 'nw\\_%' ESCAPE '\\' AND id NOT IN (${ph})`
      ).bind(...liveIds)
    );
  } else {
    statements.push(
      env.DB.prepare(`UPDATE workshops SET bookable=0 WHERE id LIKE 'nw\\_%' ESCAPE '\\'`)
    );
  }

  try {
    await env.DB.batch(statements);
  } catch (e) {
    return errorJson('sync failed', 500);
  }

  return json({ ok: true, open_future: considered, rows: liveIds.length });
}
