# icypower-site — project context for Claude

Read automatically at the start of every Claude Code session in this repo.

## What this is

The public marketing website for **ICYPOWERR**, a small wellness business
(guided ice-bath / cold-exposure / breathwork sessions) run by Oron and
Eldar in Tel Aviv. Plain static HTML/CSS/JS, no build step, no backend,
no database.

## Deployment

This repo is **the canonical, only copy** of the site. It deploys to the
Cloudflare Pages project `icypower`, connected directly via GitHub —
pushing to `main` triggers an automatic build and deploy. Root directory
for that Cloudflare project should be blank (this repo's root *is* the
site).

**Do not manually deploy this site via `wrangler pages deploy`** — that
was the old workflow before Git integration was set up, and reintroducing
it causes the Cloudflare project to serve whichever of the two deploy
paths (Git push vs. manual upload) happened most recently, regardless of
which one is actually correct. Push to `main` and let Cloudflare build it.

## Important history — do not repeat this mistake

This repo was split out of `icypower/icypower-management` (formerly
`icypower-backup`), where the site used to live in an `icypower-site/`
subfolder, specifically so the marketing site and the business's other
internal apps aren't tangled in one repo. **This is the real, intentional
home of the site now — not a stray duplicate.** A previous session
mistook this repo for an accidental duplicate, archived it, and
reconnected the Cloudflare project to the old (now-empty) location
instead, which broke the deploy pipeline. If you ever find another repo
that looks like a copy of this site, check with the user before assuming
either copy is disposable — don't archive, delete, or redirect deploys
away from this repo without confirming first.

If a backup/mirror of this repo is ever created, it should be automated
and clearly labeled as read-only (see its own README) — never a second
place anyone is expected to edit.

## Related repo

`icypower/icypower-management` holds the business's other internal apps
(financial tracker, waiver forms) and the long-term architecture
vision — see its `CLAUDE.md` for the bigger picture.
