// GET /api/sessions — public list of upcoming, bookable workshops for the
// booking page (booking.html). Reads the shared D1 database (icypower-core),
// same `DB` binding already used by /go on this project.
//
// Returns only workshops explicitly marked bookable, with a fully-configured
// price + capacity, dated today or later. Availability is computed
// server-side as capacity - COUNT(confirmed bookings); the raw booking rows
// are never exposed. No secrets, no personal data leave this endpoint.

import { json, errorJson, todayISO } from './_lib.js';

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const today = todayISO();
    const { results } = await env.DB.prepare(
      `SELECT
         w.id            AS id,
         w.date          AS date,
         w.type          AS type,
         w.start_time    AS start,
         w.end_time      AS end,
         w.price         AS price,
         w.capacity      AS capacity,
         w.city          AS city,
         w.name          AS name,
         (SELECT COUNT(*) FROM bookings b
            WHERE b.workshop_id = w.id AND b.status = 'confirmed') AS booked
       FROM workshops w
       WHERE w.bookable = 1
         AND w.price IS NOT NULL
         AND w.capacity IS NOT NULL
         AND w.date >= ?
       ORDER BY w.date ASC, w.start_time ASC`
    )
      .bind(today)
      .all();

    // Normalize to the exact shape the page expects.
    const sessions = (results || []).map((r) => ({
      id: String(r.id),
      date: r.date,
      type: r.type === 'extended' ? 'extended' : 'wellness',
      start: r.start || '',
      end: r.end || '',
      price: Number(r.price) || 0,
      capacity: Number(r.capacity) || 0,
      booked: Number(r.booked) || 0,
      city: r.city || '',
    }));

    return json({ sessions });
  } catch (e) {
    // Never leak internals; the page falls back gracefully on a non-200.
    return errorJson('failed to load sessions', 500);
  }
}
