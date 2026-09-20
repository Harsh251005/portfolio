<script lang="ts">
  /* Enumerated points. Numbers are typographic, not decorative —
     they give a scanner somewhere to land. */
  import type { Entry } from '../../lib/brain/types';
  import Placeholder from '../Placeholder.svelte';
  let { entry }: { entry: Entry } = $props();
</script>

<div class="prose intro">{@html entry.html}</div>

{#if entry.items?.length}
  <ol class="items">
    {#each entry.items as item, i (item.label)}
      <li>
        <span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        <div>
          <h4>{item.label}</h4>
          {#if item.body}<p><Placeholder text={item.body} /></p>{/if}
        </div>
      </li>
    {/each}
  </ol>
{/if}

<style>
  .items {
    list-style: none;
    padding: 0;
    margin-top: var(--s-6);
    display: grid;
    gap: var(--s-5);
  }

  li {
    display: grid;
    grid-template-columns: 2.25rem 1fr;
    gap: var(--s-3);
    align-items: start;
  }

  .num {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    color: var(--accent);
    padding-top: 0.35em;
    letter-spacing: 0.05em;
  }

  h4 {
    font-family: var(--font-body);
    font-size: var(--t-base);
    font-variation-settings: 'wght' 650;
    line-height: var(--leading-snug);
    letter-spacing: 0;
    color: var(--ink);
  }

  p {
    margin-top: var(--s-2);
    color: var(--ink-soft);
    font-size: var(--t-sm);
    max-width: var(--measure);
  }

  @media (width < 30rem) {
    li { grid-template-columns: 1.75rem 1fr; gap: var(--s-2); }
  }
</style>
