// GET /api/sessions — public list of upcoming, bookable "open" workshops for
// the booking page (booking.html). Source of truth is the Notion "Workshops"
// database (the same one Oron/Eldar manage from Notion directly) rather than
// D1 — Notion is now where open workshops are created/dated.
//
// Reads Type="Open" rows with a Date on/after today, and turns each Notion
// row into up to two synthetic "session" entries — one per ticket type
// (wellness / extended) — since a single open workshop offers both, at their
// own prices. A ticket type is only included if its price is actually set
// in Notion (מחיר - בוקר וולנס / מחיר - בוקר וולנס מורחב), so a workshop can
// be wellness-only if that's all Oron/Eldar priced.
//
// Deliberately never returns capacity/availability — Eldar asked for no
// "spots left" indicator anywhere on the booking page.
//
// Config (Cloudflare secret on the `icypower` Pages project, Production +
// Preview): NOTION_TOKEN — an internal Notion integration token, with the
// Workshops database shared to it (read access is enough for this endpoint).

import { json, errorJson, todayISO } from './_lib.js';

const WORKSHOPS_DATA_SOURCE_ID = 'e92c767d-975d-47d9-901f-7c1c3a436f8b';
const NOTION_VERSION = '2025-09-03';

const TICKET_TYPES = [
  { type: 'wellness', priceProp: 'מחיר - בוקר וולנס', durationHours: 2 },
  { type: 'extended', priceProp: 'מחיר - בוקר וולנס מורחב', durationHours: 3 },
];

function hhmm(iso) {
  if (!iso) return '';
  const m = /T(\d{2}:\d{2})/.exec(iso);
  return m ? m[1] : '';
}

function addHours(iso, hours) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.NOTION_TOKEN) {
    return errorJson('sessions source not configured', 503);
  }

  try {
    const today = todayISO();
    const res = await fetch(
      `https://api.notion.com/v1/data_sources/${WORKSHOPS_DATA_SOURCE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.NOTION_TOKEN}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            and: [
              { property: 'Type', select: { equals: 'Open' } },
              { property: 'Date', date: { on_or_after: today } },
            ],
          },
          sorts: [{ property: 'Date', direction: 'ascending' }],
          page_size: 100,
        }),
      }
    );

    if (!res.ok) {
      return errorJson('failed to load sessions', 502);
    }
    const data = await res.json();

    const sessions = [];
    for (const page of data.results || []) {
      const p = page.properties || {};
      const dateProp = p.Date?.date;
      if (!dateProp?.start) continue;

      const isDatetime = dateProp.start.includes('T');
      const startISO = dateProp.start;
      const dateOnly = startISO.slice(0, 10);

      for (const t of TICKET_TYPES) {
        const priceVal = p[t.priceProp]?.number;
        if (priceVal == null || priceVal <= 0) continue;

        const endISO = dateProp.end || (isDatetime ? addHours(startISO, t.durationHours) : '');
        sessions.push({
          id: `${page.id}:${t.type}`,
          date: dateOnly,
          type: t.type,
          start: isDatetime ? hhmm(startISO) : '',
          end: isDatetime ? hhmm(endISO) : '',
          price: Number(priceVal),
          city: 'סביון',
        });
      }
    }

    return json({ sessions }, 200, { 'Cache-Control': 'public, max-age=60' });
  } catch (e) {
    // Never leak internals; the page falls back gracefully on a non-200.
    return errorJson('failed to load sessions', 500);
  }
}
