<script lang="ts">
  /* Tappable questions, plus an optional free-text field.
     Typing is never required — the chips alone reach the whole site,
     which is what keeps this usable on a phone. */
  import type { Entry } from '../lib/brain/types';

  let {
    chips = [],
    onpick,
    onask,
    placeholder = 'or type your own question',
    compact = false,
  }: {
    chips?: Entry[];
    onpick: (id: string) => void;
    onask: (query: string) => void;
    placeholder?: string;
    compact?: boolean;
  } = $props();

  let value = $state('');

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const query = value.trim();
    if (!query) return;
    onask(query);
    value = '';
  }
</script>

<div class="ask" class:compact>
  {#if chips.length}
    <ul class="chips">
      {#each chips as chip (chip.id)}
        <li>
          <button type="button" onclick={() => onpick(chip.id)}>
            {chip.question}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <form onsubmit={submit}>
    <label class="visually-hidden" for="ask-input">Ask a question</label>
    <input
      id="ask-input"
      type="text"
      bind:value
      {placeholder}
      autocomplete="off"
      enterkeyhint="send"
    />
    <button type="submit" aria-label="Ask">
      <span aria-hidden="true">→</span>
    </button>
  </form>
</div>

<style>
  .chips {
    list-style: none;
    padding: 0;
    display: grid;
    gap: var(--s-3);
    grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  }

  .chips button {
    width: 100%;
    height: 100%;
    min-height: 4.25rem;
    padding: var(--s-4);
    text-align: left;
    background: var(--paper-raised);
    border: var(--hairline) solid var(--rule);
    border-radius: var(--radius-lg);
    font-family: var(--font-display);
    font-size: var(--t-lg);
    font-variation-settings: 'opsz' var(--opsz-text), 'wght' 400;
    line-height: var(--leading-snug);
    color: var(--ink);
    transition:
      border-color var(--dur) var(--ease),
      transform var(--dur) var(--ease-out),
      background var(--dur) var(--ease);
  }

  .chips button:hover {
    border-color: var(--accent);
    background: var(--paper-raised);
    transform: translateY(-2px);
  }

  .chips button:active { transform: translateY(0); }

  form {
    margin-top: var(--s-5);
    display: flex;
    align-items: center;
    gap: var(--s-2);
    border-bottom: var(--hairline) solid var(--rule);
    max-width: 30rem;
    transition: border-color var(--dur) var(--ease);
  }

  form:focus-within { border-color: var(--accent); }

  input {
    flex: 1;
    min-height: var(--tap);
    padding: var(--s-2) 0;
    font-size: var(--t-base);
    color: var(--ink);
  }

  input::placeholder { color: var(--ink-faint); }

  form button {
    width: var(--tap);
    height: var(--tap);
    display: grid;
    place-items: center;
    color: var(--accent);
    font-size: var(--t-lg);
    border-radius: 50%;
  }

  .compact .chips { grid-template-columns: 1fr; }
  .compact form { margin-top: 0; }

  @media (width < 34rem) {
    .chips { grid-template-columns: 1fr; }
    .chips button { min-height: 3.5rem; font-size: var(--t-base); }
  }
</style>
