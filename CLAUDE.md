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
- **Date:** 2026-07-12
- **What changed:** Hero made taller (bottom padding 36px → 90px) and the
  video frame enlarged/moved closer to center (240-480px wide → 280-560px,
  6% from the left → 13%). Eldar's request was ambiguous ("lower the
  border... make it bigger horizontally") - interpreted as "make the
  section taller" since that's the literal reading of "lower the border";
  he didn't answer a clarifying question either way, so check with him if
  this isn't what he meant.
- **Earlier the same day:** Added a rounded video frame (`.hero-video-frame`) on
  the hero's left side (opposite the text) - a `<video id="heroVideo">`
  that plays three clips back-to-back on loop (`assets/video/hero-1/2/
  3.mp4`, chained via an `ended` listener in `main.js`), sourced from
  Eldar's `contents/` folder (his own staging folder outside the repo,
  not committed - only the copies under `assets/video/` are tracked).
  Hidden below the existing 820px mobile breakpoint (same one that
  already hides `.about-video`/`.faq-photo`) to keep mobile light. Heads
  up: the three clips total ~19MB and there's no ffmpeg on this machine
  to compress them, so if load feels heavy on mobile, ask Eldar for
  lighter/shorter exports or compress them before swapping in.
- **Earlier the same day:** Contact-form emails now get a unique subject line per
  submission (sender's name + a timestamp, set in `main.js` right before
  the `fetch` POST) instead of the same fixed `ליד חדש מאתר IcyPower`
  text every time - Eldar found Gmail was stacking every lead into one
  long conversation thread because the subject never changed. Don't
  "fix" this back to a static subject; the varying subject is what keeps
  each lead as its own thread.
- **Earlier the same day:** The intro section (right under the hero) now fades in
  immediately on page load instead of waiting for scroll (`main.js`'s
  scroll-reveal block special-cases `.section.intro .reveal` elements -
  adds `.in` to them immediately instead of handing them to the shared
  `IntersectionObserver`). Also confirmed for Eldar: the contact form
  already posts to FormSubmit.co addressed to `icypowerteam@gmail.com` -
  no code change needed there, just a reminder that FormSubmit requires
  clicking a one-time activation link (sent to that inbox on the very
  first submission ever) before it starts forwarding leads automatically.
- **Note on this session's tooling:** the existing `icy` preview server
  config (root `.claude/launch.json`, Perl-based, port 5602) works fine
  standalone, but the Browser-pane preview tool itself failed to
  navigate/screenshot against it (same unreliability as earlier this
  week) - verification fell back to static checks (`node -c` syntax
  check, grep, live HTTP fetch of the deployed JS) instead.
- **Earlier the same day:** Moved the "כבר עבדנו עם" trust-strip/logo-carousel
  section to sit right after the About section instead of right before
  it (order is now: ... FAQ → About → Trust strip → final CTA). Pure
  markup reorder in `index.html`, no content/CSS changes.
- **Earlier the same day:** Added more `.spark` twinkling dot accents to the hero
  background (Eldar said he liked the original 7 and wanted more). While
  this was in flight, **Eldar had a second Claude Code session open on
  this same local checkout at the same time**, which independently
  rewrote all the spark spans (switched `inset-inline-start` to plain
  `left`, evened out their spacing/sizes) and added a thin divider line
  above the "כבר עבדנו עם" label plus matching CSS. Both sets of changes
  were confirmed with Eldar and merged into two commits, then pushed
  together (`1f3a4c2`, `d0d06f2`) after rebasing onto one more commit
  that had landed on `main` in the meantime (a docs-only `CLAUDE.md` fix
  in this repo, no code conflict). Live site now has 20 sparks total,
  positioned via `left` (not the logical `inset-inline-start` property
  used before), plus the new divider. Confirmed via the specific
  Cloudflare deployment URL directly (the `icypower.pages.dev` alias was
  still serving a cached copy briefly after deploy — that's normal CDN
  lag, not a broken deploy).
- **Anything the next session needs to know:** Two Claude Code sessions
  editing this same local working copy at once is a real, current risk,
  not just a hypothetical from the History below — it happened again
  today. If `git status`/`git diff` shows unexpected uncommitted changes
  you didn't make, don't assume it's stray/broken — ask Eldar whether
  another session is active before committing, discarding, or stashing
  anything. Also: the Bash tool's shell here does **not** reliably persist
  `cd` across tool calls within a session (it silently resets to the
  parent folder `C:\Users\eldar\Desktop\claudecode` between calls at least
  once this session) — always `cd` into `icypower-site` explicitly,
  chained with `&&`, in the same command as any git operation, and don't
  trust an earlier `cd` to still be in effect.
- **Earlier (2026-07-11):** The "כבר עבדנו עם" logo widget is now a **manual
  coverflow carousel** (`.logo-stage`/`.logo-card` in `styles.css`,
  render logic in `main.js`) — one large centered logo card with the
  other 4 stacked smaller/dimmer on either side, round prev/next arrows,
  click-a-side-card-to-jump, still auto-advances every ~3.2s. This
  replaced an auto-scrolling marquee version from earlier the same day
  that had a real bug (see History) and then didn't match what Eldar
  actually wanted (he wanted the manual card-stack look, not a scroller)
  — if you're asked to touch the logos widget again, this coverflow
  version is the one to build on, not the marquee.
