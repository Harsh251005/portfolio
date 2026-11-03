<script lang="ts">
  /* A line of text that arrives the way a language model writes it:
     in small pieces, at uneven speed, a beat longer after a full
     stop. The newest piece is briefly lit, then settles.

     Pure CSS, no script. Every piece is real text in the page from
     the start; the entrance is a CSS animation that only runs when
     the page has marked itself as running script (`.js` on <html>),
     so no-JS visitors, reduced-motion visitors and search engines
     all just get the sentence.

     Long words are cut into two pieces, which is what a model's
     tokeniser does to them, and why a word can appear in halves. */

  interface Part {
    text: string;
    /** Draw a highlighter stroke under this part once it has arrived. */
    mark?: boolean;
  }

  let { parts, start = 600 }: { parts: Part[]; start?: number } = $props();

  interface Tok {
    text: string;
    at: number;
  }

  function pieces(word: string): string[] {
    const letters = word.replace(/[^A-Za-z]/g, '').length;
    if (letters <= 7) return [word];
    const cut = Math.ceil(word.length / 2);
    return [word.slice(0, cut), word.slice(cut)];
  }

  /** Uneven but repeatable, so the sentence streams the same way on
   *  every visit. */
  const jitter = (i: number) => ((i * 7919) % 13) / 13;

  const built = $derived.by(() => {
    let t = start;
    let i = 0;
    return parts.map((part) => {
      const toks: Tok[] = [];
      const words = part.text.match(/\S+\s*/g) ?? [];
      for (const word of words) {
        for (const piece of pieces(word)) {
          toks.push({ text: piece, at: Math.round(t) });
          t += 42 + jitter(i++) * 70;
        }
        if (/[.,;:—]\s*$/.test(word)) t += 230;
      }
      return { toks, mark: part.mark ?? false, end: Math.round(t) };
    });
  });
</script>

<span class="stream">
  {#each built as part, p (p)}
    {#if part.mark}
      <span class="hl" style={`--hd:${part.end + 120}ms`}>
        {#each part.toks as tok, k (k)}<span class="tok" style={`--d:${tok.at}ms`}>{tok.text}</span>{/each}
      </span>
    {:else}
      {#each part.toks as tok, k (k)}<span class="tok" style={`--d:${tok.at}ms`}>{tok.text}</span>{/each}
    {/if}
  {/each}
</span>

<style>
  .tok {
    border-radius: 3px;
    padding-inline: 0.04em;
    margin-inline: -0.04em;
  }

  .hl {
    background-image: linear-gradient(
      transparent 58%,
      var(--accent-soft) 58%,
      var(--accent-soft) 94%,
      transparent 94%
    );
    background-repeat: no-repeat;
    background-size: 100% 100%;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }

  @media (prefers-reduced-motion: no-preference) {
    :global(.js) .tok {
      animation:
        tok-in 1ms linear both,
        tok-lit 800ms ease-out both;
      animation-delay: var(--d), var(--d);
    }

    :global(.js) .hl {
      background-size: 0% 100%;
      animation: hl-draw 900ms cubic-bezier(0.65, 0, 0.25, 1) forwards;
      animation-delay: var(--hd);
    }
  }

  @keyframes tok-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* The newest piece glows, then settles into the sentence. */
  @keyframes tok-lit {
    from { background-color: color-mix(in oklab, var(--accent) 38%, transparent); }
    to   { background-color: transparent; }
  }

  @keyframes hl-draw {
    from { background-size: 0% 100%; }
    to   { background-size: 100% 100%; }
  }
</style>
