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
