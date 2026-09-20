<script lang="ts">
  /* The engine of the whole site: every answer ends by offering the
     next question. This is what makes the page keep growing. */
  import type { Entry } from '../lib/brain/types';

  let {
    entries,
    heading = 'Still curious',
    onpick,
  }: {
    entries: Entry[];
    heading?: string;
    onpick: (id: string) => void;
  } = $props();
</script>

{#if entries.length}
  <div class="followups">
    <p class="label">{heading}</p>
    <ul>
      {#each entries as entry (entry.id)}
        <li>
          <button type="button" onclick={() => onpick(entry.id)}>
            <span class="arrow" aria-hidden="true">→</span>
            <span>{entry.question}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  .followups {
    margin-top: var(--s-7);
    padding-top: var(--s-4);
    border-top: var(--hairline) solid var(--rule);
  }

  ul {
    margin-top: var(--s-3);
    padding: 0;
    list-style: none;
    display: grid;
    gap: var(--s-1);
  }

  button {
    display: flex;
    align-items: baseline;
    gap: var(--s-3);
    width: 100%;
    min-height: var(--tap);
    padding: var(--s-2) var(--s-3) var(--s-2) 0;
    text-align: left;
    font-family: var(--font-display);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-text), 'wght' 400;
    line-height: var(--leading-snug);
    color: var(--ink);
    border-radius: var(--radius);
    transition: color var(--dur-fast) var(--ease);
  }

  button:hover { color: var(--accent); }

  .arrow {
    color: var(--accent);
    font-size: var(--t-base);
    transition: transform var(--dur) var(--ease-out);
  }

  button:hover .arrow { transform: translateX(3px); }
</style>
