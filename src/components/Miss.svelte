<script lang="ts">
  /* Shown when the brain has no answer.

     An honest miss that offers a way forward is fine. A dead end is
     the single most reliable way to make someone close the tab, so
     this always hands back three real options. */
  import type { Entry } from '../lib/brain/types';

  let {
    suggestions,
    onpick,
  }: {
    suggestions: Entry[];
    onpick: (id: string) => void;
  } = $props();
</script>

<div class="miss">
  <p class="lead">
    I don't have a good answer for that one — and I'd rather say so than make
    something up.
  </p>

  {#if suggestions.length}
    <p class="near">Nearest things I do know:</p>
    <ul>
      {#each suggestions as entry (entry.id)}
        <li>
          <button type="button" onclick={() => onpick(entry.id)}>
            <span class="arrow" aria-hidden="true">→</span>
            <span>{entry.question}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .lead {
    font-size: var(--t-lg);
    line-height: var(--leading-snug);
    color: var(--ink);
    max-width: var(--measure);
  }

  .near {
    margin-top: var(--s-6);
    font-size: var(--t-xs);
    font-variation-settings: 'wght' 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  ul { list-style: none; padding: 0; margin-top: var(--s-2); }

  button {
    display: flex;
    align-items: baseline;
    gap: var(--s-3);
    width: 100%;
    min-height: var(--tap);
    text-align: left;
    font-family: var(--font-display);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-text), 'wght' 400;
    color: var(--ink);
  }
  button:hover { color: var(--accent); }
  .arrow { color: var(--accent); font-size: var(--t-base); }
</style>
