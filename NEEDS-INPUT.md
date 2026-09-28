# What I still need from you

Everything else is written and deployable. Search the repo for `⟨` to find every
gap; each one renders as a marked box on the page.

---

## 1. Words only you can write

All in **`src/content/knowledge/about-me.md`**, except the last one. Rough notes
or bullets are fine; I'll shape them.

- **Where I'm from:** two lines that make Mumbai a place. What do you like about
  living there? What would an outsider get wrong?
- **How I got here, part 1:** what first pulled you toward computers. One
  specific moment.
- **How I got here, part 2:** the first thing you built because you wanted to,
  not because it was assigned.
- **Outside of work:** nothing to do with engineering. A Sunday, something
  you're oddly into, something you're bad at and do anyway. Specific beats
  impressive.
- **`src/components/stage/About.svelte`:** two or three sentences on what you're
  like away from a keyboard, for the home page. Can be a short version of the
  one above.

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
- **"Where I'm headed"** in `about-me.md`: says you want to build your own
  things longer term. Too much, or not enough?

## 4. Before deploying

- **The domain:** `site:` in `astro.config.mjs`. Sitemap, robots.txt, canonical
  URLs and share tags all read it.
- **The four GitHub READMEs.** Technical visitors now land there from "How it's
  built", so those READMEs are now part of the site.

## Settled

- Links are real: email, GitHub, LinkedIn, and one repo per project.
- No metrics anywhere, on your instruction.
- Project detail lives on GitHub, not on the site (2026-09-28).
- Open to relocating, written into `about-me.md`.
