<script lang="ts">
  /* The person: what I am now, then the short version.

     The headline decodes when it scrolls into view, with the same symbols
     as the name and the photo, and decodes again on hover. Then each
     column rises, a lime rule draws across its top, and its words come
     into focus one by one.

     It is all plain text from the start. Script hides it only once it can
     bring it back, a poll covers observers that never fire, and with
     reduced motion nothing is hidden. */
  import { onMount } from 'svelte';
  import Marker from './Marker.svelte';

  const HEAD = "I'm an AI engineer, building";
  const MARKED = 'agents that do real work.';

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

  const GLYPHS = '▮▯░▒▓#@$%&01<>/\\|=+*';
  /** Gap between letters, and how long each stays a symbol, in ms. */
  const STEP = 22;
  const HOLD = 420;

  const words = (s: string) => s.split(/\s+/).filter(Boolean);

  /** Letters grouped by word, numbered across the whole headline. */
  function lettered(text: string, from: number) {
    let i = from;
    return words(text).map((w) => w.split('').map((ch) => ({ ch, i: i++ })));
  }
  const headLetters = lettered(HEAD, 0);
  const markLetters = lettered(MARKED, HEAD.replace(/\s/g, '').length);

  let root: HTMLElement;
  let heading: HTMLElement;

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const letters = Array.from(heading.querySelectorAll<HTMLElement>('.ch'));
    const real = letters.map((l) => l.textContent ?? '');
    const cols = Array.from(root.querySelectorAll<HTMLElement>('.col'));
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let busy = false;

    root.classList.add('armed');

    const decode = (step: number, hold: number) => {
      if (busy) return;
      busy = true;
      // A symbol is not as wide as its letter: hold each slot still.
      letters.forEach((l) => (l.style.width = getComputedStyle(l).width));

      letters.forEach((el, i) => {
        const begin = performance.now() + i * step;
        const tick = () => {
          if (performance.now() - begin >= hold) {
            el.textContent = real[i];
            el.classList.remove('glyph');
            return;
          }
          el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          el.classList.add('glyph');
          timers.add(setTimeout(tick, 45));
        };
        timers.add(setTimeout(tick, i * step));
      });

      timers.add(
        setTimeout(() => {
          // Back to natural widths, so a later resize can't leave them stale.
          letters.forEach((l) => (l.style.width = ''));
          busy = false;
        }, letters.length * step + hold + 120),
      );
    };

    const showHeading = () => {
      if (heading.classList.contains('live')) return;
      heading.classList.add('live');
      decode(STEP, HOLD);
    };
    const showCol = (c: HTMLElement) => c.classList.add('live');

    const io = new IntersectionObserver(
      (list) =>
        list.forEach((e) => {
          if (!e.isIntersecting) return;
          if (e.target === heading) showHeading();
          else showCol(e.target as HTMLElement);
        }),
      { threshold: 0.25 },
    );
    io.observe(heading);
    cols.forEach((c) => io.observe(c));

    // Observers can fail to fire: check by hand too.
    const poll = setInterval(() => {
      const inView = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return r.top < innerHeight * 0.85 && r.bottom > 0;
      };
      if (inView(heading)) showHeading();
      cols.forEach((c) => inView(c) && showCol(c));
      if (heading.classList.contains('live') && cols.every((c) => c.classList.contains('live'))) {
        clearInterval(poll);
      }
    }, 500);

    const replay = () => decode(14, 300);
    heading.addEventListener('pointerenter', replay);

    return () => {
      io.disconnect();
      clearInterval(poll);
      timers.forEach(clearTimeout);
      heading.removeEventListener('pointerenter', replay);
    };
  });
</script>

{#snippet spelled(groups: { ch: string; i: number }[][])}
  {#each groups as group, g (g)}<span class="word"
      >{#each group as l (l.i)}<span class="ch" style={`--i:${l.i}`}>{l.ch}</span>{/each}</span
    >{' '}{/each}
{/snippet}

<div class="page about" bind:this={root}>
  <p class="label">What I do</p>

  <h2 bind:this={heading} aria-label={`${HEAD} ${MARKED}`}>
    <span aria-hidden="true">
      {@render spelled(headLetters)}
      <Marker>{@render spelled(markLetters)}</Marker>
    </span>
  </h2>

  <div class="cols">
    {#each COLUMNS as col, c (col.hook)}
      {@const hook = words(col.hook)}
      <div class="col" style={`--c:${c}`}>
        <span class="rule" aria-hidden="true"></span>
        <p>
          <strong>
            {#each hook as w, k (k)}<span class="gen" style={`--k:${k}`}>{w}</span>{' '}{/each}
          </strong>
          {#each words(col.body) as w, k (k)}<span class="gen" style={`--k:${hook.length + k}`}
              >{w}</span
            >{' '}{/each}
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

  .word { display: inline-block; white-space: nowrap; }
  .ch { display: inline-block; text-align: center; }

  /* While it is still a symbol. */
  .ch:global(.glyph) {
    font-family: var(--font-mono);
    font-variation-settings: 'wght' 500;
    color: var(--accent);
  }

  .cols {
    margin-top: var(--s-7);
    display: grid;
    gap: var(--s-6);
    font-size: var(--t-lg);
    line-height: 1.55;
    color: var(--ink-soft);
  }

  .col { padding-top: var(--s-4); position: relative; }
  .col p { max-width: 38ch; }

  .rule {
    position: absolute;
    inset: 0 0 auto;
    height: 2px;
    background: var(--accent);
    transform-origin: left;
  }

  strong {
    display: block;
    margin-bottom: var(--s-2);
    color: var(--ink);
    font-variation-settings: 'wght' 640;
  }

  /* ---------- the entrance ---------- */

  :global(.armed) h2:not(:global(.live)) .ch { opacity: 0; }

  h2:global(.live) .ch { animation: letter-in 1ms linear calc(var(--i) * 22ms) backwards; }

  @keyframes letter-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  :global(.armed) .gen { display: inline-block; }

  :global(.armed) .col:not(:global(.live)) { opacity: 0; transform: translateY(44px); }
  :global(.armed) .col:not(:global(.live)) .rule { transform: scaleX(0); }
  :global(.armed) .col:not(:global(.live)) .gen { opacity: 0; }

  .col:global(.live) {
    animation: col-rise 900ms cubic-bezier(0.2, 0.7, 0.2, 1) calc(var(--c) * 160ms) backwards;
  }

  .col:global(.live) .rule {
    animation: rule-draw 1000ms cubic-bezier(0.65, 0, 0.25, 1) calc(var(--c) * 160ms) backwards;
  }

  .col:global(.live) .gen {
    animation: focus-in 680ms cubic-bezier(0.2, 0.7, 0.2, 1) backwards;
    animation-delay: calc(var(--c) * 160ms + 240ms + var(--k) * 18ms);
  }

  @keyframes col-rise {
    from { opacity: 0; transform: translateY(44px); }
    to   { opacity: 1; transform: none; }
  }

  @keyframes rule-draw {
    from { transform: scaleX(0); }
    to   { transform: none; }
  }

  @keyframes focus-in {
    from { opacity: 0; filter: blur(5px); transform: translateY(0.4em); }
    to   { opacity: 1; filter: blur(0); transform: none; }
  }

  @media (width >= 60rem) {
    .cols { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s-7); }
  }
</style>
