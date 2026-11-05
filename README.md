# Portfolio — Harsh Dharnidharka

A static site. One scrolling page over a moonlit sea, with night-blue panels and one warm moonlight accent.

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
| `src/content/knowledge/*.md` | The three projects (`blurb` for the home-page card, plus a `link` to the repo). The other files (`the-problem`, `how-i-work`, `working-with-me`, `talk-to-me`) aren't shown anywhere: they are kept only for a future agent, read by `src/lib/brain/`. |
| `src/content.config.ts` | The schema those files must satisfy, plus the group and card-type lists. |
| `src/lib/knowledge.ts` | Loads and flattens the content. Everything that displays an answer reads it through here. |
| `src/lib/links.ts` | Name, role, and every outbound link. One place. |
| `src/lib/brain/` | What answers a typed question. `index.ts` is the swap point for a real model. |
| `src/components/stage/` | The page sections. One file each, in the order `src/pages/index.astro` lists them. |
| `src/styles/tokens.css` | Every colour, type size, spacing value and card setting. Restyling the site should mean editing this file and nothing else. |

**Where detail lives.** The site tells each project as a short story anyone can
follow. The technical write-up lives in that project's GitHub README, reached by
the "How it's built" link. Don't add architecture to the site; improve the README.

Each piece is meant to be replaceable on its own. Deleting a knowledge file or a
whole section shouldn't require touching anything else.

## The share card

`public/og.png` is what appears when the link is posted anywhere. It is
generated from the real fonts and the real page rather than drawn by hand, so
it can be remade whenever the copy changes:

Capture it from the build, because the dev server would add its toolbar:

```
npm run build
python3 -m http.server 4329 -d dist &
google-chrome --headless --no-sandbox --enable-unsafe-swiftshader --hide-scrollbars \
  --window-size=1200,630 --virtual-time-budget=6000 \
  --screenshot=public/og.png http://localhost:4329/og-card/
```

The card shows the real sea scene behind the name and tagline.

## Motion

Everything animated is behind `prefers-reduced-motion`. With it on, the name and
hero sentence are simply there.

What moves:

- **The moonlit sea** sits fixed behind the whole page (`src/lib/scene/sea.ts`). The
  water is a WebGL shader, so the moon's path comes from real reflection; the sky is
  a 2D canvas with stars, clouds, a sailing boat and the odd shooting star. The moon and its path
  on the water brighten when the cursor is on the moon. Scrolling never changes the scene. Colours live in one palette
  (`NIGHT`). With reduced motion it is a still frame, and without script the page
  stays plain dark.
- **The name** drops in letter by letter, tilted, and bounces to rest. While each
  letter falls it is a scrambled symbol, and it resolves into the real letter as
  it lands. Hover the name and it scrambles and resolves again.
- **The hero sentence** settles in after the name lands.
- **The project cards** start as one face-down dark deck. Scrolling opens it: on a
  wide screen the section holds while the cards lift, turn over and settle into
  three columns, one after another. On a narrow or short screen there is no hold
  and each card turns over by itself as it comes up the page. The motion follows
  the scroll in both directions, through a damped value (`LAG` in `Work.svelte`).
  As a face comes up, a band of light crosses it and its words come into focus,
  then a sweep of attention crosses the text once, every word lit in proportion to
  its weight. Words wrapped in `*stars*` in a project's `blurb` get full weight and
  stay marked; the rest get a small uneven one. On hover the whole map is held, and
  the card tilts toward the pointer with moonlight along its edge.
- **About and Education** fade and rise once as they come into view
  (`src/lib/motion/reveal.ts`), kept quiet so the sea and the deck carry the page.
- **The skills map** starts as noise and scrolling pulls the dots into labelled
  clusters (`Skills.svelte`). Hovering or tapping a skill draws lines to its nearest
  neighbours. The grouping is hand-made from the resume and the voice project, not computed by a model.
- **The highlighter** is drawn under a phrase the first time it scrolls into view.

Every one of them is on the page from the start. An entrance is a CSS animation
that only runs when the page has marked itself as running script (`.js` on
`<html>`), so without script, or with reduced motion, nothing is hidden.

## The resume

`public/Harsh_Dharnidharka_Resume.pdf` is served as-is and is public once deployed.
This copy has the phone number removed. Replace the file to update it, and check
any new copy for personal details first.

## Content that isn't there on purpose

Real evaluation numbers and throughput figures exist for these projects and are
deliberately absent. The site is written so a non-technical reader can follow it,
and metrics-as-proof only land with engineers. Projects are described by outcome
instead. A technical-depth page is a separate addition if it's ever wanted.
