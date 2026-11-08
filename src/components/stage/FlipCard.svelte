<script lang="ts">
  /* A glass card that turns over to show its back. A click or tap anywhere
     on it turns it; each face also has a real button for keyboards and
     screen readers. Both faces share one grid cell, so the card is always
     as tall as its taller face and nothing jumps. With reduced motion the
     faces cross-fade instead of turning.

     Each face keeps its own height, and the card's height follows the face
     that is showing, easing between the two during the turn, so a short
     front never sits half empty. */
  import type { Snippet } from 'svelte';

  let { front, back, frontCue, backCue }: { front: Snippet; back: Snippet; frontCue: string; backCue: string } = $props();
  let flipped = $state(false);
  let card: HTMLElement;
  let frontH = $state(0);
  let backH = $state(0);
  // Until both faces are measured (or without script), the card is as tall as its taller face.
  const height = $derived(frontH && backH ? `${flipped ? backH : frontH}px` : undefined);
  // Grow in the first half of the turn and shrink in the second, so the
  // taller face is never showing while the card is shorter than it.
  const shrinking = $derived(flipped ? backH < frontH : frontH < backH);

  const turn = (e: MouseEvent) => {
    flipped = !flipped;
    // A keyboard press (detail 0) keeps focus on the face now showing; a
    // mouse or touch click leaves focus alone, so no outline appears.
    if (e.detail === 0) {
      requestAnimationFrame(() => card.querySelector<HTMLButtonElement>(flipped ? '.back .cue' : '.front .cue')?.focus({ preventScroll: true }));
    }
  };
  // Clicks on links or the cue buttons handle themselves.
  const onCard = (e: MouseEvent) => {
    if ((e.target as Element).closest('a, button')) return;
    turn(e);
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (the cue buttons are the keyboard path) -->
<div class="card" class:flipped bind:this={card} onclick={onCard}>
  <div class="turn" class:shrinking style:height={height}>
    <div class="face glass front" inert={flipped} bind:offsetHeight={frontH}>
      {@render front()}
      <button class="cue" type="button" aria-expanded={flipped} onclick={turn}>{frontCue} <span aria-hidden="true">↻</span></button>
    </div>
    <div class="face glass back" inert={!flipped} bind:offsetHeight={backH}>
      {@render back()}
      <button class="cue" type="button" onclick={turn}>{backCue} <span aria-hidden="true">↺</span></button>
    </div>
  </div>
</div>

<style>
  .card { cursor: pointer; perspective: 1400px; }

  .turn {
    display: grid;
    transform-style: preserve-3d;
    transition: transform 700ms cubic-bezier(0.45, 0, 0.2, 1), height 350ms var(--ease);
  }
  .turn.shrinking { transition-delay: 0ms, 350ms; }
  .flipped .turn { transform: rotateY(180deg); }

  .face {
    grid-area: 1 / 1;
    align-self: start;
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    padding: var(--s-6) var(--s-5);
    border-top: 2px solid var(--accent);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition: box-shadow 420ms var(--ease-out);
  }
  .back { transform: rotateY(180deg); }

  @media (hover: hover) {
    .card:hover .face { box-shadow: var(--card-hover); }
  }

  .cue {
    align-self: flex-start;
    margin-top: auto;
    min-height: var(--tap);
    padding: var(--s-5) 0 0;
    border: 0;
    background: none;
    cursor: pointer;
    font: 600 var(--t-xs)/1 var(--font-mono);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .cue:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }

  @media (prefers-reduced-motion: reduce) {
    .turn, .flipped .turn { transform: none; transition: height 240ms var(--ease); }
    .back { transform: none; }
    .face { transition: opacity 240ms var(--ease); }
    .back, .flipped .front { opacity: 0; pointer-events: none; }
    .flipped .back { opacity: 1; pointer-events: auto; }
  }
</style>
