# icypower-site — project context for Claude

Read automatically at the start of every Claude Code session in this repo.

## ⚠️ HARD RULE — Always deploy end-to-end, never ask the user to push or deploy

**Never ask Eldar or Oron to run git commands, push branches, merge PRs, or deploy anything.**
Always handle the full cycle yourself: edit → commit → push branch → open PR → merge to main.
The user gives orders; Claude does everything else. No exceptions.
The only legitimate blocker is when a physical file (image, video) needs to be added to the repo
and genuinely does not exist anywhere Claude can access — in that case, explain the specific file
needed and where to place it, but nothing else. Never ask them to push or deploy.

## ⚠️ HARD RULE — Cloudflare AI: DO NOT USE

**Never enable, configure, call, or touch any Cloudflare AI / AI Agent feature**
(Workers AI, AI Gateway, AI Agents SDK, or any `ai.run()`/AI binding in wrangler.toml).
Eldar explicitly banned this — hitting the usage limit could take the live site down.
This rule has no exceptions. If any request seems to require Cloudflare AI, stop and ask the user for an alternative approach.

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
- **Date:** 2026-09-24 (round 30, same day)
- **What changed:** Removed the ghost "לפרטים נוספים" button Eldar
  circled in a screenshot, from `business.html`'s hero `.hero-actions`
  row - only the WhatsApp CTA ("לתיאום סדנה לצוות") remains. One-line
  removal, no CSS/layout change needed (the row already handles a
  single button fine).
  Verified with Playwright at 390px: `.hero-actions` now has exactly
  one `<a>`, no new horizontal overflow, screenshot confirms a clean
  layout with no leftover gap where the button used to be. PR #119,
  squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 29, same day)
- **What changed:** Follow-up on the `business.html` session-preview
  video modal - Eldar's screenshot showed the native browser video-
  player chrome still visible inside the popup (a scrubber/progress
  bar with time remaining, ±10s skip buttons, a volume icon, and
  picture-in-picture/fullscreen icons top-left). He wants **none of
  that** - just the video playing, with the **only** interaction being
  tap-to-pause / tap-again-to-resume.
  - **Removed the `controls` attribute** from `#spVideoEl`
    (`business.html`) - this alone removes every native control shown
    in the screenshot (Chrome's built-in `<video controls>` chrome).
  - **Added `spToggleVideo()`**, wired to the video's `onclick` -
    pauses if playing, plays if paused. This is now the video's only
    interactive behavior.
  - **Backdrop-click-to-close needed no change** - that existing
    listener only fires when the click lands on the dark backdrop
    element itself (`e.target.id === 'spVideoModal'`), never on the
    video, so it stays completely independent of the new toggle-on-
    click behavior added directly to the video.
  Verified with Playwright: `#spVideoEl` no longer has the `controls`
  attribute; directly exercised `spToggleVideo()`'s logic by
  instrumenting `play`/`pause` (headless Chromium here has no H.264
  decoder, so real playback state can't be observed - same limitation
  noted in earlier rounds) - three consecutive toggles produced
  `play → pause → play`, confirming the flip-state logic is correct.
  Confirmed backdrop-click-to-close still works unaffected. PR #117,
  squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** `business.html`'s
  session-preview video is now fully custom-interaction (no native
  `<video controls>` chrome at all) - click the video itself to
  toggle play/pause, click the backdrop to close. If a similar
  no-native-controls video is ever wanted elsewhere on the site
  (e.g. `booking.html`'s own `bk-`-prefixed video modal still has
  `controls` and hasn't been touched this round), this `spToggleVideo`
  pattern is the one to reuse.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 28, same day)
- **What changed:** Swapped the wa-reviews testimonial screenshot for
  a new one Eldar attached (a longer WhatsApp group thank-you
  conversation) and made it render bigger than the other cards, per
  his request.
  - **`assets/img/wa-review-5.jpg` overwritten** with the new
    screenshot (resized to 1000px wide, same file convention as the
    other review images).
  - **New `.wa-shot-card.wide` modifier** (`assets/styles.css`) -
    420px desktop / 260px mobile, vs. the other cards' shared
    300px/200px - applied only to this one card (`index.html`,
    `class="wa-shot-card wide"`). Deliberately scoped to just this
    card, not a change to the shared `.wa-shot-card` base width, since
    Eldar asked to enlarge *this* screenshot specifically, not the
    whole carousel.
  - **Found and fixed a real bug while wiring this up**:
    `assets/main.js`'s `renderWa()` was overwriting each card's
    `className` wholesale on every render
    (`card.className = 'wa-shot-card pos-' + offset`) - this would
    have silently **stripped the new `.wide` class** the very first
    time the carousel advanced past this card, since nothing preserved
    it across re-renders. Fixed by checking `classList.contains('wide')`
    before each render and re-appending it to the new className.
    **If any other modifier class is ever added to a carousel card
    driven by a similar `className = '... pos-' + offset` re-render
    pattern on this site (logo carousel, wellness-events track), check
    whether that render function preserves extra classes the same
    way** - the logo/wellness carousels don't currently have any such
    modifier classes, so they're not at risk today, but the pattern
    itself doesn't protect against it automatically.
  Verified with Playwright: the `.wide` class survives 5 consecutive
  carousel `next` clicks (confirms the className-preservation fix
  actually works, not just that it looks right once); the wide card's
  rendered width is consistently larger than the standard cards at
  every coverflow position (pos-0/±1/±2); screenshot confirms the new
  screenshot displays correctly and visibly bigger when centered. PR
  #115, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** `.wa-shot-card.wide` is
  now an established pattern for "this one testimonial should render
  bigger than the rest" - reuse that class (don't invent a new one) if
  another landscape/wide screenshot needs the same treatment later,
  and remember `renderWa()` now preserves it automatically across
  re-renders.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 27, same day)
- **What changed:** Two requests on the trust-strip logo carousel
  ("כבר עבדנו עם"): center the Philips logo on load, and make its
  arrows behave like the already-fixed wellness-events carousel
  arrows.
  - **Philips now centered on page load** - `assets/main.js`'s logo
    carousel setup finds the card whose `<img alt="Philips">` and sets
    `logoActive` to its index at init, instead of always starting at
    index 0 (idf.webp). Robust to future logo reordering/additions -
    doesn't hardcode an index.
  - **Found and fixed a real, pre-existing bug while wiring up the
    arrows**: the carousel's prev/next buttons were selected with an
    **unscoped** `document.querySelector('.logo-nav.prev'/'.next')`.
    The wellness-events carousel (earlier in the DOM, every page load)
    reuses those exact same bare class names for its own unrelated
    buttons - so this selector was silently grabbing wellness-events'
    buttons instead of the trust-strip's own, every single time. Net
    effect: **the real trust-strip prev/next buttons had no click
    handler at all** (clicking them did nothing), while the unrelated
    wellness-events buttons picked up an extra, stray `goLogo()`
    listener stacked on top of their own correct handler. This bug
    predates today's session (existed since round 8, when
    wellness-events first reused the `.logo-nav` class) - the reorder
    in round 24 didn't introduce it, just didn't happen to surface it
    either. **Fixed by scoping both selectors to `.trust-strip`**
    (`document.querySelector('.trust-strip .logo-nav.prev'/'.next')`),
    matching the exact scoping pattern the wellness-events carousel's
    own setup already uses (`.we-carousel .logo-nav.prev`/`.next`) for
    the identical reason - **any time a new carousel reuses the shared
    `.logo-nav` button class, its JS setup must scope the selector to
    that carousel's own container, never query it bare.**
  - **Swapped the two buttons' SVG chevron paths** so they point
    outward (right-side button now points right, left-side now points
    left) instead of inward - the same icon-direction fix already
    applied to the wellness-events carousel in round 21. **Click-
    binding direction needed no change** - once properly scoped,
    `prevBtn->goLogo(-1)` (right button, reveals the right-peeking
    previous logo) and `nextBtn->goLogo(1)` (left button, reveals the
    left-peeking next logo) were already correct, unlike the
    wellness-events case in round 22 which needed the bindings
    themselves swapped too. Aria-labels ("הקודם"/"הבא") were already
    accurate and left unchanged.
  Verified with Playwright: Philips is centered on load; clicking the
  right-side button reveals Vamos (index-1 from Philips, the
  right-peeking logo); clicking the left-side button from a fresh load
  reveals IDF (wrapping forward, the left-peeking logo); confirmed the
  wellness-events carousel's own arrows still work correctly and
  independently (no leftover double-binding from the old bug). PR
  #113, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** This site has (at
  least) two independent carousels sharing the bare `.logo-nav`
  button class (wellness-events, trust-strip) - **any future carousel
  JS that queries `.logo-nav.prev`/`.logo-nav.next` must scope the
  selector to its own container**, never call
  `document.querySelector('.logo-nav.prev')` bare, or it will silently
  bind to whichever carousel's buttons happen to appear first in the
  DOM instead of its own - exactly the bug this round fixed.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 26, same day)
- **What changed:** Two small fixes to round 25's `business.html` video
  preview modal, per Eldar's screenshot feedback:
  1. **Black letterbox bars on both sides of the video (desktop and
     mobile).** Root cause: `.sp-video-inner` had a fixed
     `max-width:420px` and the `<video>` had `width:100%` - whenever
     that box's aspect ratio didn't match the portrait clip's own
     (810×1440), the video letterboxed inside the mismatched box with
     its own default black background showing through the gap. Fixed
     by switching to `width:auto;height:auto` on the video itself with
     `max-width:92vw;max-height:80vh` doing the actual clamping - the
     box (`.sp-video-inner`, also `width:auto`) now hugs the video's
     real rendered size exactly, so there's no mismatched space left
     for black bars to fill. Added a thin `2px solid #fff` border
     directly on the video for the "white boundary line, not too
     thick" look Eldar asked for (replacing the border that used to
     sit on the outer box).
  2. **Removed the × close button** (`.sp-video-close`, both the
     button element and its CSS rule) - closing via a click on the
     dark backdrop outside the video was already implemented and
     untouched, that's the only close affordance now.
  Verified with Playwright at 1280px/390px: the close button no longer
  exists in the DOM; the video element's bounding box exactly matches
  `.sp-video-inner`'s (confirms no leftover letterbox padding).
  Screenshot confirms a clean thin white border around the video with
  the × gone. Backdrop-click-to-close re-verified working. PR #111,
  squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** If a modal video's box
  is ever sized with a fixed `max-width`/`width:100%` combo like this
  again, remember that mismatches between the box's aspect and the
  video's own intrinsic aspect show as the video's own default black
  background filling the gap - size the box around the video (`width:
  auto` + `max-width`/`max-height` on the `<video>` itself) instead of
  the other way around, unless a deliberate letterbox look is wanted.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 25, same day)
