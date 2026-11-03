<script lang="ts">
  /* A highlighter stroke that is drawn under a phrase the first time
     it scrolls into view, as if someone marked it with a pen.

     The mark is on by default in CSS; JavaScript takes it away only
     once it can bring it back, and a timer always brings it back. */
  import { onMount } from 'svelte';

  let { children, delay = 350 }: { children?: any; delay?: number } = $props();

  let el: HTMLElement;
  let armed = $state(false);
  let shown = $state(false);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    armed = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Let the eye land on the words before the pen arrives.
          setTimeout(() => (shown = true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.9 },
    );
    io.observe(el);
    const bail = setTimeout(() => (shown = true), delay + 2650);
    return () => {
      io.disconnect();
      clearTimeout(bail);
    };
  });
</script>

<span class="mk" class:armed class:shown bind:this={el}>{@render children?.()}</span>

<style>
  .mk {
    background-image: linear-gradient(
      transparent 56%,
      var(--accent-soft) 56%,
      var(--accent-soft) 92%,
      transparent 92%
    );
    background-repeat: no-repeat;
    background-size: 100% 100%;
    padding-inline: 0.12em;
    margin-inline: -0.12em;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }

  .mk.armed {
    background-size: 0% 100%;
    transition: background-size 900ms cubic-bezier(0.65, 0, 0.25, 1);
  }

  .mk.armed.shown { background-size: 100% 100%; }
</style>
