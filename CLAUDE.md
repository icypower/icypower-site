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
- **What changed:** Repo created by splitting the marketing site out of
  `icypower-management` (full git history preserved via `git subtree
  split`). Shortly after, a separate session mistook this repo for a stray
  duplicate, archived it, and reconnected the `icypower` Cloudflare Pages
  project to the old (now-empty) location instead — this nearly broke the
  live site. Fixed: this repo unarchived, `icypower`'s Cloudflare project
  reconnected here correctly (root directory blank), confirmed via a real
  successful deploy that the live site works.
- **Why:** Keep the public marketing site cleanly separate from the
  business's internal apps (tracker, waivers), which live in
  `icypower-management`.
- **Next goal:** None pending for this repo specifically right now — it's
  stable. Ongoing work (Cloudflare D1 database, unified back-office) is
  tracked in `icypower-management`'s `CLAUDE.md`.
- **Anything the next session needs to know:** This repo is the real,
  canonical site — see "Important history" below before assuming otherwise.

### History
- 2026-07-10 — Repo created (split from `icypower-management`, history
  preserved). Briefly archived and Cloudflare misconfigured by mistake,
  then fixed. `README.md`/`CLAUDE.md` added (had been left behind by the
  split since they lived at the old repo's root, not inside the
  `icypower-site/` subfolder).

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
