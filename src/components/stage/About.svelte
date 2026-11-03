<script lang="ts">
  /* The person: what I am now, then the short version. The motion here is
     deliberately quiet, so the sea and the card deck can carry the page. */
  import { reveal } from '../../lib/motion/reveal';
  import Marker from './Marker.svelte';

  const COLUMNS = [
    {
      hook: 'On paper, I was headed for balance sheets.',
      body: 'I studied commerce in junior college. Off paper, I was building web pages, breaking them, and working out why they broke. By 2023 the habit had won, and I went to study IT instead.',
    },
    {
      hook: 'Then I pointed that habit at AI.',
      body: "A few months ago, and for the first time, I got serious. Now I build things that have to work with a real person on the other end: a receptionist that answers a clinic's phone, a coder that reads its own errors and knows when to stop.",
    },
    {
      hook: 'Away from the screen, it’s cricket.',
      body: 'I play, and I love it. The other habit I keep is learning one small new thing every day, because that is how all of this happened.',
    },
  ];
</script>

<div class="page about" use:reveal>
  <p class="label">What I do</p>

  <h2 data-reveal>I'm an AI engineer, building <Marker delay={700}>agents that do real work.</Marker></h2>

  <div class="cols">
    {#each COLUMNS as col, c (col.hook)}
      <div class="col" data-reveal style={`--d:${c + 1}`}>
        <p>
          <strong>{col.hook}</strong>
          {col.body}
        </p>
      </div>
    {/each}
  </div>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2.25rem, 4.6vw + 1rem, 5.25rem);
    font-variation-settings: 'wght' 560;
    line-height: 0.98;
    letter-spacing: -0.035em;
    max-width: 16ch;
  }

  .cols {
    margin-top: var(--s-7);
    display: grid;
    gap: var(--s-6);
    font-size: var(--t-lg);
    line-height: 1.55;
    color: var(--ink-soft);
  }

  .col { padding-top: var(--s-4); border-top: 1px solid var(--accent); }
  .col p { max-width: 38ch; }

  strong {
    display: block;
    margin-bottom: var(--s-2);
    color: var(--ink);
    font-variation-settings: 'wght' 640;
  }

  @media (width >= 60rem) {
    .cols { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-7); }
  }
</style>
