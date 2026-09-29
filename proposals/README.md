# Private client proposals

Private, visual event-concept proposals for specific clients. The pages
are **not** linked from the site's navigation or any other page, and
they're kept out of search engines (`noindex` in each page and an
`X-Robots-Tag` header for `/proposals/*` in `_headers`). Anyone with the
link can open one; there's no login.

## Structure

```
proposals/
  _shared/            the template — shared by every proposal
    proposal.css      layout + styling (navy/gold premium style, RTL)
    proposal.js       builds the page from content.js; tabs, video, lightbox
    media/            opening photo + video poster frames
  bgirim-4q8x2m/      one client's proposal (קבוצת בגירים)
    index.html        page shell — normally never edited
    content.js        ALL the content — the only file to edit
```

## Editing a proposal

Edit only `content.js` in that proposal's folder: the client name, the
intro, and for each event its name, tagline, facts, hero photo/video,
activities, schedule, facilitators, food and gallery. Add or remove
items in a list and the layout adjusts. Delete or empty a section and
it disappears for that event. The comments at the top of `content.js`
explain each field.

## Making a new proposal for another client

1. Copy an existing proposal folder to a new, hard-to-guess name, e.g.
   `proposals/<client>-<6 random letters/digits>/`.
2. Edit that folder's `content.js`.
3. Send the client `https://icypower.pages.dev/proposals/<folder>/`.

Deep links to one concept work too: `…/proposals/<folder>/#event-03`.

## Guardrails

- There are no prices, CTAs, forms or payment details on these pages, by design.
- Never add a proposal link to `index.html`, the nav, the footer or a sitemap.
- Hero videos must be small (under ~1 MB). The 6–10 MB clips in
  `assets/video/` are too heavy for this.
