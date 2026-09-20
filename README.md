# Portfolio — Harsh Dharnidharka

A personal site with no navigation. It assembles itself from the questions a
visitor taps: each answer unfolds in place and offers the next question, so the
page you end up with is the path you took.

**Start here:** [`NEEDS-INPUT.md`](./NEEDS-INPUT.md) — what's still missing.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm run preview  # serve the built site
```

## How it's laid out

| Path | What it is |
|---|---|
| `src/content/knowledge/*.md` | **The whole site's content.** One file per answer. Adding a question means adding a file — no code changes. |
| `src/content.config.ts` | The schema those files must satisfy, plus the group and card-type lists. |
| `src/lib/knowledge.ts` | Loads and flattens the content. Everything that displays an answer goes through here. |
| `src/lib/brain/` | What answers a typed question. `index.ts` is the swap point. |
| `src/components/Thread.svelte` | The only stateful component. Owns the list of opened questions and nothing else. |
| `src/components/cards/` | One file per answer style. Add a file, add a line to `AnswerCard.svelte`. |
| `src/styles/tokens.css` | Every colour, type size and spacing value. Restyling the site should mean editing this file. |

Each piece is meant to be replaceable on its own. Deleting a knowledge file, a
card type or a whole section shouldn't require touching anything else.

## The three ways in

The conversation is the main experience, but it can't be the only one:

- `/` — the thread. Needs JavaScript.
- `/everything` — every answer, flat, in one page. Works with JavaScript off. This
  is what search engines read and what a visitor in a hurry skims.
- `/ask/<id>` — one static page per answer, so any single answer is linkable.

## The agent

Today `src/lib/brain/static.ts` answers typed questions with a local matcher:
no network, no API key, no cost, works offline.

To put a real model behind it later:

1. Add a server adapter — `npx astro add node` (or `vercel`, `cloudflare`).
2. Create `src/pages/api/ask.ts`. Retrieve over the same knowledge entries,
   generate, return `{ answerId, suggestionIds, confidence }`.
3. Set `PUBLIC_BRAIN=llm`.

`src/lib/brain/llm.ts` is already written and falls back to the local matcher if
the model is unreachable. No component changes, no design changes.

## Deploying

`npm run build` produces `dist/` — plain static files, no server required. Drop it
on any host.

Before the first deploy, set `site` in `astro.config.mjs` and the `Sitemap:` line
in `public/robots.txt` to the real domain.

| Host | What to do |
|---|---|
| **Netlify** | Connect the repo. Build `npm run build`, publish `dist`. |
| **Vercel** | Connect the repo. The Astro preset is detected automatically. |
| **Cloudflare Pages** | Build `npm run build`, output `dist`. |
| **GitHub Pages** | Push `dist/` to a `gh-pages` branch, or use the Astro Pages action. |
| **Any nginx box** | Copy `dist/` into the web root. |
