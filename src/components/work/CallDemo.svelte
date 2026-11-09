<script lang="ts">
  import { appear } from '../../lib/motion/gentle';
  /* The receptionist, shown instead of described: one example call, played a
     turn at a time, with the pipeline lighting up where the work is happening.
     The second button shows the rule that matters most: the booking tool
     refuses to run until the caller has said yes, and that is enforced by
     the code, not by asking the model nicely. The call itself is made up. */

  type Who = 'caller' | 'agent' | 'system';
  interface Step { who: Who; text: string; gloss?: string; active: number[]; note: string }

  const STAGES = [
    { name: 'Caller', hint: 'speaks Hindi, with some English mixed in' },
    { name: 'Turn detection', hint: 'knows when they have finished' },
    { name: 'Speech to text', hint: 'writes down what was said' },
    { name: 'Language model', hint: 'decides what to do, uses the booking tools' },
    { name: 'Text to speech', hint: 'says the answer out loud' },
  ];

  const ASK: Step = { who: 'caller', text: 'Mere bete ko bukhaar hai. Kal subah doctor ko dikha sakte hain?', gloss: 'My son has a fever. Can a doctor see him tomorrow morning?', active: [0, 1, 2, 3], note: 'The caller speaks. It is heard, transcribed and handed to the model.' };
  const OFFER: Step = { who: 'agent', text: 'Ji, kal subah Dr. Mehta 10:30 ya 11:00 baje free hain. Kaunsa time theek rahega?', gloss: 'Dr. Mehta is free at 10:30 or 11:00 tomorrow morning. Which time suits you?', active: [3, 4, 0], note: 'The model looks up the free slots and offers only times the diary returned.' };
  const PICK: Step = { who: 'caller', text: '10:30 theek hai.', gloss: '10:30 is fine.', active: [0, 1, 2, 3], note: 'A time is chosen. Nothing is booked yet.' };
  const DETAILS_ASK: Step = { who: 'agent', text: 'Patient ka naam aur das digit ka mobile number bata dijiye. Chahein toh aane ki wajah bhi.', gloss: "Please tell me the patient's name and a ten-digit mobile number. And the reason for the visit, if you like.", active: [3, 4, 0], note: 'Before booking, it needs the patient’s name and number. The reason is optional.' };
  const DETAILS: Step = { who: 'caller', text: 'Aarav Shah. Number 98765 43210. Bukhaar ke liye.', gloss: 'Aarav Shah. Number 98765 43210. For the fever.', active: [0, 1, 2, 3], note: 'The details are written down and handed to the model.' };
  const CHECK: Step = { who: 'system', text: 'check_booking ✓ slot still free, details ready to read back (nothing booked)', active: [3], note: 'A check, not a booking: the slot is still free and the details are valid.' };
  const READBACK: Step = { who: 'agent', text: 'Ek baar confirm kar loon: kal subah 10:30, Dr. Mehta, Aarav Shah, 98765 43210. Sab sahi hai?', gloss: 'Let me confirm: tomorrow 10:30, Dr. Mehta, Aarav Shah, 98765 43210. Is all of that right?', active: [3, 4, 0], note: 'Everything is read back. Now it has to wait for the caller’s answer.' };
  const YES: Step = { who: 'caller', text: 'Haan, sab sahi hai.', gloss: 'Yes, all correct.', active: [0, 1, 2, 3], note: 'This yes, after the read-back, is what the booking tool is waiting for.' };
  const DONE: Step = { who: 'system', text: 'book_appointment ✓ caller answered the read-back → saved to the clinic’s diary', active: [3], note: 'The tool runs, and the booking appears on the front-desk screen.' };
  const BYE: Step = { who: 'agent', text: 'Ho gaya ji. Aarav ji ka appointment kal subah 10:30 par hai. Dhanyavaad!', gloss: 'Done. Aarav’s appointment is tomorrow at 10:30. Thank you!', active: [3, 4, 0], note: 'The call ends politely.' };
  const TRY: Step = { who: 'system', text: 'book_appointment ✗ blocked: the caller has not answered the read-back yet', active: [3], note: 'The model tried to book before the caller answered. The rule in the code said no, whatever the prompt said.' };
  const WAIT: Step = { who: 'agent', text: 'Bas ek baar bata dijiye, yeh sab details sahi hain?', gloss: 'Just tell me once, are all these details right?', active: [3, 4, 0], note: 'Blocked, the model has to wait for the caller instead.' };

  const BEFORE = [ASK, OFFER, PICK, DETAILS_ASK, DETAILS, CHECK, READBACK];
  const SKIP_AT = BEFORE.length - 1; // the read-back: where skipping would happen

  let skipped = $state(false);
  let step = $state(0);

  const script = $derived(skipped ? [...BEFORE, TRY, WAIT, YES, DONE, BYE] : [...BEFORE, YES, DONE, BYE]);
  const shown = $derived(script.slice(0, step + 1));
  const now = $derived(script[Math.min(step, script.length - 1)]);
  const finished = $derived(step >= script.length - 1);

  const next = () => { if (!finished) step++; };
  const restart = (skip = false) => { skipped = skip; step = 0; };
  const trySkip = () => { skipped = true; step = SKIP_AT + 1; };
</script>

<div class="demo glass" aria-label="An example call, played one turn at a time">
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

  {#key now.note}<p class="note" in:appear>{now.note}</p>{/key}

  <div class="controls">
    {#if !finished}
      <button class="go" onclick={next}>{step === 0 ? 'Start the call' : 'Next turn'} <span aria-hidden="true">→</span></button>
    {:else}
      <button class="go" onclick={() => restart(skipped)}>Play again</button>
    {/if}
    {#if !skipped && step === SKIP_AT}
      <button class="ghost" in:appear onclick={trySkip}>Make it book before the yes</button>
    {/if}
    {#if skipped}
      <button class="ghost" in:appear onclick={() => restart(false)}>Back to the normal call</button>
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
  @media (hover: hover) { .go:hover { background: var(--ink); border-color: var(--ink); } }
  .ghost { background: transparent; color: var(--ink); border: 1px solid var(--glass-border); }
  @media (hover: hover) { .ghost:hover { border-color: var(--accent); color: var(--accent); } }
  .tag { color: var(--ink-faint); font-size: var(--t-xs); }

  @keyframes pop { from { opacity: 0; transform: translateY(10px) scale(0.98); } }
  @media (prefers-reduced-motion: reduce) { .turn { animation: none; } .pipe li, .node { transition: none; } }
  @media (width >= 52rem) { .demo { padding: var(--s-6); } .cols { grid-template-columns: 1.4fr 1fr; } }
</style>
