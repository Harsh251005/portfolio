<script lang="ts">
  import { appear } from '../../lib/motion/gentle';
  /* TruthLens's scan, run in front of you. Pick a kind of photo and press
     Scan: face check, model score, camera data, explanation — the order in
     the repo's detector_service.dart. The rules are the real ones: above 0.5
     is fake, confidence is the distance from that side; the EXIF flags and
     risk levels follow exif_service.dart; the explanation is the app's own
     built-in text (explanation_service.dart fallback), used when there is no
     API key. The scores themselves are made up. */

  const STEPS = ['Face check', 'Model', 'Camera data', 'Explain'];

  type Risk = 'LOW' | 'MEDIUM' | 'HIGH';
  interface Photo {
    label: string;
    file: string;
    face: boolean;
    score?: number;
    risk?: Risk;
    flags?: string[];
    note?: string;
  }

  const PHOTOS: Record<string, Photo> = {
    camera: {
      label: 'Straight from a phone camera',
      file: 'JPEG, camera data inside',
      face: true, score: 0.07, risk: 'LOW', flags: [],
      note: 'Camera make and model recorded. Nothing unusual.',
    },
    forward: {
      label: 'A forwarded photo',
      file: 'JPEG, camera data stripped',
      face: true, score: 0.84, risk: 'MEDIUM',
      flags: ['No camera metadata found — unusual for a real JPEG photo'],
    },
    edited: {
      label: 'Touched up in a face app',
      file: 'JPEG, edited 3 days after it was taken',
      face: true, score: 0.64, risk: 'HIGH',
      flags: ["Processed with 'Facetune' — known AI/editing tool", 'Timestamps inconsistent — modified long after capture'],
    },
    screenshot: {
      label: 'A screenshot',
      file: 'PNG, no camera data',
      face: true, score: 0.42, risk: 'LOW', flags: [],
      note: 'Screenshots never carry camera data. Not held against it.',
    },
    noface: {
      label: 'No face in it',
      file: 'JPEG, a beach at sunset',
      face: false,
    },
  };

  /** The app's built-in explanation, word for word. */
  function explain(fake: boolean, c: number): string {
    const pct = c.toFixed(0);
    if (fake) {
      if (c > 90) return `This one is almost certainly not a real photo — the patterns here are very consistent with AI-generated faces. At ${pct}% confidence, treat this image with serious scepticism and don't share it as if it were real.`;
      if (c > 70) return `There are clear signs this image has been manipulated or generated, with ${pct}% confidence. It's worth verifying the source before trusting or sharing it.`;
      return "Something about this image doesn't quite add up, though the signal isn't strong enough to be certain. Treat it with caution and verify the source if it matters.";
    }
    if (c > 90) return `This looks like a genuine photo — nothing here suggests manipulation at ${pct}% confidence. That said, no analysis is perfect, so use your own judgement too.`;
    if (c > 70) return `This image appears real, with ${pct}% confidence. There are no strong red flags, though the reading isn't completely decisive.`;
    return "This image leans toward being authentic but the confidence is low enough that you shouldn't rely solely on this result. Worth a second look if the image is important.";
  }

  let kind = $state('camera');
  let running = $state(false);
  let step = $state(-1);   // the step lit right now
  let done = $state(-1);   // the last step finished
  let needle = $state(0.5);
  let stopped = $state(false);
  let token = 0;

  const photo = $derived(PHOTOS[kind]);
  const fake = $derived((photo.score ?? 0) > 0.5);
  const conf = $derived(photo.score === undefined ? 0 : Math.round((fake ? photo.score : 1 - photo.score) * 10000) / 100);

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  async function scan() {
    const mine = ++token;
    const alive = () => mine === token;
    running = true; stopped = false; done = -1; needle = 0.5;

    step = 0; await wait(800); if (!alive()) return;
    if (!photo.face) { stopped = true; done = 0; step = -1; running = false; return; }
    done = 0;
    step = 1; needle = photo.score!; await wait(1300); if (!alive()) return;
    done = 1;
    step = 2; await wait(900); if (!alive()) return;
    done = 2;
    step = 3; await wait(700); if (!alive()) return;
    done = 3; step = -1; running = false;
  }

  function pick(k: string) { token++; kind = k; running = false; step = -1; done = -1; needle = 0.5; stopped = false; }
