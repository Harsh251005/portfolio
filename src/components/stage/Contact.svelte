<script lang="ts">
  /* The end of the page. One instruction, three links, nothing else.

     The heading letters lift on hover — the only decorative motion in
     the section, and it points at the thing you are meant to click. */
  import TextReveal from './TextReveal.svelte';
  import Reveal from './Reveal.svelte';
  import Glass from './Glass.svelte';
  import type { Link } from '../../lib/links';

  let { links }: { links: Link[] } = $props();
</script>

<div class="page wrap">
  <p class="label"><span class="bar" aria-hidden="true"></span>Talk to me</p>

  <TextReveal text="Tell me what the problem actually is." tag="h2" />

  <Reveal delay={140}>
    <p class="sub">
      Not just the stack. I'll tell you honestly whether I'm the right person
      for it — including when I'm not.
    </p>

    <Glass class="links-panel" lift={false}>
    <ul class="links">
      {#each links as link (link.label)}
        <li>
          {#if link.href}
            <a href={link.href} rel={link.external ? 'noreferrer noopener me' : undefined}>
              <span class="what">{link.label}</span>
              <span class="arrow" aria-hidden="true">→</span>
            </a>
          {:else}
            <span class="missing">
              <span class="what">{link.label}</span>
              <span class="todo">⟨ missing ⟩</span>
            </span>
          {/if}
        </li>
      {/each}
    </ul>
    </Glass>
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

  :global(.links-panel) { margin-top: var(--s-7); max-width: 44rem; }
  :global(.links-panel .inner) { padding-inline: var(--s-5); }

  .links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
  }

  li + li { border-top: 1px solid var(--rule-soft); }

  a, .missing {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-4);
    padding-block: var(--s-5);
    min-height: var(--tap);
    text-decoration: none;
    color: var(--ink);
    transition: color 320ms var(--ease), padding-left 420ms var(--ease-out);
  }

  a:hover { color: var(--accent); padding-left: var(--s-4); }

  .what {
    font-family: var(--font-display);
    font-size: var(--t-xl);
    font-variation-settings: 'opsz' var(--opsz-display), 'wght' 380;
  }

  .arrow { transition: transform 420ms var(--ease-out); }
  a:hover .arrow { transform: translateX(6px); }

  .missing { color: var(--ink-faint); }
</style>
