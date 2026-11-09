<script lang="ts">
  /* The person: what I am now, then the short version. It unfolds from its
     top line as it comes into view: the label, a gold line drawn across,
     then the heading opens downward from it; each column does the same from
     its own gold line. */
  import { arrive } from '../../lib/motion/arrive';
  import Marker from './Marker.svelte';

  const COLUMNS = [
    {
      hook: 'On paper, I was headed for balance sheets.',
      body: 'I studied commerce in junior college. Off paper, I was building web pages, breaking them, and working out why they broke. By 2023 the habit had won, and I went to study IT instead.',
    },
    {
      hook: 'Then I pointed that habit at AI.',
      body: "That's when it got serious. Now I build things that have to work with a real person on the other end: a receptionist that talks to a clinic's patients and books their visits, a coder that reads its own errors and knows when to stop. Right now I'm a QA Engineer intern at Crucibl, where the work mixes testing with development.",
    },
    {
      hook: 'Away from the screen, it’s cricket.',
      body: 'I play, and I love it. The other habit I keep is learning one small new thing every day, because that is how all of this happened.',
    },
  ];
</script>

<div class="page about" use:arrive>
  <div class="head" data-arrive>
    <p class="label">What I do</p>
    <span class="rule" aria-hidden="true"></span>
    <h2>I'm an AI engineer, building <Marker delay={1500}>agents that do real work.</Marker></h2>
  </div>

  <div class="cols">
    {#each COLUMNS as col, c (col.hook)}
      <div class="col" data-arrive style={`--d:${c}`}>
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

  .rule {
    display: block;
    height: 1px;
    margin-top: var(--s-3);
    background: var(--accent);
    transform-origin: left;
  }

  .col { position: relative; padding-top: var(--s-4); }
  .col::before {
    content: '';
    position: absolute;
    inset: 0 0 auto;
    height: 1px;
    background: var(--accent);
    transform-origin: left;
  }
  .col p { max-width: 38ch; }

  strong {
    display: block;
    margin-bottom: var(--s-2);
    color: var(--ink);
    font-variation-settings: 'wght' 640;
  }

  /* ---- the unfold (only once script has armed it) ---- */
  .about:global(.arrive-armed) .label,
  .about:global(.arrive-armed) .rule,
  .about:global(.arrive-armed) h2,
  .about:global(.arrive-armed) .col::before,
  .about:global(.arrive-armed) .col p {
    transition:
      opacity 600ms var(--ease-out),
      transform 900ms var(--ease-out),
      clip-path 1000ms var(--ease-out);
  }

  /* Folded: label up and hidden, lines not drawn, words closed up under their line. */
  .about:global(.arrive-armed) :not(:global(.in)) > .label { opacity: 0; transform: translateY(-8px); }
  .about:global(.arrive-armed) :not(:global(.in)) > .rule,
  .about:global(.arrive-armed) .col:not(:global(.in))::before { transform: scaleX(0); }
  .about:global(.arrive-armed) :not(:global(.in)) > h2,
  .about:global(.arrive-armed) .col:not(:global(.in)) p {
    clip-path: inset(0 0 100% 0);
    transform: translateY(-14px);
  }

  /* Opening, in order: label, line, then the words from the line down. */
  .about:global(.arrive-armed) .rule { transition-delay: 150ms; }
  .about:global(.arrive-armed) h2 { transition-delay: 550ms; }
  .about:global(.arrive-armed) .col::before { transition-delay: calc(var(--d, 0) * 180ms); }
  .about:global(.arrive-armed) .col p { transition-delay: calc(var(--d, 0) * 180ms + 400ms); }

  .about:global(.arrive-armed) h2,
  .about:global(.arrive-armed) .col p { clip-path: inset(-10% -4% -25% -4%); }

  /* Finished: drop the clip so nothing (descenders, the marker) is cut, and
     snap there even if the transition never ran. */
  .about:global(.arrive-armed) .head:global(.done) > h2,
  .about:global(.arrive-armed) .col:global(.done) p { clip-path: none; transition: none; }

  @media (width >= 60rem) {
    .cols { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-7); }
  }
</style>
