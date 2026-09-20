<script lang="ts">
  /* Headline that rises into place, word by word, from behind a mask.

     Same rule as everywhere else on this site: the text renders
     normally and JavaScript opts it *out* of visibility only once it
     has confirmed it can animate. Nothing here can leave a heading
     blank. */
  import { onMount } from 'svelte';

  let {
    text,
    delay = 0,
    stagger = 45,
    tag = 'h2',
  }: { text: string; delay?: number; stagger?: number; tag?: string } = $props();

  const words = text.split(' ');

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
          shown = true;
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
    );

    io.observe(el);
    const bail = setTimeout(() => (shown = true), 2600 + delay);

    return () => {
      io.disconnect();
      clearTimeout(bail);
    };
  });
</script>

<svelte:element
  this={tag}
  bind:this={el}
  class="tr"
  class:armed
  class:shown
  style={`--delay:${delay}ms`}
>
  <span class="sr">{text}</span>
  {#each words as word, i (i)}
    <span class="mask" aria-hidden="true"
      ><span class="word" style={`--i:${i}; --stagger:${stagger}ms`}>{word}</span></span
    >{' '}
  {/each}
</svelte:element>

<style>
  .tr { display: block; }

  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

  /* Unarmed: the masks are inert wrappers and the words simply show. */
  .mask { display: inline-block; vertical-align: bottom; }
  .word { display: inline-block; }

  .armed .mask { overflow: hidden; padding-bottom: 0.08em; }

  .armed .word {
    transform: translate3d(0, 110%, 0);
    opacity: 0;
    transition:
      transform 900ms var(--ease-out) calc(var(--delay) + var(--i) * var(--stagger)),
      opacity 700ms var(--ease-out) calc(var(--delay) + var(--i) * var(--stagger));
  }

  .armed.shown .word {
    transform: none;
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .armed .word { transform: none; opacity: 1; transition: none; }
    .armed .mask { overflow: visible; }
  }
</style>
