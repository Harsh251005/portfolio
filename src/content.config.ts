import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* ---------------------------------------------------------------
   One knowledge entry = one answer = one Markdown file.

   This collection is the site's single source of truth. Three
   things consume it and none of them own it:
     1. the Thread      (tap a question, unfold this answer)
     2. /everything     (all of them, flattened and linear)
     3. /ask/[slug]     (one real URL per answer)
   A fourth will later: the LLM's retrieval corpus.

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
    /** project: the one-line version a non-technical reader gets first. */
    tagline: z.string().optional(),
    /** project: what it is, in the plainest words available. */
    plain: z.string().optional(),
    /** project: real link, or omitted. Never invented. */
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
    /** Excluded from search engines and /everything when true. */
    hidden: z.boolean().default(false),
  }),
});

export const collections = { knowledge };
