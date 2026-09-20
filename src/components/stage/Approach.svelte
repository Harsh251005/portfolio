<script lang="ts">
  /* "How I work" — a sticky heading with principles scrolling past it.

     The heading holding still while the list moves is the smoothest
     scroll device there is, and it costs one CSS property. */
  import type { Entry } from '../../lib/brain/types';
  import TextReveal from './TextReveal.svelte';
  import Reveal from './Reveal.svelte';
  import Glass from './Glass.svelte';

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
          <Glass class="row">
            <span class="n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{item.label}</h3>
              {#if item.body}<p>{item.body}</p>{/if}
            </div>
          </Glass>
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

  .list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-4); }

  li :global(.row .inner) {
    display: grid;
    grid-template-columns: 2.5rem 1fr;
    gap: var(--s-4);
    padding: var(--s-5);
  }

  .n {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    color: var(--accent);
    padding-top: 0.35em;
  }

  h3 {
    font-family: var(--font-display);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-text), 'wght' 450;
    line-height: var(--leading-snug);
    letter-spacing: -0.01em;
  }

  p { margin-top: var(--s-2); font-size: var(--t-sm); color: var(--ink-soft); max-width: 46ch; }

  @media (width >= 60rem) {
    .wrap { grid-template-columns: minmax(0, 20rem) minmax(0, 1fr); gap: var(--s-8); align-items: start; }
    .sticky { position: sticky; top: 22vh; }
    .list { gap: var(--s-4); }
  }
</style>
