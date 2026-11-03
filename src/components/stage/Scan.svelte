<script lang="ts">
  /* A scanner reveal. When the block scrolls into view, a thin line
     sweeps down it and the content is uncovered behind the line, the
     way a page comes out of a scanner or a model "sees" a document.

     The content is on the page and visible from the start. Script
     hides it only once it is running and watching, and then a timer
     shows it regardless; with reduced motion nothing is hidden. */
  import { onMount } from 'svelte';

  let {
    delay = 0,
    class: extra = '',
    children,
  }: { delay?: number; class?: string; children?: any } = $props();

  let el: HTMLElement;
  let state = $state<'idle' | 'armed' | 'run' | 'done'>('idle');

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    state = 'armed';

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          state = 'run';
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);

    // Frames or observations that never arrive must not hide content.
    const bail = setTimeout(() => (state = 'done'), 3800 + delay);

    return () => {
      io.disconnect();
      clearTimeout(bail);
    };
  });

  function onEnd(event: AnimationEvent) {
    if (event.animationName.includes('scan-clip')) state = 'done';
  }
</script>

<div
  class={`scan ${state} ${extra}`}
  bind:this={el}
  style={`--delay:${delay}ms`}
  onanimationend={onEnd}
>
  {@render children?.()}
  <span class="beam" aria-hidden="true"></span>
</div>

<style>
  .scan { position: relative; }

  /* Hidden: clipped to nothing. The negative insets leave room for
     card shadows once it is revealed. */
  .armed { clip-path: inset(-12px -18px 100% -12px); }

  .run {
    animation: scan-clip 1000ms cubic-bezier(0.6, 0, 0.2, 1) var(--delay) both;
  }

  .beam {
    position: absolute;
    left: -12px;
    right: -18px;
    top: 0;
    height: 2px;
    background: var(--accent);
    opacity: 0;
    pointer-events: none;
  }

  .run .beam {
    animation: scan-beam 1000ms cubic-bezier(0.6, 0, 0.2, 1) var(--delay) both;
  }

  .done .beam { display: none; }

  @keyframes scan-clip {
    from { clip-path: inset(-12px -18px 100% -12px); }
    to   { clip-path: inset(-12px -18px -18px -12px); }
  }

  @keyframes scan-beam {
    0%   { top: 0;    opacity: 1; }
    94%  { top: 100%; opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }
</style>
