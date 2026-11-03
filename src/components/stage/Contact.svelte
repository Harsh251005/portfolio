<script lang="ts">
  /* The end of the page: where I'm headed, and three ways to reach me.

     Each link is a full-width row. On hover a block of ink fills the
     row from below and the text turns to paper, so the whole row
     reads as the thing to press. */
  import Marker from './Marker.svelte';
  import type { Link } from '../../lib/links';

  let { links }: { links: Link[] } = $props();

  /** What the visitor will actually reach, shown on each row. */
  function handle(href: string): string {
    return href.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '');
  }
</script>

<div class="page contact">
  <p class="label">Talk to me</p>

  <h2>Tell me what the <Marker>problem</Marker> actually is.</h2>

  <p class="sub">
    I'm looking for an AI engineering role on a team that ships to real users.
    I'm in Mumbai, and open to remote work or moving for the right team. I'll
    tell you honestly whether I'm the right person, including when I'm not.
  </p>

  <ul class="rows">
    {#each links as link (link.label)}
      <li>
        {#if link.href}
          <a href={link.href} rel={link.external ? 'noreferrer noopener me' : undefined}>
            <span class="what">{link.label}</span>
            <span class="handle">{handle(link.href)}</span>
            <span class="arrow" aria-hidden="true">→</span>
          </a>
        {:else}
          <span class="missing">{link.label} ⟨ missing ⟩</span>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2.25rem, 4.6vw + 1rem, 5.25rem);
    font-variation-settings: 'opsz' 72, 'wght' 440, 'WONK' 1;
    line-height: 0.98;
    letter-spacing: -0.03em;
    max-width: 14ch;
  }

  .sub {
    margin-top: var(--s-5);
    max-width: 42ch;
    font-size: var(--t-lg);
    color: var(--ink-soft);
  }

  .rows {
    list-style: none;
    margin: var(--s-8) 0 0;
    padding: 0;
    border-top: 1.5px solid var(--ink);
  }

  li { border-bottom: 1.5px solid var(--ink); }

  a {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas: 'what arrow' 'handle arrow';
    align-items: center;
    column-gap: var(--s-4);
    padding: var(--s-5) var(--s-3);
    overflow: hidden;
    isolation: isolate;
    color: var(--ink);
    text-decoration: none;
    transition: color 380ms var(--ease);
  }

  /* The ink fill. */
  a::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--ink);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 460ms cubic-bezier(0.65, 0, 0.25, 1);
  }

  a:hover, a:focus-visible { color: var(--paper); }
  a:hover::before, a:focus-visible::before { transform: scaleY(1); }

  .what {
    grid-area: what;
    font-family: var(--font-display);
    font-size: clamp(1.75rem, 2.2vw + 1rem, 3.25rem);
    font-variation-settings: 'opsz' 60, 'wght' 420;
    line-height: 1.05;
  }

  .handle {
    grid-area: handle;
    font-size: var(--t-sm);
    color: var(--ink-soft);
    overflow-wrap: anywhere;
    transition: color 380ms var(--ease);
  }

  a:hover .handle, a:focus-visible .handle { color: var(--paper-sunk); }

  .arrow {
    grid-area: arrow;
    font-size: var(--t-2xl);
    transition: transform 420ms var(--ease-out);
  }

  a:hover .arrow { transform: translateX(8px); }

  .missing { display: block; padding: var(--s-5) var(--s-3); color: var(--ink-faint); }
</style>
