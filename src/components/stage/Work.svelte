<script lang="ts">
  /* The work section. Each project is a row that opens into a live
     diagram of how the system actually works.

     Only one is open at a time, so the page never becomes a wall —
     and the diagram only animates while open, which keeps four
     simultaneous animations off the compositor. */
  import type { Entry } from '../../lib/brain/types';
  import SystemDiagram from './SystemDiagram.svelte';
  import Reveal from './Reveal.svelte';

  let { entries }: { entries: Entry[] } = $props();

  let openId = $state(entries[0]?.id ?? '');

  function toggle(id: string) {
    openId = openId === id ? '' : id;
  }
</script>

<section class="work page" id="work">
  <Reveal>
    <header class="head">
      <p class="label">
        <span class="bar" aria-hidden="true"></span>
        Things I've built
      </p>
      <h2>Four systems. Watch one run.</h2>
    </header>
  </Reveal>

  <ol class="rows">
    {#each entries as entry, i (entry.id)}
      {@const open = openId === entry.id}
      <li class:open>
        <Reveal delay={i * 70}>
          <h3>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`panel-${entry.id}`}
              onclick={() => toggle(entry.id)}
            >
              <span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span class="title">{entry.tagline ?? entry.short}</span>
              <span class="mark" aria-hidden="true"></span>
            </button>
          </h3>

          <div class="panel" id={`panel-${entry.id}`} hidden={!open}>
            <p class="plain">{entry.plain}</p>

            {#if entry.flow?.length}
              <div class="diagram-slot">
                <SystemDiagram stages={entry.flow} note={entry.flowNote} active={open} />
              </div>
            {/if}

            <a class="more" href={`/ask/${entry.id}`}>
              Read the whole story
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </Reveal>
      </li>
    {/each}
  </ol>
</section>

<style>
  .work { padding-block: var(--section); }

  .head { margin-bottom: var(--s-7); }

  .label { display: flex; align-items: center; gap: var(--s-3); }

  .bar {
    width: 2rem;
    height: 1px;
    background: var(--accent);
  }

  h2 {
    margin-top: var(--s-4);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 400;
    max-width: 18ch;
  }

  .rows { list-style: none; margin: 0; padding: 0; }

  li { border-top: 1px solid var(--rule-soft); }
  li:last-child { border-bottom: 1px solid var(--rule-soft); }

  h3 { margin: 0; font-size: inherit; letter-spacing: 0; }

  button {
    display: grid;
    grid-template-columns: 2.5rem 1fr 1.5rem;
    align-items: center;
    gap: var(--s-3);
    width: 100%;
    padding-block: var(--s-5);
    text-align: left;
    color: var(--ink-soft);
    transition: color 300ms var(--ease);
  }

  button:hover { color: var(--ink); }
  .open button { color: var(--ink); }

  .num {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    color: var(--accent);
  }

  .title {
    font-family: var(--font-display);
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 380;
    line-height: var(--leading-snug);
  }

  /* A plus that becomes a minus. Two bars, one rotates. */
  .mark {
    position: relative;
    width: 0.875rem;
    height: 0.875rem;
    justify-self: end;
  }

  .mark::before,
  .mark::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: 50%;
    height: 1px;
    background: currentColor;
    transition: transform 420ms var(--ease-out);
  }

  .mark::after { transform: rotate(90deg); }
  .open .mark::after { transform: rotate(0deg); }

  .panel {
    padding-bottom: var(--s-7);
    animation: panel-in 520ms var(--ease-out) both;
  }

  .panel[hidden] { display: none; }

  .plain {
    max-width: 46ch;
    font-size: var(--t-lg);
    line-height: var(--leading-snug);
    color: var(--ink);
    margin-left: calc(2.5rem + var(--s-3));
  }

  .diagram-slot {
    margin-top: var(--s-7);
    margin-left: calc(2.5rem + var(--s-3));
  }

  .more {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    margin-top: var(--s-6);
    margin-left: calc(2.5rem + var(--s-3));
    min-height: var(--tap);
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
    text-decoration: none;
  }

  @keyframes panel-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: none; }
  }

  @media (width < 40rem) {
    button { grid-template-columns: 2rem 1fr 1.25rem; }
    .title { font-size: var(--t-lg); }
    .plain, .diagram-slot, .more { margin-left: 0; }
  }
</style>
