<script lang="ts">
  /* The work section. Each project is a row that opens into a live
     diagram of how the system actually works.

     Only one is open at a time, so the page never becomes a wall —
     and the diagram only animates while open, which keeps four
     simultaneous animations off the compositor. */
  import type { Entry } from '../../lib/brain/types';
  import Example from './Example.svelte';
  import Reveal from './Reveal.svelte';
  import Glass from './Glass.svelte';

  let { entries }: { entries: Entry[] } = $props();

  let openId = $state(entries[0]?.id ?? '');

  function toggle(id: string) {
    openId = openId === id ? '' : id;
  }
</script>

<div class="work page">
  <Reveal>
    <header class="head" data-quiet>
      <p class="label">
        <span class="bar" aria-hidden="true"></span>
        Things I've built
      </p>
      <h2>AI works in the demo. Then real people use it.</h2>
      <p class="sub">Three things I built for the second part. Open one to see it in action.</p>
    </header>
  </Reveal>

  <ol class="rows">
    {#each entries as entry, i (entry.id)}
      {@const open = openId === entry.id}
      <li class:open data-form={entry.form}>
        <Reveal delay={i * 70} y={26}>
          <Glass class="row">
          <h3>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={`panel-${entry.id}`}
              onclick={() => toggle(entry.id)}
            >
              <span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span class="title">
                {entry.tagline ?? entry.short}
                {#if entry.moment}
                  <!-- The everyday moment comes before the project: it is
                       the reason a non-technical reader cares at all. -->
                  <span class="moment">{entry.moment}</span>
                {/if}
              </span>
              <span class="mark" aria-hidden="true"></span>
            </button>
          </h3>

          <div class="panel" id={`panel-${entry.id}`} hidden={!open}>
            <div class="story">
              <p class="plain">{entry.plain}</p>

              <!-- The site tells the story; the repo holds the detail. -->
              {#if entry.link}
                <a class="more" href={entry.link} rel="noreferrer noopener">
                  How it's built
                  <span aria-hidden="true">↗</span>
                </a>
              {/if}
            </div>

            {#if entry.example}
              <div class="example-slot">
                <Example example={entry.example} note={entry.note} active={open} />
              </div>
            {/if}
          </div>
          </Glass>
        </Reveal>
      </li>
    {/each}
  </ol>
</div>

<style>
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
    max-width: 24ch;
  }

  .sub {
    margin-top: var(--s-4);
    max-width: 44ch;
    font-size: var(--t-lg);
    color: var(--ink-soft);
  }

  .rows { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-4); }

  li :global(.row .inner) { padding-inline: var(--s-5); }

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
    display: block;
    font-family: var(--font-display);
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 380;
    line-height: var(--leading-snug);
  }

  .moment {
    display: block;
    margin-top: var(--s-2);
    max-width: 60ch;
    font-family: var(--font-body);
    font-size: var(--t-base);
    font-weight: 400;
    font-variation-settings: 'wght' 400;
    font-style: normal;
    line-height: var(--leading-body);
    color: var(--ink-faint);
  }

  .open .moment { color: var(--ink-soft); }

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

  /* Story on the left, the real thing on the right. Stacks on a
     narrow screen. */
  .panel {
    display: grid;
    gap: var(--s-6);
    margin-left: calc(2.5rem + var(--s-3));
  }

  .plain {
    max-width: 40ch;
    font-size: var(--t-lg);
    line-height: var(--leading-snug);
    color: var(--ink);
  }

  .example-slot { min-width: 0; }

  @media (width >= 60rem) {
    .panel { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: var(--s-8); }
  }

  .more {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    margin-top: var(--s-5);
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
    .panel { margin-left: 0; }
  }
</style>
