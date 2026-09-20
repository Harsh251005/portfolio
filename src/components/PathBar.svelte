<script lang="ts">
  /* A fixed trail of where you have been. Two jobs: prove you are not
     lost, and make progress visible. Appears only once the first
     question has been opened. */
  import type { Entry } from '../lib/brain/types';

  let {
    trail,
    total,
    onjump,
    onmap,
    onreset,
  }: {
    trail: Entry[];
    total: number;
    onjump: (id: string) => void;
    onmap: () => void;
    onreset: () => void;
  } = $props();
</script>

<div class="bar" class:visible={trail.length > 0}>
  <div class="page inner">
    <button class="home" type="button" onclick={onreset} aria-label="Back to the start">
      <span aria-hidden="true">←</span>
    </button>

    <nav class="trail" aria-label="Questions you've opened">
      <ol>
        {#each trail as entry, i (entry.id)}
          <li>
            {#if i > 0}<span class="sep" aria-hidden="true">›</span>{/if}
            <button type="button" onclick={() => onjump(entry.id)}>{entry.short}</button>
          </li>
        {/each}
      </ol>
    </nav>

    <div class="right">
      <span class="count" aria-live="polite">
        {trail.length}<span class="slash">/</span>{total}
      </span>
      <button class="map" type="button" onclick={onmap}>
        <span class="grid" aria-hidden="true"></span>
        <span class="maptext">Map</span>
      </button>
    </div>
  </div>
</div>

<style>
  .bar {
    position: fixed;
    inset-inline: 0;
    top: 0;
    z-index: 30;
    background: color-mix(in oklab, var(--paper) 88%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: var(--hairline) solid transparent;
    transform: translateY(-100%);
    transition:
      transform var(--dur) var(--ease-out),
      border-color var(--dur) var(--ease);
  }

  .bar.visible {
    transform: none;
    border-bottom-color: var(--rule);
  }

  .inner {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    height: 3.25rem;
  }

  .home {
    width: 2rem;
    height: var(--tap);
    display: grid;
    place-items: center;
    color: var(--ink-faint);
    flex-shrink: 0;
  }
  .home:hover { color: var(--accent); }

  .trail {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-mask-image: linear-gradient(to right, #000 85%, transparent);
    mask-image: linear-gradient(to right, #000 85%, transparent);
  }
  .trail::-webkit-scrollbar { display: none; }

  ol {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    list-style: none;
    padding: 0;
    white-space: nowrap;
  }

  li { display: flex; align-items: center; gap: var(--s-2); }

  .sep { color: var(--ink-faint); font-size: var(--t-xs); }

  ol button {
    font-size: var(--t-xs);
    color: var(--ink-faint);
    padding-block: var(--s-2);
    transition: color var(--dur-fast) var(--ease);
  }
  ol button:hover { color: var(--accent); }

  li:last-child button { color: var(--ink); }

  .right {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    flex-shrink: 0;
  }

  .count {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    color: var(--ink-faint);
    font-variant-numeric: tabular-nums;
  }
  .slash { opacity: 0.5; margin-inline: 0.1em; }

  .map {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    min-height: var(--tap);
    padding-inline: var(--s-2);
    font-size: var(--t-xs);
    font-variation-settings: 'wght' 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .map:hover { color: var(--accent); }

  .grid {
    width: 0.75rem;
    height: 0.75rem;
    display: block;
    background-image: linear-gradient(currentColor 0 0), linear-gradient(currentColor 0 0),
      linear-gradient(currentColor 0 0), linear-gradient(currentColor 0 0);
    background-size: 0.3125rem 0.3125rem;
    background-repeat: no-repeat;
    background-position: 0 0, 100% 0, 0 100%, 100% 100%;
  }

  @media (width < 30rem) {
    .maptext { display: none; }
  }
</style>
