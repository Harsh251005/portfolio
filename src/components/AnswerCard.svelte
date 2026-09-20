<script lang="ts">
  /* Picks a renderer for an entry. Adding a card type means adding a
     file in cards/ and one line to this map — nothing else in the
     site needs to know it exists. */
  import type { Entry } from '../lib/brain/types';
  import StoryCard from './cards/StoryCard.svelte';
  import ProjectCard from './cards/ProjectCard.svelte';
  import ListCard from './cards/ListCard.svelte';
  import TimelineCard from './cards/TimelineCard.svelte';
  import QuoteCard from './cards/QuoteCard.svelte';
  import CompareCard from './cards/CompareCard.svelte';

  const RENDERERS = {
    story: StoryCard,
    project: ProjectCard,
    list: ListCard,
    timeline: TimelineCard,
    quote: QuoteCard,
    compare: CompareCard,
  } as const;

  let { entry }: { entry: Entry } = $props();

  // Unknown card type falls back to prose rather than rendering nothing.
  const Card = $derived(RENDERERS[entry.card as keyof typeof RENDERERS] ?? StoryCard);
</script>

<Card {entry} />
