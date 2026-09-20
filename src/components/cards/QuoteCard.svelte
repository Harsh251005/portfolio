<script lang="ts">
  /* A single line given room to breathe. Used when the answer is a
     position rather than an explanation. */
  import type { Entry } from '../../lib/brain/types';
  let { entry }: { entry: Entry } = $props();
</script>

<figure class="quote">
  <div class="prose">{@html entry.html}</div>
  {#if entry.attribution}
    <figcaption>— {entry.attribution}</figcaption>
  {/if}
</figure>

<style>
  .quote { margin: 0; }

  .quote :global(.prose > p:first-child) {
    font-family: var(--font-display);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 300;
    font-style: italic;
    line-height: var(--leading-snug);
    letter-spacing: -0.02em;
    color: var(--ink);
    max-width: 22ch;
  }

  figcaption {
    margin-top: var(--s-5);
    font-size: var(--t-sm);
    color: var(--ink-faint);
  }
</style>
