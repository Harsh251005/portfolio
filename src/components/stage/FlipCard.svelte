<script lang="ts">
  /* A glass card that turns over to show its back. A click or tap anywhere
     on it turns it; each face also has a real button for keyboards and
     screen readers. Both faces share one grid cell, so the card is always
     as tall as its taller face and nothing jumps. With reduced motion the
     faces cross-fade instead of turning.

     Each face keeps its own height, and the card's height follows the face
     that is showing, easing between the two during the turn, so a short
     front never sits half empty.

     With a mouse it turns on hover instead of on click (a click was easy to
     miss). Because the card changes height as it turns, it only turns back
     once the pointer leaves the area of the TALLER face; otherwise the card
     could shrink out from under the pointer and flip back and forth. On
     touch it still turns on tap. The first time it scrolls into view it
     makes a small half-turn, so people can see it turns. */
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';

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

  let peek = $state(false);
  let canHover = false;            // a real mouse (hover: hover, pointer: fine)
  let lastPointer = '';            // 'mouse' | 'touch' | 'pen', from pointerdown
  let px = 0, py = 0;              // last pointer position, for the leave check
  let watching = false;

  /** Pointer still inside the box of the taller face, from the card's top? */
  const insideZone = () => {
    const r = card.getBoundingClientRect();
    const h = Math.max(frontH, backH, r.height);
    return px >= r.left && px <= r.right && py >= r.top && py <= r.top + h;
  };
  const track = (e: PointerEvent) => { px = e.clientX; py = e.clientY; check(); };
  const check = () => { if (!insideZone()) { flipped = false; stopWatching(); } };
  const stopWatching = () => {
    if (!watching) return;
    watching = false;
    window.removeEventListener('pointermove', track);
    window.removeEventListener('scroll', check);
  };

  const onEnter = (e: PointerEvent) => {
    if (!canHover || e.pointerType !== 'mouse') return;
    stopWatching();
    flipped = true;
  };
  const onLeave = (e: PointerEvent) => {
    if (!canHover || e.pointerType !== 'mouse' || !flipped) return;
    px = e.clientX; py = e.clientY;
    if (!insideZone()) { flipped = false; return; }
    watching = true;
    window.addEventListener('pointermove', track, { passive: true });
    window.addEventListener('scroll', check, { passive: true });
  };

  onMount(() => {
    canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (still) return;
      // After the section's own reveal has settled.
      timer = window.setTimeout(() => {
        if (flipped) return;
        peek = true;
        timer = window.setTimeout(() => (peek = false), 1300);
      }, 700);
    }, { threshold: 0.6 });
    io.observe(card);
    return () => { io.disconnect(); clearTimeout(timer); stopWatching(); };
  });

  const turn = (e: MouseEvent) => {
    flipped = !flipped;
    // A keyboard press (detail 0) keeps focus on the face now showing; a
    // mouse or touch click leaves focus alone, so no outline appears.
    if (e.detail === 0) {
      requestAnimationFrame(() => card.querySelector<HTMLButtonElement>(flipped ? '.back .cue' : '.front .cue')?.focus({ preventScroll: true }));
    }
  };
  // Clicks on links or the cue buttons handle themselves.
  // With a mouse, hover already turned it, so a click on the card does nothing.
  const onCard = (e: MouseEvent) => {
    if ((e.target as Element).closest('a, button')) return;
    if (canHover && lastPointer === 'mouse') return;
    turn(e);
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (the cue buttons are the keyboard path) -->
<div
  class="card"
  class:flipped
  class:peek
  bind:this={card}
  onclick={onCard}
  onpointerdown={(e) => (lastPointer = e.pointerType)}
  onpointerenter={onEnter}
  onpointerleave={onLeave}
>
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

  /* A small half-turn the first time it is seen: "this card turns". */
  .peek:not(.flipped) .turn { animation: peek 1200ms cubic-bezier(0.45, 0, 0.2, 1); }
  @keyframes peek {
    0%, 100% { transform: rotateY(0deg); }
    45% { transform: rotateY(-32deg); }
    70% { transform: rotateY(6deg); }
  }

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
    .turn, .flipped .turn { transform: none; transition: height 240ms var(--ease); animation: none; }
    .back { transform: none; }
    .face { transition: opacity 240ms var(--ease); }
    .back, .flipped .front { opacity: 0; pointer-events: none; }
    .flipped .back { opacity: 1; pointer-events: auto; }
  }
</style>
