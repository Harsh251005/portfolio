<script lang="ts">
  /* Everything the site can tell you, in one panel.

     This is the anti-lost mechanism. Because there is no nav bar, a
     visitor needs one place that shows the whole surface and lets
     them jump anywhere. The unvisited marks double as the reason to
     keep going. */
  import type { Entry } from '../lib/brain/types';

  let {
    groups,
    visited,
    open,
    onpick,
    onclose,
  }: {
    groups: { group: string; label: string; entries: Entry[] }[];
    visited: Set<string>;
    open: boolean;
    onpick: (id: string) => void;
    onclose: () => void;
  } = $props();

  let panel = $state<HTMLElement | null>(null);

  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onclose();
  }

  // Move focus into the panel when it opens so keyboard and screen
  // reader users land inside it rather than behind it.
  $effect(() => {
    if (open && panel) panel.focus();
  });

  const total = $derived(groups.reduce((n, g) => n + g.entries.length, 0));
</script>

<svelte:window on:keydown={onkeydown} />

{#if open}
  <div class="scrim" role="presentation" onclick={onclose}></div>

  <aside
    class="panel"
    bind:this={panel}
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    aria-label="Everything I can tell you"
  >
    <header>
      <h2>Everything I can tell you</h2>
      <button class="close" type="button" onclick={onclose} aria-label="Close">
        <span aria-hidden="true">✕</span>
      </button>
    </header>

    <div class="scroll">
      {#each groups as group (group.group)}
        <section>
          <p class="label">{group.label}</p>
          <ul>
            {#each group.entries as entry (entry.id)}
              <li>
                <button type="button" onclick={() => onpick(entry.id)}>
                  <span
                    class="dot"
                    class:seen={visited.has(entry.id)}
                    aria-hidden="true"
                  ></span>
                  <span class="text">{entry.short}</span>
                  <span class="visually-hidden">
                    {visited.has(entry.id) ? '(already read)' : '(not read yet)'}
                  </span>
                </button>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>

    <footer>
      <span>{visited.size} of {total} read</span>
      <a href="/everything">Read it all in one go →</a>
    </footer>
  </aside>
{/if}

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: color-mix(in oklab, var(--ink) 40%, transparent);
    animation: fade var(--dur) var(--ease) both;
  }

  .panel {
    position: fixed;
    z-index: 41;
    inset-block: 0;
    right: 0;
    width: min(28rem, 100%);
    display: flex;
    flex-direction: column;
    background: var(--paper);
    border-left: var(--hairline) solid var(--rule);
    animation: slide var(--dur) var(--ease-out) both;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-4);
    padding: var(--s-5) var(--s-5) var(--s-4);
    border-bottom: var(--hairline) solid var(--rule);
  }

  h2 {
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-text), 'wght' 500;
  }

  .close {
    width: var(--tap);
    height: var(--tap);
    display: grid;
    place-items: center;
    color: var(--ink-faint);
    border-radius: 50%;
    flex-shrink: 0;
  }
  .close:hover { color: var(--ink); }

  .scroll {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: var(--s-5);
    display: grid;
    gap: var(--s-6);
    align-content: start;
  }

  ul { list-style: none; padding: 0; margin-top: var(--s-2); }

  ul button {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    width: 100%;
    min-height: var(--tap);
    padding: var(--s-1) var(--s-2);
    margin-left: calc(var(--s-2) * -1);
    text-align: left;
    border-radius: var(--radius);
    color: var(--ink-soft);
    transition: color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease);
  }

  ul button:hover { color: var(--ink); background: var(--paper-sunk); }

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    border: 1.5px solid var(--ink-faint);
    flex-shrink: 0;
    transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease);
  }

  .dot.seen { background: var(--visited); border-color: var(--visited); }

  .text { font-size: var(--t-sm); }

  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-4);
    flex-wrap: wrap;
    padding: var(--s-4) var(--s-5);
    border-top: var(--hairline) solid var(--rule);
    font-size: var(--t-xs);
    color: var(--ink-faint);
  }

  footer a { color: var(--accent); }

  @keyframes fade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slide {
    from { transform: translateX(100%) }
    to   { transform: none }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel { animation: fade var(--dur) var(--ease) both; }
  }
</style>