- **What changed:** Follow-up on round 24's `business.html` video embed -
  Eldar liked the placement but not the presentation: the raw portrait
  `<video>` (810×1440, capped 360px wide) sitting always-visible in the
  page flow looked like an awkward narrow window. Replaced it with a
  **click-to-open preview**, matching a pattern this repo already had
  built for this exact video file on `booking.html`.
  - **New poster photo**: cropped Eldar's newly-attached photo (a
    poolside group session, 1195×896 source) to 16:9 with Pillow, saved
    as `assets/img/session-preview-poster.jpg` - everyone stays fully
    framed, no heads cut off.
  - **`business.html`'s video block replaced with a clickable
    `.sp-preview`** div (background-image: the new poster, centered
    circular play-button SVG, `role="button"`/`tabindex`/keyboard
    Enter-Space support) in the exact same DOM position as before
    (3rd top-level section, between the text+photo block and the
    "נשמור לכם תאריך?" CTA band).
  - **Reused `booking.html`'s existing click-to-open-video-modal
    pattern almost exactly** (`.bk-media`/`.bk-video-modal`/
    `bkOpenVideo`/`bkCloseVideo`, built for this same
    `session-preview.mp4` file) - a fixed-position dark-backdrop modal
    (`#spVideoModal`) holding the real `<video controls>`, toggled via
    an `.open` class. **The "click outside closes it" behavior Eldar
    asked for was already solved once in `booking.html`** - a click
    listener on the modal backdrop itself checks `e.target.id ===
    'spVideoModal'` (i.e. the click landed on the backdrop, not
    bubbled from the video or close button) before closing. Copied
    that exact technique rather than reinventing it.
  - **Built with a new `sp-` prefix, not reusing `bk-`** - this is
    page-specific interactive markup/JS (per this repo's established
    convention: page-specific behavior stays inline on its own page,
    not in shared `assets/main.js` - see `wellness-day.html`'s
    `ADDONS`/`booking.html`'s own modals), so `business.html` gets its
    own self-contained copy (CSS in its own `<style>` block, JS in its
    own inline `<script>` before `assets/main.js`'s `<script src>`
    tag) rather than sharing booking.html's `bk-` classes/functions
    across pages.
  - **Removed the now-dead `.session-video` CSS rule** added last
    round (`assets/styles.css`) - safe to delete outright rather than
    leave unused, since it was added and superseded within back-to-
    back rounds (not a case of "might be restored later").
  Verified with Playwright at 1280px/390px: preview renders in the
  correct DOM position; clicking it adds `.open` to the modal and
  resolves the correct video `src`; clicking the backdrop (not the
  video) removes `.open` again and pauses the video. Screenshot
  confirms the poster crop looks clean, play button centered. No new
  horizontal overflow, no console errors. PR #109, squash-merged to
  `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** `business.html` and
  `booking.html` now both have their **own separate copies** of this
  click-to-open-video-modal pattern (`sp-`/`bk-` prefixes, both built
  around `session-preview.mp4`) - if this pattern is ever wanted on a
  3rd page, or if it needs a behavior fix, consider whether it's
  finally worth promoting into a shared helper in `assets/main.js`
  instead of copy-pasting a third time.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 24, same day)
- **What changed:** Three homepage-polish requests plus one business-page
  addition, all in one round:
  1. **Reordered two homepage sections in `index.html`.** The trust-strip
     logo carousel ("כבר עבדנו עם") now sits right after the sessions
     grid ("מה מעניין אתכם?"), and the WhatsApp-reviews carousel
     ("הודעות מלקוחות שלנו") sits right after that - both used to be
     much further down the page (trust-strip was second-to-last, right
     before the CTA band; wa-reviews was right after the gallery strip).
     New order: hero → wellness-events → sessions → **trust-strip** →
     **wa-reviews** → gallery strip ("ככה זה נראה") → faq → about-us →
     cta-section. Pure markup cut/paste, no CSS changes - confirmed both
     carousels' JS (`main.js` ~line 305/340) reads `.logo-card`/
     `.wa-shot-card` counts from the DOM at runtime, doesn't care where
     in the page their parent section sits.
  2. **Added a Philips logo** to the trust-strip carousel (`#logoStage`,
     now 8 cards). Eldar's attached PNG had a **solid black background
     baked in** (not transparent - confirmed via pixel sampling, no
     alpha channel) - existing logo files in `assets/img/logos/` are
     all flat images with their own white/plain background baked in
     too (not relying on `.logo-card`'s `background:#fff` through
     transparency), so matched that exact convention: used Pillow to
     replace near-black pixels (threshold ~20/255) with white, saved as
     `assets/img/logos/philips.png`. **If another logo with a colored/
     dark background is ever added, check its transparency first** -
     this repo's convention is a baked-in white background in the file
     itself, not a transparent PNG relying on the card's CSS background.
  3. **Added a new testimonial screenshot** to the wa-reviews carousel
     (`#waStage`, now 5 cards) - `assets/img/wa-review-5.jpg`, resized
     to 900px wide from Eldar's attached WhatsApp group screenshot.
     Unlike the 4 existing portrait screenshots, this one is landscape
     (1216×864 source) - `.wa-shot-card` has no fixed aspect ratio
     (fixed `width:300px`, `height:auto`), so it just renders shorter
     within the same card width, no CSS change needed.
  4. **Embedded `assets/video/session-preview.mp4` directly on
     `business.html`**, in a new `<section>` between the existing
     "חוויה שהם לא ישכחו" text+photo block and the "נשמור לכם תאריך?"
     CTA band. This video file already existed in the repo but was
     previously used only inside `booking.html`'s click-to-open preview
     modal (`#bkVideoModal`) - this is the **first place on the site
     it plays inline, always-visible, not behind a click**. Has
     `controls` and **no `autoplay`** - deliberately different from
     every other video on this site (the hero's background clips),
     since this one carries **real audio** (it's a portrait
     810×1440 h264/aac clip) and autoplaying sound on page load would
     be a bad experience. New scoped CSS class `.session-video`
     (styles.css, right after `.split .media`) caps it at 360px wide
     since it's portrait - reuses `.media`'s border/radius look for
     visual consistency without touching that shared class.
  Verified with Playwright at 1280px: homepage section order matches
  the target sequence exactly (checked via `body > section` DOM order);
  `#logoStage`/`#waStage` child counts are 8/5 as expected; clicked
  through the wa-reviews carousel 5 times with no errors; screenshot
  confirms the Philips logo renders on a clean white background
  matching the other cards. `business.html`'s new video section is the
  3rd top-level `<section>` (right after the split text+photo block,
  right before the CTA band), resolves the correct `src`, `controls`
  true, `autoplay` false. No new horizontal overflow at 1280px. PR
  #107, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** `.logo-card`/
  `.wa-shot-card` counts are read dynamically by `main.js` - adding or
  removing a card from either carousel (like this round did twice)
  never needs a JS change, just markup. If `assets/video/
  session-preview.mp4` needs replacing later, it's now referenced in
  **two places**: `booking.html`'s click-to-open modal AND
  `business.html`'s new always-visible embed - keep both in sync if
  the video content changes, or split them onto separate files if they
  should ever diverge.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 23, same day)
- **What changed:** Eldar uploaded a new file directly to `main` -
  `assets/video/Updated new hero vid (short).MOV` (2160x3840 portrait
  HEVC, 50fps, 17.7s, ~40MB) - and asked for it to become the hero
  section's background video **only on mobile view**, with desktop
  left completely unchanged.
  - **Compressed with ffmpeg** (installed fresh this session - wasn't
    present, same one-time-setup situation as earlier sessions that
    needed it) to 900px wide, 30fps, H.264, CRF 26, audio stripped,
    `+faststart` - 40MB → 6.2MB, well under Cloudflare Pages' 25MB/file
    limit (that limit bit an earlier round of this project once before,
    see the 2026-08-02 hero-video History entries - checked proactively
    this time instead of finding out from a failed deploy). Saved as
    `assets/video/hero-mobile-1.mp4`; the raw `.MOV` was removed from
    the repo (it was just staging input, never meant to ship as-is).
  - **`assets/main.js`'s hero-video block (~line 159) now branches on
    `matchMedia('(max-width:680px)')`** - the same mobile breakpoint
    the wellness-events carousel already uses elsewhere in this file,
    reused here for consistency rather than inventing a new one.
    **Mobile**: loads `hero-mobile-1.mp4` into `#heroVideoA` only, sets
    native `loop=true`, and skips the `ended`-driven crossfade
    machinery entirely (pointless for a single clip) - `#heroVideoB`
    stays unused/hidden, harmless. The existing visibility-resume
    (tab/app backgrounding) and first-interaction Low-Power-Mode-kick
    behaviors were duplicated into this mobile branch too (renamed
    `heroMobileResume`/`heroMobileKick*` to avoid colliding with the
    desktop path's identically-purposed functions), since those
    concerns apply regardless of clip count. **Desktop**: the original
    9-clip `heroClips` array and `heroSwitch`/`heroQueueNext` crossfade
    cycle is completely untouched, same code path, same variable names,
    inside an `else` branch of the same top-level `if`.
  - **No `index.html`/`assets/styles.css` changes** - the existing
    `.hero-video-frame`/`#heroVideoA`/`#heroVideoB` markup and full-bleed
    styling already work unmodified for either a single looping clip or
    the multi-clip crossfade; only which clip(s) load and how they cycle
    changes, purely in `main.js`.
  Verified with Playwright: at 390px, `#heroVideoA`'s resolved `src` is
  `hero-mobile-1.mp4` with `loop:true`, `#heroVideoB` never gets a `src`
  at all. At 1280px, `#heroVideoA`/`#heroVideoB` still load the
  original first two clips from the unchanged 9-clip array - confirms
  desktop's code path is byte-for-byte the same as before this change.
  `node -c` on `main.js`. (Headless Chromium in this sandbox has no
  H.264 decoder, so actual playback couldn't be watched - the same
  "no supported sources" console warning appeared identically on both
  viewports, confirming it's a pre-existing environment limitation, not
  something this change introduced - verified correctness via `src`/
  `loop` state instead, same fallback approach used earlier this
  session when the Browser preview tool was unavailable.) PR #105,
  squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** If this clip ever needs
  swapping again, `hero-mobile-1.mp4` is the filename to overwrite (or
  add a `hero-mobile-2.mp4` etc. and update the one-item array in
  `main.js` if Eldar wants more than one mobile clip in rotation later -
  today it's deliberately just one, looped). The mobile/desktop split
  lives entirely in that one `matchMedia('(max-width:680px)')` check at
  the top of the hero-video block - don't thread a condition through
  every helper function, keep the two paths as separate, independently-
  readable branches like this round did.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 22, same day)
- **What changed:** Follow-up on round 21's arrow-icon fix - the icons
  pointed outward correctly, but Eldar reported the *behavior* was
  still backward: pressing the left arrow revealed the picture peeking
  on the **right**, and the right arrow revealed the picture peeking on
  the **left**. Root cause in `assets/main.js`'s wellness-events
  carousel IIFE: `prevBtn` (renders on the right in this RTL section)
  was bound to `goPrev()`, and `nextBtn` (renders on the left) to
  `goNext()` - the click bindings never matched the buttons' actual
  screen position, only round 21's icon direction did.
  - **Fixed by swapping which function each button calls**:
    `prevBtn.addEventListener('click', goNext)` and
    `nextBtn.addEventListener('click', goPrev)` (previously the
    reverse). Now the right-side button genuinely reveals the
    right-peeking picture, left-side button the left-peeking one -
    matches the arrow direction from round 21 for the first time.
  - **Swapped the two buttons' `aria-label` text too** (`index.html`) -
    `prevBtn`'s now says "הבא" (next), `nextBtn`'s now says "הקודם"
    (previous), so screen readers describe the actual behavior, not
    the stale CSS class name (`prev`/`next` class names themselves were
    left alone - internal selectors only, not user-facing).
  - **Swipe gestures needed no change** - `addSwipe(viewport, goNext,
    goPrev)` already follows the universal "swipe left = advance
    forward" convention, which is independent of button screen
    position and was already correct.
  - **The underlying `goNext`/`goPrev` functions and the round-15
    clone-based infinite loop were not touched** - only which button
    calls which function, so the loop/wrap behavior carried over
    unchanged.
  Verified with Playwright at 390px/1280px: clicking the right-side
  button advances forward through the photo sequence (confirmed via
  the centered tile's own caption text, not a "closest to center"
  guess), left-side button goes backward - both directions correct on
  both breakpoints. Re-verified the infinite loop still works after the
  swap (15 clicks = 3 full loops lands back on the correct tile,
  buttons never `disabled`). Confirmed the logo carousel's own separate
  prev/next buttons are untouched. No new horizontal overflow. `node -c`
  on `main.js`. PR #103, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** If this carousel's
  arrows are ever touched again, remember there are TWO separate
  things that both need to agree for "left arrow reveals left picture"
  to actually be true: (1) which way the SVG icon points (round 21),
  and (2) which JS function the button's click listener actually calls
  (round 22, this round) - fixing only one without the other produces
  an arrow that looks right but does the wrong thing, or vice versa.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 21, same day)
- **What changed:** Eldar circled both nav arrows on the
  `#wellness-events` carousel in a screenshot and pointed out they were
  pointing **inward** (toward the carousel center) instead of outward -
  the left-side button showed `›` and the right-side button showed `‹`,
  backward from the usual convention. Swapped the SVG chevron `path`
  values between the `.prev` and `.next` buttons **in this one
  carousel's markup only** (`index.html`) - left button now shows `‹`
  (points left/outward), right button now shows `›` (points
  right/outward). **Did not touch the click handlers** - the same
  buttons still call the same `goPrev`/`goNext` functions in
  `assets/main.js` as before, so next/prev functionality (and the
  round-15 infinite-loop behavior) is unchanged, only the icon glyphs
  swapped.
  - **Scoped correctly**: this site has two other carousels
    (`.logo-stage`/`.wa-stage`) reusing the same `.logo-nav` button
    class with their own separate `prev`/`next` markup instances - grep
    confirmed only the `#wellness-events` instance's `<path>` values
    were touched, the logo carousel and WA-reviews carousel's own arrow
    icons are untouched.
  Verified with Playwright at 390px/1280px: screenshot confirms both
  arrows now visually point outward; clicking left still advances to
  the next photo and right still goes back (checked via the centered
  tile's caption text before/after each click, not just visual icon
  direction). No new horizontal overflow. PR #101, squash-merged to
  `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 20, same day)
- **What changed:** Swapped `business.html`'s why-us section photo
  (`<h2>חוויה שהם לא ישכחו</h2>`, the group-beach-ice-bath photo) for
  one Eldar attached directly in chat (a couple in an outdoor ice bath).
  Grepped `assets/img/ph-land-3.jpg` first - only referenced on
  `business.html`, not shared with any other page - so per this repo's
  established convention, overwrote the file content in place, no HTML
  change needed. The new source photo was square (1024×1024); center-
  cropped with Python/Pillow to the existing file's 1000×563 landscape
  aspect ratio - both people fully framed, no heads cut off (no ffmpeg
  in this environment, same as earlier rounds).
  Verified by re-reading the cropped file with the Read tool before
  committing. Playwright screenshot of the media panel at 1280px/390px
  confirms it renders correctly. No new horizontal overflow at either
  width. PR #99, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 19, same day)
- **What changed:** Follow-up on round 18's "חברות וצוותים" card photo -
  Eldar sent a screenshot showing the crop had too much palm-tree/
  pergola background at the top and not enough of the seated group.
  Re-ran the crop **from the original uploaded source image** (not the
  already-cropped `card-biz-2.jpg`, to avoid double-crop quality loss -
  same approach as the original swap) with the crop window shifted much
  further down (top-bias increased from removing ~1/3 of the excess
  height off the top to ~72%), so the visible window now sits mostly
  toward the bottom of the source photo - cuts the pergola roof/palm
  trees almost entirely, keeps the full seated group prominent with no
  heads cut off. Same 800×643 aspect ratio, `assets/img/card-biz-2.jpg`
  overwritten in place again - no HTML changes.
  Verified by re-reading the newly cropped file with the Read tool
  before committing (confirms the framing directly). Playwright
  screenshot of `#sessions` at 1280px/390px confirms the card renders
  correctly in context - the group now fills most of the frame. No new
  horizontal overflow (pre-existing ~1px mobile overflow, documented in
  earlier rounds, unrelated). PR #97, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** If this same photo needs
  re-cropping again, always re-crop from the original source file
  (`/root/.claude/uploads/.../b04f65d7-image.jpg` in this session's
  scratchpad - not preserved across sessions, so if a future session
  needs it, ask Eldar to re-attach) rather than the already-cropped
  `card-biz-2.jpg`, to avoid compounding quality loss from a crop-of-a-
  crop.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 18, same day)
