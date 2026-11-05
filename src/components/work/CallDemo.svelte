<script lang="ts">
  /* The receptionist, shown instead of described: one example call, played a
     turn at a time, with the pipeline lighting up where the work is happening.
     The second button shows the rule that matters most: the booking tool
     refuses to run until the caller has said yes, and that is enforced by
     the code, not by asking the model nicely. The call itself is made up. */

  type Who = 'caller' | 'agent' | 'system';
  interface Step { who: Who; text: string; gloss?: string; active: number[]; note: string }

  const STAGES = [
    { name: 'Caller', hint: 'speaks in Hindi, English, or both' },
    { name: 'Turn detection', hint: 'knows when they have finished' },
    { name: 'Speech to text', hint: 'writes down what was said' },
    { name: 'Language model', hint: 'decides what to do, uses the booking tools' },
    { name: 'Text to speech', hint: 'says the answer out loud' },
  ];

  const ASK: Step = { who: 'caller', text: 'Kal subah ke liye appointment mil sakta hai?', gloss: 'Can I get an appointment tomorrow morning?', active: [0, 1, 2, 3], note: 'The caller speaks. It is heard, transcribed and handed to the model.' };
  const OFFER: Step = { who: 'agent', text: 'Haan ji, kal subah 10:30 par Dr. Mehta free hain. Book kar dun?', gloss: 'Yes, Dr. Mehta is free at 10:30 tomorrow. Shall I book it?', active: [3, 4, 0], note: 'The model looks up free slots, then asks before it books anything.' };
  const YES: Step = { who: 'caller', text: 'Haan, kar dijiye.', gloss: 'Yes, please.', active: [0, 1, 2, 3], note: 'This yes is the confirmation the booking tool is waiting for.' };
  const DONE: Step = { who: 'system', text: 'book_appointment ✓ confirmed by caller → saved to the clinic’s diary', active: [3], note: 'The tool runs, and the booking appears on the front-desk screen.' };
  const BYE: Step = { who: 'agent', text: 'Ho gaya. Kal subah 10:30, Dr. Mehta. Dhanyavaad!', gloss: 'Done. Tomorrow at 10:30 with Dr. Mehta. Thank you!', active: [3, 4, 0], note: 'The call ends politely.' };
  const TRY: Step = { who: 'system', text: 'book_appointment ✗ blocked: the caller has not confirmed yet', active: [3], note: 'The model tried to book without a yes. The rule in the code said no, whatever the prompt said.' };
  const ASKAGAIN: Step = { who: 'agent', text: 'Pehle main confirm kar loon: kal subah 10:30, Dr. Mehta, theek hai?', gloss: 'Let me confirm first: tomorrow 10:30, Dr. Mehta, is that right?', active: [3, 4, 0], note: 'Blocked, the model has to ask the caller instead.' };

  let skipped = $state(false);
  let step = $state(0);

  const script = $derived(skipped ? [ASK, TRY, ASKAGAIN, YES, DONE, BYE] : [ASK, OFFER, YES, DONE, BYE]);
  const shown = $derived(script.slice(0, step + 1));
  const now = $derived(script[Math.min(step, script.length - 1)]);
  const finished = $derived(step >= script.length - 1);

  const next = () => { if (!finished) step++; };
  const restart = (skip = false) => { skipped = skip; step = 0; };
  const trySkip = () => { skipped = true; step = 1; };
</script>

