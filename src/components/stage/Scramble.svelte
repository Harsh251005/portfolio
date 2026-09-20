<script lang="ts">
  /* Resolves text out of noise, one character at a time.

     Progressive enhancement, deliberately: the real text is rendered
     from the start and the scramble only replaces it once animation
     is confirmed to be running. A background tab, a blocked frame
     callback or a thrown error therefore leaves the text readable
     rather than blank — which is what happens if you start empty.
     A name that depends on an animation is a name that can vanish. */
  import { onMount } from 'svelte';

  let {
    text,
    delay = 0,
    speed = 1.6,
    chars = '△▽◇○□▷◁×+/\\|=<>_-',
  }: { text: string; delay?: number; speed?: number; chars?: string } = $props();

  let shown = $state(text);
  let animating = $state(false);
  let done = $state(true);

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    let start = 0;
    let stopped = false;

    const perChar = 1000 / (speed * 18);

    function finish() {
      // Stop for good. Without this the bail timeout can resolve the
      // text while frames are still suspended, and then the first
      // frame that arrives afterwards sees `start` unset, restarts
      // the whole animation, and the name is left mid-scramble.
      stopped = true;
      cancelAnimationFrame(raf);
      shown = text;
      animating = false;
      done = true;
    }

    function tick(now: number) {
      if (stopped) return;

      if (!start) {
        start = now + delay;
        // Only now do we know frames are actually being served.
        animating = true;
        done = false;
        shown = '';
      }

      if (now < start) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const settled = Math.min(text.length, (now - start) / perChar);
      const whole = Math.floor(settled);

      if (whole >= text.length) {
        finish();
        return;
      }

      let out = text.slice(0, whole);
      for (let i = whole; i < text.length; i++) {
        out += text[i] === ' ' ? ' ' : chars[(Math.random() * chars.length) | 0];
      }
      shown = out;

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    // Safety net: if frames never arrive, or arrive and then stop,
    // snap to the real text rather than leaving it scrambled.
    const bail = setTimeout(finish, delay + text.length * perChar + 2500);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      clearTimeout(bail);
    };
  });
</script>

<span class="scramble" class:animating aria-label={text}>
  <span aria-hidden="true">{shown}</span>
</span>

<style>
  .scramble { display: inline-block; }
  /* Unresolved characters sit forward in the accent; settled text
     falls back to the inherited colour. */
  .scramble.animating { color: var(--accent); }
  .scramble:not(.animating) { color: inherit; transition: color 600ms var(--ease); }
</style>
