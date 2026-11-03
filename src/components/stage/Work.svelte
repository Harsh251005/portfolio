<script lang="ts">
  /* The work: three cards, each a title, a line or two, and a link to
     the code. The detail lives in each project's README.

     The cards are dealt onto the page like scorecards: each one
     arrives tilted and settles with a small overshoot, in turn.
     They are on the page from the start; the entrance only changes
     when they become visible, and a timer guarantees it. */
  import { onMount } from 'svelte';
  import type { Entry } from '../../lib/brain/types';
  import Marker from './Marker.svelte';

  let { entries }: { entries: Entry[] } = $props();

  /** A resting tilt per card, so they sit like pinned paper. */
  const TILT = [-1.4, 0.9, -0.6];

  let deck: HTMLElement;
  let armed = $state(false);
  let dealt = $state(false);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    armed = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dealt = true;
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(deck);
    const bail = setTimeout(() => (dealt = true), 3000);
    return () => {
      io.disconnect();
      clearTimeout(bail);
    };
  });
</script>

<div class="page work">
  <p class="label">Things I've built</p>
  <h2>AI works in the demo. Then <Marker>real people use it.</Marker></h2>
  <p class="sub">Three things I built for the second part.</p>

  <ol class="deck" class:armed class:dealt bind:this={deck}>
    {#each entries as entry, i (entry.id)}
      <li class="card" style={`--r:${TILT[i % TILT.length]}deg; --i:${i}`}>
        <span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
        <h3>{entry.tagline ?? entry.short}</h3>
        <p>{entry.blurb ?? entry.plain}</p>
        {#if entry.link}
          <a href={entry.link} rel="noreferrer noopener">
            How it's built <span aria-hidden="true">↗</span>
          </a>
        {/if}
      </li>
    {/each}
  </ol>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2rem, 4vw + 1rem, 4.5rem);
    font-variation-settings: 'opsz' 72, 'wght' 440, 'WONK' 1;
    line-height: 1;
    letter-spacing: -0.03em;
    max-width: 17ch;
  }

  .sub { margin-top: var(--s-4); font-size: var(--t-lg); color: var(--ink-soft); }

  .deck {
    list-style: none;
    margin: var(--s-8) 0 0;
    padding: 0;
    display: grid;
    gap: var(--s-7);
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    padding: var(--s-6);
    background: var(--paper-raised);
    border: 1.5px solid var(--ink);
    border-radius: 6px;
    box-shadow: var(--shadow-hard);
    transform: rotate(var(--r));
    transition: transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 420ms var(--ease-out);
  }

  .card:hover {
    transform: rotate(0deg) translate(-3px, -3px);
    box-shadow: 9px 9px 0 var(--accent);
  }

  .num {
    font-family: var(--font-display);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' 72, 'wght' 300;
    line-height: 1;
    color: var(--accent);
  }

  h3 {
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' 36, 'wght' 480;
    line-height: 1.12;
    letter-spacing: -0.015em;
  }

  .card p { color: var(--ink-soft); font-size: var(--t-base); max-width: 32ch; }

  .card a {
    margin-top: auto;
    padding-top: var(--s-3);
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    min-height: var(--tap);
    font-variation-settings: 'wght' 600;
    font-size: var(--t-sm);
    color: var(--ink);
    text-decoration-thickness: 2px;
    text-decoration-color: var(--accent);
    text-underline-offset: 0.3em;
  }

  .card a:hover { color: var(--accent); }

  /* The deal. Before: stacked low and over-tilted, hidden. After: each
     card lands in turn and rocks into its resting angle. */
  .armed .card {
    opacity: 0;
    transform: translate3d(0, 5rem, 0) rotate(calc(var(--r) * 6));
  }

  .armed.dealt .card {
    opacity: 1;
    transform: rotate(var(--r));
    transition:
      opacity 400ms var(--ease-out) calc(var(--i) * 190ms),
      transform 900ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--i) * 190ms),
      box-shadow 420ms var(--ease-out);
  }

  .armed.dealt .card:hover {
    transform: rotate(0deg) translate(-3px, -3px);
    transition-delay: 0s;
  }

  @media (width >= 60rem) {
    .deck { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-6); }
    .card:nth-child(2) { margin-top: var(--s-7); }
  }

  @media (prefers-reduced-motion: reduce) {
    .card, .card:hover { transform: none; transition: none; }
  }
</style>
