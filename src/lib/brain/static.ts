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
  const words = input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w));

  const kept = words.filter((w) => w.length > 1 && !STOP.has(w));

  // "what do you do" is entirely stop words but is the single most
  // likely question anyone types. Never return nothing.
  return kept.length ? kept : words;
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

/** How much each token counts, by how rare it is across the corpus.

    Without this, "what do you work on" matches "How do you actually
    work?" as strongly as anything else, because the only shared word
    is "work" — which appears nearly everywhere and means almost
    nothing. Rare words like "remotely" or "hobbies" should decide. */
function buildIdf(entries: Entry[]): Map<string, number> {
  const df = new Map<string, number>();

  for (const entry of entries) {
    const seen = new Set(
      tokens([entry.question, entry.short, ...entry.aliases].join(' ')),
    );
    for (const token of seen) df.set(token, (df.get(token) ?? 0) + 1);
  }

  const n = entries.length;
  const idf = new Map<string, number>();
  for (const [token, count] of df) idf.set(token, Math.log(1 + n / count));
  return idf;
}

/** Unknown words are rare by definition, so they get the top weight. */
function weightOf(idf: Map<string, number>, token: string): number {
  return idf.get(token) ?? Math.log(1 + 20);
}

/** Weights: an alias hit is near-certain intent; body text is weak
 *  evidence and mostly there to catch topic words. */
const W = { question: 3.0, alias: 3.2, short: 1.6, body: 0.25, fuzzy: 1.4 };

/** Below this, we'd rather admit we don't know. Raising it makes the
 *  site refuse more often, which is the safer failure. */
const THRESHOLD = 0.3;

/** A query that is essentially one of the known phrasings should win
 *  outright, whatever the token maths says. */
const NEAR_EXACT = 0.82;

function score(
  query: string,
  entry: Entry,
  idf: Map<string, number>,
): number {
  const q = tokens(query);
  if (!q.length) return 0;

  const totalWeight = q.reduce((sum, t) => sum + weightOf(idf, t), 0);
  if (totalWeight === 0) return 0;

  /** Share of the query's *meaning* — not its word count — found in
   *  this text. */
  const covered = (text: string) => {
    const set = new Set(tokens(text));
    if (!set.size) return 0;
    const hit = q.reduce(
      (sum, t) => sum + (set.has(t) ? weightOf(idf, t) : 0),
      0,
    );
    return hit / totalWeight;
  };

  const phrases = [entry.question, ...entry.aliases];
  const qGrams = trigrams(query);
  const fuzzyBest = phrases.reduce(
    (best, phrase) => Math.max(best, dice(qGrams, trigrams(phrase))),
    0,
  );

  if (fuzzyBest >= NEAR_EXACT) return 1;

  const aliasBest = entry.aliases.reduce(
    (best, alias) => Math.max(best, covered(alias)),
    0,
  );

  const raw =
    covered(entry.question) * W.question +
    aliasBest * W.alias +
    covered(entry.short) * W.short +
    covered(entry.text) * W.body +
    fuzzyBest * W.fuzzy;

  return raw / (W.question + W.alias + W.short + W.body + W.fuzzy);
}

export function createStaticBrain(entries: Entry[]): Brain {
  const pool = entries.filter((e) => !e.hidden);
  const idf = buildIdf(pool);

  return {
    name: 'static',
    async ask(query: string): Promise<Answer> {
      const ranked = pool
        .map((entry) => ({ entry, s: score(query, entry, idf) }))
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
