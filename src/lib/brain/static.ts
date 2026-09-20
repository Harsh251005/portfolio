import type { Answer, Brain, Entry } from './types';

/* ---------------------------------------------------------------
   The v1 brain: a local matcher over the knowledge entries.

   No network, no API key, no cost. It works with the machine
   offline. It is deliberately simple — the job is to recognise
   which of ~20 known questions someone is asking, not to reason.

   Replaced wholesale by ./llm.ts later. Nothing else imports it.
   --------------------------------------------------------------- */

const STOP = new Set([
  'a','an','the','is','are','was','were','be','been','do','does','did','you',
  'your','yours','i','me','my','we','us','it','its','of','to','in','on','for',
  'at','by','with','about','and','or','but','so','if','then','than','that',
  'this','these','those','what','whats','how','why','when','where','who','which',
  'can','could','would','should','will','have','has','had','get','got','tell',
  'show','me','any','some','there','here','from','as','not','no','yes','ok',
]);

/** Lowercase, strip punctuation, drop stop words, crude de-pluralise. */
function tokens(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w));
}

/** Character-trigram overlap. Catches typos and near-misses that
 *  token matching alone would drop. */
function trigrams(s: string): Set<string> {
  const p = ` ${s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ' ')} `;
  const out = new Set<string>();
  for (let i = 0; i < p.length - 2; i++) out.add(p.slice(i, i + 3));
  return out;
}

function dice(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const g of a) if (b.has(g)) shared++;
  return (2 * shared) / (a.size + b.size);
}

/** Weights: an alias hit is near-certain intent, body text is weak
 *  evidence. Tuned so a one-word query like "hire" still lands. */
const W = { question: 3.0, alias: 3.0, short: 2.0, body: 0.4, fuzzy: 2.0 };

/** Below this, we'd rather admit we don't know. Raising it makes the
 *  site say "I don't know" more often, which is the safer failure. */
const THRESHOLD = 0.34;

function score(query: string, entry: Entry): number {
  const q = tokens(query);
  if (!q.length) return 0;

  const inSet = (text: string) => {
    const set = new Set(tokens(text));
    if (!set.size) return 0;
    return q.filter((t) => set.has(t)).length / q.length;
  };

  const aliasBest = entry.aliases.reduce((best, a) => Math.max(best, inSet(a)), 0);
  const fuzzyBest = [entry.question, ...entry.aliases].reduce(
    (best, a) => Math.max(best, dice(trigrams(query), trigrams(a))),
    0,
  );

  const raw =
    inSet(entry.question) * W.question +
    aliasBest * W.alias +
    inSet(entry.short) * W.short +
    inSet(entry.text) * W.body +
    fuzzyBest * W.fuzzy;

  return raw / (W.question + W.alias + W.short + W.body + W.fuzzy);
}

export function createStaticBrain(entries: Entry[]): Brain {
  const pool = entries.filter((e) => !e.hidden);

  return {
    name: 'static',
    async ask(query: string): Promise<Answer> {
      const ranked = pool
        .map((entry) => ({ entry, s: score(query, entry) }))
        .sort((a, b) => b.s - a.s);

      const top = ranked[0];

      if (!top || top.s < THRESHOLD) {
        return {
          kind: 'miss',
          entry: null,
          query,
          // Still offer the nearest three — a dead end is the one
          // thing guaranteed to make someone leave.
          suggestions: ranked.slice(0, 3).map((r) => r.entry),
          confidence: top?.s ?? 0,
        };
      }

      return {
        kind: 'hit',
        entry: top.entry,
        query,
        suggestions: ranked.slice(1, 3).map((r) => r.entry),
        confidence: top.s,
      };
    },
  };
}
