# icypower-site — project context for Claude

Read automatically at the start of every Claude Code session in this repo.

## 🔄 Session Handoff Log — read this section first, every time

Both Oron and Eldar work on this repo, in separate Claude Code sessions,
sometimes without the other knowing. This section exists so no session
starts blind, and so nobody undoes another session's work by accident —
that already happened once (see History).

**Rules for every session working in this repo:**
1. Read "Latest status" below before doing anything else.
2. At the end of **every change or action** — not just big milestones —
   update "Latest status" before ending your turn. If unsure whether
   something's worth logging, log it anyway.
3. "Latest status" is a snapshot of *right now* — overwrite it each time.
   Add one short line to "History" so nothing gets lost — a sentence is
   enough, it's a breadcrumb trail, not a full report.
4. If you're about to do something that might conflict with, undo, or
   reinterpret a decision recorded here (e.g. "is this repo a stray
   duplicate or intentional?") — **stop and ask the user first.** See
   "Important history" below for exactly why this rule exists.

### Latest status
- **Date:** 2026-07-10
- **What changed:** Content/UX pass from Eldar's session: contact form now
  submits via `fetch` so the page never navigates to FormSubmit's bare
  confirmation page — instead an inline "תודה!" success card fades in in
  its place (see `assets/main.js` + `.form-success` in `styles.css`).
  Removed the "עדיף בוואטסאפ" note and the waiver-form contact button from
  `contact.html` (waiver link still reachable via the footer). On the
  homepage: the intro section is now vertically centered against its photo
  carousel with a decorative accent quote-mark icon (it looked plain after
  the eyebrow label was removed in an earlier session); the "קצת עלינו"
  about section got a two-avatar founders row (Eldar/Oron, styled like the
  testimonials' avatar component) so it's not just a wall of paragraphs;
  both blue-panel sections (about + gallery) now have a wavy SVG top/bottom
  edge instead of a straight line.
- **Why:** Eldar reported the contact form's post-submit page looked
  broken/off-brand, and that the intro + about sections felt visually
  "blank." This session's Eldar-side local folder was also freshly synced
  to match this canonical repo exactly beforehand (see below), after it had
  drifted (missing this CLAUDE.md/README.md/`_headers`, still had a stale
  `netlify.toml`) from deploying via the old `wrangler` workflow.
- **Next goal:** None pending for this repo specifically. Eldar still needs
  to drop a real vertical clip at `assets/video/about.mp4` (currently shows
  a photo poster instead) and a hero background video, whenever he has
  the footage.
- **Anything the next session needs to know:** Eldar's local clone lives at
  `C:\Users\eldar\Desktop\claudecode\icypower-site` (a clean, separate git
  checkout of this repo — NOT a subfolder of `icypower-management`
  anymore). Deploys only happen via `git push` to `main`, per the rule
  below — never `wrangler pages deploy`.

### History
- 2026-07-10 — Repo created (split from `icypower-management`, history
  preserved). Briefly archived and Cloudflare misconfigured by mistake,
  then fixed. `README.md`/`CLAUDE.md` added (had been left behind by the
  split since they lived at the old repo's root, not inside the
  `icypower-site/` subfolder).
- 2026-07-10 — Eldar's local folder had drifted (still deploying via old
  `wrangler` uploads, missing this repo's `CLAUDE.md`/`README.md`/
  `_headers`) — re-cloned fresh from this repo, no content lost (verified
  this repo already had his latest edits). Then: contact form fixed to
  confirm inline instead of navigating to FormSubmit's page; removed two
  small contact-page elements; polished the intro and about sections
  (centered intro layout + accent icon, founders avatar row); added wavy
  top/bottom edges to both blue-panel sections.

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
