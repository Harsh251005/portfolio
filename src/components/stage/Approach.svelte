<script lang="ts">
  /* "How I work" — a sticky heading with principles scrolling past it.

     The heading holding still while the list moves is the smoothest
     scroll device there is, and it costs one CSS property.

     Deliberately not glass. The panels above and below are; a ruled
     list here breaks the run of cards so the page has a rhythm rather
     than one surface repeated. */
  import type { Entry } from '../../lib/brain/types';
  import TextReveal from './TextReveal.svelte';
  import Reveal from './Reveal.svelte';

  let { entry }: { entry: Entry } = $props();
  const items = $derived(entry?.items ?? []);
</script>

<div class="page wrap">
  <div class="sticky">
    <p class="label"><span class="bar" aria-hidden="true"></span>How I work</p>
    <TextReveal text="Four habits that took too long to learn." tag="h2" />
    <p class="sub">Nothing exotic. They are just the ones that survived contact with something breaking.</p>
  </div>

  <ol class="list">
    {#each items as item, i (item.label)}
      <Reveal delay={i * 60} y={26}>
        <li>
          <span class="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3>{item.label}</h3>
            {#if item.body}<p>{item.body}</p>{/if}
          </div>
        </li>
      </Reveal>
    {/each}
  </ol>
</div>

<style>
  .wrap { display: grid; gap: var(--s-7); }

  .label { display: flex; align-items: center; gap: var(--s-3); }
  .bar { width: 2rem; height: 1px; background: var(--accent); }

  .sticky :global(h2) {
    margin-top: var(--s-4);
    font-family: var(--font-display);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 400;
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
    max-width: 14ch;
  }

  .sub {
    margin-top: var(--s-4);
    font-size: var(--t-sm);
    color: var(--ink-soft);
    max-width: 32ch;
  }

  .list { list-style: none; margin: 0; padding: 0; display: grid; border-bottom: 1px solid var(--rule); }

  li {
    display: grid;
    grid-template-columns: 5.5rem 1fr;
    gap: var(--s-4);
    padding-block: var(--s-6);
    border-top: 1px solid var(--rule);
  }


  /* Big, thin, outlined numerals: the ornament this section gets
     instead of a card. */
  .n {
    font-family: var(--font-display);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 300;
    line-height: 0.8;
    color: transparent;
    -webkit-text-stroke: 1px color-mix(in oklab, var(--accent) 70%, transparent);
  }

  h3 {
    font-family: var(--font-display);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-text), 'wght' 450;
    line-height: var(--leading-snug);
    letter-spacing: -0.01em;
  }

  p { margin-top: var(--s-2); font-size: var(--t-sm); color: var(--ink-soft); max-width: 46ch; }

  @media (width < 40rem) {
    li { grid-template-columns: 3.5rem 1fr; }
  }

  @media (width >= 60rem) {
    .wrap { grid-template-columns: minmax(0, 20rem) minmax(0, 1fr); gap: var(--s-8); align-items: start; }
    .sticky { position: sticky; top: 22vh; }
  }
</style>
