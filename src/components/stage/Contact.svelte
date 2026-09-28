<script lang="ts">
  /* The end of the page. One instruction, three links, nothing else.

     The heading letters lift on hover — the only decorative motion in
     the section, and it points at the thing you are meant to click. */
  import TextReveal from './TextReveal.svelte';
  import Reveal from './Reveal.svelte';
  import Glass from './Glass.svelte';
  import type { Link } from '../../lib/links';

  let { links }: { links: Link[] } = $props();

  /** What the visitor will actually reach, shown under each label —
   *  a tile that only says "Email" makes you click to find out. */
  function handle(href: string): string {
    return href.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '');
  }
</script>

<div class="page wrap">
  <p class="label"><span class="bar" aria-hidden="true"></span>Talk to me</p>

  <TextReveal text="Tell me what the problem actually is." tag="h2" />

  <Reveal delay={140}>
    <p class="sub">
      Not just the tech you use. I'll tell you honestly whether I'm the right
      person for it, including when I'm not.
    </p>

    <ul class="links">
      {#each links as link (link.label)}
        <li>
          <Glass class="tile">
            {#if link.href}
              <a href={link.href} rel={link.external ? 'noreferrer noopener me' : undefined}>
                <span class="what">{link.label}<span class="arrow" aria-hidden="true">→</span></span>
                <span class="handle">{handle(link.href)}</span>
              </a>
            {:else}
              <span class="missing">
                <span class="what">{link.label}</span>
                <span class="handle">⟨ missing ⟩</span>
              </span>
            {/if}
          </Glass>
        </li>
      {/each}
    </ul>
  </Reveal>
</div>

<style>
  .wrap { padding-block: var(--s-6); }

  .label { display: flex; align-items: center; gap: var(--s-3); }
  .bar { width: 2rem; height: 1px; background: var(--accent); }

  .wrap :global(h2) {
    margin-top: var(--s-5);
    font-family: var(--font-display);
    font-size: var(--t-3xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 400;
    line-height: 0.98;
    letter-spacing: -0.03em;
    max-width: 14ch;
  }

  .sub {
    margin-top: var(--s-5);
    font-size: var(--t-lg);
    color: var(--ink-soft);
    max-width: 38ch;
  }

  .links {
    list-style: none;
    margin: var(--s-7) 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: var(--s-4);
  }

  li :global(.tile) { height: 100%; }

  a, .missing {
    display: grid;
    gap: var(--s-2);
    padding: var(--s-5);
    min-height: var(--tap);
    text-decoration: none;
    color: var(--ink);
    transition: color 320ms var(--ease);
  }

  a:hover { color: var(--accent); }

  .what {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-family: var(--font-display);
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 380;
  }

  .handle {
    font-family: var(--font-mono);
    font-size: var(--t-xs);
    letter-spacing: 0.04em;
    color: var(--ink-soft);
    overflow-wrap: anywhere;
  }

  .arrow { font-size: var(--t-lg); transition: transform 420ms var(--ease-out); }
  a:hover .arrow { transform: translateX(6px); }

  .missing { color: var(--ink-faint); }
</style>
