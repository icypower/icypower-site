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
- **Date:** 2026-08-03
- **What changed:** Swapped `private-groups.html`'s "media" photo for
  a real one (`contents/session pages/pic2.jpg` → new file
  `assets/img/ph-land-6.jpg`, ~1MB → 204KB after ffmpeg compression).
  **Important:** that page previously shared `ph-land-4.jpg` with
  `events.html` - did **not** overwrite that file (which would have
  silently changed events.html's photo too), instead added the new
  photo under its own filename and repointed only
  private-groups.html's reference. **Any time an image file is shared
  across multiple pages, check `grep -rln '<filename>' *.html` first**
  before deciding whether to overwrite in place (fine if only one page
  uses it) or add a new file + repoint one reference (required if
  shared) - this is the second time this exact situation has come up
  this session (see the intro-1.jpg/card-events.jpg swap entry above).
- **Earlier:** Two more updates:
  1. Replaced `assets/img/ph-land-3.jpg` (frozen-lake stock photo used
     on `business.html`'s "חוויה אחת, המון אחרי" section) with Eldar's
     real group session photo (`contents/session pages/pic 1.jpg`,
     resized/compressed with ffmpeg, 450KB → 115KB). **Note the
     `contents/session pages/` folder** - a new staging location
     alongside `gellery`/`section 2`/`section 3`/`hero section`, not
     committed, just for reference if asked to find more files there.
  2. Removed the small category tag labels/bubbles (e.g. "נשימה"/"קרח")
     that were overlaid on gallery photos - both on `gallery.html`'s
     grid (13 of them) and `index.html`'s homepage gallery preview
     strip (4 of them). The `.tag` CSS rule in `styles.css` was left in
     place (harmless, just unused now) rather than deleted, in case a
     future request wants a similar label pattern elsewhere.
- **Earlier:** Replaced all gallery stock photos with real ones -
  Eldar provided 17 candidate photos in `contents/gellery/`; visually
  reviewed every one (using the Read tool's image support) and excluded
  4 that were exact duplicates of photos already used in the homepage
  intro carousel (`sec2 pic 1/5/6/7.jpg`), keeping the remaining 13
  unique ones. Resized to 900px wide + ffmpeg compression (~12MB →
  ~2.6MB, ~78% smaller). `gallery.html`'s grid grew from 12 tiles to 13
  (`assets/img/g01.jpg` through `g13.jpg` - g13 is new, g01-g12 had
  their file contents replaced in place) with tags matched to each
  photo's real content (נשימה/קבוצה/צחוקים/הדרכה/איזון/אמבטיה/חיבור).
  **Note:** the homepage's own gallery preview strip
  (`index.html`, `.gallery-grid.home`) reuses g09/g01/g05/g03 by
  filename, so it picked up new photos automatically too - fixed 2 of
  its tags there since the old ones (קבוצה/אנרגיה) no longer matched.
  `gallery.html`'s own hero background (`hero-gallery.jpg`) was left
  untouched - only the photo grid was in scope for this request.
- **Earlier:** Two small updates:
  1. Sessions section homepage heading: "חוויה אחת, מותאמת לכל קבוצה"
     → "מה מעניין אתכם?" (`index.html`).
  2. Swapped `assets/img/intro-1.jpg` (beach/bucket-hat party photo)
     with `assets/img/card-events.jpg` (soldiers/military photo) -
     Eldar wanted them in each other's spot (the military one into the
     homepage intro carousel, the beach party one onto the אירועים
     ומסיבות card + `events.html`'s hero). **Swapped the actual file
     bytes, not the HTML references** - both filenames are used in
     multiple places (`intro-1.jpg` in the carousel;
     `card-events.jpg` on the homepage card AND `events.html`'s hero
     background), so swapping file contents was simpler and safer than
     chasing every reference. If asked to swap other images like this
     again, this file-content-swap approach is the right pattern -
     confirm by re-reading the resulting files with the Read tool
     (visual check) before publishing, since a byte-swap gives no
     other structural signal that it worked correctly.
- **Earlier:** Each session sub-page's hero background now uses
  the same photo as its homepage card instead of the old generic stock
  photos - `business.html` (card-biz.jpg, was hero-business.jpg),
  `private-groups.html` (card-groups.jpg), `open-session.html`
  (card-open.jpg), `couples.html` (card-couples.jpg), `events.html`
  (card-events.jpg), `contact.html` (card-custom.jpg - this is the
  "משהו אחר במחשבה" card's target; contact.html also serves as the
  general contact page though, worth knowing if that ever feels
  mismatched). Also removed `business.html`'s duplicate "איך זה עובד"
  section (repeated homepage content) - checked every other session
  sub-page for the same pattern and confirmed none had it, only
  business.html did. The nav's "איך זה עובד" **link** stays everywhere
  (it's just a menu item to `index.html#how`, not a section) -
  `index.html`'s own how-it-works section was explicitly left alone
  per instruction.
- **Earlier:** Updated `business.html` copy (companies/teams page):
  hero headline ("גיבוש שלא ישכחו" → "חוויה שהם לא ישכחו") and lead
  line, the "חוויה אחת, המון אחרי" section's intro paragraph, and all 4
  feature-list bullets (kept existing icons, just swapped text). Same
  pattern as the private-groups.html update earlier this session.
  Copy-only.
- **Earlier:** Updated the homepage "how it works" steps section
  heading: "שלושה שלבים. שינוי אחד אמיתי." → "שלושה שלבים. חוויה אחת
  בלתי נשכחת." (`index.html`). Copy-only.
- **Earlier:** Updated `private-groups.html` copy: hero headline
  ("הקבוצה שלכם, חוויה אחרת" → "נשבור שגרה עם החבר'ה?") and lead line,
  the "אתגר שמצחיק ומחבר" section's intro paragraph, and all 4 feature-
  list bullet points (kept the existing icons, just swapped text -
  3rd bullet, "אנחנו מגיעים אליכם...", was left unchanged since Eldar's
  new wording matched the old one exactly). Copy-only, no layout/CSS.
- **Earlier:** Replaced all 6 session card photos
  (`assets/img/card-biz/couples/custom/events/groups/open.jpg`) with
  new ones from Eldar (`contents/section 3/`, staging folder, not
  committed) - each source file was literally named after its card's
  Hebrew heading (e.g. `חברות וצוותים.jpg`), so the mapping was
  unambiguous, no clarification needed. Originals were 1.3-2.4MB each
  at 1536-2048px (~9.7MB total) for a card photo that displays at only
  ~220px tall/~450px max width - resized to 800px wide + ffmpeg
  compression, down to ~1.0MB total (~89% smaller). One was a PNG with
  an alpha channel (`משהו אחר במחשבה.png`) - converted straight to JPG
  since it's used as a plain photo background, not expected to need
  transparency.
- **Earlier:** Updated 4 session card descriptions on the homepage
  (`index.html`, `.sessions-grid`): "חברות וצוותים" (companies/teams),
  "סדנת זוגות" (couples), "אירועים ומסיבות" (added `/ות` to "רווקים",
  now gender-inclusive), and "משהו אחר במחשבה?" (custom - "כמות חריגה"
  → "כמות גדולה", added "מותאמת אישית"). Copy-only, no layout/CSS
  changes.
- **Earlier:** Replaced the intro section's carousel photos
  (`assets/img/intro-1.jpg` through `intro-7.jpg`) with 7 new ones from
  Eldar (sourced from `contents/section 2/`, his own staging folder,
  not committed). Originals were 1536x2048 at 1-1.7MB each (~8.3MB
  total) - resized to 1000px wide + re-compressed with ffmpeg (now
  installed on this machine, see the hero-video entry below) down to
  ~2.1MB total, no visible quality loss. Went from 4 slides to 7 - the
  carousel's JS (`main.js`, reads `.carousel-slide`/`.carousel-dots
  .dot` counts dynamically) and dot markup needed no logic changes,
  just matching HTML added. Discussed with Eldar whether this section
  should become a video window (like the hero) instead of photos -
  decided against it: the hero already carries the video/motion
  moment, and a second autoplaying video right under it would compete
  with the reading content next to it rather than add anything new.
- **Earlier:** Fixed the CTA centering **for real** this time -
  the earlier "fixed" version (`left:50%;transform:translateX(-50%)`)
  looked right in the code but was still visibly off-center in
  practice (button's left edge landed at 50%, not its middle). Root
  cause: `.hero-actions` also carries `.reveal` for its entrance
  animation, and `.reveal.in{transform:none}` (equal specificity,
  later in the file) was clobbering the centering `transform` the
  moment the button revealed itself - `transform` doesn't merge across
  rules, only one wins. Switched to a transform-free centering
  technique (`inset-inline:0;width:fit-content;margin-inline:auto`)
  that can't collide with `.reveal`. **Lesson for future sessions:**
  any element with the `.reveal` class needs positioning/layout done
  without relying on `transform` for anything other than the reveal
  animation itself, or use `.reveal.in` combined with the other
  selector to guarantee it wins the cascade.
- **Earlier the same day:** Fixed the CTA "disappearing" after the previous fix
  moved it out of `.hero-inner`. Real cause: it was never gone - it was
  rendering **behind the opaque video**. `.hero-video-frame` (z-index:1)
  and `.hero-inner` (z-index:2) are positioned with explicit z-index
  values; `.hero-actions`, once moved to be `.hero`'s direct child, had
  none (`z-index:auto`) - and per CSS stacking rules, z-index:auto
  positioned elements paint *behind* any sibling with an explicit
  positive z-index, regardless of DOM order. Added `z-index:2` to fix
  it. **Any future positioned element added as a direct child of
  `.hero` needs an explicit z-index ≥2 or it'll have this same
  invisible-behind-the-video bug.** Also: enlarged the headline further
  (max ~3.1rem → ~3.8rem) and moved it up (was vertically centered via
  `justify-content:center`; now starts ~22% down the section instead
  via `justify-content:flex-start;padding-block:22vh 0`), and removed
  the small logo icon above it entirely per request - cleaned up the
  now-fully-dead `.hero-logo`/`brandPop` CSS (that keyframe was already
  an orphan from an even earlier wordmark-icon swap).
- **Earlier the same day:** Fixed the hero CTA not being truly centered - it was
  visually shifted right. Root cause: `.hero-actions` was absolutely
  positioned (`left:50%;transform:translateX(-50%)`) relative to
  `.hero-inner`, a padded, `max-width`-constrained box nested inside the
  full-bleed `.hero` section, not relative to the section itself. Moved
  `.hero-actions` in `index.html` to be a **direct child of `.hero`**
  (sibling of `.hero-inner`, not nested inside it) so its centering math
  is unambiguous - no CSS change was needed, `.hero .hero-actions`
  matched either way. **If the CTA is ever moved back inside
  `.hero-inner`, expect this same off-center issue to return.**
- **Earlier the same day:** Eldar didn't like the simplified hero's layout, so
  reworked its structure (content unchanged, this is purely CSS/JS):
  1. `.hero` is now exactly `100vh`/`100dvh` tall (was content-sized).
  2. Content is horizontally centered (was pinned to the RTL-start/right
     edge via `margin-inline-start:0` - removed that, `.hero-inner` now
     uses `margin-inline:auto` + `text-align:center`), and the headline
     is enlarged slightly (`2.5rem` max → `3.1rem` max).
  3. The CTA (`.hero .hero-actions`) is pulled out of normal flow with
     `position:absolute;bottom:clamp(40px,7vh,80px)` so it sits near the
     section's bottom edge independent of headline height, instead of
     sitting right below it. **Note:** `.hero-actions` is a shared class
     also used in the CTA band further down the page - the absolute
     positioning is scoped to `.hero .hero-actions` specifically, don't
     move it to the bare `.hero-actions` selector or it'll break that
     other section.
  4. Removed several now-redundant mobile-only centering overrides in
     the 820px media query (centering is the default at every width now).
  5. **Separately, removed the crossfade transition entirely** - clips
     now hard-cut instantly between each other instead of fading (Eldar
     wanted no transition/delay at all). The double-buffer preload
     mechanism (next clip loads in the hidden `<video>` while the
     current one plays) stays - it still prevents any load-stutter on
     the cut, just no more opacity fade. `heroCrossfade()` was renamed
     `heroSwitch()` in `main.js` for clarity now that it's not a fade.
- **Earlier the same day:** Radically simplified the hero to just a headline +
  one CTA - removed the lead paragraph and the meta row (3 icon+phrase
  items) entirely, no replacement, and dropped the secondary "sessions"
  ghost button (WhatsApp is now the only CTA). New headline: "תדליקו את
  הכוח / שבתוככם" (ignite the power within you), replacing "קור שמדליק
  / אנרגיה". **Why:** Eldar shared 3 reference hero sections he liked
  (theicebathclubs.com, zivmanor.co.il, penguinproductions.co.il) and
  specifically praised theicebathclubs.com's headline+CTA-only
  minimalism for giving the brand's "power sentence" full focus. Agreed
  this works for IcyPower too even though it's mostly B2B (where a
  quick context/trust anchor usually matters more than for B2C) because
  the intro section right below the hero already opens with "...לעסקים
  ולקבוצות פרטיות" - so that context isn't lost, just one scroll away.
  Also confirmed explicitly: IcyPower's brand voice is energized/alive/
  laughing/connected/up-for-a-challenge, **not** zen/calm/gentle
  wellness - keep that in mind for any future hero or headline copy. If
  a future session is asked to "add back" a subtitle or stats row here,
  check with Eldar first - this was a deliberate, discussed choice, not
  an oversight.
- **Earlier the same day:** Cleaned up the hero foreground. Eldar noticed the nav
  already shows "IcyPower" (logo + wordmark) right above the hero, which
  then repeated "ICYPOWER" again as a big text wordmark (`.hero-brand`)
  directly under it - redundant/cluttered. Removed that wordmark and
  replaced it with the actual `assets/img/logo-mark.svg` icon
  (`.hero-logo`) above the "קור שמדליק אנרגיה" heading instead. Also
  enlarged and gave more weight to the lead paragraph/meta row for
  visibility, and tightened the h1's letter-spacing slightly - confirmed
  with Eldar to stay on Heebo throughout rather than introduce a second
  typeface just for the hero.
- **Earlier the same day:** The hero video (5-clip crossfade, see History below)
  is now the **full-bleed background of the entire hero section**, at
  every screen size including mobile - not a small rounded window on the
  left anymore. Removed the twinkling spark accents entirely (dead code:
  `.hero-sparks`/`.spark`/`sparkTwinkle` - gone from `index.html` and
  `styles.css`, don't re-add them, the video replaced that role).
  `.hero-bg` is now just a plain dark gradient fallback behind the video
  (visible only before the first frame paints, or if video fails). Added
  `.hero-video-frame::after`, a dark scrim gradient on top of the video,
  so hero text stays readable over moving footage. Confirmed with Eldar
  that video-on-mobile-too was wanted (not gradient-only on mobile).
- **Earlier the same day:** Fixed a *second* cause of the hero video crossfade
  flash - Eldar reported it still happened after the first fix (below).
  `heroCrossfade()` was calling `heroNext.currentTime = 0` right at the
  crossfade moment, forcing a fresh seek exactly as the fade-in started
  - redundant (`.load()` already resets `currentTime` to 0 when the clip
  was queued, seconds earlier) and the seek itself caused a brief decode
  stall. Removed that line, and the incoming clip's opacity fade-in now
  only fires after its `play()` promise resolves (confirming playback
  actually started) instead of assuming it started instantly. **If a
  flash is ever reported again on this feature, look for a third
  possible cause rather than assuming these two fixes were wrong** - the
  Browser preview tool couldn't render in this session to visually
  confirm either fix, so both were verified by logic/code inspection
  only, not by watching it play.
- **Earlier the same day:** Fixed a real bug in the hero video crossfade (below):
  `heroQueueNext()` was reloading the outgoing `<video>`'s `src`
  immediately on crossfade, while that element was still visibly
  fading out over its 0.9s opacity transition - reloading wipes a
  video element's current frame, so this caused a visible flash
  partway through every transition. Fixed by delaying the reload via
  `setTimeout(heroQueueNext, heroFadeMs)` until after the fade-out
  fully completes (`heroFadeMs` = 900, must stay in sync with the CSS
  transition duration on `.hero-video-frame video`). Also reordered the
  clip sequence (hero-2.mp4 moved from 2nd to 4th) and removed the bold
  weight from the "הכוח שבקור" accent-highlighted phrase only (the
  other one, "עם אנרגיה, צחוק, חיבור והמון חיים", stays bold) via a new
  `.accent-regular{font-weight:400}` modifier class.
- **Earlier the same day:** Hero video area overhauled:
  1. Replaced the 3 hero clips with 5 new ones from Eldar
     (`assets/video/hero-1.mp4` through `hero-5.mp4`).
  2. Rebuilt the crossfade logic in `main.js` to use **two stacked
     `<video>` elements** (`#heroVideoA`/`#heroVideoB`) instead of one -
     the next clip preloads into the hidden element while the current
     one plays, then a CSS opacity transition (`.hero-video-frame
     video{opacity:0;transition:opacity .9s} .is-active{opacity:1}`)
     crossfades between them. Fixes the blank/black flash that happened
     before when swapping a single `<video>`'s `src` on `ended`.
  3. **This broke the deploy the first time**: `hero-5.mp4` was 26.9MB,
     over Cloudflare Pages' hard **25MB per-file limit** - the build
     failed silently from Eldar's POV (nothing looked different because
     the previous successful deploy was still live). Diagnosed via the
     Cloudflare deployment logs API
     (`/deployments/{id}/history/logs`), not guesswork.
  4. **Installed `ffmpeg`** (`winget install Gyan.FFmpeg` - the standard
     trusted Windows build, confirmed via `winget show` before
     installing) since none was available on this machine, and
     re-encoded all 5 clips: downscaled 1920x1080→960px wide (the
     display frame maxes out around 620px, so 1080p was pure waste),
     stripped audio (videos are muted anyway), CRF 26. **Total dropped
     from ~67MB to ~6.3MB** with no visible quality loss at display
     size. Redeployed successfully after this.
  - Intro section presentation also polished further this session (see
    entries below): headline moved above the two-column layout,
    centered, single line on desktop; accent line moved from above the
    headline to below it as an underline; headline text enlarged;
    divider lines between paragraphs given breathing room on both sides.
- **Earlier the same day:** Restructured the intro section's layout -
  `.intro-heading` (the `<h2>` + accent bar) moved out of `.intro-text`
  to sit full-width, centered, above the two-column `.intro-split`
  (carousel + paragraphs) instead of inside the text column. On desktop/
  tablet (960px+) the headline forces `white-space:nowrap` at a smaller,
  fitted font-size so it stays on one line; below 960px it wraps
  naturally at a larger size instead of shrinking too small to read.
  `.intro-split` changed from `align-items:center` to `align-items:start`
  so the text column's top now lines up with the carousel's top edge
  instead of both being vertically centered as a pair. Paragraph font
  size was also enlarged (~1rem → ~1.15rem clamp).
- **Earlier the same day:** Polished the intro section's *presentation* only (no
  wording changed) - centered the `<h2>` with a small accent-color bar
  above it, narrowed/shrunk the body paragraphs (720px→560px,
  ~1.1rem→~1rem) for a clearer size hierarchy under the headline, added a
  thin divider line between paragraphs, wrapped two short phrases in
  `<span class="accent">` for scannability, and polished the photo
  carousel's dots (bigger + a bottom gradient scrim for legibility over
  any photo). Design reasoning: kept the carousel (adds life, just needed
  better dot contrast); deliberately did NOT convert to bullet points -
  the copy is flowing narrative prose, not parallel facts, so bullets
  would break the storytelling.
- **Earlier the same day:** Tightened the intro section's copy further (same 3
  `<p>` structure as the previous entry below, just different wording).
  Opening paragraph now leads with a differentiation/belief statement
  ("ב-IcyPower אנחנו מאמינים ש...") instead of a generic feature
  description, and the "hundreds of businesses" credibility paragraph was
  dropped entirely (not replaced) - the logo carousel further down the
  page already covers that with real client names, so it wasn't worth a
  full paragraph here. The third paragraph (session flow + take-home
  value) was kept unchanged. No CSS/layout changes.