- **Earlier the same day:** Homepage revision (About repositioned +
  condensed, session-card photo ratio flip, steps timeline redesign,
  benefits section removed, dashes normalized — see History for the full
  list). Then the hero was made content-sized (matches `.page-hero`'s
  existing pattern) instead of `min-height:92vh` so it ends right after
  its content instead of a huge empty gap, then further shrunk again and
  given a blue-gradient-plus-sparks background instead of a photo (still
  too tall/text too big the first time), and the now-redundant scroll-down
  cue was removed. The final CTA band's padding was reduced so it's
  noticeably shorter. The contact form's success message is no longer an
  inline block that replaced the form (it read as stranded in a corner) —
  it's now a small rounded `.toast` that fades in near the bottom of the
  screen and disappears on its own after 5s (no close button), and the
  form resets and stays usable right after submitting.
- **Why:** Eldar reviewed the live site and found the sessions subtitle
  redundant, the trust strip too generic (wanted real client logos), the
  about section buried too early and text-heavy, the session cards
  text-heavy relative to their photos, the steps section visually
  indistinguishable from the session cards above it, the benefits section
  repetitive, dash styles inconsistent, the hero far too tall relative to
  its content, the final CTA too tall, and the post-submit contact form
  message awkwardly placed.
- **Next goal:** None pending for this repo specifically. Still waiting on
  Eldar for: real founder photos (to replace the initial-letter avatars),
  a real vertical clip for `assets/video/about.mp4`, and a hero background
  video.
- **Anything the next session needs to know:** Push access needs a token
  from the **icypower** GitHub account, not eldar-marom (his personal
  token is read-only here) — Eldar generated one and it's stored as the
  `GITHUB_TOKEN_ICYPOWER` user env var on his PC specifically for this repo
  (his older `GITHUB_TOKEN` still works fine for `icypower-management`).
  Eldar's local clone lives at
  `C:\Users\eldar\Desktop\claudecode\icypower-site` (a clean, separate git
  checkout of this repo — NOT a subfolder of `icypower-management`
  anymore). Deploys only happen via `git push` to `main`, per the rule
  below — never `wrangler pages deploy`. One deploy this session failed at
  the `deploy` stage with `Error: Failed to publish your Function. Got
  error: Unknown internal error occurred.` — this project has no Functions
  at all, so it's a transient Cloudflare-side glitch, not a real problem
  with the code (the asset upload itself had already succeeded). Fix: `POST
  /accounts/{account_id}/pages/projects/icypower/deployments/{id}/retry`
  via the Cloudflare API (using `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`)
  — the retry succeeded immediately. If a deploy ever looks like it didn't
  take effect after pushing, check
  `GET .../pages/projects/icypower/deployments` for a `failure` status
  before assuming the CSS/HTML is wrong.

### History
- 2026-07-12 — Made the hero taller and enlarged/recentered the video
  frame (request was ambiguous, unconfirmed - see Latest status).
- 2026-07-12 — Added a looping 3-clip video area to the hero's left side
  (~19MB total, uncompressed - no ffmpeg available on this machine).
- 2026-07-12 — Contact-form emails now get a unique subject line per
  submission (name + timestamp) so Gmail stops stacking every lead into
  one conversation thread.
- 2026-07-12 — Intro section now fades in on page load instead of on
  scroll; confirmed the contact form already emails
  `icypowerteam@gmail.com` via FormSubmit (needs one-time activation
  click on first-ever submission).
- 2026-07-12 — Moved the trust-strip logo carousel to after the About
  section instead of before it.
- 2026-07-12 — Added more hero spark accents; concurrently, a second
  active Claude Code session on the same local checkout added a
  trust-strip divider and rebalanced all spark positions/spacing —
  confirmed with Eldar and merged both into one push.
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
- 2026-07-10 — Discovered Eldar's personal GitHub token can't push here
  (read-only); he generated a new token from the icypower account
  (`GITHUB_TOKEN_ICYPOWER`) with write access. Then: bigger homepage pass —
  logo carousel with real client logos, About section moved + condensed +
  founders relabeled, session cards made photo-dominant, steps section
  redesigned as a connected timeline, benefits section removed, all
  em-dashes normalized to hyphens.
- 2026-07-10 — Hero shrunk to a content-sized box (was min-height:92vh),
  scroll-cue removed as no longer needed; final CTA band padding reduced;
  contact form success message changed from an inline block to a small
  self-dismissing toast, form now resets after a successful submit.
- 2026-07-10 — Fixed the logo carousel's loop math (was a plain -50% shift,
  which doesn't land on a real repeat boundary with an odd gap count —
  caused a visible jump/blank gap); rebuilt as 4 identical `.logo-set`
  groups shifted by an exact pixel amount. Redesigned the hero further:
  photo background replaced with a blue gradient + twinkling spark
  accents, text sizes shrunk and pinned to the right instead of centered,
  large-screen max-width scale-up reduced so it stays compact on wide
  monitors. This push's Cloudflare deploy failed on an unrelated transient
  `Failed to publish your Function` error (no Functions exist in this
  project) — retried via the Cloudflare API and it succeeded immediately.
- 2026-07-11 — The marquee-style fix above still wasn't what Eldar wanted
  once he saw a reference image (a manual card-stack carousel with
  prev/next arrows, not an auto-scroller) — replaced it entirely with a
  coverflow-style carousel (one large centered card, others smaller/dimmer
  on each side, arrows + click-to-jump, still auto-advances).
- 2026-07-11 — (management-repo session) Updated the "Related repo"
  cross-reference below to note that icypower-management's shared D1
  database, Cloudflare Access, and daily backup are now live — no
  marketing-site code changed here.

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
(financial tracker, waiver forms). As of 2026-07-11 those apps are backed
by a shared **Cloudflare D1** database (`icypower-core`), with Cloudflare
Access login on the tracker and an automated daily backup to Google
Sheets — the "unified back-office" idea is now partly built and live, not
just aspirational. This marketing site is intentionally kept separate from
all of that (static, no backend, no database). See that repo's `CLAUDE.md`
for the full architecture reference.
