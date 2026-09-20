<script lang="ts">
  /* ---------------------------------------------------------------
     A live diagram of how one system works.

     Every project here is a pipeline, so it draws as a chain: each
     stage lights up in turn and a pulse travels the wire between
     them. Someone who doesn't know what retrieval or a state machine
     is can still watch a request move through and understand the
     shape of it.

     Pure CSS animation — no frame loop, so it costs nothing while
     idle and keeps running if JavaScript is busy elsewhere.
     --------------------------------------------------------------- */

  let {
    stages,
    note,
    /** Seconds for one full pass through the chain. */
    cycle = 4.4,
    active = true,
  }: { stages: string[]; note?: string; cycle?: number; active?: boolean } = $props();

  const step = $derived(cycle / stages.length);
</script>

<figure class="diagram" class:active style={`--cycle:${cycle}s; --step:${step}s;`}>
  <ol class="chain" style={`--count:${stages.length}`}>
    {#each stages as stage, i (stage)}
      <li style={`--i:${i}`}>
        {#if i > 0}
          <span class="wire" aria-hidden="true"><span class="pulse"></span></span>
        {/if}
        <span class="node">
          <span class="ring" aria-hidden="true"></span>
          <span class="idx" aria-hidden="true">{i + 1}</span>
        </span>
        <span class="label">{stage}</span>
      </li>
    {/each}
  </ol>

  {#if note}
    <figcaption>{note}</figcaption>
  {/if}
</figure>

<style>
  .diagram { margin: 0; }

  .chain {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--s-4);
  }

  li {
    display: grid;
    grid-template-columns: 1.75rem 1fr;
    align-items: center;
    gap: var(--s-4);
    position: relative;
  }

  /* --- the node -------------------------------------------------- */
  .node {
    position: relative;
    width: 1.75rem;
    height: 1.75rem;
    display: grid;
    place-items: center;
    border: 1px solid var(--rule);
    border-radius: 50%;
    background: var(--paper);
    transition: border-color 400ms var(--ease);
  }

  .idx {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    color: var(--ink-faint);
    transition: color 400ms var(--ease);
  }

  .ring {
    position: absolute;
    inset: -1px;
    border-radius: 50%;
    border: 1px solid var(--accent);
    opacity: 0;
  }

  .label {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--ink-faint);
    transition: color 400ms var(--ease);
  }

  /* --- the wire between stages ----------------------------------- */
  .wire {
    position: absolute;
    left: 0.875rem;
    bottom: calc(100% - 0.5rem);
    width: 1px;
    height: calc(var(--s-4) + 0.5rem);
    background: var(--rule);
    overflow: hidden;
  }

  .pulse {
    position: absolute;
    inset-inline: -1px;
    height: 60%;
    background: linear-gradient(to bottom, transparent, var(--accent), transparent);
    transform: translateY(-120%);
    opacity: 0;
  }

  /* --- the animation ---------------------------------------------
     Each stage is offset by one step, so the chain lights in order
     and the pulse always arrives just before the node it feeds. */
  .active .node,
  .active .idx,
  .active .label,
  .active .ring,
  .active .pulse {
    animation-duration: var(--cycle);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-delay: calc(var(--i) * var(--step));
  }

  .active .node { animation-name: node-on; }
  .active .idx { animation-name: idx-on; }
  .active .label { animation-name: label-on; }
  .active .ring { animation-name: ring-out; }
  .active .pulse {
    animation-name: pulse-run;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    animation-delay: calc(var(--i) * var(--step) - var(--step) * 0.55);
  }

  @keyframes node-on {
    0%, 4%   { border-color: var(--accent); }
    22%, 100% { border-color: var(--rule); }
  }

  @keyframes idx-on {
    0%, 4%   { color: var(--accent); }
    22%, 100% { color: var(--ink-faint); }
  }

  @keyframes label-on {
    0%, 4%   { color: var(--ink); }
    26%, 100% { color: var(--ink-faint); }
  }

  @keyframes ring-out {
    0%   { opacity: 0.9; transform: scale(1); }
    18%  { opacity: 0; transform: scale(2.1); }
    100% { opacity: 0; transform: scale(2.1); }
  }

  @keyframes pulse-run {
    0%   { opacity: 0; transform: translateY(-120%); }
    6%   { opacity: 1; }
    16%  { opacity: 1; transform: translateY(160%); }
    17%, 100% { opacity: 0; transform: translateY(160%); }
  }

  figcaption {
    margin-top: var(--s-5);
    padding-top: var(--s-4);
    border-top: 1px solid var(--rule-soft);
    font-size: var(--t-sm);
    color: var(--ink-soft);
    max-width: 38ch;
  }

  /* Horizontal on wider screens — a pipeline reads left to right. */
  @media (width >= 46rem) {
    .chain {
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
      gap: 0;
      align-items: start;
    }

    li {
      grid-template-columns: 1fr;
      grid-template-rows: 1.75rem auto;
      justify-items: start;
      gap: var(--s-3);
      padding-right: var(--s-4);
    }

    .wire {
      left: auto;
      right: calc(100% - 0.875rem);
      bottom: auto;
      top: 0.875rem;
      width: calc(100% - 1.75rem + var(--s-4));
      height: 1px;
    }

    .pulse {
      inset-block: -1px;
      inset-inline: auto;
      height: auto;
      width: 34%;
      background: linear-gradient(to right, transparent, var(--accent), transparent);
      transform: translateX(-120%);
    }

    @keyframes pulse-run {
      0%   { opacity: 0; transform: translateX(-120%); }
      6%   { opacity: 1; }
      16%  { opacity: 1; transform: translateX(320%); }
      17%, 100% { opacity: 0; transform: translateX(320%); }
    }

    .label { font-size: 0.6875rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    /* Hold the whole chain lit rather than animating it. */
    .active :is(.node, .idx, .label, .ring, .pulse) { animation: none; }
    .node { border-color: var(--accent); }
    .label { color: var(--ink); }
    .pulse { opacity: 0.4; transform: none; }
  }
</style>
