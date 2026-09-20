# What I still need from you

Everything else is done and deployable. The four items in section 1 are the only
things standing between this and shipping — each one renders as a loud marked box
on the live page, so none of them can go out unnoticed.

Search the repo for `⟨` to find every one.

---

## 1. Words only you can write

### `src/content/knowledge/outside-of-work.md` — *entirely blank, and the most important*

This is the answer that makes a stranger decide they'd like working with you. It
should have nothing to do with engineering.

What do you spend a Sunday on? What are you unreasonably into? What's something
you're bad at and do it anyway?

**Specific beats impressive.** "I make terrible filter coffee and refuse to stop"
is worth more here than a list of interests.

### `src/content/knowledge/how-did-you-get-here.md` — *two gaps*

- **Before** — what pulled you toward computers in the first place? One specific
  moment beats a general interest.
- **The turn** — when did this stop being coursework and start being the thing
  you actually cared about? What was the first thing you built because you wanted
  to, not because it was assigned?
- Plus one or two opening lines in your own voice.

### `src/content/knowledge/where-im-from.md` — *one paragraph*

A couple of lines that make Mumbai a place rather than a pin on a map. What do
you actually like about living there? What would someone who's never been get
wrong about it?

*(The work-arrangement line is written: open to remote, in Mumbai if you'd rather
meet, and willing to relocate.)*

### `src/components/stage/About.svelte` — *one paragraph*

The short version of the same thing, for the About section. Two or three
sentences. It can be a compression of the answer above.

---

## 2. One file to drop in

**A photo of you** → `src/images/portrait.jpg`

A phone portrait in decent light is fine. A real face is one of the strongest
signals a site wasn't generated, and it is currently the largest missing piece
after the writing.

Nothing else changes — the build finds the file, sizes it and places it.

---

## 3. Read these and tell me if they're wrong

- **`where-are-you-headed.md`** — drafted from what you've told me privately and
  then rewritten for a public page. Your actual goal includes building for
  yourself; stated plainly on a site recruiters read, that reads as "will leave
  within a year." The file has the honest-but-usable version. There is a `⟨ CHECK ⟩`
  note in it that I'll delete once you've confirmed it.
- **`should-i-hire-you.md`** and **`what-i-get-wrong.md`** — I put words in your
  mouth about your own weaknesses. If you wouldn't say it out loud in an
  interview, it shouldn't be there.
- **The opening line**, in `src/components/stage/Hero.svelte`: *"I build software
  that makes decisions on its own — and then I make sure it makes the right
  ones."* It's the first thing anyone reads, and it's on the share card too.

---

## 4. Before deploying

- **The domain.** One line: `site:` in `astro.config.mjs`. Canonical URLs, the
  sitemap, `robots.txt` and the social share tags all read it from there. Nothing
  else needs changing.
- **Re-make the share card** if you change the opening line — steps in
  `README.md`.

---

## 5. Settled

- Links are real and wired: email, GitHub, LinkedIn.
- `what-i-believe.md` — deleted, on your call. Nothing else referenced it.
- Work arrangement — open to relocating, written into `where-im-from.md`.
- No metrics anywhere, on your instruction, even though the real numbers exist.