- **What changed:** Swapped the "חברות וצוותים" (companies/teams) card
  photo on the homepage `#sessions` grid for one Eldar attached
  directly in chat (outdoor group breathwork/meditation circle,
  pergola/pool setting). `index.html`'s card already referenced
  `assets/img/card-biz-2.jpg` - grepped it first and confirmed that
  filename is **not** shared with anything else (`business.html`'s own
  hero uses a different file, `card-biz.jpg`), so per this repo's
  established convention, overwrote `card-biz-2.jpg`'s file content in
  place instead of adding a new filename - no HTML change needed.
  Cropped/resized with Python/Pillow to match the existing card photo's
  800×643 aspect ratio (no ffmpeg in this environment, same as earlier
  rounds).
  Verified by re-reading the resized file with the Read tool before
  committing (confirms the crop, since a byte-swap gives no other
  structural signal it worked) - the full group circle is framed
  correctly. Playwright screenshot of `#sessions` at 1280px/390px
  confirms the card renders the new photo. Grep-confirmed
  `business.html` (different file) is unaffected. No new horizontal
  overflow (pre-existing ~1px mobile overflow, documented in earlier
  rounds, unrelated). PR #95, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 17, same day)
- **What changed:** Copy-only update to `index.html`'s `#wellness-events`
  section (the squiggle-divider section right below the hero). Headline
  ("אירועי וולנס מותאמים אישית לחברות ולקבוצות") is **unchanged** -
  only the lead paragraph below it was replaced: was "לא עוד חבילה
  קבועה מהמדף - אנחנו בונים איתכם אירוע וולנס שמתאים בול לקבוצה שלכם,
  כדי שכל אחד ואחת ייצאו רגועים יותר, מחוברים יותר, וטעונים מחדש.",
  now "כל קבוצה היא אחרת, וגם האירוע שמתאים לה. ב־Icy Power אנחנו
  בונים יחד איתכם חוויה שמתאימה לאנשים שלכם, לאווירה שאתם מחפשים
  ולמטרה של האירוע." per Eldar's new wording. No CSS/layout touched -
  same `.section-head p` styling applies automatically.
  Verified with a visual screenshot at 390px/1280px - renders cleanly
  under the headline at both widths. No new horizontal overflow (the
  small pre-existing ~1px mobile overflow documented in earlier rounds
  is unrelated/unaffected). PR #93, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 16, same day)
- **What changed:** Small copy trim on `business.html`'s hero, following
  up on round 14. Headline shortened from "חוויה משותפת, שחרור סטרס,
  והקניית כלים לצוותים ומנהלים" to "חוויה משותפת, שחרור סטרס, והקניית
  כלים" (dropped the trailing "לצוותים ומנהלים"). Removed the opening
  lead paragraph entirely ("מורידים את הסטרס. מתחברים כצוות. יוצאים עם
  כלים ליום־יום.") since it echoed the headline - the hero now starts
  straight into "אנחנו יודעים שסביבת העבודה..." (the 3 remaining
  paragraphs from round 14 are unchanged). Copy-only, no CSS/layout.
  Verified with a visual screenshot at 390px/1280px - no leftover gap
  or spacing issue where the removed paragraph was. No new horizontal
  overflow. PR #91, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 15, same day)
- **What changed:** Round 13's infinite loop for the `#wellness-events`
  carousel had a real UX flaw Eldar caught from a live screenshot: at
  the boundary (e.g. reaching the last photo on the right), pressing
  `next` again teleported instantly back to the first photo with **no
  animation and no visible "next" content during the press** - it felt
  like a dead end followed by a jump, not a loop. Eldar wanted the
  opposite-end photo to already be peeking in as you approach the
  boundary, then keep sliding continuously in the same direction
  forever, never snapping backward.
  - **Rebuilt the carousel's loop mechanism in `assets/main.js`** around
    **cloned tiles** instead of round-13's index-wrap-and-snap: the 5
    real tiles are cloned once before and once after themselves
    (`aria-hidden`, purely decorative, inserted at setup) so the track
    is actually 15 tiles wide (`cloneBefore(5) + real(5) + cloneAfter(5)`).
    Now `next`/`prev` from the last/first real tile is just a **normal
    one-step animated slide into a clone** - and since a clone is
    visually identical to the real tile it stands in for, the "next"
    photo genuinely peeks in and slides into place, exactly matching
    what Eldar described.
  - **The wrap itself is still an instant re-render (no snap-drag
    across everything)** - but timed correctly this round: once resting
    on a clone between clicks, the *next* navigation first does an
    **imperceptible instant swap** (`transition:none`, forced reflow)
    back to the equivalent real tile, which lands on the exact same
    rendered pixels (a clone sits exactly one full 5-tile
    "cycle-width" from its real counterpart, and cycle-width is
    measured directly from tile geometry, not assumed) - **then**,
    only after a full paint has committed that swap (double
    `requestAnimationFrame`, not a single one - a single rAF wasn't
    reliably enough separation and the animated move right after it
    would sometimes inherit the disabled transition, silently killing
    its own animation), the transition is re-enabled and the actual
    requested move plays normally. **This two-step ordering is the
    part that's easy to get subtly wrong** - doing the remap and the
    next move in the same tick (even with one rAF) can make the move
    itself render instantly instead of animating, which looks like the
    same bug in a different spot. If this carousel (or a similar clone-
    based infinite loop) is touched again, keep the double-rAF gap
    between the snap and the next transform change.
  - Same clone-and-swap technique powers **both mobile** (index-based
    centering, `activeIndex` now ranges within `[realStart, realStart+
    realCount)` between remaps) **and desktop** (offset-based windowed
    scroll, same logic keyed on px `offset` and a measured `cycleWidth()`
    instead of tile count).
  - `maxOffset()`/`maxOffsetMobile()` (round-12's edge-clamping helpers)
    are gone entirely - clamping is fundamentally incompatible with a
    true loop, replaced by the clone-and-remap approach above.
  Verified with a `MutationObserver` on `.we-track`'s `style` attribute
  to directly observe the two-step sequence (instant snap, then a
  separate animated move) rather than trusting sampled transform values
  alone - confirmed the snap always lands on a position that's pixel-
  identical in rendered content (same centered photo + same peeks) to
  what was showing right before it. 15 consecutive `next` clicks (3
  full loops) on mobile land back on the mathematically correct tile
  (verified via the centered tile's own caption text, not a "closest to
  center" guess). `prev` wrap verified the same way, both breakpoints.
  No new horizontal overflow after heavy clicking. Buttons never
  `disabled`. Visual screenshot confirms correct centering post-wrap.
  `node -c` on `main.js`. PR #89, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** If this carousel (or any
  future clone-based infinite-loop carousel on this site) needs
  touching again: (1) the clone-and-remap-with-double-rAF pattern here
  is the reference implementation for a *sliding-track* infinite loop -
  different from `.logo-stage`/`.wa-stage`'s coverflow loop (which
  re-renders discrete positioned cards via modulo index, no clones
  needed, since there's no continuous track to keep visually
  continuous across a wrap); (2) a single `requestAnimationFrame`
  between disabling and re-enabling the transition is **not** reliably
  enough separation - use two, chained - or the move right after the
  snap can silently render without animating.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 14, same day)
- **What changed:** Copy-only update to `business.html`'s hero (companies/
  teams page), per Eldar's new wording. `<h1>` changed from "אירוע
  אמבטיות קרח לצוות שלכם" to "חוויה משותפת, שחרור סטרס, והקניית כלים
  לצוותים ומנהלים" - moves the framing from "ice bath event" to
  stress-relief/team-connection/take-home-tools. The single lead `<p>`
  was replaced with **4 short paragraphs** (stress-relief opener → why
  it matters today → the accumulating-pressure problem → "ובדיוק בשביל
  זה אנחנו כאן"), matching the multi-paragraph copy Eldar supplied
  directly. No CSS/layout change - `.page-hero p` styling already
  applies to any paragraph in that container, so the extra `<p>` tags
  just stack with normal spacing; verified visually this doesn't look
  cramped. Nothing else on the page touched (feature-list bullets,
  CTAs, hero photo, breadcrumb unchanged).
  Verified with a visual screenshot at 390px and 1280px - copy reads
  cleanly against the hero photo at both widths, no cramping. Confirmed
  no new horizontal overflow. PR #87, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-24 (round 13)
- **What changed:** Two more requests on the `#wellness-events` carousel,
  both in `assets/main.js`'s wellness-events carousel IIFE:
  1. **Starts centered on the middle photo on load.** `activeIndex` used
     to start at `0` (sound bath) - mobile visitors only ever saw the
     right-side peek until they clicked once. Changed the initial value
     to `2` (closing-circle, "ביחד כקבוצה") so both-side peeks are
     visible immediately on page load, no interaction needed. Desktop's
     initial `offset` stays `0` - it's a windowed multi-tile view with
     no equivalent "center" concept, and the ask was specifically about
     the mobile peek-on-load look.
  2. **Infinite looping, both mobile and desktop** (confirmed scope via
     AskUserQuestion - Eldar picked "both," not mobile-only). The
     `prevBtn`/`nextBtn` `disabled` clamping at the first/last position
     is gone entirely - pressing `next` past the last photo now wraps to
     the first, and `prev` past the first wraps to the last, on both
     carousel modes.
  - **Avoided a real UX trap while building this**: this carousel's
    `.we-track` slides via a single continuous `translateX()` - naively
    wrapping the index/offset (like the site's *other* looping
    carousels, `goLogo`/`goWa`'s coverflow, which wrap via modulo +
    re-rendering discrete positioned cards, not a sliding track) would
    have made the wrap visibly slide backward across all 5 tiles instead
    of jumping straight to the opposite end. **Added a `snapTo(px)`
    helper** - disables the track's CSS transition for one frame, jumps
    straight to the wrapped position, forces a reflow, then restores the
    transition via `requestAnimationFrame` so the *next* move animates
    normally again. Used by both `goNext`/`goPrev` only on the wrap step
    itself; every other move still uses the normal animated slide.
  - **`.logo-nav:disabled` CSS rule** (styles.css, added round 8) is now
    unused for this carousel specifically (buttons are never disabled
    again) - left in place per this repo's "don't delete now-unused CSS"
    convention; grepped first and confirmed the logo/WA coverflows never
    used `:disabled` either, so nothing else depends on removing it.
  Verified with Playwright at 390px: on load, tile index 2's caption
  reads "ביחד כקבוצה" with ~37-38px peek on both sides (screenshot
  confirms); 3x `next` from load correctly wraps to tile 0, `prev` from
  tile 0 wraps to tile 4, both fully centered; neither button ever
  reports `disabled`; no new horizontal overflow. At 1280px: initial
  view unaffected (offset 0, 3 tiles); repeated `next` clicks wrap
  `offset` back to `0` past `maxOffset()`; `prev` from `0` wraps to
  `maxOffset()`; neither button ever `disabled`; no new overflow.
  `node -c` on `main.js`. PR #85, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** If another carousel on
  this site is ever asked to loop infinitely, check which architecture
  it uses first - a discrete-positioned-cards carousel (like
  `.logo-stage`/`.wa-stage`) can wrap with plain modulo arithmetic and a
  re-render, no special handling needed; a single continuous sliding
  track (like `.we-track` here) needs the transition-disable/snap
  technique (`snapTo()` in `main.js`, this carousel) or the wrap will
  visibly slide backward across every tile in between instead of
  jumping to the far end.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 12, same day)
