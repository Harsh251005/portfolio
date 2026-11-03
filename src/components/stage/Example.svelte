<script lang="ts">
  /* A small, honest picture of a project doing its job: a phone call,
     an answer with its source, a retry log.

     It replaces a generic row of stage boxes, which looked the same
     for every project and showed nothing real. This shows one
     concrete moment, and the caption always says it is an
     illustration — nothing here is presented as a real transcript.

     Lines appear one after another with a CSS delay. The content is
     in the page regardless: the animation only affects when each
     line becomes visible, and it is off for reduced motion. */
  import type { Entry } from '../../lib/brain/types';

  let {
    example,
    note,
    active = true,
  }: { example: NonNullable<Entry['example']>; note?: string; active?: boolean } = $props();
</script>

<figure class={`example kind-${example.kind}`} class:active>
  <figcaption>{example.caption}</figcaption>

  <ol class="lines">
    {#each example.lines as line, i (i)}
      <li
        class="line"
        class:me={line.me}
        data-state={line.state}
        style={`--i:${i}`}
      >
        <span class="who">{line.who}</span>
        <div class="bubble">
          <p class="text">{line.text}</p>
          {#if line.gloss}<p class="gloss">{line.gloss}</p>{/if}
          {#if line.tag}<span class="tag">{line.tag}</span>{/if}
        </div>
      </li>
    {/each}
  </ol>

  {#if note}<p class="note">{note}</p>{/if}
</figure>

<style>
  .example { margin: 0; }

  figcaption {
    margin-bottom: var(--s-4);
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .lines { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-3); }

  .line {
    display: grid;
    gap: var(--s-1);
    justify-items: start;
  }

  .active .line {
    animation: line-in 520ms var(--ease-out) both;
    animation-delay: calc(var(--i) * 520ms + 200ms);
  }

  .who {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .bubble {
    max-width: 34rem;
    padding: var(--s-3) var(--s-4);
    border-radius: 14px 14px 14px 4px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
  }

  .text { margin: 0; color: var(--ink); font-size: var(--t-base); line-height: var(--leading-snug); }
  .gloss { margin: var(--s-1) 0 0; color: var(--ink-faint); font-size: var(--t-sm); font-style: italic; }

  /* The visitor's side of a conversation sits on the right. */
  .kind-call .me, .kind-answer .me { justify-items: end; }
  .kind-call .me .bubble, .kind-answer .me .bubble {
    border-radius: 14px 14px 4px 14px;
    background: color-mix(in oklab, var(--accent) 10%, transparent);
    border-color: color-mix(in oklab, var(--accent) 30%, transparent);
  }

  .tag {
    display: inline-block;
    margin-top: var(--s-2);
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    border: 1px solid color-mix(in oklab, var(--accent) 45%, transparent);
  }

  /* The retry log reads as rows, not speech. */
  .kind-log .line { grid-template-columns: 4.5rem 1fr; align-items: start; gap: var(--s-3); }
  .kind-log .bubble {
    border-radius: var(--radius);
    border-left-width: 3px;
    max-width: none;
  }
  .kind-log [data-state='fail'] .bubble { border-left-color: var(--light-3); }
  .kind-log [data-state='ok'] .bubble   { border-left-color: #4ade80; }
  .kind-log [data-state='stop'] .bubble { border-left-color: var(--ink-faint); border-style: dashed; }
  .kind-log .who { padding-top: var(--s-3); }

  [data-state='stop'] .tag { color: var(--ink-soft); border-color: var(--rule); }

  .note {
    margin-top: var(--s-5);
    max-width: 40ch;
    color: var(--ink-soft);
    font-size: var(--t-sm);
  }

  @keyframes line-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .active .line { animation: none; }
  }
</style>
