/* ---------------------------------------------------------------
   The contract between the site and whatever is answering.

   Today a local matcher implements it. Later an LLM will. The UI
   imports `ask` from ./index and knows nothing about which.
   Keep this file small — every field added here is a field the
   future LLM adapter has to produce too.
   --------------------------------------------------------------- */

/** A knowledge entry, flattened for use anywhere (server or browser). */
export interface Entry {
  id: string;
  question: string;
  short: string;
  aliases: string[];
  group: string;
  card: string;
  featured: boolean;
  order: number;
  followups: string[];
  hidden: boolean;
  /** Rendered body HTML. Built once, at build time. */
  html: string;
  /** Plain text of the body, for matching. */
  text: string;
  /* card-specific, all optional */
  tagline?: string;
  plain?: string;
  link?: string;
  items?: { label: string; body?: string }[];
  sides?: { label: string; points: string[] }[];
  attribution?: string;
  flow?: string[];
  flowNote?: string;
}

export type AnswerKind = 'hit' | 'miss';

export interface Answer {
  kind: AnswerKind;
  /** The entry to show. Null only when kind is 'miss'. */
  entry: Entry | null;
  /** What the visitor typed, if they typed. */
  query: string;
  /** On a miss: the nearest things we do know. */
  suggestions: Entry[];
  /** 0–1. Useful for tuning; not shown to visitors. */
  confidence: number;
}

export interface Brain {
  readonly name: string;
  ask(query: string): Promise<Answer>;
}
