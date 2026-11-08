<script lang="ts">
  import { appear, fold } from '../../lib/motion/gentle';
  /* The document reader, shown by contrast. Ask the same question of an
     ordinary chatbot and of this reader, then step through what the reader
     does: ten passages found two ways, reranked down to four, and an answer
     where every claim carries the page it came from. The second question is
     one the document never covers, which is where a chatbot makes something
     up and this one says so. The lease and its pages are made up. */

  interface Passage { page: number; text: string; how: 'meaning' | 'keyword' | 'both' }
  const PASSAGES: Passage[] = [
    { page: 14, text: 'The tenant may end this lease early by giving sixty days’ written notice.', how: 'both' },
    { page: 3, text: 'The lease begins on 1 March and runs for eleven months.', how: 'meaning' },
    { page: 15, text: 'An early-termination fee of two months’ rent applies.', how: 'both' },
    { page: 9, text: 'Rent is due on the fifth of each month.', how: 'keyword' },
    { page: 31, text: 'Notice must be sent by registered post to the landlord’s address.', how: 'keyword' },
    { page: 22, text: 'The landlord may enter with 24 hours’ notice.', how: 'meaning' },
    { page: 16, text: 'No fee applies if the landlord fails to repair a serious fault.', how: 'meaning' },
    { page: 27, text: 'Pets are allowed with written permission.', how: 'keyword' },
    { page: 12, text: 'The deposit is returned within thirty days of move-out.', how: 'meaning' },
    { page: 40, text: 'Disputes are heard in the local civil court.', how: 'meaning' },
  ];

  interface Q { label: string; ask: string; chatbot: string; kept: number[]; found: boolean; reader: { text: string; cite?: number }[] }
  const QUESTIONS: Record<string, Q> = {
    inside: {
      label: 'A question the document answers',
      ask: 'Can I end the lease early?',
      chatbot: 'Yes. You can usually end a lease early by giving notice and paying a small fee.',
      kept: [14, 15, 31, 16],
      found: true,
      reader: [
        { text: 'You can end it early with sixty days’ written notice ' }, { text: 'p.14', cite: 14 },
        { text: '\u2060, sent by registered post ' }, { text: 'p.31', cite: 31 },
        { text: '\u2060. A fee of two months’ rent applies ' }, { text: 'p.15', cite: 15 },
        { text: '\u2060, unless the landlord failed to repair a serious fault ' }, { text: 'p.16', cite: 16 }, { text: '\u2060.' },
      ],
    },
    outside: {
      label: 'A question it never covers',
      ask: 'Can I sublet the flat?',
      chatbot: 'Yes. Subletting is generally allowed with your landlord’s consent.',
      // The reranker always keeps its best four; none of them mention subletting.
      kept: [27, 22, 14, 3],
      found: false,
      reader: [{ text: 'I could not find this information in the provided document.' }],
    },
  };

  let qk = $state<'inside' | 'outside'>('inside');
  let who = $state<'chatbot' | 'reader'>('chatbot');
  let phase = $state(0); // 0 idle, 1 searched, 2 reranked, 3 answered
  let hover = $state<number | null>(null);

  const q = $derived(QUESTIONS[qk]);
  const ranked = $derived([...PASSAGES].sort((a, b) => (q.kept.includes(b.page) ? 1 : 0) - (q.kept.includes(a.page) ? 1 : 0) || q.kept.indexOf(a.page) - q.kept.indexOf(b.page)));
  const list = $derived(phase >= 2 ? ranked : PASSAGES);

  const reset = () => { phase = 0; hover = null; };
  const pickQ = (k: 'inside' | 'outside') => { qk = k; reset(); };
  const pickWho = (w: 'chatbot' | 'reader') => { who = w; reset(); };
</script>

