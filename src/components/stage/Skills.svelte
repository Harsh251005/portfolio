<script lang="ts">
  /* Skills as a map, the way a model lays out meaning: things that belong
     together sit close together. It starts as noise, and scrolling pulls
     the dots into labelled clusters. Hover or tap a skill and it reaches
     out to its nearest neighbours.

     The grouping is hand-made from the resume and the voice project, not computed
     by a model.

     The skills are real lists from the start, shown as plain groups.
     Script turns that into the map only once it is running, and with
     reduced motion it stays as the lists. */
  import { onMount } from 'svelte';
  import Marker from './Marker.svelte';
  import { skyBridge } from '../../lib/scene/sea';

  const GROUPS = [
    { name: 'Agents', skills: ['LangGraph', 'LangChain', 'OpenAI Agents SDK', 'MCP', 'Agentic workflows', 'Pydantic'] },
    { name: 'Retrieval', skills: ['RAG pipelines', 'Hybrid search', 'BM25', 'Reranking', 'Qdrant', 'Pinecone', 'ChromaDB'] },
    { name: 'Voice', skills: ['LiveKit', 'Sarvam', 'ElevenLabs', 'Speech-to-text', 'Text-to-speech'] },
    { name: 'Models & evals', skills: ['OpenAI API', 'Groq', 'Hugging Face', 'Sentence-Transformers', 'Prompt engineering', 'LangSmith'] },
    { name: 'Build & ship', skills: ['Python', 'SQL', 'FastAPI', 'Streamlit', 'Docker', 'Git', 'Render', 'Railway'] },
  ];

  const MOON = '#f3dfae';
  /** Dots per skill that fill out each cloud. */
  const CLOUD = 26;
  /** The same, when the dots are real stars: fewer, so the sky stays a sky. */
  const CLOUD_STARS = 6;
  /** How many neighbours a skill reaches for. */
  const NEAREST = 3;

  let root: HTMLElement;
  let map: HTMLElement;
  let canvas: HTMLCanvasElement;

  interface Dot { sx: number; sy: number; tx: number; ty: number; ph: number; delay: number; anchor: boolean; star: number; s0: number; sp: number }
  interface Box { el: HTMLElement; x: number; y: number; w: number; h: number; c: number; title: boolean }

  onMount(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

    root.classList.add('armed');

    const skillEls = Array.from(map.querySelectorAll<HTMLElement>('.skill'));
    const titleEls = Array.from(map.querySelectorAll<HTMLElement>('.gname'));

    let W = 0;
    let H = 0;
    let pinned = false;
    let dots: Dot[] = [];
    let skills: Box[] = [];
    let near: number[][] = [];
    let edges: Array<[number, number]> = [];
    let lastWidth = -1;
    /** Pinned: the dots are real sky stars, borrowed while the section holds. */
    let starMode = false;
    let seen = -1;
    let owned = false;

    /** Spreads the labels apart around their cluster centres. Same input, same map. */
    const relax = (boxes: Box[], centres: { x: number; y: number }[]) => {
      for (let step = 0; step < 240; step++) {
        for (let i = 0; i < boxes.length; i++) {
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i];
            const b = boxes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const ox = (a.w + b.w) / 2 + 20 - Math.abs(dx);
            const oy = (a.h + b.h) / 2 + 14 - Math.abs(dy);
            if (ox <= 0 || oy <= 0) continue;
            if (ox < oy) {
              const s = (dx >= 0 ? 1 : -1) * ox * 0.5;
              a.x -= s;
              b.x += s;
            } else {
              const s = (dy >= 0 ? 1 : -1) * oy * 0.5;
              a.y -= s;
              b.y += s;
            }
          }
        }
        for (const b of boxes) {
          b.x += (centres[b.c].x - b.x) * (b.title ? 0.12 : 0.006);
          b.y += (centres[b.c].y - b.y) * (b.title ? 0.12 : 0.006);
          b.x = Math.min(W - b.w / 2, Math.max(b.w / 2, b.x));
          b.y = Math.min(H - b.h / 2, Math.max(b.h / 2, b.y));
        }
      }
    };

    const layout = () => {
      const wide = innerWidth >= 960;
      pinned = wide && innerHeight >= 680;
      root.classList.toggle('pinned', pinned);

      // Narrow: clusters stack, and the map is as tall as they need.
      if (wide) {
        map.style.height = '';
      } else {
        map.style.height = `${GROUPS.reduce((n, g) => n + 104 + g.skills.length * 19, 0)}px`;
      }

      W = map.clientWidth;
      H = map.clientHeight;
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let y = 0;
      const centres = GROUPS.map((g, c) => {
        if (wide) {
          const spots = [[0.15, 0.27], [0.5, 0.2], [0.85, 0.28], [0.29, 0.76], [0.74, 0.77]];
          return { x: W * spots[c][0], y: H * spots[c][1] };
        }
        const band = 104 + g.skills.length * 19;
        const at = { x: W / 2, y: y + band / 2 };
        y += band;
        return at;
      });

      const boxes: Box[] = [];
      titleEls.forEach((el, c) => {
        boxes.push({ el, x: centres[c].x, y: centres[c].y, w: el.offsetWidth, h: el.offsetHeight, c, title: true });
      });
      let e = 0;
      skills = [];
      GROUPS.forEach((g, c) => {
        g.skills.forEach((_, k) => {
          const el = skillEls[e++];
          const angle = (k + c) * 2.4;
          const r = 46 + 22 * Math.sqrt(k + 1);
          const box: Box = {
            el,
            x: centres[c].x + Math.cos(angle) * r * 1.8,
            y: centres[c].y + Math.sin(angle) * r,
            w: el.offsetWidth,
            h: el.offsetHeight,
            c,
            title: false,
          };
          boxes.push(box);
          skills.push(box);
        });
      });

      relax(boxes, centres);
      boxes.forEach((b) => {
        b.el.style.left = `${(b.x - b.w / 2).toFixed(1)}px`;
        b.el.style.top = `${(b.y - b.h / 2).toFixed(1)}px`;
      });

      /* ---- who is near whom ---- */
      const anchor = (b: Box) => ({ x: b.x - b.w / 2 + 4, y: b.y });
      near = skills.map((a, i) => {
        const pa = anchor(a);
        return skills
          .map((b, j) => {
            const pb = anchor(b);
            return { j, d: Math.hypot(pa.x - pb.x, pa.y - pb.y) };
          })
          .filter((o) => o.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, NEAREST)
          .map((o) => o.j);
      });
      edges = [];
      near.forEach((list, i) => {
        list.slice(0, 2).forEach((j) => {
          if (skills[i].c === skills[j].c) edges.push([i, j]);
        });
      });

      /* ---- the dots: noise anywhere, then a place in a cloud ---- */
      dots = skills.map((b) => {
        const p = anchor(b);
        return {
          sx: Math.random() * W,
          sy: Math.random() * H,
          tx: p.x,
          ty: p.y,
          ph: Math.random() * 6.28,
          delay: Math.random(),
          anchor: true,
          star: -1,
          s0: 0,
          sp: 0,
        };
      });
      GROUPS.forEach((g, c) => {
        const reach = Math.max(80, Math.min(W, H) * 0.3);
        for (let i = 0; i < g.skills.length * (pinned ? CLOUD_STARS : CLOUD); i++) {
          // Roughly bell-shaped, wider than tall like the labels.
          const gx = (Math.random() + Math.random() + Math.random()) / 1.5 - 1;
          const gy = (Math.random() + Math.random() + Math.random()) / 1.5 - 1;
          dots.push({
            sx: Math.random() * W,
            sy: Math.random() * H,
            tx: Math.min(W, Math.max(0, centres[c].x + gx * reach * 1.7)),
            ty: Math.min(H, Math.max(0, centres[c].y + gy * reach)),
            ph: Math.random() * 6.28,
            delay: Math.random(),
            anchor: false,
            star: -1,
            s0: 0,
            sp: 0,
          });
        }
      });
      borrowStars();
    };

    /** Hands real sky stars to the dots, so they start out as ordinary stars. */
    const borrowStars = () => {
      starMode = false;
      seen = skyBridge.version;
      owned = false;
      skyBridge.taken = new Set();
      if (!pinned || !skyBridge.stars.length) return;
      const stage = root.querySelector<HTMLElement>('.stage')!;
      const mr = map.getBoundingClientRect();
      const ox = mr.left;
      const oy = mr.top - stage.getBoundingClientRect().top;
      const free: number[] = [];
      skyBridge.stars.forEach((s, i) => {
        const x = s.x - ox;
        const y = s.y - oy;
        if (x >= 0 && x <= W && y >= 0 && y <= H && s.y < skyBridge.hz - 6) free.push(i);
      });
      if (free.length < skills.length) return;
      const used = new Set<number>();
      const give = (d: Dot, i: number) => {
        const s = skyBridge.stars[i];
        used.add(i);
        d.star = i;
        d.sx = s.x - ox;
        d.sy = s.y - oy;
        d.s0 = s.s;
        d.sp = s.sp;
        d.ph = s.ph;
      };
      // Each skill takes the free star nearest to where its label sits.
      for (let n = 0; n < skills.length; n++) {
        let best = -1;
        let bd = Infinity;
        for (const i of free) {
          if (used.has(i)) continue;
          const d = Math.hypot(skyBridge.stars[i].x - ox - dots[n].tx, skyBridge.stars[i].y - oy - dots[n].ty);
          if (d < bd) { bd = d; best = i; }
        }
        give(dots[n], best);
      }
      // The cloud around them comes from stars picked at random.
      const rest = free.filter((i) => !used.has(i)).sort(() => Math.random() - 0.5);
      for (let n = skills.length, r = 0; n < dots.length && r < rest.length; n++, r++) give(dots[n], rest[r]);
      starMode = true;
    };

    /** The stars are ours only while the section is held still on screen. */
    const syncOwner = () => {
      let on = false;
      if (starMode) {
        const r = root.getBoundingClientRect();
        on = r.top <= 0 && r.bottom >= innerHeight - 1;
      }
      if (on !== owned) {
        owned = on;
        skyBridge.taken = on ? new Set(dots.filter((d) => d.star >= 0).map((d) => d.star)) : new Set();
      }
    };

    /* ---- what the scroll asks for, and the damped follow ---- */
    let want = 0;
    let u = 0;
    const measure = () => {
      syncOwner();
      if (pinned) {
        const r = root.getBoundingClientRect();
        want = clamp((-r.top / (r.height - innerHeight) - 0.04) / 0.72);
      } else {
        const r = map.getBoundingClientRect();
        want = clamp((innerHeight * 0.9 - r.top) / (Math.min(r.height, innerHeight) * 0.75));
      }
    };

    let active = -1;
    let glow = 0;
    let raf = 0;
    let last = 0;
    let visible = false;

    const place = (d: Dot, now: number) => {
      const k = ease(clamp(u * 1.45 - d.delay * 0.45));
      const sway = d.star >= 0 ? 10 * Math.sin(Math.PI * k) + 2.5 * k : d.anchor ? 12 * (1 - k) : 12 - 9 * k;
      return {
        x: d.sx + (d.tx - d.sx) * k + Math.sin(now * 0.0007 + d.ph) * sway,
        y: d.sy + (d.ty - d.sy) * k + Math.cos(now * 0.0006 + d.ph * 1.7) * sway,
        k,
      };
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      u += (want - u) * (1 - Math.exp(-dt / 130));
      if (Math.abs(want - u) < 0.0005) u = want;
      map.style.setProperty('--v', u.toFixed(4));

      glow += ((active >= 0 ? 1 : 0) - glow) * (1 - Math.exp(-dt / 90));

      ctx.clearRect(0, 0, W, H);
      const dimmed = 1 - glow * 0.55;

      // The stars are the sky's own until the section is held in place;
      // then they are drawn here, exactly where and how the sky had them.
      if (starMode && seen !== skyBridge.version) layout();
      syncOwner();
      // Unformed and not held: nothing to draw, the sky's stars are its own.
      if (starMode && !owned && u < 0.002) {
        if (visible && !document.hidden) raf = requestAnimationFrame(frame);
        else last = 0;
        return;
      }
      // A star glows while it is on the move, each on its own schedule, and
      // settles once it has arrived.
      const glowOf = (k: number) => Math.sin(Math.PI * k) ** 1.5;
      const halo = (x: number, y: number, g: number, dim: number) => {
        if (g < 0.03) return;
        ctx.globalAlpha = 0.11 * g * dim;
        ctx.beginPath();
        ctx.arc(x, y, 2.5 + 5.5 * g, 0, 6.2832);
        ctx.fill();
        ctx.globalAlpha = 0.28 * g * dim;
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + 1.8 * g, 0, 6.2832);
        ctx.fill();
      };
      const tw = (d: Dot) => 0.4 + 0.6 * Math.sin(now * 0.001 * d.sp + d.ph) ** 2;

      // Quiet links inside each cluster, once it has formed.
      const linked = clamp((u - 0.7) * 3.4);
      if (linked > 0) {
        ctx.strokeStyle = MOON;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.34 * linked * dimmed;
        ctx.beginPath();
        for (const [i, j] of edges) {
          const a = place(dots[i], now);
          const b = place(dots[j], now);
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      }

      // The clouds and the noise they come from.
      ctx.fillStyle = MOON;
      for (let i = skills.length; i < dots.length; i++) {
        const d = dots[i];
        const p = place(d, now);
        if (d.star >= 0) {
          const size = d.s0 + (2.6 - d.s0) * p.k;
          halo(p.x, p.y, glowOf(p.k), dimmed);
          ctx.globalAlpha = (tw(d) * (1 - p.k) + (0.3 + 0.4 * Math.sin(now * 0.001 + d.ph) ** 2) * p.k) * dimmed;
          ctx.fillRect(p.x - size / 2 + ((1 - p.k) * d.s0) / 2, p.y - size / 2 + ((1 - p.k) * d.s0) / 2, size, size);
          continue;
        }
        ctx.globalAlpha = (0.3 + 0.4 * Math.sin(now * 0.001 + d.ph) ** 2) * dimmed;
        ctx.fillRect(p.x, p.y, 2.5, 2.5);
      }

      // The hovered skill reaching for its neighbours.
      if (active >= 0 && glow > 0.01) {
        const a = place(dots[active], now);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = MOON;
        ctx.globalAlpha = glow;
        ctx.beginPath();
        for (const j of near[active]) {
          const b = place(dots[j], now);
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      }

      // The skills themselves.
      for (let i = 0; i < skills.length; i++) {
        const d = dots[i];
        const p = place(d, now);
        const on = i === active || (active >= 0 && near[active].includes(i));
        const final = on ? 1 : 0.55 + 0.45 * dimmed * p.k;
        const target = on ? 9 : 5;
        if (d.star >= 0) {
          const s = d.s0 + (target - d.s0) * p.k;
          halo(p.x, p.y, glowOf(p.k), 1);
          ctx.globalAlpha = tw(d) * (1 - p.k) + final * p.k;
          ctx.fillRect(p.x - s / 2 + ((1 - p.k) * d.s0) / 2, p.y - s / 2 + ((1 - p.k) * d.s0) / 2, s, s);
          continue;
        }
        ctx.globalAlpha = final;
        ctx.fillRect(p.x - target / 2, p.y - target / 2, target, target);
      }
      ctx.globalAlpha = 1;

      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    const wake = () => {
      measure();
      if (visible && !raf) raf = requestAnimationFrame(frame);
    };

    const paintOnce = () => {
      measure();
      u = want;
      map.style.setProperty('--v', u.toFixed(4));
    };

    const setup = () => {
      layout();
      lastWidth = innerWidth;
      paintOnce();
      if (visible && !raf) raf = requestAnimationFrame(frame);
    };
    setup();
    document.fonts?.ready.then(setup);

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        wake();
      },
      { rootMargin: '10% 0px' },
    );
    io.observe(map);

    const resize = () => {
      if (innerWidth !== lastWidth || pinned) setup();
    };

    addEventListener('scroll', measure, { passive: true });
    addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', wake);

    /* ---- hover or tap a skill ---- */
    const setActive = (i: number) => {
      active = i;
      root.classList.toggle('focused', i >= 0);
      skillEls.forEach((el, k) => {
        el.classList.toggle('on', k === i);
        el.classList.toggle('near', i >= 0 && near[i].includes(k));
      });
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const el = (e.target as HTMLElement).closest<HTMLElement>('.skill');
      setActive(el ? skillEls.indexOf(el) : -1);
    };
    const leave = () => setActive(-1);
    const tap = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('.skill');
      setActive(el ? skillEls.indexOf(el) : -1);
    };
    map.addEventListener('pointerover', over);
    map.addEventListener('pointerleave', leave);
    map.addEventListener('click', tap);

    return () => {
      cancelAnimationFrame(raf);
      skyBridge.taken = new Set();
      io.disconnect();
      removeEventListener('scroll', measure);
      removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', wake);
      map.removeEventListener('pointerover', over);
      map.removeEventListener('pointerleave', leave);
      map.removeEventListener('click', tap);
    };
  });