- **What changed:** Round 10's mobile carousel centering fix turned out
  to only actually work for the *middle* tiles (2-4) - Eldar sent a
  fresh screenshot showing the very first tile (what's visible on page
  load) still flush against one edge with zero peek on the other side.
  Two real bugs found, both in `assets/main.js`'s wellness-events
  carousel block:
  1. **`.we-track` wasn't a positioned element** (no `position` set),
     so `tile.offsetLeft` - which measures against the nearest
     *positioned* ancestor, not just the direct parent - was being
     measured against some element further up the tree instead of the
     track itself, throwing every centering calculation off by a
     constant, silently-wrong offset. **Fixed with `position:relative`
     on `.gallery-grid.we-track`** (styles.css) so it correctly becomes
     the `offsetParent` for its `.gtile` children. **This is a general
     trap for any future carousel/positioning math on this site that
     uses `offsetLeft`/`offsetTop`**: always confirm the element you're
     measuring "relative to" actually IS positioned, or the browser
     silently measures against something else entirely with no error.
  2. **`track.scrollWidth` doesn't reliably include trailing/end
     padding** once content already overflows past it, when the element
     itself isn't the scroll container (`.we-viewport` is, via
     `overflow:hidden` - `.we-track` itself has `overflow:visible`).
     This under-counted `maxOffset()` by about one peek-width, so the
     *last* tile's centered position got clamped short, flush against
     the right edge. **Fixed by adding `maxOffsetMobile()`**, computed
     directly from the last tile's own `offsetLeft`/`offsetWidth` (same
     formula as the normal per-tile centering math) instead of relying
     on `scrollWidth` at all, for the mobile centering path only
     (desktop's existing `maxOffset()`/`scrollWidth` usage is untouched
     and still correct for that path).
  - **Also switched mobile tile-width/track-padding from CSS
    percentages to exact px, computed in JS** (`layoutMobile()`, runs
    inside `apply()` before the centering math each time) - percentage
    track-padding and percentage tile flex-basis compound against each
    other unpredictably (the tile's `%` resolves against the track's
    own content box, which the padding itself shrinks), which is what
    made my first attempt at this same fix still come out asymmetric
    before I found the two bugs above. **If this carousel's sizing is
    touched again, keep the px-based JS approach** - don't revert to
    CSS-percentage tile widths on mobile, it re-introduces this
    compounding problem.
  Verified all 5 slides individually with Playwright (not just a
  "closest to center" heuristic, which can mask a real asymmetry if
  another tile coincidentally measures closer) - every one now shows
  ~37-38px peek on both sides, including the first (on load) and last.
  Confirmed desktop unaffected (still exactly 3 tiles fully visible).
  Visual screenshot confirms the fix matches what Eldar was pointing at.
  No new horizontal overflow. PR #83, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** If a future report about
  this carousel (or a similar one built the same way) says "still
  looks off" after a fix that tested fine in isolation, **verify by
  index, not by a visual "closest tile" heuristic** - this round's
  first debugging pass used exactly that shortcut in a test script and
  it can pick the wrong tile as "active" when peeks are already uneven,
  masking the real bug instead of catching it.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 11, same day)
- **What changed:** Eldar wants `wellness-day.html` (the interactive
  "day builder" page from 2026-08-20) **not accessible right now** -
  removed every link to it site-wide, without touching the page itself.
  - **7 links removed**: the "☀️ אירוע וולנס ליום שלם" hero buttons on
    `business.html` and `private-groups.html` (`class="btn
    btn-wellness-day btn-lg"`), and all 5 `.tile-cta` buttons in the
    homepage's `#wellness-events` photo carousel (rounds 6/8) - each
    tile now shows just its title + one-line caption, no button.
  - **`wellness-day.html` itself was NOT deleted or archived** - it's
    still a real, complete page in the repo, just unreachable through
    normal site navigation now (no nav link, no button, no card
    anywhere points to it). If Eldar wants it back later, the fix is
    just re-adding these same 7 links - no content was lost. This is a
    different situation from the round-3/round-9 "archive and remove a
    section" pattern (which removes markup but keeps a reference copy
    in `archive/`) - here the *destination page* stays fully live and
    unchanged, only the *paths to it* were cut.
  - **`.btn-wellness-day`'s per-page `<style>` block** (in
    `business.html`/`private-groups.html`, the glowing-button CSS) was
    **left in place**, now unused - harmless, matches this repo's
    "don't delete CSS for removed markup" convention. If those buttons
    are restored later, the styling is already there.
  Verified via `grep -rn "wellness-day.html" *.html` (zero results) and
  a visual screenshot check on all 3 touched pages - clean layout, no
  gaps where buttons/CTAs used to be. PR #81, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** `wellness-day.html` is a
  **live, complete, orphaned page** right now - reachable only by typing
  its URL directly, not linked from anywhere on the site. Don't assume
  it's broken or half-built if you land on it; it's intentionally
  unlinked per Eldar's request, not abandoned. Re-check with Eldar
  before deleting it outright or before re-adding links to it.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 10, same day)
- **What changed:** Eldar noticed on mobile that the `#wellness-events`
  carousel (round 8) only ever peeked the *next* tile on one side - the
  active tile sat flush against the viewport's left edge, so there was
  never a peek of the *previous* tile too. Asked to "make this into a
  carousel" on mobile - confirmed via AskUserQuestion he meant a
  standard centered-active-tile carousel (equal peek of both
  neighbors), not an RTL-direction swipe change.
  - **New responsive-aware JS in the same carousel block** (the one
    from round 8, `assets/main.js`): tracks a `window.matchMedia('(max-width:680px)')`
    query and branches - **desktop (≥681px)** keeps the exact
    round-8 behavior (multi-visible windowed scroll, 3 tiles flush
    against the viewport edges, arrows step by one tile-width).
    **Mobile (≤680px)** is new: an `activeIndex` state advances/retreats
    one tile per arrow-click/swipe, and the offset is recomputed each
    time to **center that tile** in the viewport
    (`tile.offsetLeft + tile.offsetWidth/2 - viewport.clientWidth/2`,
    clamped to `[0, maxOffset()]` same as before) - naturally reveals
    equal peeks of the previous/next tile on both sides, clamping
    gracefully at the first/last tile (no peek on the side that doesn't
    exist).
  - **CSS**: mobile tile width reduced from 78% to 72% (`styles.css`'s
    existing `@media(max-width:680px){ .we-track .gtile{...} }` block)
    to leave room for peeks on both sides instead of just one.
  - **If this carousel is touched again**: the mode split lives entirely
    in JS (`mq.matches`), not in separate CSS classes - don't assume
    mobile/desktop are structurally different beyond that one flex-basis
    rule, the centering math is what actually changes the visual result.
  Verified with Playwright at 390px: after navigating, the active tile's
  left/right peek widths are ~equal (~37-38px each), arrows correctly
  disable at both the first and last tile. Confirmed desktop (1280px)
  is unaffected - still exactly 3 tiles fully visible. Visual screenshot
  check on mobile. PR #79, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 9, same day)
- **What changed:** Eldar asked to remove the "איך זה עובד" section
  (3-step timeline: נשימה → קרח → אנרגיה, `id="how"`, directly below
  `#sessions`) from the homepage entirely. Same "archive, don't just
  delete" convention as round 3 - saved the full markup + its dependent
  CSS (`.steps-timeline`/`.step`/`.step-circle`/`.step-num` and their
  mobile vertical-timeline override) to
  `archive/how-it-works-section.html` (self-contained, restore
  instructions at the top) before removing the `<section>` from
  `index.html`. `#sessions` now flows straight into the gallery-strip
  `blue-panel` section.
  - **Nothing deleted from `assets/styles.css`** (the `.steps-timeline`
    etc. rules stay, just unused) or `assets/main.js` (this section had
    no reveal-on-load special case or other JS tied to it, unlike some
    earlier removed sections - nothing else needed touching).
  - **Flagged, not fixed**: `index.html#how` is still linked from the
    nav bar on every other page on the site, plus two inline CTAs
    (`open-session.html`, `private-groups.html`). Those links now just
    land on the homepage top instead of scrolling to a specific spot -
    a dead anchor, not a broken link, so left as-is per the round-3
    precedent of not chasing every cross-page reference on a section
    removal unless asked. If this bothers Eldar later, either restore
    the section (fixes it automatically) or remove/repoint those nav
    links - not done proactively this round.
  Verified with Playwright at 390×844/1280×900: `#sessions`'s next
  sibling is the gallery-strip section, no `.steps-timeline`/`#how`
  markup remains, no new horizontal overflow. PR #77, squash-merged to
  `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** `archive/` now holds 3
  removed-section reference files (`intro-section.html`,
  `activity-preview-section.html`, `how-it-works-section.html`) - same
  restore pattern for all three, read the file's own top comment.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 8, same day)
- **What changed:** Two requests: (1) add 2 more photos to
  `#wellness-events`'s photo row with left/right arrows to reveal the
  ones that don't fit ("5 pictures, buttons that when pressed the
  pictures that are too much on the side will come to the screen"), and
  (2) the caption text was still pinned to the bottom of each tile after
  last round's spacing fix - Eldar hard-refreshed and confirmed it
  wasn't a caching issue, it genuinely needed to move.
  - **The 2 new source photos were pushed directly to `main` by Eldar**
    (`assets/img/Gemini_Generated_Image_s7bb11s7bb11s7bb.jpg` - a
    sound-bath/gong session, `assets/img/IMG_2100.PNG` - an ice-bath
    photo with ~261px black letterbox bars top/bottom, confirmed by a
    pixel-brightness scan) - same pattern as round 5. Resized/compressed
    with Python/Pillow to `assets/img/we-soundbath.jpg`/
    `we-icebath.jpg` (~800px wide). **No manual crop needed for the
    letterbox bars** - the tile's 4/5 aspect ratio is wide enough
    relative to the photo's own narrow aspect that `background-size:cover`
    crops ~21% off the top/bottom automatically, more than enough to
    remove the ~9%-each black bars without cutting into the subject.
  - **Final photo order (confirmed with Eldar)**: sound bath → breathwork
    → group circle → aromatherapy → ice bath.
  - **New `.we-carousel`/`.we-viewport`/`.we-track` structure**
    (`index.html`/`assets/styles.css`) wraps the 5 `.gtile`s - a
    genuine multi-visible sliding carousel (3 tiles visible on desktop,
    ~1.2 on mobile with a "peek" of the next one), **not** the site's
    existing single-focus coverflow pattern (`.logo-stage`/`.wa-stage`,
    which show one card at a time with others scaled/dimmed on the
    sides - a different visual model, not reused here). Arrow buttons
    reuse the existing `.logo-nav` circular button class + the same
    chevron SVGs already used by the logo carousel (`index.html:319-333`)
    - no new button visual style needed. New `.logo-nav:disabled{opacity:.35}`
    rule added since this carousel (unlike the looping coverflows) has
    real start/end bounds and disables the arrows there.
  - **Important technical choice**: `.we-track` (the sliding element)
    is given an explicit `direction:ltr`, overriding the page's global
    RTL, so the carousel's slide offset is driven by **plain JS
    `translateX()` px math** instead of native `overflow-x:auto` +
    `scrollLeft`. This sidesteps a real cross-browser landmine: under
    `direction:rtl`, `scrollLeft`'s sign convention differs between
    Chrome/Firefox/Safari, making arrow-button-driven native scroll
    unreliable on an RTL page. Since `direction:ltr` also flips how
    child text renders, `.tile-caption` (the Hebrew caption inside each
    tile) explicitly sets `direction:rtl` back, scoped to just that
    element - **if this carousel's structure is ever touched again,
    keep that `.we-track{direction:ltr}` / `.tile-caption{direction:rtl}`
    pairing intact**, removing either half without the other will
    visibly break something (RTL scroll bugs or reversed Hebrew text).
  - New JS block in `assets/main.js` (right after the WhatsApp coverflow
    block) - reuses the file's existing `addSwipe()` helper for touch,
    computes `stepSize()` from the actual rendered tile width + gap (not
    a hardcoded px value, so it stays correct across breakpoints/photo
    additions), clamps `offset` between 0 and `maxOffset()`, and
    disables each arrow at its respective bound.
  - **Caption fix**: `.gtile .tile-caption` changed from
    `inset-block-end:14px` (pinned to bottom) to `top:50%;transform:
    translateY(-50%)` (vertically centered). Also added a translucent
    dark panel background behind the caption text
    (`background:rgba(12,26,43,.38);border-radius:14px;padding:14px 12px`)
    since legibility can no longer rely on `.gtile::after`'s
    bottom-biased scrim now that the text floats over arbitrary
    mid-photo content.
  Verified with Playwright at 390×900/1280×900: `prev` disabled/`next`
  enabled initially, clicking `next` repeatedly reveals the ice-bath tile
  and disables `next` at the end, caption's bounding-box vertical
  midpoint matches its tile's midpoint (confirms centering, not just
  that the CSS rule exists), no new horizontal overflow. Visual
  screenshot check at both widths. `node -c` on `main.js`. PR #75,
  squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** This site now has its
  **first genuine multi-visible sliding carousel** (as opposed to the
  existing single-focus coverflow pattern) - if a future request wants
  a similar "show N at once, arrows reveal more" carousel elsewhere,
  `.we-carousel`/`.we-viewport`/`.we-track` is the pattern to reuse
  (and generalize/rename if it's no longer wellness-events-specific),
  not the coverflow classes.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 7, same day)
