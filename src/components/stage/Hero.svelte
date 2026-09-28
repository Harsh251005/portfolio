<script lang="ts">
  /* The first screen. A living field, a name that resolves out of
     noise, and a live status line — nothing decorative that isn't
     also telling you something. */
  import Scramble from './Scramble.svelte';

  let {
    role,
    location,
    status,
  }: { role: string; location: string; status?: string } = $props();

  let clock = $state('');

  $effect(() => {
    const tick = () => {
      // His local time, so the status line is genuinely live.
      clock = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      }).format(new Date());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  });
</script>

<section class="hero" id="main">
  <div class="page inner">
    <p class="eyebrow">
      <span class="dot" aria-hidden="true"></span>
      <span>{role}</span>
      <span class="sep" aria-hidden="true">/</span>
      <span>{location}</span>
      <span class="sep" aria-hidden="true">/</span>
      {#if status}
        <span class="status">{status}</span>
        <span class="sep" aria-hidden="true">/</span>
      {/if}
      <span class="clock">{clock}<span class="tz">IST</span></span>
    </p>

    <h1>
      <span class="line"><Scramble text="HARSH" delay={140} /></span>
      <span class="line dim"><Scramble text="DHARNIDHARKA" delay={420} /></span>
    </h1>

    <p class="statement">
      I build software that makes decisions on its own —
      <em>and then I make sure it makes the right ones.</em>
    </p>

    <a class="cue" href="#work">
      <span>See what that means</span>
      <span class="cue__line" aria-hidden="true"></span>
    </a>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 100svh;
    display: flex;
    /* Sits high in the frame, in the sky above the skyline crest,
       rather than centred over the buildings. */
    align-items: flex-start;
    padding-top: clamp(5rem, 15vh, 10rem);
    isolation: isolate;
    overflow: hidden;
  }

  /* A soft pool of shade behind the copy. On a short viewport the
     crest rises into the text block, and this is what keeps it
     readable without dimming the whole scene. */
  .hero::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: 0;
    height: 86%;
    background: radial-gradient(
      70% 58% at 32% 45%,
      color-mix(in oklab, #05070f 62%, transparent) 0%,
      color-mix(in oklab, #05070f 28%, transparent) 45%,
      transparent 72%
    );
    pointer-events: none;
    z-index: 0;
  }

  .inner { position: relative; z-index: 1; padding-block: var(--s-8); }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: var(--s-3);
    flex-wrap: wrap;
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  /* A mark and an expanding hairline ring. No glow: this palette is
     a drawing, and drawings do not emit light. */
  .dot {
    position: relative;
    width: 0.4rem;
    height: 0.4rem;
    background: var(--accent);
  }

  .dot::after {
    content: '';
    position: absolute;
    inset: -1px;
    border: 1px solid var(--accent);
    animation: ping 2.8s var(--ease) infinite;
  }

  .sep { opacity: 0.35; }

  .status { color: var(--accent); }

  .clock { color: var(--ink-soft); font-variant-numeric: tabular-nums; }
  .tz { margin-left: 0.4em; opacity: 0.5; }

  h1 {
    margin-top: var(--s-5);
    display: grid;
    font-family: var(--font-display);
    font-size: var(--t-4xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 400;
    line-height: 0.88;
    letter-spacing: -0.035em;
    min-width: 0;
  }

  .line { display: block; min-width: 0; }
  .dim { color: var(--ink-soft); }

  .statement {
    margin-top: var(--s-6);
    max-width: 34ch;
    font-family: var(--font-display);
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 350;
    line-height: var(--leading-snug);
    color: var(--ink-soft);
  }

  .statement em { color: var(--ink); font-style: italic; }

  .cue {
    margin-top: var(--s-6);
    display: inline-flex;
    align-items: center;
    gap: var(--s-3);
    min-height: var(--tap);
    padding-inline: var(--s-5);
    border: 1px solid color-mix(in oklab, var(--accent) 45%, transparent);
    border-radius: 999px;
    background: color-mix(in oklab, var(--paper) 62%, transparent);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: border-color 320ms var(--ease), background 320ms var(--ease);
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink);
    text-decoration: none;
  }

  .cue:hover {
    border-color: var(--accent);
    background: color-mix(in oklab, var(--paper) 80%, transparent);
  }

  .cue__line {
    width: 2.5rem;
    height: 1px;
    background: var(--accent);
    transform-origin: left;
    animation: sweep 2.4s var(--ease) infinite;
  }

  .cue:hover .cue__line { animation-play-state: paused; }

  @keyframes ping {
    0%        { transform: scale(1);   opacity: 0.9; }
    70%, 100% { transform: scale(3.2); opacity: 0; }
  }

  @keyframes sweep {
    0%, 100% { transform: scaleX(1); opacity: 1; }
    50%      { transform: scaleX(1.5); opacity: 0.45; }
  }

  @media (width >= 60rem) {
    .statement { font-size: var(--t-2xl); }
  }
</style>
