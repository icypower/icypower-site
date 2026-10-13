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
  sessions-4q8x2m/    THE reusable sessions proposal (six options), sent to every lead
    index.html        page shell — normally never edited
    content.js        ALL the content — the only file to edit
  bgirim-4q8x2m/      legacy link (sent to עיריית תל אביב before the page became
                      reusable): loads sessions-4q8x2m's content with a fixed headline
```

## Personal links (headline per lead)

The sessions page is one shared page. Each lead gets their own link,
`/proposals/sessions-4q8x2m/?c=<code>`, and the page shows that lead's name
as the big headline. Links are created, renamed and deleted in the tracker
app: **More → "Proposal page links"**. They're stored in D1
(`settings.proposal_links`) and read live by `functions/api/proposal-title.js`,
so a rename also updates links that were already sent. A link with no code (or
an unknown one) shows the default headline from `content.js` (`client`).

## Editing a proposal

Edit only `content.js` in that proposal's folder: the client name, the
intro, and for each event its name, tagline, outcomes, hero photo/video,
activities, schedule, food and gallery. Add or remove
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