- **What changed:** Eldar shared reference screenshots and asked to
  "move their writing to the center" and add more space around the CTA
  in `#wellness-events`. **Checked first with Playwright before
  touching anything**: the paragraph, phone CTA, and photo-tile captions
  were already `text-align:center` (added in earlier rounds this
  session) - so this wasn't a centering bug, just needed more breathing
  room. Confirmed with Eldar via AskUserQuestion that the ask was
  spacing only, scoped to the section's paragraph+CTA (not the photo
  tiles).
  - **New scoped class**: `.wellness-events-cta{margin-block:28px}`
    (styles.css, right after `.squiggle`) added to the existing
    `<a href="tel:...">` button (now `class="btn btn-primary btn-lg
    wellness-events-cta"`). Doubles the gap above/below the button
    (14px → 28px each side). **Deliberately scoped to this one button**,
    not a change to `.section-head p`'s or `.squiggle`'s base margins -
    those are shared classes used (or reusable) elsewhere on the site,
    so a global change there would have silently affected other
    sections too.
  Verified with Playwright at 390×844/1280×900 (computed margin is 28px
  top/bottom, no new horizontal overflow) plus a visual screenshot
  check. PR #73, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change. Still
  waiting on Eldar to send new photos for the `#wellness-events` photo
  row (see round 6 entry below) - swap + caption text update when they
  arrive.
- **Anything the next session needs to know:** If asked to adjust
  spacing/alignment again, **check computed styles with Playwright
  first** before assuming something's broken - this round confirmed
  centering was already correct and the real ask was just more margin,
  which would have been easy to misdiagnose as an alignment bug from
  the screenshots alone.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 6, same day)
- **What changed:** Eldar pointed at the same reference wellness site
  from round 4 and asked for one more piece of its format: each of the
  3 photos in `#wellness-events`'s photo row (breathwork/closing-circle/
  aromatherapy) should have a title, a short caption, and a light
  (not-bold) CTA overlaid on the photo itself.
  - **New `.tile-caption`/`.tile-cta` CSS** (styles.css, right after the
    existing `.gtile` rules ~line 416) - `.tile-caption` is a centered
    title+caption+button block pinned to the bottom of each `.gtile`,
    reusing the scrim that already existed there (`.gtile::after`,
    unchanged). `.tile-cta` is deliberately **not** `.btn`/`.btn-primary`
    - Eldar explicitly wants it "not very bold," so it's a translucent
    white pill (`background:rgba(255,255,255,.14)`, blurred border) -
    **if asked to add another photo-overlay CTA elsewhere on the site,
    reuse `.tile-cta` for that lightweight look, not `.btn`.**
  - Added matching markup to all 3 `.gtile`s in `index.html`: titles
    (נשימות / ביחד כקבוצה / ארומתרפיה), one-line captions, and CTAs
    ("מתחילים לנשום" / "מצטרפים אלינו" / "מגלים עוד") all linking to
    `wellness-day.html` (same bridge destination the section already
    uses elsewhere).
  - **This copy is placeholder, tied to the current placeholder
    photos** - Eldar said he'll send new photos soon to replace
    breathwork/closing-circle/aromatherapy. **When those arrive, this is
    a quick follow-up**: swap the 3 image files and update the
    title/caption/CTA text to match the new photos' content - no
    structural change needed, the `.tile-caption` markup pattern stays
    the same.
  Verified with Playwright at 390×844 and 1280×900 (all 3 tiles render
  title/caption/CTA, CTA hrefs correct, no new horizontal overflow) plus
  a visual screenshot check at both widths. PR #71, squash-merged to
  `main`.
- **Next goal:** Waiting on Eldar to send the 3 replacement photos for
  this row - when they arrive, swap `assets/img/retreat-breathwork.jpg`/
  `retreat-closing-circle.jpg`/`retreat-aromatherapy2.jpg` references in
  `index.html`'s `#wellness-events` `.gallery-grid` and update the 3
  `.tile-caption` title/p/CTA text to match.
