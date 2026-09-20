<script lang="ts">
  /* Marks ⟨ draft text ⟩ inside frontmatter strings, the same way the
     remark plugin marks it inside Markdown bodies. One visual
     language for "this isn't written yet", everywhere. */
  let { text }: { text: string } = $props();
  const parts = $derived(text.split(/(⟨[^⟩]*⟩)/g).filter(Boolean));
</script>

{#each parts as part}{#if part.startsWith('⟨')}<span class="todo">{part}</span>{:else}{part}{/if}{/each}
