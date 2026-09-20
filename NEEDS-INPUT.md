# What I need from you

Everything below is either missing or guessed. Nothing here blocks the site from
running — it runs now — but each item makes it less yours until it's filled in.

Draft text is wrapped in `⟨ angle brackets ⟩` and renders as a loud marked box on
the page, so it cannot ship by accident. Search the repo for `⟨` to find every one.

---

## 1. Assets

| What | Where it goes | Notes |
|---|---|---|
| A photo of you | `public/portrait.jpg` | Then swap the placeholder in `src/components/Opening.astro`. A phone portrait in decent light is fine — a real face is one of the strongest signals a site wasn't generated. |
| Email, GitHub, LinkedIn | `src/lib/links.ts` | I've left these `null` rather than guess at URLs. They currently render as visible `⟨missing⟩` markers in the footer. |
| Your CV | — | Send it to me; I'll check nothing on the site contradicts it. |

## 2. Content I could not write for you

These are in `src/content/knowledge/`. Each is one Markdown file.

- **`outside-of-work.md`** — the most important one on the site, and completely
  blank. This is the answer that makes a stranger decide they'd like working with
  you. Nothing to do with engineering. Specific beats impressive.
- **`how-did-you-get-here.md`** — two of the four moments are blank. What pulled
  you toward computers, and when did it stop being coursework?
- **`where-im-from.md`** — a couple of lines that make Mumbai a place rather than a
  pin. Also: confirm remote / hybrid / on-site / relocating.
- **`what-i-believe.md`** — you've said you're spiritual. I wrote nothing, because
  guessing at what someone believes is the one thing I shouldn't do. Write it,
  keep it glancing, or delete the file — deleting changes nothing else.

## 3. Things to check, not write

- **`where-are-you-headed.md`** — drafted from what you've told me privately, then
  rewritten for a public page. Your actual goal includes independence; stated
  plainly on a site recruiters read, that reads as "will leave within a year." The
  file has the softened version. Tell me if it's not yours.
- **`should-i-hire-you.md`** and **`what-i-get-wrong.md`** — I put words in your
  mouth about your own weaknesses. Read them. If you wouldn't say it out loud in
  an interview, it shouldn't be there.
- **The opening line** in `src/components/Opening.astro`: *"I build software that
  makes decisions on its own — and then I make sure it makes the right ones."*
  It's the first thing anyone reads. Change it if it isn't how you'd put it.

## 4. Decisions still open

- **Domain.** Nothing depends on it. When you buy one, set `site` in
  `astro.config.mjs` and the host line in `public/robots.txt`.
- **Host.** Any static host works — see `README.md`.
- **The real AI agent.** The site answers questions now with a local matcher. See
  `src/lib/brain/llm.ts` for exactly what turning on a real model requires.

## 5. Deliberately absent

You asked for no real metrics, so none of the eval numbers from Evident AI or the
retry figures from Phoenix are on the site, even though they're real and on disk.
Projects are described in outcomes instead. If you ever want a technical-depth
page for engineers specifically, that's a separate addition — say the word.