- **Anything the next session needs to know:** Nothing else pending.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 5, same day)
- **What changed:** Eldar asked to swap two homepage session-card photos:
  "חברות וצוותים" (companies/teams) → an ice-bath scene, "סדנה פתוחה"
  (open session) → a group photo. He referenced them as "sessions pic 3"
  and "sessions pic 4" - those files didn't exist anywhere accessible to
  this cloud session at first (genuinely missing, not a search failure -
  checked the whole repo and filesystem), so per this repo's hard-rule
  exception, asked Eldar to attach them directly in chat. **While waiting,
  Eldar separately pushed the real files straight to `main`** (`assets/img/
  sessions pic 1-4.JPG`, a direct "Add files via upload" commit, not
  through this session) - used those authoritative repo files instead of
  the chat attachments once they landed.
  - **Confirmed which file is which**: `assets/img/sessions pic 3.JPG` is
    the ice-bath scene (two guys at an outdoor ice tub), `sessions pic
    4.JPG` is the group photo (women looking at cards indoors) - mapped
    pic 3 → חברות וצוותים, pic 4 → סדנה פתוחה exactly as asked.
  - Resized/compressed both to ~800px wide with Python/Pillow (no ffmpeg
    available in this session's environment - installed Pillow via pip
    instead; same target size/quality this repo's other card photos use)
    and saved as new files: `assets/img/card-biz-2.jpg`,
    `assets/img/card-open-2.jpg`.
  - **Did not overwrite `card-biz.jpg`/`card-open.jpg` in place** -
    confirmed via grep that both filenames are shared: `card-biz.jpg` is
    also `business.html`'s hero background, `card-open.jpg` is also
    `open-session.html`'s hero background (this exact "check for shared
    filenames before overwriting" pattern is documented repeatedly
    earlier in this file's History - kept following it). Only
    `index.html`'s two `.sessions-grid` card references were repointed to
    the new `-2.jpg` filenames; `business.html`/`open-session.html`'s own
    hero photos are untouched.
  - Note for future reference: `assets/img/sessions pic 1.JPG` and
    `sessions pic 2.JPG` also landed in that same direct-push commit but
    weren't asked for or used yet - they're sitting in the repo unused,
    available if a future request calls for them (unknown content, not
    reviewed this round).
  Verified with a Playwright screenshot of `#sessions` at 1280px - both
  cards show the correct new photos; grep-confirmed `business.html`/
  `open-session.html` still reference the original filenames. PR #69,
  squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change. Mid-turn, the
  user also referenced a different reference-site section (photos with a
  short caption + light CTA overlaid on each image) and said "do this" -
  that request was explicitly deferred ("finish your previous task
  first") and had not yet been scoped/planned as of this entry; check
  chat for whether it was picked up in a later round.
- **Anything the next session needs to know:** `assets/img/sessions pic
  1.JPG` and `2.JPG` exist in the repo, uploaded but unused/unreviewed -
  don't assume they're already wired into anything.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 4, same day)
- **What changed:** Eldar showed a reference wellness-business homepage
  (screenshot of "פינגווין הפקות וולנס") and liked its section format
  directly below the hero: a decorative squiggle divider, bold headline,
  short paragraph, a phone-call CTA button, another squiggle, then a row
  of 3 photos. Asked for the same format built for Icy Power, in the same
  position (directly below `.hero`, which now flows straight into that
  new section then `#sessions`) - explicitly **without** the reference's
  circular mascot/logo icon on the side.
  - **New section**: `<section class="section" id="wellness-events">`,
    inserted right after `.hero` and before `#sessions`. Headline "אירועי
    וולנס מותאמים אישית לחברות ולקבוצות", one paragraph, a
    `tel:+972548787766` phone-call CTA ("חייגו אלינו" + a new phone-icon
    SVG - this is the site's first `tel:` CTA; every other CTA on the
    site is WhatsApp-first, this one is a deliberate exception per
    Eldar's explicit request to match the reference).
  - **Reused existing patterns, no new components beyond the divider**:
    `.section`/`.container`/`.section-head.center` scaffolding,
    `.btn.btn-primary.btn-lg` for the CTA (same icon+label pattern as the
    hero's WhatsApp button), and the **bare `.gallery-grid`/`.gtile`**
    classes (already a 3-column grid at desktop, collapses to 2 at
    narrower widths via the same media queries `gallery.html` already
    uses - styles.css:814,848) for the 3-photo row. Photos:
    `retreat-breathwork.jpg`, `retreat-closing-circle.jpg`,
    `retreat-aromatherapy2.jpg` (all already existed in `assets/img/`, no
    uploads needed). DOM order right→left in this RTL site is breathwork,
    closing-circle, aromatherapy.
  - **One genuinely new CSS component**: `.squiggle` (styles.css, right
    after `.section-head` rules) - a small inline-SVG wavy divider. **No
    squiggle/ornament pattern existed anywhere in this codebase before
    this** (`.wave-divider` is a full-width panel-*edge* wave shape, a
    different thing, not reused here). If a future request wants a
    squiggle divider elsewhere on the site, reuse this `.squiggle` class
    rather than inventing another one.
  - **Explicitly did not reuse** `.about-founder` or
    `assets/img/logo-mark.svg` (the closest "circular icon" patterns in
    this codebase) - per Eldar's explicit exclusion of the reference's
    mascot illustration.
  Verified with Playwright at 390×844 and 1280×900 (new section is
  `.hero`'s immediate next sibling, `#sessions` follows it, CTA href is
  correct, 3 photos render, no leftover circular-logo markup, no new
  horizontal overflow) plus a visual screenshot check at both widths.
  PR #67, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** This site now has its
  **first `tel:` CTA** (previously 100% WhatsApp-first) - that was an
  explicit, deliberate choice for this one section to match the
  reference Eldar showed, not a site-wide direction change. Don't assume
  future CTAs should default to phone-call over WhatsApp unless asked.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 3, same day)
- **What changed:** Oron/Eldar asked to remove two homepage sections
  entirely (declutter the page) but keep their content recoverable rather
  than deleted outright: the **activity-preview** tap-to-preview selector
  (directly below the hero, from round 1/2 above) and the **intro**
  section (headline "חוויה בלתי נשכחת של נשימות ואמבטיות קרח לעסקים
  ולקבוצות פרטיות", right below activity-preview). The homepage's hero now
  flows straight into the `#sessions` ("מה מעניין אתכם?") grid.
  - Both sections' full markup were saved as **standalone reference files
    in `archive/`** - `archive/activity-preview-section.html` and
    `archive/intro-section.html` - before removing them from `index.html`.
    Each archive file is self-contained: the exact `<section>` markup, the
    exact inline `<script>` block (for activity-preview, which had one),
    and a full copy of the CSS rules those sections depend on (as a
    reference `<style>` block, in case those rules are ever pruned from
    `assets/styles.css` as "unused"), plus a plain-English numbered
    "how to restore this" comment at the top of each file. **These
    archive files are not linked from anywhere and load on no page** -
    they exist purely as a paste-back-in reference if either section is
    wanted again later. If asked to restore one, read the file and follow
    its own restore-instructions comment rather than guessing where things
    went.
  - **Nothing was deleted from `assets/styles.css`** (the `.ap-*` and
    `.intro*`/`.carousel-*` rules are untouched, just unused while no page
    references those classes) **or from `assets/img`** (the activity
    photos, `intro-1.jpg` through `intro-7.jpg`, etc. all still exist in
    the repo, just unreferenced). Only `index.html`'s markup and its
    trailing inline `<script>` block (the `AP_ACTIVITIES` array + chip
    click-handler IIFE) were removed from the live page.
  - `assets/main.js`'s reveal-on-load special case
    (`aboveFoldSections = [introSection, document.querySelector('.activity-preview')]`,
    ~line 41-51) was **left as-is** - `.activity-preview` now resolves to
    `null` and is filtered out by `.filter(Boolean)`, so this is inert,
    not broken. No need to "clean this up" unless it's visibly bothering a
    future session; it does nothing on the current page.
  - Verified with Playwright (390×844): hero's very next sibling section
    is now `#sessions`, no `.ap-chip`/`.intro-carousel` references remain
    in `index.html`, no new console/page errors beyond expected local-dev
    noise (video files not resolving over the sandbox's plain-HTTP
    preview server - not a real site issue).
  PR #65, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** If either section is ever
  wanted back, don't rebuild it from scratch - it's already fully written
  in `archive/activity-preview-section.html` / `archive/intro-section.html`,
  just needs pasting back into `index.html` per that file's own restore
  comment. This is also worth knowing as a **general pattern for this
  repo going forward**: when asked to "remove but don't lose" a section,
  archive/ is now an established place for full reference copies (not
  previously used in this repo before today) - keep using it rather than
  inventing a new location each time.

### Latest status (previous, same day)
- **Date:** 2026-09-23 (round 2, same day)
- **What changed:** Oron/Eldar reviewed the activity-preview section from
  round 1 (below) live and asked for a visual revision, which is what's
  actually live now - **the round-1 entry directly below describes an
  intermediate state that no longer matches the site** (dark blue-panel,
  horizontal-scroll chip row, 6 activities, different copy). Read this
  entry for what's actually on the page today.
  - **Light section now, not dark.** Dropped `blue-panel` off
    `#activities-preview` entirely (now just `section activity-preview`)
    and removed its two `.wave-divider` elements (they only ever blended a
    dark panel into the white sections around it - pointless once this
    section is white too). Every `.ap-*` CSS rule that referenced an
    on-dark token (`--on-dark`, `--on-dark-dim`, `--on-dark-line`,
    `--accent-on-dark`, `--dark-2`) was swapped to its light-section
    equivalent (`--ink`, `--ink-dim`, `--line`, `--accent`, `--sand`/
    `--card-hover`). **If asked to touch this section's colors again,
    it's a light section now** - don't reach for on-dark tokens here.
  - **Chips are now a wrapping grid, not a scroll row**, positioned beside
    the photo instead of spanning full-width above it. New wrapper
    `.ap-side` holds `.ap-chips` (the grid) + `.ap-copy` (title/desc)
    together; `.ap-visual` (the photo) is the other half of a two-column
    `.ap-stage`. `.ap-chip{flex:1 1 calc(50% - 5px)}` mobile (2/row),
    `calc(33.333% - 7px)` at ≥821px (3/row) - a natural responsive wrap,
    not hardcoded row breaks, so it stays correct at 7 items without
    manual math if a chip is ever added/removed.
  - **Photo is now on the visual left, chips+copy on the visual right**
    (desktop only - mobile is a single stacked column). Achieved purely by
    DOM order: `.ap-side` is now the *first* child of `.ap-stage`,
    `.ap-visual` the *second* - and since this is an RTL site, the first
    grid column renders on the right. **No `order` CSS property is
    involved** - if this section's markup order in `index.html` ever
    changes, the left/right positions will silently follow it.
  - **Added Pilates as a 7th activity** (`id:'pilates'`, icon 🤸, `img:null`
    → falls back to the gradient+emoji tile like yoga/massage already do).
    Copy adapted from `wellness-day.html`'s own Pilates `ADDONS` entry to
    match this section's shorter, mood-focused style.
  - **New copy:** h2 is now "אילו פעילויות מחכות לכם" (was "תבחרו חוויה,
    תראו איך זה מרגיש"). The eyebrow ("מה נכנס ליום שלכם") was removed
    entirely - this section has no eyebrow span at all now. Subhead is now
    "יחד, נבנה את התכנים והפעילויות שאתם רוצים" (was the "קור, נשימה,
    תנועה, פינוק..." line).
  - **Found and fixed two real bugs in the same pass, same root cause**:
    `.ap-visual.ph{display:flex}` (the gradient+emoji fallback tile) and
    the site's global `img{display:block}` reset (styles.css ~line 74)
    were both unconditionally overriding the `[hidden]` attribute's
    default `display:none` - an author-stylesheet rule beats the UA
    stylesheet's default regardless of selector specificity. Net effect:
    the fallback tile was rendering *underneath* the real photo for every
    single activity (not just the photo-less ones), and the `<img>`
    stayed visible even for activities with `img:null`. This is almost
    certainly what "remove the bottom photo" in the feedback meant. Fixed
    with explicit `.ap-visual.ph:not([hidden]){display:flex}` and
    `.ap-img[hidden]{display:none}`. **This is a general trap worth
    remembering for any future `[hidden]`-toggled element on this
    site**: an unconditional `display` rule on that element's own
    class/selector silently wins over `[hidden]`'s default, no matter how
    "obviously" the element should be hidden by the attribute alone -
    always scope such rules with `:not([hidden])` or add an explicit
    `[hidden]{display:none}` override. The round-1 Playwright check only
    verified the `hidden` *IDL property* (`element.hidden === true`),
    which was already correct - it never actually checked the *rendered*
    `display` value, which is why this passed round-1 review and only
    surfaced once a human looked at the real page. **If verifying
    show/hide behavior again on this site, check computed `display`, not
    just the `hidden` property/attribute.**
  Verified with Playwright at 390×844 and 1280×900: exactly one visual
  (photo XOR fallback tile) renders per activity across all 7 - this time
  checking actual computed `display`, not just the IDL property - white
  background confirmed, no eyebrow, correct headline/subhead text, chips
  wrap into multiple rows without scrolling, chips+copy render right /
  photo renders left at desktop width, no horizontal overflow, no
  leftover wave-dividers, section still reveals immediately on load.
  PR #63, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change.
- **Anything the next session needs to know:** Everything below in the
  round-1 entry about *why* this section exists and the business-model/
  brand-voice reasoning is still accurate and worth reading - only the
  *visual* details (colors, chip layout, exact copy, activity count) are
  superseded by this entry. Also see this file's other still-outstanding
  items further down (accessibility statement, font choice).

### Latest status (previous, same day)
- **Date:** 2026-09-23
- **What changed:** Redesigned the homepage section directly below the hero.
  It used to be an "About/Philosophy" block (`about-us blue-panel`: big
  headline "אז מי אנחנו?", founder names, 2 paragraphs, a photo) — Oron/Eldar
  felt it was in the wrong spot: that position should build desire in the
  offering, not explain who the company is, and it no longer matched how the
  business actually works (no single fixed session anymore — groups now pick
  from a menu of activities: ice bath, breathwork, yoga, massage, sound
  healing, aromatherapy, and IcyPower tailors a custom day, same model
  `wellness-day.html` already builds around). Brand voice was also updated:
  relaxation + fun + connection + practical stress-management tools + a touch
  of luxury — explicitly **not** adrenaline/extreme (contradicts older brand
  guidance further down this file, e.g. the 2026-08-02 entries — that older
  guidance is superseded) and not zen/spiritual/clinical either.
  - **New section: interactive "activity preview" selector**, `id="activities-preview"`,
    inserted directly after `.hero` (was previously the `intro` section).
    6 tappable chips (`.ap-chip`, real `<button>`s, `role="tab"`/`aria-selected`
    — single-select ARIA pattern, not `wd-toggle`'s multi-select
    `aria-pressed`) for אמבט קרח / נשימות / יוגה / עיסויים / סאונד הילינג /
    ארומתרפיה. Tapping one instantly swaps a large photo + one-line mood
    description in `.ap-stage` (no page reload, no carousel arrows - this
    *shows* the "you choose, we tailor" model instead of describing it in
    prose). Ends with a bridge line ("זה רק טעימה - בואו נבנה את היום שלכם")
    linking to `wellness-day.html`, the actual next step in the same mental
    model. Kept a **dark `blue-panel`** treatment (not light) on purpose, to
    preserve the page's dark/light rhythm and read as premium — and to stay
    visually distinct from the light, static, 3-up "מה מעניין אתכם?"
    sessions-grid further down (explicit requirement from Oron: the two
    must not look like the same kind of section).
  - **Data-driven, inline in `index.html`** (an `AP_ACTIVITIES` array + a
    small vanilla-JS IIFE in a `<script>` block before `</body>`) — same
    convention `wellness-day.html` already uses for its `ADDONS` array
    (page-specific content stays inline on its own page, not in
    `assets/main.js`, which stays reserved for shared cross-page behavior).
    Single-select only, no `localStorage`, no summary/totals — deliberately
    much lighter than `wellness-day.html`'s real builder, this is just a
    stateless teaser.
  - **Built mobile-first per explicit instruction**: `.ap-chips` is a
    horizontally-scrollable row (`overflow-x:auto`, not wrap — 6 chips with
    two-word Hebrew labels like "סאונד הילינג" would wrap to multiple rows
    and push the stage down) and `.ap-stage` stacks to one column by
    default; the two-column stage and other refinements are a
    `min-width:821px` enhancement layer on top, not the base design.
  - **Two activities have no real photo yet** (יוגה, עיסויים — `img:null`)
    and fall back to the same gradient+emoji tile pattern already
    established in `wellness-day.html` (don't invent a new fallback look if
    asked to touch this again). The other 4 use existing
    `assets/img/retreat-*.jpg` files that were already in the repo.
  - **Old about-us/founders content was not deleted** — it stays in its
    exact existing file position (directly before the trust-strip/logo
    carousel section, right where it always was) but demoted from a
    full-viewport `blue-panel` to a compact `tight blue-panel` (just added
    the `tight` class — reuses the exact pattern already used elsewhere in
    this file, e.g. the gallery-teaser `section tight blue-panel`, no new
    CSS needed). No copy changes inside it. It's now doing trust-building
    work ("here are the real people behind this, right before you see who
    else trusts us") instead of first-impression work.
  - **`main.js`'s reveal-on-load special case extended**: it previously only
    force-revealed `.section.intro .reveal` immediately on load (since that
    section used to sit right under the hero and could already be in view).
    Now also force-reveals `.activity-preview .reveal`, since that's the
    section in that position now. **If this position changes again, check
    this special-case list in `main.js` (~line 41-51) needs updating too.**
  - Caught and fixed a real bug before merging: an initial version of
    `.ap-chips` used a `margin-inline:-22px` "bleed to viewport edge" trick
    that assumed `.container`'s padding was always 22px — but that padding
    actually changes across breakpoints (16px on narrow phones, 22px+ up).
    The mismatch caused a few px of real horizontal page overflow on
    desktop. Fixed by dropping the bleed trick entirely — the chip row just
    scrolls within the container's own padding at every width, no
    edge-to-edge bleed. **Don't reintroduce an edge-bleed margin trick here
    without checking the container's padding-inline value at every
    breakpoint it needs to work at** — verified with Playwright by diffing
    `document.documentElement.scrollWidth` against `main` before this
    change existed, which also surfaced that a small (~16px) horizontal
    overflow at very narrow widths (~360px) is **pre-existing on `main`**
    from unrelated components (`.wa-nav`, `.logo-card` off-screen
    positioning) — not something this session introduced, and out of scope
    to fix here, but worth knowing if a future session investigates mobile
    overflow reports.
  Verified with Playwright at 390×844 and 1280×900: correct DOM order,
  correct initial/on-click state for every chip, fallback tile renders
  correctly for the 2 photo-less activities, keyboard Tab+Enter/Space
  activates chips, bridge link resolves to `wellness-day.html`, stage is
  1-col mobile / 2-col desktop, no new horizontal overflow. `node -c` on
  both the new inline script and `main.js`. PR #61, squash-merged to `main`.
- **Next goal:** Nothing pending from this specific change. Worth flagging
  to Oron/Eldar next time either is in a session: `wellness-day.html`'s own
  `ADDONS` array still lists `aroma: img:null` even though
  `assets/img/retreat-aromatherapy2.jpg` already exists in the repo and is
  now used by the new homepage section — a quick follow-up could point that
  entry at the same file for consistency, but wasn't in scope here.
- **Anything the next session needs to know:** The brand-voice guidance in
  this file's older entries (search "adrenaline"/"אתגר" in the 2026-08-02
  entries) is **outdated** — current direction is relaxation + fun +
  connection + practical stress-tools + light luxury, not
  adrenaline/extreme, not zen/spiritual. Also still outstanding from
  earlier sessions: the Israeli-law accessibility statement + named
  coordinator (2026-08-07 entry), and Oron's font choice from the 4-font
  comparison (2026-08-17 entry, below).

### Latest status (previous)
- **Date:** 2026-08-20
- **What changed:** Oron asked for a second "premium landing" page alongside
  `evening-retreat.html` - this time a **daytime wellness event for groups**,
  at any location in the country, that the customer can *configure themselves*.
  Built `wellness-day.html` (new page):
  - **Bright/summery design language**, deliberately the mirror image of the
    evening retreat's dark navy+gold look: sky gradient, sun glow, mint/blue
    accents, Heebo (no Frank Ruhl serif here - that's the evening page's
    signature). Same page skeleton though: nav, hero with eyebrow+pills,
    content sections, CTA band, footer, floating WhatsApp.
  - **The core idea: an interactive "day builder."** Add-on cards (photo,
    title, duration, description, add button) that the customer toggles;
    every toggle updates a live **"היום שלי"** summary panel - sticky on the
    side on desktop, in-flow + a floating bottom bar on mobile - which shows
    the chosen items **sorted into day order** (an `order` field per add-on),
    the always-included base, the priced total (currently only catering),
    and a WhatsApp CTA whose message text is **generated from the selection**
    (items list + blank lines for group size / date / location). Selection
    persists in `localStorage` (`icypower_wellness_day`).
  - **Add-ons are data-driven.** A single `ADDONS` array at the top of the
    inline `<script>`, with a Hebrew comment block explaining every field.
    **To add a new option later, add one object to that array - nothing
    else.** Currently: יוגה, פילאטיס, סדנת נשימות, אמבטיות קרח, עמידה על
    מסמרים, ארומתרפיה, עיסויים, סאונד הילינג, וקייטרינג בריאות (70 ₪ לאדם,
    the only priced item - the rest render "לפי הרכב היום" and `price:null`;
    set a number there when real prices exist and the totals math picks it
    up automatically).
  - **Missing photos (needs Oron/Eldar):** only 4 add-ons have real photos
    (נשימות/קרח/סאונד from the retreat set, קייטרינג reusing
    `retreat-villa-spread.jpg`). יוגה, פילאטיס, עיסויים, מסמרים, ארומתרפיה
    have `img:null` and fall back to a designed gradient tile with an emoji -
    looks intentional, not broken. Drop real files into `assets/img/` and set
    `img:'assets/img/<file>.jpg'` on those entries.
  - **Entry points:** a glowing `.btn-wellness-day` button ("☀️ אירוע וולנס
    ליום שלם") added to `business.html`'s hero (that's the "אירועי חברה"
    placement Oron asked for) and to `private-groups.html`'s hero next to the
    existing evening-retreat button. Both use the same self-contained
    `<style>` block pattern the retreat button uses (per-page, not in
    `styles.css`).
  - Verified with Playwright at 1400px and 390px: 9 cards render, toggling
    adds/removes from the summary, totals recompute, the WhatsApp href
    carries the selection, the mobile bar appears only when something is
    selected, no horizontal overflow, no JS errors; `node --check` on the
    inline script.
- **Next goal:** Nothing pending. Oron said he'll come back periodically to
  add more add-on options - that's a one-object edit in `ADDONS`.
- **Anything the next session needs to know:** Still outstanding from
  earlier: the Israeli-law accessibility statement + named coordinator (see
  the 2026-08-07 entry), and Oron's font choice from the 4-font comparison
  (see the 2026-08-17 entry).

### Latest status (previous)
- **Date:** 2026-08-17
- **What changed:** Oron asked to change the homepage hero headline and to
  see font options for a nicer look. Changed the `<h1>` in `index.html`
  from "תדליקו את הכוח שבתוככם" to "מוכנים לחוויית וולנס קפואה?" (kept the
  same two-line structure with the `.warm` accent span on the second line).
  Pushed directly to `main` (small, low-risk copy-only change, same
  convention as similar past edits in this file's history).
  **Font change is not yet done** — built and sent Oron a visual comparison
  artifact of 4 candidate Hebrew fonts (Rubik, Assistant, Suez One, Frank
  Ruhl Libre) shown against the new headline text on the real hero dark
  background, alongside the current Heebo for reference, so he can pick one
  without guessing from font names. The site currently loads only Heebo
  (`<link>` in `index.html`'s `<head>`, `font-family` set once globally in
  `assets/styles.css` line ~55) — once Oron picks, swapping it is a two-line
  change (the Google Fonts `<link>` URL + the `font-family` value), same
  everywhere since there's only one root font-family declaration. Whichever
  is picked, applies site-wide (not just the hero headline) since that's how
  the current Heebo is wired — flag to Oron if he actually only wants it on
  the hero heading rather than the whole site.
- **Date:** 2026-08-07 (follow-up, same day)
- **What changed:** Oron reported the text-size a11y control didn't actually
  do anything on desktop, plus a new bug on the WhatsApp reviews carousel
  on iPhone. Both fixed, plus two small copy/order requests:
  1. **Text-size a11y control now actually works.** Root cause: it was
     scaling `body`'s font-size, but almost all of the site's type
     (headings, buttons, eyebrows, etc.) is set in `rem`, which is relative
     to the *root* `<html>` element, not `body` — so nearly all text was
     silently unaffected by the "large"/"x-large" buttons. Now scales the
     root font-size instead; verified with Playwright that a heading's
     *computed* font-size actually changes, on both a desktop and a
     phone-sized viewport.
  2. **WA reviews carousel on iPhone: swiping caused a second, wrong jump
     right after releasing.** Root cause: my swipe fix from earlier today
     correctly advanced the card, but iOS then fires a synthetic "click" on
     whatever card ended up under the finger once the coverflow
     re-positioned — which the existing card-click-to-jump handler acted
     on, causing a second jump right after the swipe. Fixed by calling
     `preventDefault()` on `touchend` once a real swipe is recognized,
     which suppresses that ghost click.
  3. **Added a skip-to-content link** (injected site-wide via `main.js`,
     same self-injecting pattern as the back-to-top button/a11y widget) —
     a standard accessibility requirement for keyboard/screen-reader users
     to bypass the header nav.
  4. **"About us" section**: swapped founder order to אורון then אלדר
     (card order, avatar order, and the intro paragraph text/image alt),
     and removed the redundant "מייסד ומדריך" caption under each name, per
     Oron's request.
  All in `assets/main.js`/`assets/styles.css`/`index.html`. Verified with
  Playwright, `node -c` syntax check. Pushed branch
  `claude/a11y-swipe-fixes-4w1ccu`, PR #41, merged to `main`.
- **Also flagged to Oron (not yet actioned):** he asked whether the site's
  accessibility setup meets Israeli law. Israeli accessibility law (the
  Equal Rights for Persons with Disabilities regulations, based on the
  IS 5568 standard / WCAG 2.1 AA) requires more than just an accessibility
  widget — specifically a dated, published **accessibility statement**
  naming a real **accessibility coordinator** (רכז נגישות) with real
  contact details, plus reasonable-effort conformance to WCAG 2.1 AA
  itself (contrast, keyboard access, alt text, etc. — not just the widget).
  A session cannot fabricate that statement or a coordinator's identity —
  needs real input from Oron/Eldar (who the coordinator is + their phone/
  email, and whether they want a professional accessibility audit) before
  a real statement page can be written and published. Flagged directly to
  Oron in chat; worth following up if a future session touches this again
  and it's still outstanding.
- **Previous entry same day, below.**

### Latest status (previous, same day)
- **Date:** 2026-08-07
- **What changed:** Oron reported 5 issues from real iPhone/desktop use.
  Fixed all of them in `assets/main.js` + `assets/styles.css` only (no
  per-page HTML edits — the new pieces inject themselves into every page at
  runtime, since main.js already loads on every page):
  1. **Carousels now support touch swipe on iPhone**, not just the arrow
     buttons (intro photo carousel, logo coverflow, WhatsApp reviews
     coverflow) — new generic `addSwipe()` helper wired into all three.
  2. **Added a site-wide "scroll to top" button** (`.back-to-top`) that
     fades in after scrolling down ~600px and smooth-scrolls back to the
     top on click.
  3. **Added a built-in accessibility widget** (bottom-left toggle button):
     text size (normal/large/x-large), high contrast, underlined links,
     reduced motion — persisted per device via `localStorage`
     (`icypower_a11y` key), applied as classes on `<html>`. This is a
     lightweight custom widget, not a third-party plugin/service.
  4. **Fixed a real bug on desktop:** clicking/dragging on a carousel card
     (logo coverflow, WhatsApp reviews, gallery tiles) looked like it was
     selecting text/dragging the image, because those cards had no
     `user-select:none` and images had no drag-prevention. Fixed with CSS
     (`user-select:none` on the cards, `-webkit-user-drag:none` on their
     images).
  5. **Fixed a real bug: the homepage's own gallery preview did nothing on
     click.** Root cause: `main.js`'s lightbox code only activates if a
     `.lightbox` element exists on the page, and that markup was only ever
     written into `gallery.html` — the homepage's `gallery-grid home`
     section (using the same `.gtile` tiles) had no lightbox at all, so
     clicks were inert. Fixed by having `main.js` build the lightbox
     markup itself whenever it finds `.gtile` tiles but no `.lightbox` on
     the page — works on any current or future page with a gallery grid,
     no per-page markup needed. Also made tiles keyboard-accessible
     (`role="button"`, `tabindex`, Enter/Space to open).
  Verified with Playwright (desktop 1400px + a touch-emulated mobile
  viewport): homepage gallery tile click opens the lightbox, a11y panel
  opens and applies the x-large text class, back-to-top button appears on
  scroll and returns to `scrollY:0`, simulated touch swipe on the logo
  coverflow advances the active card. `node -c` syntax-checked `main.js`.
  Per this file's hard rule, went through the full cycle myself — pushed
  branch `claude/accessibility-carousel-improvements-4w1ccu`, opened PR
  #39, merged to `main` (deploy auto-triggered).
- **Next goal:** Nothing pending. Awaiting Eldar/Oron for next requests.
- **Anything the next session needs to know:** See the 2026-08-03 entry's notes about push auth (`GITHUB_TOKEN_ICYPOWER`) and the two-session-at-once risk.

### History (previous)
- 2026-09-24 (round 30) — Removed the "לפרטים נוספים" ghost button from
  business.html's hero - only the WhatsApp CTA remains. PR #119, merged.
- 2026-09-24 (round 29) — Removed the native <video controls> chrome
  from business.html's session-preview modal (scrubber, skip, volume,
  PiP/fullscreen icons) and replaced it with a single click-to-toggle
  play/pause handler on the video itself; backdrop-click-to-close
  stays independent and unaffected. PR #117, merged.
- 2026-09-24 (round 28) — Swapped the wa-reviews testimonial
  screenshot for a new one and made it render bigger via a new
  .wa-shot-card.wide modifier (scoped to just that card); fixed a real
  bug in renderWa() that would have silently stripped that modifier
  class on the carousel's first re-render. PR #115, merged.
- 2026-09-24 (round 27) — Trust-strip logo carousel now centers on
  Philips on load; fixed a real pre-existing bug where its prev/next
  buttons were selected with an unscoped query that silently grabbed
  the wellness-events carousel's buttons instead (scoped to
  .trust-strip, matching the pattern .we-carousel already used); also
  swapped its arrow icons to point outward. PR #113, merged.
- 2026-09-24 (round 26) — Fixed black letterbox bars around the
  business.html video modal (box was fixed-width, mismatched the
  portrait clip's own aspect - switched to width:auto sizing around
  the video, added a thin white border) and removed the × close
  button (backdrop-click-to-close was already the working affordance).
  PR #111, merged.
- 2026-09-24 (round 25) — Replaced business.html's always-visible
  portrait video embed with a clickable horizontal poster (cropped
  16:9) + play button that pops the video up in a modal, closing on
  backdrop click - reused booking.html's existing pattern for this
  same video file, built as its own sp-prefixed copy. PR #109, merged.
- 2026-09-24 (round 24) — Moved the trust-strip logo carousel and
  wa-reviews carousel to sit right after the sessions grid instead of
  much further down the page; added a Philips logo (background
  converted from black to white) and a new testimonial screenshot;
  embedded session-preview.mp4 directly (controls, no autoplay) on
  business.html's "חוויה שהם לא ישכחו" section. PR #107, merged.
- 2026-09-24 (round 23) — Hero background video now branches by screen
  size: mobile loads and loops Eldar's newly-uploaded short clip
  (compressed 40MB→6.2MB with ffmpeg), desktop keeps its original
  9-clip crossfade sequence completely unchanged. PR #105, merged.
- 2026-09-24 (round 22) — Fixed the actual behavior behind round 21's
  arrow-icon fix: the right/left arrows were revealing the opposite
  side's picture (click bindings never matched screen position, only
  the icon did). Swapped `prevBtn`/`nextBtn`'s `goNext`/`goPrev`
  bindings and their `aria-label` text to match; swipe was already
  correct. Loop/wrap behavior re-verified unaffected. PR #103, merged.
- 2026-09-24 (round 21) — Fixed the `#wellness-events` carousel's nav
  arrow icons, which pointed inward instead of outward - swapped the
  SVG chevron paths between the two buttons in this carousel's markup
  only (click handlers/functionality unchanged, other carousels on the
  site unaffected). PR #101, merged.
- 2026-09-24 (round 20) — Swapped `business.html`'s why-us section
  photo (`ph-land-3.jpg`, not shared with any other page) for one
  Eldar attached in chat, center-cropped from a square source to the
  existing landscape aspect ratio. PR #99, merged.
- 2026-09-24 (round 19) — Re-cropped the "חברות וצוותים" card photo
  lower (from the original source, not the already-cropped file) per
  Eldar's feedback - less top background, more of the seated group.
  PR #97, merged.
- 2026-09-24 (round 18) — Swapped the "חברות וצוותים" homepage card
  photo for one Eldar attached in chat, overwriting
  `assets/img/card-biz-2.jpg` in place (not shared with any other page).
  PR #95, merged.
- 2026-09-24 (round 17) — Replaced the `#wellness-events` section's
  lead paragraph with new copy per Eldar's wording; headline unchanged.
  Copy-only. PR #93, merged.
- 2026-09-24 (round 16) — Trimmed `business.html`'s hero further:
  shortened headline (dropped "לצוותים ומנהלים"), removed the opening
  lead paragraph that echoed it. Copy-only. PR #91, merged.
- 2026-09-24 (round 15) — Rebuilt the `#wellness-events` carousel's
  infinite loop around cloned tiles (5 real tiles cloned once before +
  once after themselves) instead of round-13's index-wrap-and-snap -
  fixes a real UX flaw where the wrap boundary teleported instantly
  with no "next photo" animation. Now next/prev always animates a
  normal slide, including into a clone at the boundary; once resting on
  a clone, the next click does an imperceptible instant swap back to
  the real tile (double-rAF timed) before its own move animates. Same
  technique on mobile and desktop. PR #89, merged.
- 2026-09-24 (round 14) — Rewrote `business.html`'s hero headline and
  lead paragraph (now 4 short paragraphs) with Eldar's new copy -
  stress-relief/team-connection/take-home-tools framing instead of
  "ice bath event." Copy-only, no layout/CSS change. PR #87, merged.
- 2026-09-24 (round 13) — Wellness-events carousel now starts centered
  on the middle photo (closing-circle) on load instead of the first, and
  next/prev loop infinitely on both mobile and desktop instead of
  disabling at the ends - wrap uses a transition-disabled instant snap
  (`snapTo()`) so it doesn't visibly slide across every tile. PR #85,
  merged.
- 2026-09-23 (round 12) — Fixed the `#wellness-events` mobile carousel
  for real: round 10's centering only worked for middle tiles, not the
  first/last. Two bugs: `.we-track` wasn't positioned so
  `tile.offsetLeft` measured against the wrong ancestor
  (`position:relative` fix), and `track.scrollWidth` under-counts
  trailing padding on a non-scroll-container element (new
  `maxOffsetMobile()`, computed from the last tile's own geometry
  instead). Also moved mobile tile-width/track-padding from CSS % to
  exact px computed in JS (percentages were compounding against each
  other). All 5 slides now verified individually symmetric. PR #83,
  merged.
- 2026-09-23 (round 11) — Removed all 7 links to `wellness-day.html`
  site-wide (2 hero buttons + 5 carousel tile-CTAs) per Eldar's request
  to make that page inaccessible for now - the page itself is untouched
  and still live, just unlinked/orphaned. PR #81, merged.
- 2026-09-23 (round 10) — Fixed the `#wellness-events` carousel on
  mobile so the active tile is centered with equal peeks of the
  previous/next tile on both sides (was flush-left, only ever peeking
  the next tile). New responsive JS split (`matchMedia`) - desktop keeps
  the round-8 windowed-scroll behavior unchanged. PR #79, merged.
- 2026-09-23 (round 9) — Removed the "איך זה עובד" 3-step timeline
  section from the homepage (below `#sessions`), archived to
  `archive/how-it-works-section.html` per this session's established
  archive-before-delete convention. `index.html#how` is still linked
  from nav/CTAs elsewhere on the site (now a dead anchor, not fixed -
  flagged only). PR #77, merged.
- 2026-09-23 (round 8) — Turned the `#wellness-events` photo row into a
  genuine 5-photo sliding carousel (added sound-bath + ice-bath photos,
  final order sound bath → breathwork → group circle → aromatherapy →
  ice bath), with left/right `.logo-nav`-style arrows revealing hidden
  tiles. Track forces `direction:ltr` for predictable transform math
  (avoids cross-browser `scrollLeft`-under-RTL bugs); captions restore
  `direction:rtl`. Also fixed the caption position - was still pinned to
  each tile's bottom, now vertically centered with a translucent
  backdrop panel for legibility. PR #75, merged.
- 2026-09-23 (round 7) — Added more spacing around the `#wellness-events`
  phone CTA (14px → 28px margin each side) via a new scoped
  `.wellness-events-cta` class. Confirmed with Playwright first that
  centering was already correct site-wide - the actual ask was just
  breathing room, not an alignment fix. PR #73, merged.
- 2026-09-23 (round 6) — Added title+caption+light-CTA overlays to the 3
  photo tiles in `#wellness-events`'s photo row, matching more of the
  round-4 reference site's format. New `.tile-caption`/`.tile-cta` CSS
  (translucent pill, not `.btn` - deliberately not bold). Placeholder
  copy tied to the current placeholder photos - Eldar is sending
  replacement photos soon, swap + copy update will follow. PR #71,
  merged.
- 2026-09-23 (round 5) — Swapped the "חברות וצוותים" and "סדנה פתוחה"
  homepage card photos for two new ones Eldar provided (ice-bath scene,
  group photo) - saved as `card-biz-2.jpg`/`card-open-2.jpg` since the
  original filenames are shared with `business.html`/`open-session.html`
  hero backgrounds. Eldar's referenced files weren't accessible from this
  cloud session at first and were pushed directly to `main` by him outside
  this session while waiting on a chat upload. PR #69, merged.
- 2026-09-23 (round 4) — Added a new `#wellness-events` section directly
  below the hero, matching a reference wellness site's format (squiggle
  divider → headline → paragraph → phone CTA → squiggle → 3-photo row),
  minus the reference's circular mascot icon per instruction. First
  `tel:`-based CTA on the site (deliberate exception, not a new default).
  New `.squiggle` CSS component added; everything else reused existing
  patterns (`.btn`, `.gallery-grid`/`.gtile`). PR #67, merged.
- 2026-09-23 (round 3) — Removed the activity-preview and intro sections
  from the homepage entirely (hero now flows straight into the sessions
  grid), but archived both sections' full markup/CSS/JS as standalone
  reference files (`archive/activity-preview-section.html`,
  `archive/intro-section.html`, with restore instructions) instead of
  deleting the work - nothing removed from `assets/styles.css`/`assets/img`,
  only unused. PR #65, merged.
- 2026-09-23 (round 2) — Revised the activity-preview section per live
  feedback: dark blue-panel → light/white section, chips moved from a
  scroll row into a wrapping grid beside the photo (photo left, chips+copy
  right on desktop, pure DOM-order/RTL trick, no `order` CSS), added
  Pilates as a 7th activity, new headline/subhead, eyebrow removed. Also
  fixed a real bug found in the same pass: two `[hidden]`-toggled elements
  (`.ap-visual.ph`, `.ap-img`) had unconditional `display` rules that were
  silently overriding the `[hidden]` attribute's default, so the fallback
  emoji tile rendered under the real photo for every activity - fixed with
  `:not([hidden])`/`[hidden]{display:none}`. PR #63, merged.
- 2026-09-23 — Replaced the homepage's about-us section (right below the
  hero) with an interactive tap-to-preview activity selector (`.ap-chips`/
  `.ap-stage`, data-driven `AP_ACTIVITIES` array inline in index.html) -
  reflects the business's new "pick activities, we tailor the day" model
  and updated brand voice (relaxation+fun+luxury, not adrenaline/zen).
  Bridges to wellness-day.html. Old about-us/founders content kept in its
  same file position but demoted to a compact `tight blue-panel`, now doing
  trust-building work before the logo carousel instead of first-impression
  work. Mobile-first per explicit instruction. PR #61, merged.
- 2026-08-20 — Added `wellness-day.html`: a bright daytime counterpart to the
  evening retreat page, built around an interactive add-on builder (cards →
  live "היום שלי" summary → WhatsApp message generated from the selection).
  Add-ons live in a single data-driven `ADDONS` array so adding an option is a
  one-object edit. Entry buttons added on `business.html` and
  `private-groups.html`. 5 of the 9 add-ons still need real photos.
- 2026-08-17 — Changed homepage hero headline to "מוכנים לחוויית וולנס
  קפואה?" (was "תדליקו את הכוח שבתוככם"), pushed straight to `main`. Built
  a 4-font comparison artifact (Rubik/Assistant/Suez One/Frank Ruhl Libre
  vs. current Heebo) for Oron to pick from — font swap itself not yet done,
  waiting on his choice.
- 2026-08-07 (follow-up) — Fixed the a11y widget's text-size control (was
  scaling `body`, not the root, so `rem`-sized text never actually
  changed), fixed a second-jump bug on the WA reviews carousel on iPhone
  after a swipe (iOS ghost-click on the repositioned card), added a
  skip-to-content link, and swapped the "About us" founder order/removed
  a redundant caption per Oron's request. PR #41, merged. Also flagged to
  Oron that Israeli accessibility law needs a real accessibility statement
  + named coordinator with real contact info, which a session can't
  fabricate — still outstanding, needs his input.
