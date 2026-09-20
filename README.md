# Portfolio — Harsh Dharnidharka

A static site. One scrolling page over a generated Mumbai skyline, plus a flat
version of everything and one page per answer for search engines and for anyone
in a hurry.

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
| `src/content/knowledge/*.md` | **The whole site's content.** One file per answer. Adding a question means adding a file — no code changes. |
| `src/content.config.ts` | The schema those files must satisfy, plus the group and card-type lists. |
| `src/lib/knowledge.ts` | Loads and flattens the content. Everything that displays an answer reads it through here. |
| `src/lib/links.ts` | Name, role, and every outbound link. One place. |
| `src/lib/portrait.ts` | Finds the photo, if there is one. See below. |
| `src/lib/brain/` | What answers a typed question. `index.ts` is the swap point for a real model. |
| `src/components/stage/` | The page sections. One file each, in the order `src/pages/index.astro` lists them. |
| `src/components/stage/CityScape.svelte` | The skyline. Self-contained; delete the one line in `index.astro` and the site is a plain dark page. |
| `src/styles/tokens.css` | Every colour, type size, spacing value and glass setting. Restyling the site should mean editing this file and nothing else. |

Each piece is meant to be replaceable on its own. Deleting a knowledge file or a
whole section shouldn't require touching anything else.

## The three ways in

The scrolling page is the main experience, but it can't be the only one:

- `/` — the page.
- `/everything` — every answer, flat, in one document. Works with JavaScript off.
  This is what search engines read and what a visitor in a hurry skims.
- `/ask/<id>` — one static page per answer, so any single answer is linkable.

## The photo

Drop a file at `src/images/portrait.jpg` — `.jpeg`, `.png` and `.webp` also
work. The build finds it, sizes it, hashes it and puts it on the About section.
No other file changes. Remove it and the section falls back to a drawn frame
rather than a gap.

## The share card

`public/og.png` is what appears when the link is posted anywhere. It is
generated from the real fonts and the real skyline rather than drawn by hand, so
it can be remade whenever the copy changes:

1. `npm run build && npx serve dist` (or any static server).
2. Open `/og-card/`. It sizes itself to your window and reports the exact region
   to capture in the `data-capture` attribute on `#og`.
3. Screenshot that region from the top-left corner.
4. Scale it to 1200×630 and save it over `public/og.png`.

On a window at least 1200×700 the card renders at 1:1 and step 3 needs no
scaling.

## Motion

Everything animated is behind `prefers-reduced-motion`. With it on: the skyline
is drawn once and stays still, nothing flickers, nothing drifts on scroll, and
the glass panels drop their blur for a solid surface.

The skyline follows the actual clock in Mumbai — the sky is a different colour in
the evening than at 3am — but never reaches daylight, because a bright sky would
put the white text below usable contrast.

## Content that isn't there on purpose

Real evaluation numbers and throughput figures exist for these projects and are
deliberately absent. The site is written so a non-technical reader can follow it,
and metrics-as-proof only land with engineers. Projects are described by outcome
instead. A technical-depth page is a separate addition if it's ever wanted.
