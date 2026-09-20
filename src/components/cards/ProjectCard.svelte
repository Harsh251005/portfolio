<script lang="ts">
  /* A thing he built. The plain-English line comes first and large;
     everything technical lives below, or inside an explain-more. */
  import type { Entry } from '../../lib/brain/types';
  import Placeholder from '../Placeholder.svelte';
  let { entry }: { entry: Entry } = $props();
</script>

<div class="project">
  {#if entry.tagline}
    <h3 class="tagline">{entry.tagline}</h3>
  {/if}

  {#if entry.plain}
    <p class="plain"><Placeholder text={entry.plain} /></p>
  {/if}

  <div class="prose">{@html entry.html}</div>

  {#if entry.link}
    <a class="link" href={entry.link} target="_blank" rel="noreferrer noopener">
      See the code <span aria-hidden="true">↗</span>
    </a>
  {/if}
</div>

<style>
  .project {
    border-left: 2px solid var(--accent);
    padding-left: clamp(var(--s-4), 3vw, var(--s-6));
  }

  .tagline {
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 500;
    color: var(--ink);
  }

  .plain {
    margin-top: var(--s-3);
    font-size: var(--t-lg);
    line-height: var(--leading-snug);
    color: var(--ink);
    font-variation-settings: 'wght' 380;
    max-width: var(--measure);
  }

  .plain + :global(.prose) { margin-top: var(--s-5); }

  /* The plain line is the headline here, so the prose that follows
     must not compete with it. */
  .project :global(.prose > p:first-child) {
    font-size: var(--t-base);
    color: var(--ink-soft);
    font-variation-settings: 'wght' 400;
  }

  .link {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    margin-top: var(--s-5);
    min-height: var(--tap);
    font-size: var(--t-sm);
    font-variation-settings: 'wght' 600;
    color: var(--accent);
  }
</style>
