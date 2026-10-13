// GET /api/proposal-title?c=<code> — the headline for one personal proposal link.
//
// Oron/Eldar create a link per lead in the tracker (More → "Proposal page
// links"); the list lives in the shared D1 database as JSON under
// settings.proposal_links = [{ id, name, created }]. The proposal page
// (proposals/_shared/proposal.js) calls this with the ?c= code from its URL
// and shows the returned name as its headline. Public and read-only: it only
// ever returns the single name for a code someone already holds.

import { json } from './_lib.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const code = new URL(request.url).searchParams.get('c') || '';
  if (!/^[a-z0-9]{4,16}$/i.test(code)) return json({ error: 'bad_code' }, 400);

  try {
    const row = await env.DB.prepare(
      "SELECT value FROM settings WHERE key = 'proposal_links'"
    ).first();
    const links = row && row.value ? JSON.parse(row.value) : [];
    const hit = Array.isArray(links) && links.find((l) => l && l.id === code);
    if (!hit || !hit.name) return json({ error: 'not_found' }, 404, { 'Cache-Control': 'no-store' });
    return json({ name: String(hit.name).slice(0, 120) }, 200, { 'Cache-Control': 'no-store' });
  } catch (e) {
    return json({ error: 'unavailable' }, 503, { 'Cache-Control': 'no-store' });
  }
}
