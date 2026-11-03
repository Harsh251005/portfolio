<script lang="ts">
  /* Education as a staircase: school, junior college, degree, and an
     empty step for whatever comes next. Readable at a glance, because
     higher means later. Each step is lighter than the one before. */
  import { reveal } from '../../lib/motion/reveal';
  import Marker from './Marker.svelte';

  const STEPS = [
    { when: 'Until 2021', what: 'School · ICSE', where: 'RBK School', place: 'Mira Road' },
    { when: '2021 – 2023', what: 'Junior college · Commerce', where: 'Thakur College of Science and Commerce', place: 'Maharashtra Board' },
    { when: '2023 – 2026', what: 'B.Sc. Information Technology', where: 'Thakur Shyamnarayan Degree College', place: 'University of Mumbai' },
  ];
</script>

<div class="page edu" use:reveal>
  <p class="label">Education</p>
  <h2>Three steps up. <Marker>The next one's open.</Marker></h2>

  <ol class="stairs">
    {#each STEPS as step, i (step.where)}
      <li class="col" data-reveal style={`--d:${i}`}>
        <div class="step">
          <p class="when">{step.when}</p>
          <p class="where">{step.where}</p>
          <p class="what">{step.what}<br />{step.place}</p>
        </div>
      </li>
    {/each}
    <li class="col next" data-reveal style="--d:3">
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
  }
</style>
