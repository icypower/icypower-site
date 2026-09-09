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
//    connection) on a schedule; Make POSTs the current list of open, future
//    workshops here and this endpoint reconciles D1 to match.
//
// MODEL: each Notion "Open" workshop becomes TWO bookable D1 rows — one
// "wellness" ticket and one "extended" ticket — so the booking page shows
// two cards (בוקר וולנס / בוקר וולנס מורחב) for the same date. Row ids are
// derived from the Notion page id so re-syncs upsert instead of duplicating:
//   nw_<notionId>_wellness   nw_<notionId>_extended
//
// RECONCILE: rows this endpoint manages (id LIKE 'nw\_%') that are NOT in the
// incoming list are set bookable=0 (hidden) rather than deleted — never drop
// a row a booking's foreign key points at. Manually-created bookable rows
// (ids without the nw_ prefix) are never touched.
//
// SECURITY: gated by a bearer token (SYNC_TOKEN, a Cloudflare secret on the
// `icypower` project). Without it the endpoint returns 503 and changes
// nothing. No personal data flows through here — only public workshop info.

import { json, errorJson, nowISO, todayISO, cleanStr } from './_lib.js';

// Fixed pricing for open workshops (per person). Couple-ticket pricing
// (450 / 630) is applied later at checkout, not here.
const PRICE_WELLNESS = 250;
const PRICE_EXTENDED = 350;
const CAPACITY = 20;

const TICKETS = [
  { suffix: 'wellness', type: 'wellness', price: PRICE_WELLNESS, defEnd: '10:00' },
  { suffix: 'extended', type: 'extended', price: PRICE_EXTENDED, defEnd: '11:00' },
];

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.SYNC_TOKEN) {
    return json({ error: 'sync_not_configured' }, 503);
  }
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== env.SYNC_TOKEN) {
    return new Response('forbidden', { status: 403 });
  }

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 200000) return errorJson('payload too large', 413);
    body = JSON.parse(raw);
  } catch {
    return errorJson('invalid JSON');
  }

  const items = Array.isArray(body.workshops) ? body.workshops : null;
  if (!items) return errorJson('workshops array required');

  const today = todayISO();
  const ts = nowISO();
  const statements = [];
  const liveIds = [];

  for (const w of items) {
    const notionId = cleanStr(w.notion_id, 80).replace(/[^a-zA-Z0-9]/g, '');
    const name = cleanStr(w.name, 200);
    const date = cleanStr(w.date, 10); // YYYY-MM-DD
    if (!notionId || !name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (date < today) continue; // never publish today-or-earlier

    const city = cleanStr(w.city, 120);
    const location = cleanStr(w.location, 200);
    const subtitle = cleanStr(w.subtitle, 200);
    const start = cleanStr(w.start_time, 10) || '08:00';

    for (const t of TICKETS) {
      const id = `nw_${notionId}_${t.suffix}`;
      const end = cleanStr(w.end_time, 10) || t.defEnd;
      liveIds.push(id);
      statements.push(
        env.DB.prepare(
          `INSERT INTO workshops
             (id, name, date, folder_url, created_at, type, start_time, end_time,
              price, capacity, location, city, subtitle, bookable)
           VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
           ON CONFLICT(id) DO UPDATE SET
             name=excluded.name, date=excluded.date, type=excluded.type,
             start_time=excluded.start_time, end_time=excluded.end_time,
             price=excluded.price, capacity=excluded.capacity,
             location=excluded.location, city=excluded.city,
             subtitle=excluded.subtitle, bookable=1`
        ).bind(id, name, date, ts, t.type, start, end, t.price, CAPACITY, location, city, subtitle)
      );
    }
  }

  // Hide any previously-synced rows that are no longer in the incoming list
  // (removed in Notion, or their date has passed). Never delete — a booking's
  // foreign key may reference the row.
  if (liveIds.length) {
    const placeholders = liveIds.map(() => '?').join(',');
    statements.push(
      env.DB.prepare(
        `UPDATE workshops SET bookable=0
           WHERE id LIKE 'nw\\_%' ESCAPE '\\' AND id NOT IN (${placeholders})`
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

  return json({ ok: true, synced: liveIds.length, workshops: items.length });
}