<div class="demo glass" aria-label="An ordinary chatbot compared with the document reader">
  <div class="row" role="group" aria-label="Pick a question">
    {#each Object.entries(QUESTIONS) as [k, item] (k)}
      <button class:on={qk === k} onclick={() => pickQ(k as 'inside' | 'outside')}>{item.label}</button>
    {/each}
  </div>

  {#key qk}<p class="ask" in:appear><span class="lab">The question</span>“{q.ask}”</p>{/key}

  <div class="row" role="group" aria-label="Who answers">
    <button class:on={who === 'chatbot'} onclick={() => pickWho('chatbot')}>An ordinary chatbot</button>
    <button class:on={who === 'reader'} onclick={() => pickWho('reader')}>This reader</button>
  </div>

  {#if who === 'chatbot'}
    <div class="answer plain" in:appear>
      <p>{q.chatbot}</p>
      <p class="warn">Where did that come from? There is no way to tell, and it sounds just as sure either way.</p>
    </div>
  {:else}
    <div class="bar" in:appear>
      <ol class="steps">
        <li class:done={phase >= 1}>1 Search two ways</li>
        <li class:done={phase >= 2}>2 Rerank, keep four</li>
        <li class:done={phase >= 3}>3 Answer with pages</li>
      </ol>
      {#if phase < 3}
        <button class="go" onclick={() => phase++}>{['Search the document', 'Rerank the results', 'Write the answer'][phase]} <span aria-hidden="true">→</span></button>
      {:else}
        <button class="go" onclick={reset}>Start over</button>
      {/if}
    </div>

    <ul class="passages" in:appear>
      {#each list as p (p.page)}
        {@const kept = phase >= 2 && q.kept.includes(p.page)}
        {@const dropped = phase >= 2 && !kept}
        <li class:kept class:dropped class:lit={hover === p.page} style:order={phase >= 2 ? 0 : undefined}>
          <span class="pg">p.{p.page}</span>
          <span class="tx">{p.text}</span>
          {#if phase >= 1 && phase < 2}<span class={`how ${p.how}`} in:appear>{p.how === 'both' ? 'meaning + keyword' : p.how}</span>{/if}
          {#if dropped}<span class="how" in:appear>dropped</span>{/if}
        </li>
      {/each}
    </ul>

    {#if phase >= 3}
      <div class="answer" transition:fold>
        <p>
          {#each q.reader as part, i (i)}{#if part.cite}<button class="cite" onpointerenter={() => (hover = part.cite!)} onpointerleave={() => (hover = null)} onfocus={() => (hover = part.cite!)} onblur={() => (hover = null)}>{part.text}</button>{:else}{part.text}{/if}{/each}
        </p>
        <p class="good">{q.found ? 'Hover a page tag to see exactly where it came from.' : 'It kept the four closest passages. None of them mention subletting, so it says so instead of guessing.'}</p>
      </div>
    {/if}

  {/if}
  <p class="tag">The lease, its pages and the chatbot’s reply are made up. The steps are how the reader really works.</p>
</div>

<style>
  .demo { padding: var(--s-5); display: grid; gap: var(--s-4); }
  .row { display: flex; flex-wrap: wrap; gap: var(--s-2); }
  button { min-height: var(--tap); padding: 0 var(--s-5); border-radius: 999px; font: inherit; font-variation-settings: 'wght' 600; font-size: var(--t-sm); cursor: pointer; background: transparent; color: var(--ink); border: 1px solid var(--glass-border); transition: background-color 200ms, color 200ms, border-color 200ms; }
  button:hover { border-color: var(--accent); color: var(--accent); }
  button.on { background: color-mix(in oklab, var(--accent) 22%, transparent); border-color: var(--accent); color: var(--accent); }
  .go { background: var(--accent); color: var(--paper); border-color: var(--accent); }
  .go:hover { background: var(--ink); border-color: var(--ink); color: var(--paper); }

  .ask { font-size: var(--t-xl); letter-spacing: -0.02em; color: var(--ink); }
  .lab { display: block; font-family: var(--font-label); font-size: var(--t-xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-bottom: var(--s-1); }

  .answer { padding: var(--s-4) var(--s-5); border-radius: var(--radius-lg); border: 1px solid var(--accent-soft); background: color-mix(in oklab, var(--accent) 10%, transparent); display: grid; gap: var(--s-3); animation: rise 420ms var(--ease-out) both; }
  .answer.plain { border-color: var(--glass-border); background: rgba(60, 80, 124, 0.3); }
  .answer p:first-child { color: var(--ink); font-size: var(--t-lg); }
  .warn { color: #ff9f8f; font-size: var(--t-sm); }
  .good { color: var(--accent); font-size: var(--t-sm); }
  .cite { all: unset; cursor: pointer; padding: 0 0.4em; margin-inline: 0.15em; border-radius: 4px; font-family: var(--font-label); font-size: 0.8em; background: color-mix(in oklab, var(--accent) 28%, transparent); color: var(--accent); }
  .cite:focus-visible { outline: 2px solid var(--accent); }

  .steps { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s-4); font-size: var(--t-sm); color: var(--ink-faint); }
  .steps li { transition: color 260ms; }
  .steps .done { color: var(--accent); }

  .passages { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-2); }
  .passages li { display: grid; grid-template-columns: 3.4rem 1fr auto; gap: var(--s-3); align-items: baseline; padding: var(--s-2) var(--s-3); border: 1px solid var(--rule); border-radius: var(--radius); transition: opacity 400ms var(--ease), border-color 300ms, background-color 300ms, transform 400ms var(--ease-out); }
  .pg { font-family: var(--font-label); font-size: var(--t-xs); color: var(--accent); }
  .tx { color: var(--ink-soft); font-size: var(--t-sm); }
  .how { font-family: var(--font-label); font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-faint); white-space: nowrap; }
  .how.both { color: var(--accent); }
  .kept { border-color: var(--accent); background: color-mix(in oklab, var(--accent) 12%, transparent); }
  .kept .tx { color: var(--ink); }
  .dropped { opacity: 0.32; }
  .lit { transform: translateX(6px); background: color-mix(in oklab, var(--accent) 26%, transparent); }

  .bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s-3) var(--s-5); }
  .tag { color: var(--ink-faint); font-size: var(--t-xs); }

  @keyframes rise { from { opacity: 0; transform: translateY(10px); } }
  @media (prefers-reduced-motion: reduce) { .answer { animation: none; } .passages li { transition: none; } }
  @media (width >= 52rem) { .demo { padding: var(--s-6); } .passages { grid-template-columns: 1fr 1fr; } }
  @media (width < 40rem) { .passages li { grid-template-columns: 3rem 1fr; } .how { grid-column: 2; } }
</style>
