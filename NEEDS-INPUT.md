# What I still need from you

Everything else is written and deployable. Search the repo for `⟨` to find every
gap; each one renders as a marked box on the page.

---

## 1. Words only you can write

Done: the About copy was written from your own answers on 2026-11-03.

## 2. One file to drop in

**A photo of you** → `src/images/portrait.jpg`. The build finds it, sizes it
and places it.

## 3. Check these are yours

- **The hero line:** *"I build software that makes decisions on its own — and
  then I make sure it makes the right ones."* It's also on the share card.
- **"Open to work"** on the first screen (`status` in `src/lib/links.ts`).
  Remove it once you've got a job.
- **`working-with-me.md`** and its folded "What I'm still working on" section:
  I wrote your weaknesses. If you wouldn't say it in an interview, cut it.

## 4. Before deploying

- **The domain:** `site:` in `astro.config.mjs`. Sitemap, robots.txt, canonical
  URLs and share tags all read it.
- **The three GitHub READMEs.** Technical visitors now land there from "How it's
  built", so those READMEs are now part of the site.

## Settled

- Links are real: email, GitHub, LinkedIn, and one repo per project.
- No metrics anywhere, on your instruction.
- Project detail lives on GitHub, not on the site (2026-09-28).
- Open to relocating, written into `Contact.svelte`.