- **Earlier the same day:** Rewrote the intro section (right under the hero) -
  removed the decorative quote-mark icon and the old single quote line +
  4-item bullet list, replaced with a plain `<h2>` headline and three
  paragraphs of new copy Eldar provided directly. Cleaned up the now-dead
  `.intro-quote-mark`/`.intro-points`/`.intro .accent` CSS. Also picked up
  and rebased on top of the `/go` QR redirect work (below) that landed on
  the remote from a separate session while this one was in progress -
  confirmed no file overlap before rebasing.
- **Earlier (2026-07-27):**
- **New: this site now has one backend endpoint.** Added
  `functions/go.js` — a Cloudflare Pages Function serving
  `icypower.pages.dev/go`, used for a printed QR code on the roll-up
  banner. It 302-redirects to whatever URL is stored in the shared D1
  database's `settings.qr_target_url` (database: `icypower-core`, shared
  with `icypower-management`'s tracker/waiver apps — see that repo's
  `CLAUDE.md` for the full schema), falling back to the Instagram profile
  if unset/unreachable. **This is the one deliberate exception** to this
  site being pure static HTML/CSS/JS with no backend/database (see "What
  this is" below) — everything else about the site is unchanged.
  Oron/Eldar change the destination from the tracker app's Settings screen
  (More → "QR code redirect (banner)"), not from anything in this repo.
  **Manual step still needed:** this project (`icypower` in Cloudflare
  Pages) needs a `DB` binding added (Settings → Bindings → D1 database →
  `icypower-core`) or `/go` will just keep falling back to Instagram
  instead of reading the real setting.
- **Earlier (2026-07-12):**
- **What changed:** Widened the hero content horizontally: `.hero-inner`
  base max-width 640px → 720px (and every large-screen breakpoint bumped
  proportionally: 680→760, 700→780, 720→800, 760→840), plus the video
  frame's max width 560px → 620px, so both sides spread out more and
  leave less empty gradient gap between them on wide screens.
- **Earlier the same day:** Below 820px (where the hero video is already hidden),
  the hero's heading/lead/buttons/meta row are now centered instead of
  staying pinned to the RTL-start (right) edge - Eldar saw the mobile
  hero looked lopsided with nothing on the video's side to balance it.
- **Earlier the same day:** Hero made taller (bottom padding 36px → 90px) and the
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
- 2026-08-03 — Swapped private-groups.html's media photo for a real
  one via a new file (ph-land-6.jpg), avoiding overwriting the
  ph-land-4.jpg it used to share with events.html.
- 2026-08-03 — Swapped business.html's frozen-lake stock photo for a
  real group photo; removed the tag-label bubbles from gallery photos
  (grid + homepage strip).
- 2026-08-03 — Replaced all 12 gallery stock photos with 13 real ones
  from Eldar (g01-g13.jpg, ~78% smaller after compression); homepage
  gallery strip picked up 4 of them automatically via shared filenames.
- 2026-08-03 — Updated sessions heading to "מה מעניין אתכם?"; swapped
  intro-1.jpg and card-events.jpg's file contents per Eldar's request.
- 2026-08-03 — Session sub-page heroes now use their homepage card's
  photo instead of generic stock images; removed business.html's
  duplicate "how it works" section (only page that had one).
- 2026-08-03 — Updated business.html copy: hero headline/lead, intro
  paragraph, and all 4 feature-list bullets.
- 2026-08-03 — Updated homepage steps-section heading.
- 2026-08-03 — Updated private-groups.html copy: hero headline/lead,
  intro paragraph, and all 4 feature-list bullets.
- 2026-08-03 — Replaced all 6 session card photos with new ones from
  Eldar (matched by filename = card heading), resized/compressed with
  ffmpeg (~9.7MB → ~1.0MB).
- 2026-08-03 — Updated 4 session card descriptions (companies, couples,
  events, custom) with new copy Eldar provided.
- 2026-08-03 — Replaced intro carousel's 4 photos with 7 new ones,
  resized/compressed with ffmpeg (~8.3MB → ~2.1MB); decided against
  making this section video instead of photos (hero already covers that).
- 2026-08-02 — Fixed CTA centering for real: `.reveal.in{transform:none}`
  was clobbering the translateX-based centering; switched to a
  transform-free technique instead.
- 2026-08-02 — Fixed CTA rendering invisibly behind the video (missing
  z-index after the previous move); enlarged/repositioned headline
  upward; removed the logo icon above it.
- 2026-08-02 — Fixed hero CTA off-center: moved `.hero-actions` to be a
  direct child of `.hero` instead of nested in `.hero-inner`, so it
  centers against the full section, not a padded/constrained sub-box.
- 2026-08-02 — Made hero exactly 100vh, centered its content (was
  pinned right), pinned the CTA near the bottom absolutely, and
  removed the video crossfade transition for instant hard cuts.
- 2026-08-02 — Simplified hero to headline + single CTA (removed lead
  paragraph and meta row entirely, dropped 2nd button); new headline
  "תדליקו את הכוח שבתוככם", built around an energized/alive brand voice
  after reviewing 3 reference sites Eldar liked.
- 2026-08-02 — Removed the redundant "IcyPower" text wordmark from the
  hero (nav already shows it), replaced with the logo icon; enlarged/
  emboldened the lead paragraph and meta row.
- 2026-08-02 — Hero video is now the full-bleed background (all screen
  sizes) instead of a side window; removed the spark accents entirely;
  added a dark scrim over the video for text legibility.
- 2026-08-02 — Fixed a second crossfade flash cause: a redundant
  currentTime=0 seek right at the crossfade moment; incoming clip now
  only fades in after play() confirms it actually started.
- 2026-08-02 — Fixed a flash mid-crossfade in the hero video (was
  reloading the outgoing clip's src before its fade-out finished);
  reordered the clip sequence; unbolded one of the two accent phrases.
- 2026-08-02 — Replaced hero videos with 5 new clips + rebuilt as a
  true crossfade (2 stacked `<video>`s). First deploy failed silently
  (Cloudflare's 25MB/file limit, hero-5.mp4 was 26.9MB) - installed
  ffmpeg and re-encoded all 5 (1080p→960px, audio stripped) from ~67MB
  total down to ~6.3MB, then redeployed successfully. Also moved the
  intro's accent line below the headline as an underline, enlarged the
  headline, and spaced out the paragraph dividers.
- 2026-08-02 — Moved intro headline above the two-column layout
  (full-width, centered, single line at 960px+); columns now top-align
  instead of vertically centering; enlarged paragraph text.
- 2026-08-02 — Polished intro section presentation (no copy changes):
  centered headline + accent bar, narrower/smaller body text, paragraph
  dividers, 2 accent-color phrase highlights, better carousel dots.
- 2026-08-02 — Tightened the intro section's copy again: stronger
  differentiation opener, dropped the "hundreds of businesses" paragraph
  (logo carousel covers that better).
- 2026-08-02 — Rewrote the intro section: new headline + 3 paragraphs of
  Eldar's copy, removed the quote-mark icon and old bullet list.
- 2026-07-27 — Added `functions/go.js`, a single Cloudflare Pages Function
  serving `/go` as a database-backed redirect for a printed QR code on the
  roll-up banner (destination stored in the shared D1 database, editable
  from the tracker app, not from this repo). First-ever backend/database
  dependency in this otherwise fully static site — needs a `DB` binding
  added to the `icypower` Cloudflare project (manual step, pending).
- 2026-07-12 — Widened the hero horizontally (text column and video
  frame both grown, at base and all large-screen breakpoints).
- 2026-07-12 — Centered the hero content on mobile/tablet (below 820px,
  where the video frame is hidden) instead of leaving it pinned right.
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
no database — with **one deliberate exception**: `functions/go.js`, a
single Cloudflare Pages Function serving `/go` (a redirect used by a
printed QR code), which reads its target URL from the same shared D1
database `icypower-management`'s apps use. See "Latest status" above and
that repo's `CLAUDE.md` for the full explanation. Nothing else about this
site talks to a database or has any backend logic.

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
