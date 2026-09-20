import type { Answer, Brain, Entry } from './types';

/* ---------------------------------------------------------------
   The v2 brain. Written, wired, and dormant.

   Turning it on, when there is a host and an API key:
     1. add a server adapter        (npx astro add node | vercel | cloudflare)
     2. create src/pages/api/ask.ts (retrieve over the same entries,
        generate, return { answerId, text, suggestions })
     3. set PUBLIC_BRAIN=llm
   No component changes. No design changes. The UI cannot tell the
   difference because it only ever sees an Answer.
   --------------------------------------------------------------- */

export function createLlmBrain(entries: Entry[], endpoint = '/api/ask'): Brain {
  const byId = new Map(entries.map((e) => [e.id, e]));

  return {
    name: 'llm',
    async ask(query: string): Promise<Answer> {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!res.ok) throw new Error(`ask failed: ${res.status}`);

        const data = (await res.json()) as {
          answerId?: string;
          suggestionIds?: string[];
          confidence?: number;
        };

        const entry = data.answerId ? byId.get(data.answerId) ?? null : null;
        const suggestions = (data.suggestionIds ?? [])
          .map((id) => byId.get(id))
          .filter((e): e is Entry => Boolean(e));

        return {
          kind: entry ? 'hit' : 'miss',
          entry,
          query,
          suggestions,
          confidence: data.confidence ?? 0,
        };
      } catch {
        // The site must never be broken by the model being down.
        // Fall back to the local matcher, which always works.
        const { createStaticBrain } = await import('./static');
        return createStaticBrain(entries).ask(query);
      }
    },
  };
}
