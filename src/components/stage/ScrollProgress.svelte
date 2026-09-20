<script lang="ts">
  /* A hairline at the top of the page showing how far through you are,
     plus the name of the section you're currently in.

     There is no navigation bar, so this is the only persistent sense
     of place — it answers "where am I" without occupying the page. */
  import { onMount } from 'svelte';

  let { sections }: { sections: { id: string; label: string }[] } = $props();

  let progress = $state(0);
  let current = $state(sections[0]?.label ?? '');
  let lifted = $state(false);
  /* Which band is under the rail. The rail adopts that band's tone
     so it stays legible over both — a blend mode looks clever here
     and turns the orange accent cyan over the light bands. */
  let tone = $state<'ink' | 'paper'>('ink');

  onMount(() => {
    let ticking = false;

    function measure() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - innerHeight;
      progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      lifted = scrollY > innerHeight * 0.5;

      // The section whose top has most recently passed the upper third.
      const line = innerHeight * 0.32;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= line) current = section.label;
      }

      const under = document
        .elementsFromPoint(innerWidth / 2, 2)
        .find((el) => (el as HTMLElement).dataset?.tone) as HTMLElement | undefined;
      if (under?.dataset.tone === 'ink' || under?.dataset.tone === 'paper') {
        tone = under.dataset.tone;
      }

      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    }

    measure();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });

    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  });
</script>

<div class={`rail tone-${tone}`} class:lifted>
  <div class="bar" style={`transform: scaleX(${progress})`}></div>
  <div class="meta">
    <span class="where">{current}</span>
    <span class="pct">{Math.round(progress * 100)}</span>
  </div>
</div>

<style>
  .rail {
    position: fixed;
    inset-inline: 0;
    top: 0;
    z-index: 50;
    pointer-events: none;
  }

  .bar {
    height: 2px;
    background: var(--accent);
    transform-origin: left;
    will-change: transform;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--s-4);
    padding: var(--s-3) var(--gutter);
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-faint);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 420ms var(--ease), transform 420ms var(--ease-out);
  }

  .lifted .meta { opacity: 1; transform: none; }

  .pct::after { content: '%'; opacity: 0.5; margin-left: 0.15em; }

  @media (prefers-reduced-motion: reduce) {
    .bar { transition: none; }
  }
</style>
