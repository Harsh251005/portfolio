<script lang="ts">
  /* A highlighter stroke that is drawn under a phrase the first time
     it scrolls into view, as if someone marked it with a pen.

     The mark is on by default in CSS; JavaScript takes it away only
     once it can bring it back, and brings it back once the phrase is
     reached, after `delay` (time for the heading's entrance to finish). */
  import { onMount } from 'svelte';

  let { children, delay = 350 }: { children?: any; delay?: number } = $props();

  let el: HTMLElement;
  let armed = $state(false);
  let shown = $state(false);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    armed = true;
    let timer = 0;
    // Same line as the section entrances (arrive.ts): once the phrase is well
    // into view (top above 75% of the screen), wait for the heading's own
    // entrance, then draw. Checked on scroll and on a poll, so it also works
    // where observers don't fire, and never before the phrase is reached.
    const check = () => {
      if (el.getBoundingClientRect().top >= innerHeight * 0.75) return;
      stop();
      timer = window.setTimeout(() => (shown = true), delay);
    };
    const poll = setInterval(check, 400);
    const stop = () => {
      removeEventListener('scroll', check);
      clearInterval(poll);
    };
    addEventListener('scroll', check, { passive: true });
    check();
    return () => {
      stop();
      clearTimeout(timer);
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
