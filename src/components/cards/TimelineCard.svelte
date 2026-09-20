<script lang="ts">
  /* Ordered moments. A rule runs down the left so the sequence is
     readable at a glance without reading any of the words. */
  import type { Entry } from '../../lib/brain/types';
  import Placeholder from '../Placeholder.svelte';
  let { entry }: { entry: Entry } = $props();
</script>

<div class="prose intro">{@html entry.html}</div>

{#if entry.items?.length}
  <ol class="track">
    {#each entry.items as item (item.label)}
      <li>
        <h3>{item.label}</h3>
        {#if item.body}<p><Placeholder text={item.body} /></p>{/if}
      </li>
    {/each}
  </ol>
{/if}

<style>
  .track {
    list-style: none;
    padding: 0;
    margin-top: var(--s-6);
    display: grid;
    gap: var(--s-6);
    position: relative;
  }

  .track::before {
    content: '';
    position: absolute;
    inset-block: 0.5rem;
    left: 0.3125rem;
    width: var(--hairline);
    background: var(--rule);
  }

  li { padding-left: var(--s-5); position: relative; }

  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.45em;
    width: 0.6875rem;
    height: 0.6875rem;
    border-radius: 50%;
    background: var(--paper);
    border: 2px solid var(--accent);
  }

  h3 {
    font-family: var(--font-body);
    font-size: var(--t-xs);
    font-variation-settings: 'wght' 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    line-height: 1.4;
  }

  p {
    margin-top: var(--s-2);
    color: var(--ink-soft);
    max-width: var(--measure);
  }
</style>
