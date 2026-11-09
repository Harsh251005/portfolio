<script lang="ts">
  /* Skills as a plain index: each group's name, and its tools beside it.
     Built to be read in seconds. No numbers, so nothing reads as a ranking.
     The core skills only; the resume has the full list.

     Entrance: the heading comes into focus, then each group's name slides
     in and its tools are listed one at a time, as if being called out. */
  import { arrive } from '../../lib/motion/arrive';

  const GROUPS = [
    { name: 'Agents', skills: ['LangGraph', 'LangChain', 'OpenAI Agents SDK', 'MCP', 'Pydantic'] },
    { name: 'Retrieval', skills: ['RAG pipelines', 'Hybrid search', 'Reranking', 'Qdrant'] },
    { name: 'Voice', skills: ['LiveKit', 'Sarvam', 'ElevenLabs', 'Speech-to-text'] },
    { name: 'Models & evals', skills: ['OpenAI API', 'Prompt engineering', 'LangSmith', 'Hugging Face'] },
    { name: 'Build & ship', skills: ['Python', 'FastAPI', 'SQL', 'Docker', 'Git'] },
  ];
</script>

<div class="page skills" use:arrive={{ doneAfter: 3200 }}>
  <div class="head" data-arrive>
    <p class="label">Skills</p>
    <h2>What I work with.</h2>
  </div>

  <ul class="glass index">
    {#each GROUPS as group, i (group.name)}
      <li class="row" data-arrive style={`--d:${i}`}>
        <h3>{group.name}</h3>
        <p class="tools">
          {#each group.skills as skill, k (skill)}<span class="tool" style={`--t:${k}`}>{skill}</span>{#if k < group.skills.length - 1}<span class="sep" style={`--t:${k}`} aria-hidden="true">/</span><wbr />{/if}{/each}
        </p>
      </li>
    {/each}
  </ul>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2rem, 4vw + 1rem, 4.5rem);
    font-variation-settings: 'wght' 560;
    line-height: 1;
    letter-spacing: -0.035em;
    color: var(--ink);
  }

  .index { list-style: none; margin: var(--s-6) 0 0; padding: var(--s-2) var(--s-5); }

  .row {
    display: grid;
    gap: var(--s-2);
    padding-block: var(--s-5);
    border-top: 1px solid var(--rule);
  }
  .row:first-child { border-top: 0; }
  @media (min-width: 760px) {
    .row { grid-template-columns: minmax(12rem, 1fr) 2.2fr; gap: var(--s-6); align-items: baseline; }
  }

  h3 {
    font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.5rem);
    font-variation-settings: 'wght' 560;
    letter-spacing: -0.03em;
    line-height: 1.05;
    color: var(--ink);
    transition: transform 320ms var(--ease-out), color 260ms var(--ease), opacity 260ms var(--ease);
  }

  .tools { min-width: 0; font-size: var(--t-base); line-height: 1.7; color: var(--ink-soft); transition: color 260ms var(--ease), opacity 260ms var(--ease); }
  /* A tool never breaks across lines; a line may only break after a slash. */
  .tool { display: inline-block; white-space: nowrap; }
  .sep { display: inline-block; margin: 0 0.5em 0 0.4em; color: var(--accent); opacity: 0.5; }

  /* ---- the entrance (only once script has armed it) ---- */
  .skills:global(.arrive-armed) .label,
  .skills:global(.arrive-armed) h2 { transition: filter 1100ms var(--ease-out), opacity 900ms var(--ease-out), scale 1100ms var(--ease-out); }
  .skills:global(.arrive-armed) h2 { transition-delay: 120ms; }
  .skills:global(.arrive-armed) .head:not(:global(.in)) > * { filter: blur(14px); opacity: 0; scale: 1.04; }

  /* translate, not transform, so it never fights the hover nudge. */
  .skills:global(.arrive-armed) h3 {
    transition: transform 320ms var(--ease-out), color 260ms var(--ease), opacity 260ms var(--ease), translate 800ms var(--ease-out), clip-path 800ms var(--ease-out);
    transition-delay: 0s, 0s, 0s, calc(var(--d) * 140ms), calc(var(--d) * 140ms);
    clip-path: inset(-20% -10% -30% -10%);
  }
  .skills:global(.arrive-armed) .row:not(:global(.in)) h3 { translate: -28px 0; clip-path: inset(-20% 100% -30% 0); }
  .skills:global(.arrive-armed) .row:global(.done) h3 { clip-path: none; transition: transform 320ms var(--ease-out), color 260ms var(--ease), opacity 260ms var(--ease); }
  .skills:global(.arrive-armed) .tool,
  .skills:global(.arrive-armed) .sep {
    transition: opacity 500ms var(--ease-out), translate 600ms var(--ease-out);
    transition-delay: calc(var(--d) * 140ms + 280ms + var(--t) * 90ms);
  }
  .skills:global(.arrive-armed) .sep { transition-delay: calc(var(--d) * 140ms + 320ms + var(--t) * 90ms); }
  .skills:global(.arrive-armed) .row:not(:global(.in)) .tool { opacity: 0; translate: 0 8px; }
  .skills:global(.arrive-armed) .row:not(:global(.in)) .sep { opacity: 0; }
  .skills:global(.arrive-armed) .row:global(.done) .tool,
  .skills:global(.arrive-armed) .row:global(.done) .sep { transition: none; }
  .skills:global(.arrive-armed) .head:global(.done) > * { transition: none; }

  /* Pointing at a group brings it forward and lets the rest step back. */
  @media (hover: hover) {
    /* On the children, so it never fights the row's own entrance fade. */
    .index:hover .row:not(:hover) > * { opacity: 0.4; }
    .row:hover h3 { transform: translateX(6px); }
    .row:hover .tools { color: var(--ink); }
  }

  @media (prefers-reduced-motion: reduce) {
    h3, .tools { transition: none; }
    .row:hover h3 { transform: none; }
  }
</style>