- 2026-08-07 — Fixed 5 issues Oron reported from real iPhone/desktop use:
  touch swipe on all 3 carousels, a site-wide back-to-top button, a
  built-in accessibility widget (text size/contrast/underline/reduced
  motion), a real desktop bug where carousel cards looked like they were
  being text-selected on click/drag, and a real bug where the homepage's
  own gallery preview didn't open on click (no lightbox markup on that
  page — now injected automatically). All changes self-contained in
  `assets/main.js`/`assets/styles.css`, no per-page HTML edits. PR #39,
  merged to `main`.
- 2026-08-04 — Global "IcyPower" → "Icy Power" rename + large copy update across all 5 session pages. Deployed.
- **Date (previous):** 2026-08-03
- **What changed:** Eldar reported some sections rendering with a
  black background instead of white. **Verified this was never a real
  site bug** - checked the actual live deployed CSS directly and
  confirmed `--sand:#FFFFFF`/`--card:#B4D0EA` (both correctly light,
  nothing dark). The symptom (some plain-background sections inverted
  to black, photos and the intentionally-dark hero unaffected) matches
  the exact signature of a browser's forced/auto dark-mode feature
  (Chrome's "Auto Dark Mode for Web Contents," or an extension like
  Dark Reader) - not our code. Added `<meta name="color-scheme"
  content="light">` to all 10 pages + `color-scheme:light` in
  `styles.css`'s `:root`, which opts out of Chrome's *native* forced
  dark rendering (a third-party extension like Dark Reader would still
  override this regardless - that's outside what any site's code can
  control). **If this is ever reported again, don't assume the CSS
  broke** - check the live deployed CSS values first (`curl` the
  actual `--sand`/`--card` variables) before touching any code.
