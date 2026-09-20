<script lang="ts">
  /* Reveals a block once it enters the viewport, then stops watching.

     Progressive enhancement, deliberately. The content is visible by
     default in CSS; JavaScript opts it *out* of visibility on mount
     and then reveals it. So if the island never hydrates, if the
     observer never fires, or if the tab is in the background when it
     loads, the content is simply there.

     The naive version — opacity 0 in CSS, revealed by an observer —
     makes an entire section permanently invisible in all three of
     those cases. That is not a trade worth an entrance animation. */
  import { onMount } from 'svelte';

  let {
    delay = 0,
    y = 18,
    once = true,
    children,
  }: { delay?: number; y?: number; once?: boolean; children?: any } = $props();

  let el: HTMLElement;
  let armed = $state(false);
  let shown = $state(false);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    // Already on screen at mount? Don't hide it just to fade it in.
    const rect = el.getBoundingClientRect();
    if (rect.top < innerHeight && rect.bottom > 0) return;

    armed = true;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          shown = true;
          if (once) io.disconnect();
        } else if (!once) {
          shown = false;
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );

    io.observe(el);

    // If frames or observations never arrive, show it anyway.
    const bail = setTimeout(() => (shown = true), 2500 + delay);

    return () => {
      io.disconnect();
      clearTimeout(bail);
    };
  });
</script>

<div
  class="reveal"
  class:armed
  class:shown
  bind:this={el}
  style={`--reveal-delay:${delay}ms; --reveal-y:${y}px;`}
>
  {@render children?.()}
</div>

<style>
  /* Visible by default — see the note above. */
  .reveal { opacity: 1; }

  .reveal.armed {
    opacity: 0;
    transform: translate3d(0, var(--reveal-y), 0);
    transition:
      opacity 700ms var(--ease-out) var(--reveal-delay),
      transform 700ms var(--ease-out) var(--reveal-delay);
  }

  .reveal.armed.shown {
    opacity: 1;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .reveal, .reveal.armed {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>
