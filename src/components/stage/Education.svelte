<script lang="ts">
  /* Where I am now, then how I got here. The current role leads as a card
     that turns over to show what the work involves; past education sits in
     a plain list beside it, newest first.

     Entrance: the heading is wiped in from the left with a soft edge, the
     card slides in, and a gold timeline line grows down the list, each step
     appearing as the line reaches it. */
  import { arrive } from '../../lib/motion/arrive';
  import FlipCard from './FlipCard.svelte';

  const NOW = {
    role: 'QA Engineer · Intern',
    where: 'Crucibl',
    line: 'Development, testing and bug fixing',
    // The back of the card: his day-to-day, as he described it. The title
    // says QA; the work is all-round engineering.
    headline: 'More than testing. I build, test and fix.',
    work: [
      'Develop features for the product, not only check them.',
      'Take the lead on testing, so problems are caught before users meet them.',
      'Track down bugs and fix them in the code myself.',
    ],
    close: 'Every day: build it, break it, fix it.',
  };

  const PAST = [
    { when: '2023 – 2026', what: 'B.Sc. Information Technology', where: 'Thakur Shyamnarayan Degree College, University of Mumbai', score: 'CGPI 8.68' },
    { when: '2021 – 2023', what: 'Junior college · Commerce', where: 'Thakur College of Science and Commerce, Maharashtra Board', score: '69.33%' },
    { when: 'Until 2021', what: 'School · ICSE', where: 'RBK School, Mira Road', score: '82%' },
  ];
</script>

