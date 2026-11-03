# What I still need from you

Everything else is written and deployable. Search the repo for `⟨` to find every
gap; each one renders as a marked box on the page.

---

## 1. Words only you can write

Done: the About copy was written from your own answers on 2026-11-03.

## 2. Check these are yours

- **The hero line:** *"I build AI that answers phones, reads documents and fixes
  its own code. And I make sure it holds up."* It's also on the share card.
- **The About copy:** "On paper, I was headed for balance sheets" and "By 2023
  the habit had won" are inferred from your resume, not your words.
- **The skills map:** the Voice cluster comes from your clinic project, not your
  resume. The grouping is hand-made, so don't describe it as real embeddings.
- **"Open to work"** on the first screen (`status` in `src/lib/links.ts`).
  Remove it once you've got a job.

## 3. Before deploying

- **The domain:** `site:` in `astro.config.mjs`. Sitemap, robots.txt, canonical
  URLs and share tags all read it.
- **The three GitHub READMEs.** Technical visitors now land there from "How it's
  built", so those READMEs are now part of the site.

## Settled

- Links are real: email, GitHub, LinkedIn, and one repo per project.
- No metrics anywhere, on your instruction.
- Project detail lives on GitHub, not on the site (2026-09-28).
- Open to relocating, written into `Contact.svelte`.
- Single page, no photo, no karate (2026-11-03).

## Later

- The sea adapts to the visitor's real time of day. All colours are in `NIGHT` in
  `src/lib/scene/sea.ts`.
- `src/content/knowledge/` non-project files and `src/lib/brain/` aren't shown on
  the site. They are kept for a possible AI agent; delete them if that's dropped.
