<script lang="ts">
  /* Where I am now, then how I got here. The current role leads as a card
     that turns over to show what the work involves; past education sits in
     a plain list beside it, newest first. */
  import { reveal } from '../../lib/motion/reveal';
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

<div class="page edu" use:reveal>
  <p class="label">Experience &amp; Education</p>
  <h2 data-reveal>Where I am now, and how I got here.</h2>

  <div class="grid">
    <div class="now" data-reveal style="--d:0">
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

    <ol class="glass past" data-reveal style="--d:1">
      {#each PAST as step (step.when)}
        <li>
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
</style>
