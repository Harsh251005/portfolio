<script lang="ts">
  /* The first screen. A living field, a name that resolves out of
     noise, and a live status line — nothing decorative that isn't
     also telling you something. */
  import FlowField from './FlowField.svelte';
  import Scramble from './Scramble.svelte';

  let { role, location }: { role: string; location: string } = $props();

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
  <FlowField />

  <div class="page inner">
    <p class="eyebrow">
      <span class="dot" aria-hidden="true"></span>
      <span>{role}</span>
      <span class="sep" aria-hidden="true">/</span>
      <span>{location}</span>
      <span class="sep" aria-hidden="true">/</span>
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
    align-items: center;
    isolation: isolate;
    overflow: hidden;
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

  .dot {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 0 var(--glow);
    animation: pulse 2.6s var(--ease) infinite;
  }

  .sep { opacity: 0.35; }

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
    margin-top: var(--s-7);
    display: inline-flex;
    align-items: center;
    gap: var(--s-3);
    min-height: var(--tap);
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink);
    text-decoration: none;
  }

  .cue__line {
    width: 3.5rem;
    height: 1px;
    background: var(--accent);
    transform-origin: left;
    animation: sweep 2.4s var(--ease) infinite;
  }

  .cue:hover .cue__line { animation-play-state: paused; }

  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0 var(--glow); }
    70%  { box-shadow: 0 0 0 0.6rem transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }

  @keyframes sweep {
    0%, 100% { transform: scaleX(1); opacity: 1; }
    50%      { transform: scaleX(1.5); opacity: 0.45; }
  }

  @media (width >= 60rem) {
    .statement { font-size: var(--t-2xl); }
  }
</style>
