// GET /go - server-side redirect for the printed roll-up banner QR code.
//
// The destination is looked up live from the shared D1 database
// (icypower-core, settings.qr_target_url) on every request, so Oron/Eldar
// can repoint the QR code (Instagram, website, Linktree, ...) from the
// tracker app's Settings screen with no redeploy needed. Falls back to the
// Instagram profile if the setting is missing or the database is
// unreachable, so the QR code never dead-ends.
const FALLBACK_URL = 'https://www.instagram.com/the.icy.power.il';

export async function onRequestGet(context) {
  const { env } = context;
  let target = FALLBACK_URL;

  try {
    const row = await env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'qr_target_url'"
    ).first();
    if (row && row.value && row.value.trim()) target = row.value.trim();
  } catch (e) {
    // DB unreachable/misconfigured - fall back rather than error out on a
    // scanned QR code.
  }

  return Response.redirect(target, 302);
}