</script>

<div class="skills" bind:this={root}>
  <div class="stage">
    <div class="page inner">
      <p class="label">Skills</p>
      <h2>What I work with, <Marker>and what goes together.</Marker></h2>
      <p class="sub">Close together means used together. Point at a skill to see its neighbours.</p>

      <div class="map" bind:this={map}>
        <canvas bind:this={canvas} aria-hidden="true"></canvas>
        {#each GROUPS as group, c (group.name)}
          <div class="group">
            <h3 class="gname" style={`--s:${0.5 + c * 0.03}`}>{group.name}</h3>
            <ul>
              {#each group.skills as skill, k (skill)}
                <li class="skill" style={`--s:${0.56 + c * 0.03 + k * 0.012}`}>{skill}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  h2 {
    margin-top: var(--s-4);
    font-size: clamp(2rem, 4vw + 1rem, 4.5rem);
    font-variation-settings: 'wght' 560;
    line-height: 1;
    letter-spacing: -0.035em;
    max-width: 17ch;
  }

  .sub { margin-top: var(--s-3); max-width: 60ch; font-size: var(--t-lg); color: var(--ink-soft); }

  .map {
    position: relative;
    margin-top: var(--s-6);
    display: grid;
    gap: var(--s-6);
  }

  canvas { display: none; }

  .gname {
    font-family: var(--font-label);
    font-size: var(--t-sm);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
  }

  ul { list-style: none; margin: var(--s-2) 0 0; padding: 0; }
  li { font-size: var(--t-base); }

  @media (width >= 40rem) {
    .map { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  /* ---------- as a map ---------- */

  :global(.armed) .map {
    display: block;
    height: 34rem;
    margin-top: var(--s-5);
    touch-action: pan-y;
  }

  :global(.armed) canvas {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  :global(.armed) .group,
  :global(.armed) ul { display: contents; }

  :global(.armed) .gname,
  :global(.armed) .skill {
    position: absolute;
    white-space: nowrap;
    opacity: clamp(0, calc((var(--v, 1) - var(--s)) * 7), 1);
    transition: color 220ms var(--ease);
    text-shadow: 0 0 8px var(--paper), 0 0 2px var(--paper);
  }

  :global(.armed) .gname {
    padding: 0.15rem 0.5rem;
    background: rgba(7, 11, 24, 0.82);
    border: 1px solid var(--accent);
    border-radius: 4px;
    pointer-events: none;
    text-shadow: none;
  }

  :global(.armed) .skill {
    padding: 0.2rem 0.3rem 0.2rem 0.85rem;
    font-size: var(--t-base);
    font-variation-settings: 'wght' 520;
    color: var(--ink);
    cursor: default;
  }

  /* One skill in focus, its neighbours lit, the rest stepping back. */
  :global(.focused) .skill { color: var(--ink-faint); }
  :global(.focused) .skill:global(.near) { color: var(--ink); }
  :global(.focused) .skill:global(.on) { color: var(--accent); font-variation-settings: 'wght' 680; }

  /* ---------- the hold ---------- */

  .skills:global(.pinned) { height: 205vh; }

  .skills:global(.pinned) .stage {
    position: sticky;
    top: 0;
    height: 100svh;
    display: flex;
    padding-block: var(--s-6) var(--s-5);
  }

  .skills:global(.pinned) .inner {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .skills:global(.pinned) h2 { font-size: clamp(2rem, 2.6vw + 1rem, 3.5rem); max-width: none; }

  .skills:global(.pinned) .map { flex: 1; height: auto; min-height: 0; }
</style>
