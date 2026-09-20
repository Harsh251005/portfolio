<script lang="ts">
  /* Two columns, side by side. Collapses to stacked on a phone —
     the comparison still reads because each side keeps its heading. */
  import type { Entry } from '../../lib/brain/types';
  let { entry }: { entry: Entry } = $props();
</script>

<div class="prose intro">{@html entry.html}</div>

{#if entry.sides?.length === 2}
  <div class="sides">
    {#each entry.sides as side, i (side.label)}
      <section class:second={i === 1}>
        <h4>{side.label}</h4>
        <ul>
          {#each side.points as point (point)}
            <li>{point}</li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
{/if}

<style>
  .sides {
    margin-top: var(--s-6);
    display: grid;
    gap: var(--s-6);
    container-type: inline-size;
  }

  @media (width >= 38rem) {
    .sides {
      grid-template-columns: 1fr 1fr;
      gap: var(--s-7);
    }
    .second {
      border-left: var(--hairline) solid var(--rule);
      padding-left: var(--s-6);
    }
  }

  h4 {
    font-family: var(--font-body);
    font-size: var(--t-xs);
    font-variation-settings: 'wght' 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .second h4 { color: var(--accent); }

  ul {
    margin-top: var(--s-4);
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--s-3);
  }

  li {
    padding-left: var(--s-4);
    position: relative;
    color: var(--ink-soft);
    font-size: var(--t-sm);
  }

  li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.65em;
    width: 0.375rem;
    height: var(--hairline);
    background: var(--ink-faint);
  }

  .second li::before { background: var(--accent); }
</style>
