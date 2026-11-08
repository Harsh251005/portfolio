<script lang="ts">
  import { appear } from '../../lib/motion/gentle';
  /* The code-fixer's loop, run in front of you. Pick a bug it can fix or one
     it can't and press Run: it writes, saves, runs, and on a failure the
     Critic reads the error and sends the broken files back. After the first
     run it gets five fixes, then it stops (route_from_critic_to_coder in the
     repo). The bugs are made up; the loop and the limit are the real ones. */

  const STAGES = ['Coder', 'Writer', 'Executor', 'Critic'];
  const MAX = 5; // fix attempts after the first run

  interface Scenario { label: string; fails: string[] }
  const SCENARIOS: Record<string, Scenario> = {
    fixable: {
      label: 'A bug it can fix',
      fails: ["ModuleNotFoundError: No module named 'flask'", "NameError: name 'app' is not defined"],
    },
    stuck: {
      label: 'A bug it cannot fix',
      fails: Array(MAX + 1).fill('PermissionError: cannot open /secure/data.db'),
    },
  };

  let kind = $state<'fixable' | 'stuck'>('fixable');
  let running = $state(false);
  let stage = $state(-1);
  let fixes = $state(0);
  let log = $state<{ tone: 'info' | 'bad' | 'good' | 'stop'; text: string }[]>([]);
  let result = $state<'' | 'pass' | 'stop'>('');
  let token = 0;
  let logEl: HTMLElement | undefined = $state();

  // Keep the newest line in view as the log fills.
  $effect(() => {
    log.length;
    logEl?.scrollTo({ top: logEl.scrollHeight, behavior: 'smooth' });
  });

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function run() {
    const mine = ++token;
    const sc = SCENARIOS[kind];
    running = true; result = ''; log = []; fixes = 0; stage = -1;
    const alive = () => mine === token;
    const say = (tone: 'info' | 'bad' | 'good' | 'stop', text: string) => (log = [...log, { tone, text }]);

    for (let n = 0; n <= MAX; n++) {
      if (n > 0) fixes = n;
      stage = 0; say('info', n === 0 ? 'Coder: writes the project from the description' : `Coder: fix ${n} of ${MAX}, rewrites only the files the Critic flagged`);
      await wait(750); if (!alive()) return;
      stage = 1; say('info', 'Writer: saves the files'); await wait(550); if (!alive()) return;
      stage = 2; say('info', 'Executor: runs the project in a sealed box'); await wait(750); if (!alive()) return;

      const err = sc.fails[n];
      if (!err) { say('good', 'Ran without errors. Done.'); result = 'pass'; break; }
      say('bad', err);
      stage = 3; say('info', 'Critic: reads the error and flags the broken files'); await wait(650); if (!alive()) return;
      if (n === MAX) {
        say('stop', `That was fix ${MAX} of ${MAX}. It stops and tells you it gave up, instead of paying to try again.`);
        result = 'stop';
        break;
      }
      say('info', 'Critic: sends them back to the Coder'); await wait(550); if (!alive()) return;
    }
    stage = -1; running = false;
  }

  function pick(k: 'fixable' | 'stuck') { token++; kind = k; running = false; stage = -1; fixes = 0; log = []; result = ''; }
</script>

