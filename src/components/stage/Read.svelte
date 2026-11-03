<script lang="ts">
  /* A paragraph that is read as you scroll.

     There is a focus line a little below the middle of the window.
     Words near it are bright and tinted with the accent; words far
     above or below fade back. As you scroll, the bright patch moves
     down the text, like an attention window sliding over it.

     The words are ordinary text at full strength until script runs,
     and with reduced motion they stay that way. */
  import { onMount } from 'svelte';

  let { text }: { text: string } = $props();

  const words = $derived(text.split(/\s+/).filter(Boolean));

  let para: HTMLElement;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const els = Array.from(para.querySelectorAll<HTMLElement>('.rw'));
    let centres: number[] = [];
    let raf = 0;

    /** Page-relative vertical centre of each word, measured once per
     *  layout so a scroll frame does no layout reads. */
    function measure() {
      centres = els.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + scrollY + r.height / 2;
      });
      paint();
    }

    function paint() {
      raf = 0;
      const focus = scrollY + innerHeight * 0.56;
      const reach = innerHeight * 0.24;
      for (let i = 0; i < els.length; i++) {
        const d = (centres[i] - focus) / reach;
        const a = Math.exp(-d * d);
        els[i].style.setProperty('--a', a.toFixed(3));
      }
    }

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };

    measure();
    // Fonts arriving change line breaks, which moves every word.
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(para);
    addEventListener('scroll', schedule, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener('scroll', schedule);
    };
  });
</script>

<p class="read" bind:this={para}>
  {#each words as word, i (i)}<span class="rw">{word}</span>{' '}{/each}
</p>

<style>
  /* No --a means no script: full opacity, resting colour. */
  .rw {
    opacity: calc(0.24 + 0.76 * var(--a, 1));
    color: color-mix(in oklab, var(--accent) calc(var(--a, 0) * 30%), var(--ink-soft));
  }
</style>