</script>

<div class="demo glass" aria-label="TruthLens scanning a photo">
  <div class="picker" role="group" aria-label="Choose a photo">
    {#each Object.entries(PHOTOS) as [k, p] (k)}
      <button class:on={kind === k} onclick={() => pick(k)} disabled={running}>{p.label}</button>
    {/each}
  </div>

  <p class="file"><span class="lab">The file</span>{photo.file}</p>

  <ol class="steps" aria-hidden="true">
    {#each STEPS as s, i (s)}
      <li class:on={step === i} class:done={done >= i && !(stopped && i === 0)} class:fail={stopped && i === 0}>{s}</li>
    {/each}
  </ol>

  <div class="panes">
    <section class="pane">
      <h3>Model score</h3>
      <div class="meter" role="img" aria-label={done >= 1 ? `Score ${photo.score} of 1` : 'Not scored yet'}>
        <span class="half" aria-hidden="true"></span>
        <span class="needle" class:shown={step >= 1 || done >= 1} style={`--x: ${needle * 100}%`} aria-hidden="true"></span>
      </div>
      <div class="ends" aria-hidden="true"><span>0 real</span><span>0.5</span><span>fake 1</span></div>
      {#if stopped}
        <p class="verdict stop" in:appear>No human face detected. Please upload a clear face photo.</p>
      {:else if done >= 1}
        <p class="verdict" class:fake in:appear><strong>{fake ? 'FAKE' : 'REAL'}</strong> · {conf}% sure <span class="raw">(score {photo.score?.toFixed(2)})</span></p>
      {:else}
        <p class="verdict idle">{running ? 'Checking…' : 'Press Scan.'}</p>
      {/if}
    </section>

    <section class="pane">
      <h3>Camera data {#if done >= 2}<span class={`risk ${photo.risk?.toLowerCase()}`} in:appear>{photo.risk} risk</span>{/if}</h3>
      {#if done >= 2}
        <ul class="flags" in:appear>
          {#each photo.flags ?? [] as f (f)}<li>{f}</li>{/each}
          {#if photo.note}<li class="ok">{photo.note}</li>{/if}
        </ul>
      {:else}
        <p class="idle">{stopped ? 'Skipped: no face, no verdict.' : 'Not read yet.'}</p>
      {/if}
    </section>
  </div>

  <blockquote class="why" class:shown={done >= 3}>
    {#if done >= 3}<p in:appear>{explain(fake, conf)}</p>{:else}<p class="idle">The plain-words reason appears here.</p>{/if}
  </blockquote>

  <div class="controls">
    <button class="go" onclick={scan} disabled={running}>{done >= 0 ? 'Scan again' : running ? 'Scanning…' : 'Scan'} <span aria-hidden="true">→</span></button>
  </div>
  <p class="tag">Made-up scores. The steps, the 0.5 line, the flags and the reason text are the app's real ones.</p>
</div>

<style>
  .demo { padding: var(--s-5); display: grid; gap: var(--s-4); }
  .picker { display: flex; flex-wrap: wrap; gap: var(--s-2); }
  button { min-height: var(--tap); padding: 0 var(--s-5); border-radius: 999px; font: inherit; font-variation-settings: 'wght' 600; font-size: var(--t-sm); cursor: pointer; background: transparent; color: var(--ink); border: 1px solid var(--glass-border); transition: background-color 200ms, color 200ms, border-color 200ms; }
  @media (hover: hover) { button:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); } }
  button.on { background: color-mix(in oklab, var(--accent) 22%, transparent); border-color: var(--accent); color: var(--accent); }
  button:disabled { opacity: 0.55; cursor: default; }
  .go { background: var(--accent); color: var(--paper); border-color: var(--accent); }
  @media (hover: hover) { .go:hover:not(:disabled) { background: var(--ink); border-color: var(--ink); color: var(--paper); } }

  .lab { font-family: var(--font-label); font-size: var(--t-xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); margin-right: var(--s-3); }
  .file { color: var(--ink-soft); font-size: var(--t-sm); }

  .steps { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-3); }
  .steps li { padding: var(--s-2) var(--s-4); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); color: var(--ink-soft); transition: all 260ms var(--ease); }
  .steps li.on { color: var(--ink); border-color: var(--accent); background: color-mix(in oklab, var(--accent) 18%, transparent); box-shadow: 0 0 18px color-mix(in oklab, var(--accent) 40%, transparent); transform: translateY(-2px); }
  .steps li.done { color: var(--ink); border-color: color-mix(in oklab, var(--accent) 55%, transparent); }
  .steps li.fail { color: #ff9f8f; border-color: #ff9f8f; }

  .panes { display: grid; gap: var(--s-4); }
  .pane { padding: var(--s-4); background: rgba(5, 8, 18, 0.55); border-radius: var(--radius-lg); display: grid; gap: var(--s-3); align-content: start; min-height: 9.5rem; }
  h3 { display: flex; align-items: center; gap: var(--s-3); font-family: var(--font-label); font-size: var(--t-xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-faint); font-weight: normal; }

  .meter { position: relative; height: 10px; border-radius: 999px; background: linear-gradient(90deg, #9fe3b0 0%, color-mix(in oklab, var(--ink) 30%, transparent) 50%, #ff9f8f 100%); opacity: 0.85; }
  .half { position: absolute; left: 50%; top: -6px; bottom: -6px; width: 1px; background: var(--ink); }
  .needle { position: absolute; left: var(--x); top: 50%; width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px color-mix(in oklab, var(--accent) 30%, transparent); opacity: 0; transition: left 1100ms var(--ease-out), opacity 200ms; }
  .needle.shown { opacity: 1; }
  .ends { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: var(--t-xs); color: var(--ink-faint); }

  .verdict { color: #9fe3b0; }
  .verdict.fake { color: #ff9f8f; }
  .verdict.stop { color: var(--accent); }
  .verdict strong { font-variation-settings: 'wght' 700; letter-spacing: 0.04em; }
  .raw { color: var(--ink-faint); font-size: var(--t-xs); font-family: var(--font-mono); }
  .idle, .verdict.idle { color: var(--ink-faint); font-size: var(--t-sm); }

  .risk { padding: 0.15rem 0.55rem; border-radius: 999px; border: 1px solid currentColor; letter-spacing: 0.06em; }
  .risk.low { color: #9fe3b0; }
  .risk.medium { color: var(--accent); }
  .risk.high { color: #ff9f8f; }
  .flags { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s-2); font-family: var(--font-mono); font-size: var(--t-xs); color: #ff9f8f; }
  .flags .ok { color: var(--ink-soft); }

  .why { margin: 0; padding: var(--s-4) var(--s-5); border-left: 3px solid var(--glass-border); transition: border-color 300ms; min-height: 5.5rem; }
  .why.shown { border-color: var(--accent); }
  .why p { color: var(--ink); font-size: var(--t-base); line-height: 1.5; max-width: 62ch; }
  .why p.idle { color: var(--ink-faint); font-size: var(--t-sm); }

  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-4); }
  .tag { color: var(--ink-faint); font-size: var(--t-xs); }

  @media (prefers-reduced-motion: reduce) { .needle, .steps li { transition: none; } }
  @media (width >= 52rem) { .demo { padding: var(--s-6); } .panes { grid-template-columns: 1fr 1fr; } }
</style>