<div class="page edu" use:arrive={{ doneAfter: 3000 }}>
  <div class="head" data-arrive>
    <p class="label">Experience &amp; Education</p>
    <h2>Where I am now, and how I got here.</h2>
  </div>

  <div class="grid">
    <div class="now" data-arrive>
      <FlipCard frontCue="What I do there" backCue="Turn back">
        {#snippet front()}
          <p class="tag"><span class="pulse" aria-hidden="true"></span>Now</p>
          <h3>{NOW.role}</h3>
          <p class="at">at <strong>{NOW.where}</strong></p>
          <p class="line">{NOW.line}</p>
        {/snippet}
        {#snippet back()}
          <p class="tag">Day to day at {NOW.where}</p>
          <p class="headline">{NOW.headline}</p>
          <ul class="work">
            {#each NOW.work as item (item)}<li>{item}</li>{/each}
          </ul>
          <p class="close">{NOW.close}</p>
        {/snippet}
      </FlipCard>
      <a class="next" href="#contact">Open to what's next. Let's talk <span aria-hidden="true">↓</span></a>
    </div>

    <ol class="glass past" data-arrive>
      {#each PAST as step, j (step.when)}
        <li style={`--j:${j}`}>
          <p class="when">{step.when}</p>
          <p class="what">{step.what}</p>
          <p class="where">{step.where}</p>
          <p class="score">{step.score}</p>
        </li>
      {/each}
    </ol>
  </div>
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

  .grid { margin-top: var(--s-6); display: grid; gap: var(--s-4); }
  @media (min-width: 900px) { .grid { grid-template-columns: 1fr 1.4fr; align-items: start; } }

  .now { display: flex; flex-direction: column; gap: var(--s-4); }

  .tag { display: inline-flex; align-items: center; gap: var(--s-2); font: 600 var(--t-xs)/1 var(--font-mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); }
  .pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 10px var(--accent); animation: pulse 2.4s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: 0.35; } }

  h3 { margin-top: var(--s-3); font-size: clamp(1.75rem, 1.3rem + 1.8vw, 2.75rem); font-variation-settings: 'wght' 560; letter-spacing: -0.03em; line-height: 1.05; color: var(--ink); }
  .at { font-size: var(--t-lg); color: var(--ink-soft); }
  .at strong { color: var(--ink); font-variation-settings: 'wght' 600; }
  .line { font-size: var(--t-sm); color: var(--ink-faint); }

  .headline { margin-top: var(--s-3); font-size: var(--t-xl); font-variation-settings: 'wght' 560; letter-spacing: -0.02em; line-height: 1.15; color: var(--ink); }
  .close { margin-top: var(--s-3); font-size: var(--t-sm); color: var(--ink-soft); font-style: italic; }
  .work { list-style: none; margin: var(--s-3) 0 0; padding: 0; display: grid; gap: var(--s-3); }
  .work li { position: relative; padding-left: var(--s-5); font-size: var(--t-base); line-height: 1.5; color: var(--ink); }
  .work li::before { content: ''; position: absolute; left: 0; top: 0.65em; width: 0.6rem; height: 1px; background: var(--accent); }

  .next { font-size: var(--t-base); font-variation-settings: 'wght' 560; color: var(--accent); text-decoration: none; }
  .next:focus-visible { text-decoration: underline; text-underline-offset: 4px; }
  @media (hover: hover) { .next:hover { text-decoration: underline; text-underline-offset: 4px; } }

  .past { list-style: none; margin: 0; padding: var(--s-2) var(--s-5); }
  .past li { display: grid; grid-template-columns: 1fr auto; gap: var(--s-1) var(--s-4); padding-block: var(--s-4); border-top: 1px solid var(--rule); }
  .past li:first-child { border-top: 0; }
  .when { grid-column: 1 / -1; font: 600 var(--t-xs)/1 var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-faint); }
  .what { font-size: var(--t-lg); font-variation-settings: 'wght' 560; letter-spacing: -0.02em; color: var(--ink); }
  .where { grid-column: 1; font-size: var(--t-sm); color: var(--ink-soft); }
  .score { grid-row: 2 / span 2; grid-column: 2; align-self: center; font: var(--t-base)/1 var(--font-mono); color: var(--accent); white-space: nowrap; }

  @media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }

  /* ---- the entrance (only once script has armed it) ---- */
  /* Heading: a soft-edged wipe from the left. The mask is 2.6x as wide as
     the text, opaque on its left part: at 0% the text shows, at 100% not. */
  .edu:global(.arrive-armed) .head > * {
    -webkit-mask-image: linear-gradient(90deg, #000 45%, transparent 55%);
    mask-image: linear-gradient(90deg, #000 45%, transparent 55%);
    -webkit-mask-size: 260% 100%;
    mask-size: 260% 100%;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: 0% 0;
    mask-position: 0% 0;
    transition: -webkit-mask-position 1300ms var(--ease), mask-position 1300ms var(--ease);
  }
  .edu:global(.arrive-armed) .head > h2 { transition-delay: 150ms; }
  .edu:global(.arrive-armed) .head:not(:global(.in)) > * { -webkit-mask-position: 100% 0; mask-position: 100% 0; }
  .edu:global(.arrive-armed) .head:global(.done) > * { -webkit-mask-image: none; mask-image: none; transition: none; }

  /* The card slides in from the left. */
  .edu:global(.arrive-armed) .now { transition: opacity 700ms var(--ease-out), translate 900ms var(--ease-out); }
  .edu:global(.arrive-armed) .now:not(:global(.in)) { opacity: 0; translate: -32px 0; }
  .edu:global(.arrive-armed) .now:global(.done) { transition: none; }

  /* The list: a timeline line grows down it, each step arriving as it passes. */
  .past { position: relative; }
  .edu:global(.arrive-armed) .past::before {
    content: '';
    position: absolute;
    left: calc(var(--s-5) / 2);
    top: var(--s-5);
    bottom: var(--s-5);
    width: 1px;
    background: var(--accent);
    opacity: 0.85;
    transform-origin: top;
    transition: transform 1200ms var(--ease);
    transition-delay: 200ms;
  }
  .edu:global(.arrive-armed) .past:not(:global(.in))::before { transform: scaleY(0); }
  .edu:global(.arrive-armed) .past li { transition: opacity 600ms var(--ease-out), translate 700ms var(--ease-out); transition-delay: calc(350ms + var(--j) * 330ms); }
  .edu:global(.arrive-armed) .past:not(:global(.in)) li { opacity: 0; translate: -16px 0; }
  .edu:global(.arrive-armed) .past:global(.done) li,
  .edu:global(.arrive-armed) .past:global(.done)::before { transition: none; }
</style>
