<script lang="ts">
  /* A glass panel with a highlight that follows the cursor.

     The spotlight is the detail that makes a panel feel like a
     surface rather than a rectangle: light lands where you point,
     and fades when you leave. Tracked with CSS custom properties so
     moving the mouse never triggers a Svelte re-render. */
  import type { Snippet } from 'svelte';

  let {
    strong = false,
    spotlight = true,
    lift = true,
    class: extra = '',
    children,
  }: {
    strong?: boolean;
    spotlight?: boolean;
    lift?: boolean;
    class?: string;
    children?: Snippet;
  } = $props();

  let el = $state<HTMLElement | null>(null);

  function onMove(event: PointerEvent) {
    if (!spotlight || !el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - r.left}px`);
    el.style.setProperty('--my', `${event.clientY - r.top}px`);
    el.style.setProperty('--spot', '1');
  }

  function onLeave() {
    el?.style.setProperty('--spot', '0');
  }
</script>

<div
  bind:this={el}
  class={`panel glass ${strong ? 'glass--strong' : ''} ${lift ? 'lift' : ''} ${extra}`}
  onpointermove={onMove}
  onpointerleave={onLeave}
>
  {#if spotlight}<span class="spot" aria-hidden="true"></span>{/if}
  <div class="inner">{@render children?.()}</div>
</div>

<style>
  .panel {
    --spot: 0;
    --mx: 50%;
    --my: 50%;
    overflow: hidden;
  }

  .lift {
    transition:
      transform 520ms var(--ease-out),
      border-color 520ms var(--ease),
      box-shadow 520ms var(--ease);
  }

  .lift:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 255, 255, 0.16);
  }

  .spot {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    opacity: var(--spot);
    transition: opacity 420ms var(--ease);
    background: radial-gradient(
      22rem 22rem at var(--mx) var(--my),
      color-mix(in oklab, var(--accent) 12%, transparent),
      transparent 62%
    );
  }

  .inner { position: relative; z-index: 1; }

  @media (prefers-reduced-motion: reduce) {
    .lift:hover { transform: none; }
  }
</style>
