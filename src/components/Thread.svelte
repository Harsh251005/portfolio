<script lang="ts">
  /* ---------------------------------------------------------------
     The Thread. The only stateful part of the site.

     It owns one thing: the ordered list of question ids the visitor
     has opened. Everything visible follows from that list.

     It deliberately does not own: how an answer looks (AnswerCard),
     what counts as an answer (lib/brain), or what the content is
     (content/knowledge). Each of those is replaceable without
     touching this file.
     --------------------------------------------------------------- */
  import { tick } from 'svelte';
  import type { Answer, Entry } from '../lib/brain/types';
  import { createBrain } from '../lib/brain';
  import AnswerCard from './AnswerCard.svelte';
  import Followups from './Followups.svelte';
  import AskBox from './AskBox.svelte';
  import MapPanel from './MapPanel.svelte';
  import PathBar from './PathBar.svelte';
  import Miss from './Miss.svelte';

  let {
    entries,
    groups,
    featured,
  }: {
    entries: Entry[];
    groups: { group: string; label: string; entries: Entry[] }[];
    featured: Entry[];
  } = $props();

  const brain = createBrain(entries);
  const byId = new Map(entries.map((e) => [e.id, e]));

  /** A step is either an answer that was found, or a question we
   *  couldn't answer. Misses stay on the page on purpose — silently
   *  dropping them is what makes a system feel broken. */
  type Step =
    | { kind: 'hit'; key: string; entry: Entry }
    | { kind: 'miss'; key: string; query: string; suggestions: Entry[] };

  let steps = $state<Step[]>([]);
  let mapOpen = $state(false);
  let announce = $state('');

  const trail = $derived(
    steps.filter((s): s is Extract<Step, { kind: 'hit' }> => s.kind === 'hit').map((s) => s.entry),
  );
  const visited = $derived(new Set(trail.map((e) => e.id)));
  const total = $derived(entries.filter((e) => !e.hidden).length);

  /** Questions to offer at the very bottom: this answer's own
   *  follow-ups, minus anything already read, topped up with
   *  anything unread so the thread never dead-ends. */
  const nextUp = $derived.by(() => {
    const last = trail.at(-1);
    const wanted = last
      ? last.followups.map((id) => byId.get(id)).filter((e): e is Entry => Boolean(e))
      : [];
    const unread = wanted.filter((e) => !visited.has(e.id));
    if (unread.length >= 2) return unread.slice(0, 3);

    const filler = entries.filter(
      (e) => !e.hidden && !visited.has(e.id) && !unread.some((u) => u.id === e.id),
    );
    return [...unread, ...filler].slice(0, 3);
  });

  /** Waits for Svelte to render the new step before scrolling to it —
   *  a bare requestAnimationFrame fires while the node still doesn't
   *  exist, and the page ends up scrolled to nowhere. */
  async function scrollTo(key: string) {
    await tick();
    requestAnimationFrame(() => {
      document.getElementById(`step-${key}`)?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }

  function open(id: string) {
    mapOpen = false;

    const existing = steps.find((s) => s.kind === 'hit' && s.entry.id === id);
    if (existing) {
      scrollTo(existing.key);
      return;
    }

    const entry = byId.get(id);
    if (!entry) return;

    const key = `${id}-${steps.length}`;
    steps = [...steps, { kind: 'hit', key, entry }];
    announce = `Opened: ${entry.question}`;
    syncUrl();
    scrollTo(key);
  }

  async function ask(query: string) {
    const answer: Answer = await brain.ask(query);

    if (answer.kind === 'hit' && answer.entry) {
      open(answer.entry.id);
      return;
    }

    const key = `miss-${steps.length}`;
    steps = [...steps, { kind: 'miss', key, query, suggestions: answer.suggestions }];
    announce = `No answer found for: ${query}`;
    scrollTo(key);
  }

  function reset() {
    steps = [];
    mapOpen = false;
    announce = 'Back to the start';
    syncUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Keeps the URL in step with the path, so a visitor can share the
   *  exact conversation they had. Uses replaceState so the browser
   *  back button leaves the site rather than unwinding the thread. */
  function syncUrl() {
    const ids = trail.map((e) => e.id);
    const url = new URL(window.location.href);
    if (ids.length) url.searchParams.set('p', ids.join(','));
    else url.searchParams.delete('p');
    history.replaceState(null, '', url);
  }

  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    const restore = params.get('p');
    if (!restore) return;

    const found = restore
      .split(',')
      .map((id) => byId.get(id.trim()))
      .filter((e): e is Entry => Boolean(e));

    if (found.length) {
      steps = found.map((entry, i) => ({ kind: 'hit', key: `${entry.id}-${i}`, entry }));
    }
  });
</script>

<PathBar
  {trail}
  {total}
  onjump={(id) => open(id)}
  onmap={() => (mapOpen = true)}
  onreset={reset}
/>

<p class="visually-hidden" aria-live="polite">{announce}</p>

{#if steps.length === 0}
  <div class="opening page">
    <p class="label">Ask me something</p>
    <div class="opening__box">
      <AskBox chips={featured} onpick={open} onask={ask} />
    </div>
  </div>
{/if}

{#if steps.length}
  <div class="steps">
    {#each steps as step, i (step.key)}
      <article class="step" id={`step-${step.key}`}>
        <div class="page grid">
          <div class="head">
            <p class="marker" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
            {#if step.kind === 'hit'}
              <h2>{step.entry.question}</h2>
            {:else}
              <h2 class="missed">“{step.query}”</h2>
            {/if}
          </div>

          <div class="body">
            {#if step.kind === 'hit'}
              <AnswerCard entry={step.entry} />
            {:else}
              <Miss suggestions={step.suggestions} onpick={open} />
            {/if}

            {#if i === steps.length - 1}
              <Followups entries={nextUp} onpick={open} />
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </div>

  <div class="tail page">
    <AskBox onpick={open} onask={ask} placeholder="ask something else" compact />
  </div>
{/if}

<MapPanel
  {groups}
  {visited}
  open={mapOpen}
  onpick={open}
  onclose={() => (mapOpen = false)}
/>

<!-- Exposed so the static Opening section can drive the thread
     without this component owning the hero's markup. -->
<svelte:window
  on:thread:open={(e) => open((e as CustomEvent<string>).detail)}
  on:thread:ask={(e) => ask((e as CustomEvent<string>).detail)}
  on:thread:map={() => (mapOpen = true)}
/>

<style>
  .opening {
    padding-bottom: var(--section);
    animation: step-in var(--dur-slow) var(--ease-out) both;
  }

  .opening__box { margin-top: var(--s-4); }

  /* The chips are a decision point, not a list — two columns keeps
     each one a readable block instead of a thin strip. */
  .opening__box :global(.chips) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 46rem;
  }

  @media (width < 44rem) {
    .opening__box :global(.chips) { grid-template-columns: 1fr; }
  }

  .steps { display: grid; }

  .step {
    padding-block: var(--section);
    border-top: var(--hairline) solid var(--rule-soft);
    animation: step-in var(--dur-slow) var(--ease-out) both;
  }

  .step:first-child { border-top-color: var(--rule); }

  .grid { display: grid; gap: var(--s-6); }

  .marker {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    color: var(--accent);
    letter-spacing: 0.1em;
  }

  h2 {
    margin-top: var(--s-3);
    font-size: var(--t-2xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 400;
    max-width: 20ch;
  }

  .missed {
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 350;
    font-style: italic;
    color: var(--ink-faint);
  }

  /* Editorial two-column: the question holds a narrow left column and
     the answer runs beside it, so a wide screen reads as a spread
     rather than a narrow strip with empty space to its right. */
  @media (width >= 64rem) {
    .grid {
      grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
      gap: var(--s-7);
      align-items: start;
    }

    /* Answers get a slightly wider measure than the default: beside a
       heading column, 34rem leaves the spread looking under-filled. */
    .body { --measure: 38rem; }

    .head { position: sticky; top: 5.5rem; }

    h2 { font-size: var(--t-xl); max-width: 16ch; }
  }

  .tail {
    padding-bottom: var(--section);
    display: flex;
    justify-content: center;
  }

  @keyframes step-in {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: none; }
  }
</style>
