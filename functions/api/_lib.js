// Shared helpers for the booking API (Cloudflare Pages Functions).
// Mirrors the small helper style used by the tracker/CRM APIs in
// icypower-management, kept self-contained here since this repo is separate.

export const CORS = {
  'Content-Type': 'application/json; charset=utf-8',
  // Same-origin only in practice (the page and the API share the origin);
  // we do NOT send Access-Control-Allow-Origin:* so the endpoints aren't
  // trivially callable cross-site.
};

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, ...extraHeaders },
  });
}

export function errorJson(message, status = 400) {
  return json({ error: message }, status);
}

export function nowISO() {
  return new Date().toISOString();
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

export function newId() {
  return crypto.randomUUID();
}

// Basic input guards — the booking endpoints are public/unauthenticated,
// so every incoming value is validated and length-capped before use.
export function cleanStr(v, max = 200) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

export function isEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

export function isPhone(v) {
  // Israeli / international-ish: digits, spaces, dashes, parens, leading +; 6-20 chars.
  return typeof v === 'string' && /^[+()\-\s0-9]{6,20}$/.test(v);
}

// --- Ticket pricing -------------------------------------------------------
// The per-person ("single") price is read PER WORKSHOP from Notion
// (מחיר - בוקר וולנס / מחיר - בוקר וולנס מורחב). The couple-ticket price is a
// fixed business rule, the same for every open workshop, so it lives here as
// a constant keyed by ticket type. If per-workshop couple pricing is ever
// needed, add two more Notion number columns and read them the same way.
export const COUPLE_PRICE = { wellness: 450, extended: 630 };

// Amount for `qty` people of one ticket type: use as many couple tickets as
// possible (a couple ticket is cheaper per person), plus one single ticket
// for the odd person out. So an even qty is entirely couple tickets — exactly
// the rule Eldar asked for. Falls back to single×qty if no couple price.
export function ticketAmount(type, single, qty) {
  const s = Number(single);
  const couple = COUPLE_PRICE[type];
  const n = Math.max(1, parseInt(qty, 10) || 1);
  if (!Number.isFinite(s) || s <= 0) return NaN;
  if (!Number.isFinite(couple) || couple <= 0) return s * n; // no couple rate
  const pairs = Math.floor(n / 2);
  const singles = n % 2;
  return pairs * couple + singles * s;
}