- **Earlier:** Replaced `hero-groups.jpg` (the FAQ section's
  `.faq-photo`, used only there) in place with Eldar's real photo
  (`contents/general photos/asked questions photo.jpg`), resized/
  cropped to 4:3 with ffmpeg.
- **Earlier:** Replaced the About section's (`index.html`,
  `.about-video`) video placeholder with a real horizontal photo.
  `.about-vid` was always a `<video>` pointing at
  `assets/video/about.mp4`, which **never actually existed** - it only
  ever showed its `poster` image (`hero-about.jpg`). Converted the
  element to a plain `<img>` and swapped in Eldar's group photo
  (`contents/general photos/us photo.jpg` → new file
  `assets/img/about-us.jpg`, since `hero-about.jpg` is shared with
  `about.html`'s unrelated page-hero banner - didn't touch that).
  Changed the aspect ratio from portrait 9/16 to landscape 4/3 per
  request, and **removed the desktop-only height-driven sizing rules**
  (`@media(min-width:821px)`/`1400px` blocks) that were tuned
  specifically for a tall portrait video - they'd have forced the new
  landscape photo absurdly wide otherwise. **If asked to touch this
  element again, remember it's a plain `<img>` now, not a video** - the
  `assets/video/about.mp4` placeholder path is gone entirely.
- **Earlier:** Replaced `hero-gallery.jpg` (gallery.html's hero
  background, used only there) with Eldar's real photo
  (`contents/session pages/pic7.jpg`), and added a 14th gallery tile
  (`assets/img/g14.jpg`, from `contents/gellery/IMG_9160.jpg`).
- **Earlier:** Swapped the "window" photo on 3 more session pages
  with real ones from `contents/session pages/` (pic3/4/5), overwriting
  in place since each was confirmed used on only one page:
  `ph-land-2.jpg` (open-session.html), `ph-land.jpg` (couples.html),
  `ph-land-4.jpg` (events.html - now safe to overwrite in place since
  private-groups.html moved to its own `ph-land-6.jpg` earlier).
  **Eldar explicitly said to leave `contact.html`/pic6 alone** - that
  page has no matching window/media section (just a hero + the contact
  form), so there was nothing to swap there; don't add one unless asked.
- **Earlier:** Added 2 more client logos to the homepage's logo
  coverflow carousel (`assets/img/logos/hachalutz.png`, `vamos.jpg` -
  from `contents/logos/`, Eldar's staging folder) - now 7 logos total.
  No JS changes needed, `main.js`'s carousel logic already reads
  `.logo-card` count dynamically.
- **Earlier:** Swapped `private-groups.html`'s "media" photo for
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
- 2026-08-03 — Diagnosed "black sections" report as browser forced
  dark-mode, not a real bug (confirmed live CSS was always correct);
  added color-scheme:light to opt out of Chrome's native version.
- 2026-08-03 — Replaced the FAQ section's photo (hero-groups.jpg) with
  a real one.
- 2026-08-03 — About section's video placeholder (never had a real
  video) replaced with a real horizontal photo; converted <video> to
  <img>, portrait 9/16 → landscape 4/3.
- 2026-08-03 — Replaced gallery.html's hero background photo; added a
  14th gallery tile (g14.jpg).
- 2026-08-03 — Swapped window photos on open-session/couples/events
  pages; left contact.html alone per Eldar (no matching section there).
- 2026-08-03 — Added 2 client logos (החלוץ, Vamos) to the logo
  carousel - now 7 total.
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
