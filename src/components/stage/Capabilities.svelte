<script lang="ts">
  /* "What I do" — the plain-English answer, on a light band.

     Each row draws its own rule as it enters, which gives the section
     a sense of being assembled rather than pasted in. */
  import TextReveal from './TextReveal.svelte';
  import Reveal from './Reveal.svelte';
  import Glass from './Glass.svelte';

  const ITEMS = [
    {
      k: 'Talk',
      title: 'Systems that hold a conversation',
      body: 'Voice and text agents that answer the phone, understand what someone actually wants, and do it — in their language, at their pace, at eleven at night.',
    },
    {
      k: 'Read',
      title: 'Systems that read so you do not have to',
      body: 'Point them at a pile of documents and ask a question. They answer, and they show you the line they got it from — or admit the answer is not in there.',
    },
    {
      k: 'Decide',
      title: 'Systems that follow the rules exactly',
      body: 'Where getting it wrong costs money or trust, the rules stay in code and the model only works out what a person meant. It never gets a vote.',
    },
    {
      k: 'Recover',
      title: 'Systems that survive their own mistakes',
      body: 'The part everyone skips. It will break at three in the morning — so it has to notice, back out, and tell someone, without a human watching.',
    },
  ];
</script>

<div class="page">
  <header class="head">
    <p class="label"><span class="bar" aria-hidden="true"></span>What I do</p>
    <TextReveal text="Four kinds of thing, in plain words." tag="h2" />
  </header>

  <ol class="grid">
    {#each ITEMS as item, i (item.k)}
      <Reveal delay={i * 90} y={26}>
        <li>
          <Glass class="card">
            <span class="k">{item.k}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </Glass>
        </li>
      </Reveal>
    {/each}
  </ol>
</div>

<style>
  .head { margin-bottom: var(--s-8); }

  .label { display: flex; align-items: center; gap: var(--s-3); }
  .bar { width: 2rem; height: 1px; background: var(--accent); }

  .head :global(h2) {
    margin-top: var(--s-4);
    font-family: var(--font-display);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 400;
    line-height: var(--leading-tight);
    letter-spacing: -0.02em;
    max-width: 16ch;
  }

  .grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: var(--s-4);
  }

  li { height: 100%; }

  li :global(.card) { height: 100%; }

  li :global(.card .inner) {
    display: grid;
    gap: var(--s-3);
    align-content: start;
    padding: var(--s-5);
    height: 100%;
  }

  .k {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
  }

  h3 {
    font-family: var(--font-display);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-text), 'wght' 450;
    line-height: var(--leading-snug);
    letter-spacing: -0.01em;
    color: var(--ink);
    max-width: 22ch;
  }

  p {
    font-size: var(--t-sm);
    color: var(--ink-soft);
    max-width: 42ch;
  }

  @media (width >= 48rem) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (width >= 72rem) {
    .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    p { font-size: var(--t-xs); }
  }
</style>
