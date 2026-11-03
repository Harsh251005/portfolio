<script lang="ts">
  /* Education as a staircase: school, junior college, degree, and an
     empty step for whatever comes next. Readable at a glance, because
     higher means later. Each step is lighter than the one before, so
     the climb is also a walk from dark into light.

     The steps rise out of the floor as you scroll, and sink back if you
     scroll up. They are fully built by default (--u is 1 in the CSS);
     script only takes them down once it can bring them back. */
  import { onMount } from 'svelte';
  import Marker from './Marker.svelte';

  const STEPS = [
    { when: 'Until 2021', what: 'School · ICSE', where: 'RBK School', place: 'Mira Road' },
    { when: '2021 – 2023', what: 'Junior college · Commerce', where: 'Thakur College of Science and Commerce', place: 'Maharashtra Board' },
    { when: '2023 – 2026', what: 'B.Sc. Information Technology', where: 'Thakur Shyamnarayan Degree College', place: 'University of Mumbai' },
  ];

  let root: HTMLElement;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
    const cols = Array.from(root.querySelectorAll<HTMLElement>('.col'));
    const floor = root.querySelector<HTMLElement>('.stairs')!;
    const target = cols.map(() => 0);
    const current = cols.map(() => 0);

    const measure = () => {
      const wide = innerWidth >= 960;
      const p = clamp((innerHeight * 0.95 - floor.getBoundingClientRect().top) / (innerHeight * 0.55));
      cols.forEach((c, i) => {
        target[i] = wide
          ? clamp((p - i * 0.16) / 0.52)
          : clamp((innerHeight * 0.98 - c.getBoundingClientRect().top) / (innerHeight * 0.35));
      });
    };

    const paint = (i: number) => cols[i].style.setProperty('--u', ease(current[i]).toFixed(4));

    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      const pull = 1 - Math.exp(-dt / 120);
      let moving = false;
      cols.forEach((_, i) => {
        const gap = target[i] - current[i];
        if (gap === 0) return;
        current[i] = Math.abs(gap) < 0.0006 ? target[i] : current[i] + gap * pull;
        paint(i);
        if (current[i] !== target[i]) moving = true;
      });
      if (moving) raf = requestAnimationFrame(tick);
      else last = 0;
    };
    const wake = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    measure();
    cols.forEach((_, i) => {
      current[i] = target[i];
      paint(i);
    });

    addEventListener('scroll', wake, { passive: true });
    addEventListener('resize', wake, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('scroll', wake);
      removeEventListener('resize', wake);
    };
  });
</script>

<div class="page edu" bind:this={root}>
  <p class="label">Education</p>
  <h2>Three steps up. <Marker>The next one's open.</Marker></h2>

  <ol class="stairs">
    {#each STEPS as step, i (step.where)}
      <li class="col" style={`--i:${i}`}>
        <div class="step">
          <p class="when">{step.when}</p>
          <p class="where">{step.where}</p>
          <p class="what">{step.what}<br />{step.place}</p>
        </div>
      </li>
    {/each}
    <li class="col next" style="--i:3">
      <a class="step" href="#contact">
        <p class="when">Next</p>
        <p class="where">Your team? <span aria-hidden="true">↓</span></p>
      </a>
    </li>
  </ol>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2rem, 4vw + 1rem, 4.5rem);
    font-variation-settings: 'wght' 560;
    line-height: 1;
    letter-spacing: -0.035em;
    max-width: 17ch;
  }

  .stairs {
    list-style: none;
    margin: var(--s-7) 0 0;
    padding: 0;
    display: grid;
    gap: var(--s-3);
  }

  .col { overflow: hidden; }

  .step {
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    height: 100%;
    padding: var(--s-5);
    border-top: 3px solid var(--accent);
    color: var(--ink);
    transform: translateX(calc((var(--u, 1) - 1) * 100%));
    will-change: transform;
  }

  /* Night lifting as the climb goes up. */
  .col:nth-child(1) .step { background: rgba(9, 16, 34, 0.76); }
  .col:nth-child(2) .step { background: rgba(26, 38, 68, 0.78); }
  .col:nth-child(3) .step { background: rgba(50, 66, 104, 0.8); }
  .col:nth-child(1) { width: 72%; }
  .col:nth-child(2) { width: 82%; }
  .col:nth-child(3) { width: 92%; }

  .when {
    font-family: var(--font-label);
    font-size: var(--t-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .where {
    font-size: var(--t-xl);
    font-variation-settings: 'wght' 560;
    line-height: 1.12;
    letter-spacing: -0.02em;
  }

  .what { font-size: var(--t-sm); line-height: 1.4; }

  /* The step that isn't built yet. */
  .next .step {
    background: transparent;
    border: 1.5px dashed var(--accent);
    color: var(--accent);
    text-decoration: none;
    transition: background-color 320ms var(--ease), color 320ms var(--ease);
  }

  .next .step:hover,
  .next .step:focus-visible {
    background: var(--accent);
    color: var(--paper);
  }

  @media (width >= 60rem) {
    .stairs {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      align-items: end;
      height: clamp(30rem, 66vh, 38rem);
      border-bottom: 1px solid var(--rule);
    }

    .col:nth-child(n) { width: auto; }
    .col:nth-child(1) { height: 40%; }
    .col:nth-child(2) { height: 60%; }
    .col:nth-child(3) { height: 80%; }
    .col:nth-child(4) { height: 100%; }

    .step { transform: translateY(calc((1 - var(--u, 1)) * 100%)); }
  }

  @media (prefers-reduced-motion: reduce) {
    .step { transform: none; }
  }
</style>
