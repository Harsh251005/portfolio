<script lang="ts">
  /* Skills as a plain index: each group's name, and its tools beside it.
     Built to be read in seconds. No numbers, so nothing reads as a ranking.
     The core skills only; the resume has the full list. */
  import { reveal } from '../../lib/motion/reveal';

  const GROUPS = [
    { name: 'Agents', skills: ['LangGraph', 'LangChain', 'OpenAI Agents SDK', 'MCP', 'Pydantic'] },
    { name: 'Retrieval', skills: ['RAG pipelines', 'Hybrid search', 'Reranking', 'Qdrant'] },
    { name: 'Voice', skills: ['LiveKit', 'Sarvam', 'ElevenLabs', 'Speech-to-text'] },
    { name: 'Models & evals', skills: ['OpenAI API', 'Prompt engineering', 'LangSmith', 'Hugging Face'] },
    { name: 'Build & ship', skills: ['Python', 'FastAPI', 'SQL', 'Docker', 'Git'] },
  ];
</script>

<div class="page skills" use:reveal>
  <p class="label">Skills</p>
  <h2>What I work with.</h2>

  <ul class="glass index">
    {#each GROUPS as group, i (group.name)}
      <li class="row" data-reveal style={`--d:${i}`}>
        <h3>{group.name}</h3>
        <p class="tools">
          {#each group.skills as skill, k (skill)}<span class="tool">{skill}</span>{#if k < group.skills.length - 1}<span class="sep" aria-hidden="true">/</span><wbr />{/if}{/each}
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
  .tool { white-space: nowrap; }
  .sep { margin: 0 0.5em 0 0.4em; color: var(--accent); opacity: 0.5; }

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
