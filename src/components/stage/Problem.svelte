<script lang="ts">
  /* "The problem I work on" — why any of the projects below matter.

     Driven by the-problem.md: its title is the heading, its body is
     the intro, its items are the cards. The closing line hands the
     reader to the work section, which is the answer to this one. */
  import type { Entry } from '../../lib/brain/types';
  import TextReveal from './TextReveal.svelte';
  import Reveal from './Reveal.svelte';
  import Glass from './Glass.svelte';

  let { entry }: { entry: Entry } = $props();
  const items = $derived(entry?.items ?? []);
</script>

<div class="page">
  <header class="head">
    <p class="label"><span class="bar" aria-hidden="true"></span>{entry.short}</p>
    <TextReveal text={entry.question} tag="h2" />
    <div class="intro">{@html entry.html}</div>
  </header>

  <ol class="grid">
    {#each items as item, i (item.label)}
      <Reveal delay={i * 90} y={26}>
        <li>
          <Glass class="card">
            <span class="k">{String(i + 1).padStart(2, '0')}</span>
            <h3>{item.label}</h3>
            {#if item.body}<p>{item.body}</p>{/if}
          </Glass>
        </li>
      </Reveal>
    {/each}
  </ol>

  <Reveal delay={200}>
    <p class="close">Closing that gap is my job. Here's what I've built to do it.</p>
  </Reveal>
</div>

<style>
  .head { margin-bottom: var(--s-7); }

  .intro {
    margin-top: var(--s-5);
    max-width: 40ch;
    font-size: var(--t-lg);
    line-height: var(--leading-snug);
    color: var(--ink-soft);
  }

  .intro :global(p + p) { margin-top: var(--s-3); }

  .close {
    margin-top: var(--s-7);
    font-family: var(--font-display);
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 380;
    font-style: italic;
    color: var(--ink);
    max-width: 30ch;
  }

  .label { display: flex; align-items: center; gap: var(--s-3); }
  .bar { width: 2rem; height: 1px; background: var(--accent); }

  .head :global(h2) {
    margin-top: var(--s-4);
    font-family: var(--font-display);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 400;
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
    max-width: 16ch;
  }

  .grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--s-4);
  }

  li { height: 100%; }

  li :global(.card) { height: 100%; }

  li :global(.card .inner) {
    display: grid;
    gap: var(--s-3);
    align-content: start;
    padding: var(--s-5);
    height: 100%;
  }

  .k {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
  }

  h3 {
    font-family: var(--font-display);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-text), 'wght' 450;
    line-height: var(--leading-snug);
    letter-spacing: -0.01em;
    color: var(--ink);
    max-width: 22ch;
  }

  p {
    font-size: var(--t-sm);
    color: var(--ink-soft);
    max-width: 42ch;
  }

  @media (width >= 48rem) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (width >= 72rem) {
    .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    p { font-size: var(--t-xs); }
  }
</style>