<div class="demo glass" aria-label="An example phone call, played one turn at a time">
  <div class="cols">
    <ol class="talk" aria-live="polite">
      {#each shown as s, i (i + (skipped ? 'a' : 'b'))}
        <li class={`turn ${s.who}`}>
          {#if s.who === 'system'}
            <span class="tool">{s.text}</span>
          {:else}
            <span class="who">{s.who === 'caller' ? 'Caller' : 'Receptionist'}</span>
            <span class="said">{s.text}</span>
            {#if s.gloss}<span class="gloss">{s.gloss}</span>{/if}
          {/if}
        </li>
      {/each}
    </ol>

    <ol class="pipe" aria-label="What is working right now">
      {#each STAGES as st, i (st.name)}
        <li class:on={now.active.includes(i)}>
          <span class="node"></span>
          <span class="name">{st.name}</span>
          <span class="hint">{st.hint}</span>
        </li>
      {/each}
    </ol>
  </div>

  <p class="note">{now.note}</p>

  <div class="controls">
    {#if !finished}
      <button class="go" onclick={next}>{step === 0 ? 'Start the call' : 'Next turn'} <span aria-hidden="true">→</span></button>
    {:else}
      <button class="go" onclick={() => restart(skipped)}>Play again</button>
    {/if}
    {#if !skipped && step === 1}
      <button class="ghost" onclick={trySkip}>Make it skip the confirmation</button>
    {/if}
    {#if skipped}
      <button class="ghost" onclick={() => restart(false)}>Back to the normal call</button>
    {/if}
  </div>
  <p class="tag">An example call. The conversation is made up; how each turn is handled is how it really works.</p>
</div>

<style>
  .demo { padding: var(--s-5); display: grid; gap: var(--s-4); }
  .cols { display: grid; gap: var(--s-5); }

  .talk { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-3); align-content: start; min-height: 16rem; }
  .turn { display: grid; gap: 0.15rem; padding: var(--s-3) var(--s-4); border-radius: var(--radius-lg); max-width: 34rem; animation: pop 420ms var(--ease-out) both; }
  .caller { background: rgba(60, 80, 124, 0.45); justify-self: start; }
  .agent { background: rgba(243, 223, 174, 0.12); border: 1px solid var(--accent-soft); justify-self: end; }
  .system { justify-self: center; padding: var(--s-2) var(--s-3); border: 1px dashed var(--accent-soft); background: transparent; }
  .who { font-family: var(--font-label); font-size: var(--t-xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); }
  .said { color: var(--ink); font-size: var(--t-base); }
  .gloss { color: var(--ink-faint); font-size: var(--t-sm); font-style: italic; }
  .tool { font-family: var(--font-mono); font-size: var(--t-xs); color: var(--accent); }

  .pipe { list-style: none; margin: 0; padding: 0 0 0 var(--s-4); display: grid; gap: var(--s-3); border-left: 1px solid var(--rule); align-content: start; }
  .pipe li { position: relative; display: grid; opacity: 0.45; transition: opacity 300ms var(--ease); }
  .pipe li.on { opacity: 1; }
  .node { position: absolute; left: calc(-1 * var(--s-4) - 5px); top: 0.45rem; width: 9px; height: 9px; border-radius: 50%; background: var(--ink-faint); transition: background-color 300ms, box-shadow 300ms; }
  .on .node { background: var(--accent); box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 25%, transparent), 0 0 14px var(--accent); }
  .name { color: var(--ink); font-variation-settings: 'wght' 580; }
  .hint { color: var(--ink-faint); font-size: var(--t-sm); }

  .note { color: var(--ink-soft); font-size: var(--t-sm); min-height: 2.6em; padding-top: var(--s-3); border-top: 1px solid var(--rule); }
  .controls { display: flex; flex-wrap: wrap; gap: var(--s-3); }
  button { min-height: var(--tap); padding: 0 var(--s-5); border-radius: 999px; font: inherit; font-variation-settings: 'wght' 600; font-size: var(--t-sm); cursor: pointer; transition: background-color 200ms, color 200ms, border-color 200ms; }
  .go { background: var(--accent); color: var(--paper); border: 1px solid var(--accent); }
  .go:hover { background: var(--ink); border-color: var(--ink); }
  .ghost { background: transparent; color: var(--ink); border: 1px solid var(--glass-border); }
  .ghost:hover { border-color: var(--accent); color: var(--accent); }
  .tag { color: var(--ink-faint); font-size: var(--t-xs); }

  @keyframes pop { from { opacity: 0; transform: translateY(10px) scale(0.98); } }
  @media (prefers-reduced-motion: reduce) { .turn { animation: none; } .pipe li, .node { transition: none; } }
  @media (width >= 52rem) { .demo { padding: var(--s-6); } .cols { grid-template-columns: 1.4fr 1fr; } }
</style>
