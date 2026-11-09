import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/* ---------------------------------------------------------------
   One knowledge entry = one answer = one Markdown file.

   The home page reads the projects from this collection. The rest
   is kept for a future agent's retrieval corpus.

   Adding a question to the site means adding a file here. No code
   changes anywhere.
   --------------------------------------------------------------- */

/** Where an entry sits in the Map panel. Order here is display order. */
export const GROUPS = [
  'short-version',
  'things-built',
  'how-i-think',
  'the-person',
] as const;

export const GROUP_LABELS: Record<(typeof GROUPS)[number], string> = {
  'short-version': 'The short version',
  'things-built': "Things I've built",
  'how-i-think': 'How I think',
  'the-person': 'The person',
};

/** Which renderer draws this answer. Each maps to one file in
 *  components/cards/. Adding a card type = adding a file + a line
 *  in the CardRenderer map. */
export const CARD_TYPES = [
  'story',    // prose with an optional figure
  'project',  // a thing he built, plain-English first
  'list',     // enumerated points
  'timeline', // ordered moments
  'quote',    // a single line given room
  'compare',  // two columns, this vs that
] as const;

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema: z.object({
    /** The question exactly as a visitor sees it on a chip. */
    question: z.string(),
    /** Two or three words, for the Map panel. */
    short: z.string(),
    /** Other phrasings the matcher should accept. Cheap recall wins. */
    aliases: z.array(z.string()).default([]),
    group: z.enum(GROUPS),
    card: z.enum(CARD_TYPES).default('story'),
    /** Question ids offered at the end of this answer. */
    followups: z.array(z.string()).default([]),
    /** Shown as an opening chip on the landing page. */
    featured: z.boolean().default(false),
    /** Display order inside a group. */
    order: z.number().default(0),

    /* --- optional, card-specific ------------------------------ */
    /** project: an everyday moment the reader recognises, told before
     *  the project itself. It is the reason anyone should care. */
    moment: z.string().optional(),
    /** project: the one-line version a non-technical reader gets first. */
    tagline: z.string().optional(),
    /** project: what it is, in the plainest words available. */
    plain: z.string().optional(),
    /** project: its public repo, where the technical detail lives.
     *  Real link or omitted. Never invented. */
    link: z.string().url().optional(),
    /** list / timeline: the rows. */
    items: z
      .array(z.object({ label: z.string(), body: z.string().optional() }))
      .optional(),
    /** compare: two labelled columns. */
    sides: z
      .array(z.object({ label: z.string(), points: z.array(z.string()) }))
      .length(2)
      .optional(),
    /** quote: attribution, if any. */
    attribution: z.string().optional(),
    /** project: one or two lines for the card on the home page. */
    blurb: z.string().optional(),
    /** Excluded from search engines and /everything when true. */
    hidden: z.boolean().default(false),
  }),
});

/* ---------------------------------------------------------------
   One project page = one Markdown file here, named like the project's
   id in the knowledge collection (receptionist, truthlens, ...).

   The page at /work/<id> shows the project's card copy from the
   knowledge entry first, then the frontmatter below, then this file's
   body. Write the body freely: headings, lists, images, anything
   Markdown can hold. Only state what is true of the project.
   --------------------------------------------------------------- */

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    /** The tools it is built with, as short chips. */
    stack: z.array(z.string()).default([]),
    /** Up to three numbers or facts to show big, above the write-up. */
    facts: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .max(3)
      .default([]),
    /** How it is built, as the path the work travels: one stop per step,
     *  a plain line and the tools. When present, the page shows this strip
     *  and folds the long write-up behind a toggle. */
    build: z
      .object({
        title: z.string(),
        steps: z.array(z.object({ step: z.string(), does: z.string(), tools: z.array(z.string()).default([]) })),
      })
      .optional(),
    /** An interactive demonstration shown under the page header. `kind`
     *  picks the component in src/components/work/. */
    demo: z
      .object({
        kind: z.enum(['call', 'scan', 'retrieval']),
        title: z.string(),
        lead: z.string(),
      })
      .optional(),
  }),
});

export const collections = { knowledge, projects };