<div class="demo glass" aria-label="The code fixer running a loop">
  <div class="picker" role="group" aria-label="Choose what goes wrong">
    {#each Object.entries(SCENARIOS) as [k, sc] (k)}
      <button class:on={kind === k} onclick={() => pick(k as 'fixable' | 'stuck')} disabled={running}>{sc.label}</button>
    {/each}
  </div>

  <div class="ring" aria-hidden="true">
    {#each STAGES as s, i (s)}
      <div class="stage" class:on={stage === i}><span class="n">{i + 1}</span>{s}</div>
      {#if i < STAGES.length - 1}<span class="arrow">→</span>{/if}
    {/each}
    <span class="back" class:on={stage === 3}>↺ back to the Coder</span>
  </div>

  <div class="tries" aria-label={`Fix ${fixes} of ${MAX}`}>
    <span class="lab">Fixes</span>
    {#each Array(MAX) as _, i (i)}
      <span class="dot" class:used={fixes > i} class:cur={fixes === i + 1 && running}></span>
    {/each}
    <span class="count">{fixes} of {MAX}</span>
  </div>

  <ul class="log" aria-live="polite" bind:this={logEl}>
    {#each log as l, i (i)}<li class={l.tone}>{l.text}</li>{/each}
    {#if log.length === 0}<li class="info idle">Press Run to watch it work.</li>{/if}
  </ul>

  <div class="controls">
    <button class="go" onclick={run} disabled={running}>{result ? 'Run it again' : running ? 'Running…' : 'Run'} <span aria-hidden="true">→</span></button>
    {#if result === 'pass'}<span class="out good" in:appear>{fixes === 0 ? 'Worked first time.' : `Fixed after ${fixes} ${fixes === 1 ? 'fix' : 'fixes'}.`}</span>{/if}
    {#if result === 'stop'}<span class="out stop" in:appear>Stopped. It said so.</span>{/if}
  </div>
  <p class="tag">A replay with made-up bugs. The loop and the five-fix limit are how it really works.</p>
</div>

<style>
  .demo { padding: var(--s-5); display: grid; gap: var(--s-4); }
  .picker { display: flex; flex-wrap: wrap; gap: var(--s-2); }
  button { min-height: var(--tap); padding: 0 var(--s-5); border-radius: 999px; font: inherit; font-variation-settings: 'wght' 600; font-size: var(--t-sm); cursor: pointer; background: transparent; color: var(--ink); border: 1px solid var(--glass-border); transition: background-color 200ms, color 200ms, border-color 200ms; }
  button:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  button.on { background: color-mix(in oklab, var(--accent) 22%, transparent); border-color: var(--accent); color: var(--accent); }
  button:disabled { opacity: 0.55; cursor: default; }
  .go { background: var(--accent); color: var(--paper); border-color: var(--accent); }
  .go:hover:not(:disabled) { background: var(--ink); border-color: var(--ink); color: var(--paper); }

  .ring { position: relative; display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2) var(--s-3); padding-bottom: var(--s-5); }
  .stage { display: inline-flex; align-items: center; gap: var(--s-2); padding: var(--s-2) var(--s-4); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); color: var(--ink-soft); transition: all 260ms var(--ease); }
  .stage .n { font-family: var(--font-label); font-size: var(--t-xs); color: var(--ink-faint); }
  .stage.on { color: var(--ink); border-color: var(--accent); background: color-mix(in oklab, var(--accent) 18%, transparent); box-shadow: 0 0 18px color-mix(in oklab, var(--accent) 40%, transparent); transform: translateY(-2px); }
  .arrow { color: var(--ink-faint); }
  .back { position: absolute; right: 0; bottom: 0; font-size: var(--t-xs); font-family: var(--font-label); letter-spacing: 0.08em; color: var(--ink-faint); transition: color 260ms; }
  .back.on { color: var(--accent); }

  .tries { display: flex; align-items: center; gap: var(--s-2); }
  .lab { font-family: var(--font-label); font-size: var(--t-xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-right: var(--s-2); }
  .dot { width: 14px; height: 14px; border-radius: 50%; border: 1.5px solid var(--glass-border); transition: all 260ms var(--ease); }
  .dot.used { background: var(--accent); border-color: var(--accent); }
  .dot.cur { box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 30%, transparent); }
  .count { margin-left: var(--s-2); color: var(--ink-soft); font-size: var(--t-sm); }

  .log { list-style: none; margin: 0; padding: var(--s-4); display: grid; gap: var(--s-2); height: 14rem; overflow-y: auto; align-content: start; background: rgba(5, 8, 18, 0.55); border-radius: var(--radius-lg); font-family: var(--font-mono); font-size: var(--t-xs); }
  .log li { animation: slide 320ms var(--ease-out) both; color: var(--ink-soft); }
  .log .bad { color: #ff9f8f; }
  .log .good { color: #9fe3b0; }
  .log .stop { color: var(--accent); }
  .log .idle { color: var(--ink-faint); }

  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-4); }
  .out { font-variation-settings: 'wght' 600; }
  .out.good { color: #9fe3b0; }
  .out.stop { color: var(--accent); }
  .tag { color: var(--ink-faint); font-size: var(--t-xs); }

  @keyframes slide { from { opacity: 0; transform: translateX(-8px); } }
  @media (prefers-reduced-motion: reduce) { .log li { animation: none; } .stage, .dot { transition: none; } }
  @media (width >= 52rem) { .demo { padding: var(--s-6); } }
</style>
