# Portfolio — Harsh Dharnidharka

A static site. One scrolling page over a moonlit sea, with night-blue panels and one warm moonlight accent.

Builds to a plain `dist/` folder. No server, no database, no vendor lock-in.

Anything unwritten (marked `⟨…⟩`) renders as a loud marked box on the page, so
nothing half-finished can ship by accident.

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
| `src/content/projects/*.md` | One long write-up per project, named like the project's id (`receptionist`, `code-fixer`, `document-reader`). Frontmatter holds the tools (`stack`), up to three big facts (`facts`) and, optionally, `build`: a `title` and the `steps` of how it is built (a plain line and tools each; keep it at five, the light's timing assumes five), shown as a strip by `src/components/work/BuildStrip.astro`. A project with `build` folds its write-up behind a "Read the technical write-up" toggle; the Markdown body is the page's write-up, so write anything Markdown can hold. Only state what the repo backs up. |
| `src/pages/work/[slug].astro` | The page at `/work/<id>`, one per project: the card copy, tools, demo, facts, the build strip, the write-up, and links to the next project and to Contact. The home-page card's "How it's built" opens it; the GitHub link lives on this page. |
| `src/components/work/*.svelte` | One interactive demo per project, picked by `demo.kind` in the project's frontmatter: `CallDemo` (a made-up call played turn by turn: slots, name and number, read-back, then booking only after the yes, with the pipeline lighting up and the code blocking an early booking), `FixLoopDemo` (the write, run, fix loop: a first run, then up to five fixes, the Critic reading every failure), `RetrievalDemo` (a chatbot vs the reader: search, rerank, answer with pages). The scenarios are made up and labelled so; the behaviour they show is the real one. A new kind of demo is one component plus one line in the page. |
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
  on the water brighten when the cursor is on the moon. On a portrait screen the moon sits high in the
  empty sky above the hero text, and the boat drifts slower (its speed follows its size). Scrolling never changes the scene. Colours live in one palette
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
  the card tilts toward the pointer with moonlight along its edge. The whole card is a link to its project page: the
  card lifts away from the pointer on hover, so the click is caught on the fixed wrapper
  around it (`Work.svelte`), not only on the "How it's built" link.
- **Anything that opens or closes** eases instead of snapping. Every `<details>`,
  such as "Read the technical write-up", grows or shrinks to its new height and
  reverses if clicked mid-way (`src/lib/motion/disclosure.ts`, one listener on the
  document). In the demos, parts that appear or leave use the `appear` and `fold`
  transitions in `src/lib/motion/gentle.ts`. New open/close UI should use these two.
- **About, Skills and Education** fade and rise once as they come into view
  (`src/lib/motion/reveal.ts`), kept quiet so the sea and the deck carry the page.
- **Skills** (`Skills.svelte`) is a plain index: each group's name with its tools
  beside it, no numbers so nothing reads as a ranking. Rows fade in like About and
  Education; pointing at a group dims the others. Only the core skills are shown; the
  resume has the full list.
- **Education** (`Education.svelte`) leads with where I am now: the current role is a
  card that turns over (`FlipCard.svelte`) on a click or tap anywhere on it, or with
  its "What I do there" button, to show what the work involves. Past education sits
  beside it as a list, newest first. With reduced motion the card cross-fades.
- **Changing page** uses Astro's page router (`<ClientRouter />` in `Base.astro`). The sea
  is kept alive across pages (`transition:persist`), so it never restarts or flashes; the
  page above it leaves and arrives; and the project card that was clicked grows into the
  header panel of its page (matching `view-transition-name`, set on click in `Work.svelte`).
  Scroll handling is rebuilt on every page (`astro:page-load`). A link that arrives with
  `#id` waits for the page to stop growing, then glides down from the top
  (`landOnHash` in `smooth.ts`). A band can set `land` (0 to 1) to be arrived at part-way
  into its held section, without a glide: the Work band uses 0.96, so coming back from a project
  page ("Back to the work", the browser's Back, or a shared `/#work`) always opens the deck fully
  spread. Narrow screens have no held deck and glide to the section top.
  A refresh (normal or hard) keeps you exactly where you were on any page, even with a
  `#id` in the address: the position is saved when the page is left and put back on reload
  (`keep-place.ts`, `restoreTo` in `smooth.ts`). The hero's "See what I've built" stops a little way into
  the held Work section (`data-scroll-progress`), so one light scroll starts opening the cards.
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
