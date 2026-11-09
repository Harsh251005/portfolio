<script lang="ts">
  /* The end of the page: what I'm looking for. The ways to reach me
     sit right below it, in the footer.

     Entrance: the heading's words light up one after another, like lamps
     coming on along a deck, each catching the gold for a moment. */
  import Marker from './Marker.svelte';
  import { arrive } from '../../lib/motion/arrive';

  const HEAD = ["Let's", 'build', 'something', 'people', 'can'];
  const TAIL = ['rely', 'on.'];
</script>

<div class="page contact" use:arrive={{ doneAfter: 2800 }}>
  <div class="head" data-arrive>
    <p class="label">Talk to me</p>

    <h2>
      {#each HEAD as t, i (i)}<span class="lw" style={`--i:${i}`}>{t}</span>{' '}{/each}<Marker delay={1950}
        >{#each TAIL as t, i (i)}<span class="lw" style={`--i:${HEAD.length + i}`}>{t}</span>{#if i < TAIL.length - 1}{' '}{/if}{/each}</Marker
      >
    </h2>
  </div>

  <p class="sub">
    I'm looking for an AI engineering role on a team that ships to real users.
    I'm in Mumbai, and open to remote work or moving for the right team. I'll
    tell you honestly whether I'm the right person, including when I'm not.
  </p>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2.25rem, 4.6vw + 1rem, 5.25rem);
    font-variation-settings: 'wght' 560;
    line-height: 0.98;
    letter-spacing: -0.035em;
    max-width: 15ch;
  }

  .sub {
    margin-top: var(--s-5);
    max-width: 42ch;
    font-size: var(--t-lg);
    color: var(--ink-soft);
  }

  /* ---- the entrance (only once script has armed it) ---- */
  @keyframes lamp {
    0% { opacity: 0.12; color: var(--ink); text-shadow: none; }
    45% { opacity: 1; color: var(--accent); text-shadow: 0 0 18px rgb(243 223 174 / 0.45); }
    100% { opacity: 1; color: var(--ink); text-shadow: none; }
  }
  .contact:global(.arrive-armed) .label,
  .contact:global(.arrive-armed) .sub { transition: opacity 700ms var(--ease-out); }
  .contact:global(.arrive-armed) .sub { transition-delay: 1100ms; }
  .contact:global(.arrive-armed) .head:not(:global(.in)) .label,
  .contact:global(.arrive-armed) .head:not(:global(.in)) ~ .sub { opacity: 0; }
  .contact:global(.arrive-armed) .head:not(:global(.in)) .lw { opacity: 0.12; }
  .contact:global(.arrive-armed) .head:global(.in) .lw { animation: lamp 950ms var(--ease) both; animation-delay: calc(200ms + var(--i) * 120ms); }
  .contact:global(.arrive-armed) .head:global(.done) .lw { animation: none; }
</style>
