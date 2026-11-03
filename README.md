# Portfolio — Harsh Dharnidharka

A static site. One scrolling page on neutral black with light cards and one acid-green accent, plus one
page per entry (about me, how I work, each project) in the same style.

Builds to a plain `dist/` folder. No server, no database, no vendor lock-in.

**Before you deploy:** [`NEEDS-INPUT.md`](./NEEDS-INPUT.md) lists what is still
missing. Anything unwritten renders as a loud marked box on the page, so nothing
half-finished can ship by accident.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built site
npm run test:brain   # the question matcher, against ~40 real questions
```

## Deploying

The build output is static files. Any host works, and the domain is set in one
place.

1. **Set the domain.** `site:` in `astro.config.mjs`. Canonical URLs, the
   sitemap, `robots.txt` and the social share tags all read it from there.
2. **Build.** `npm run build`.
3. **Upload `dist/`.**

| Host | What to do |
|---|---|
| **Netlify** | Drag `dist/` onto the dashboard, or connect the repo with build command `npm run build` and publish directory `dist`. |
| **Vercel** | Import the repo. It detects Astro. Output directory `dist`. |
| **Cloudflare Pages** | Connect the repo; build command `npm run build`, output `dist`. |
| **GitHub Pages** | Push `dist/` to a `gh-pages` branch. If the site lives under a sub-path, also set `base` in `astro.config.mjs`. |
| **Any nginx/Apache box** | Copy `dist/` into the web root. Nothing else to configure. |

## How it's laid out

| Path | What it is |
|---|---|
| `src/content/knowledge/*.md` | **The whole site's content**, eight files. The three projects (`moment` → `plain`, a one-line `blurb` for the home-page card, plus a `link` to the repo), `the-problem`, `how-i-work`, `working-with-me`, `about-me`, `talk-to-me`. |
| `src/content.config.ts` | The schema those files must satisfy, plus the group and card-type lists. |
| `src/lib/knowledge.ts` | Loads and flattens the content. Everything that displays an answer reads it through here. |
| `src/lib/links.ts` | Name, role, and every outbound link. One place. |
| `src/lib/portrait.ts` | Finds the photo, if there is one. See below. |
| `src/lib/brain/` | What answers a typed question. `index.ts` is the swap point for a real model. |
| `src/components/stage/` | The page sections. One file each, in the order `src/pages/index.astro` lists them. |
| `src/components/stage/TokenStream.svelte` | The hero sentence, which arrives piece by piece the way a model writes it. Pure CSS; the text is real text from the start. |
| `src/styles/tokens.css` | Every colour, type size, spacing value and card setting. Restyling the site should mean editing this file and nothing else. |

**Where detail lives.** The site tells each project as a short story anyone can
follow. The technical write-up lives in that project's GitHub README, reached by
the "How it's built" link. Don't add architecture to the site; improve the README.

Each piece is meant to be replaceable on its own. Deleting a knowledge file or a
whole section shouldn't require touching anything else.

## The two ways in

- `/` — the page.
- `/ask/<id>` — one page per entry, on the same black, as one light card. Readable with JavaScript off, so it is also
  what search engines read.

## The photo

Drop a file at `src/images/portrait.jpg` — `.jpeg`, `.png` and `.webp` also
work. The build finds it, sizes it, hashes it and puts it on the About section.
No other file changes. Remove it and the section falls back to a drawn frame
rather than a gap.

## The share card

`public/og.png` is what appears when the link is posted anywhere. It is
generated from the real fonts and the real page rather than drawn by hand, so
it can be remade whenever the copy changes:

1. `npm run build && npx serve dist` (or any static server).
2. Open `/og-card/`. It sizes itself to your window and reports the exact region
   to capture in the `data-capture` attribute on `#og`.
3. Screenshot that region from the top-left corner.
4. Scale it to 1200×630 and save it over `public/og.png`.

On a window at least 1200×700 the card renders at 1:1 and step 3 needs no
scaling.

## Motion

Everything animated is behind `prefers-reduced-motion`. With it on, the name and
hero sentence are simply there.

What moves:

- **The name** drops in letter by letter, tilted, and bounces to rest. While each
  letter falls it is a scrambled symbol, and it resolves into the real letter as
  it lands. Hover the name and it scrambles and resolves again.
- **The hero sentence** streams in like a model writing it: small pieces, uneven
  speed, a longer beat after a full stop, the newest piece briefly lit. Long
  words arrive in two halves, as a tokeniser would cut them.
- **The project cards** show an attention map of their description on hover:
  every word lit in proportion to its weight, sweeping left to right. Words
  wrapped in `*stars*` in a project's `blurb` get full weight; the rest get a
  small uneven one. On touch screens it is shown at rest.
- **The highlighter** is drawn under a phrase the first time it scrolls into view.

Every one of them is on the page from the start. An entrance is a CSS animation
that only runs when the page has marked itself as running script (`.js` on
`<html>`), so without script, or with reduced motion, nothing is hidden.

## Content that isn't there on purpose

Real evaluation numbers and throughput figures exist for these projects and are
deliberately absent. The site is written so a non-technical reader can follow it,
and metrics-as-proof only land with engineers. Projects are described by outcome
instead. A technical-depth page is a separate addition if it's ever wanted.
