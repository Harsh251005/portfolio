import type { Brain, Entry } from './types';
import { createStaticBrain } from './static';
import { createLlmBrain } from './llm';

/* ---------------------------------------------------------------
   The swap point. This is the only file that decides which brain
   is answering, and it is the only file that changes when the
   real model goes in.
   --------------------------------------------------------------- */

export type { Answer, Brain, Entry } from './types';

export function createBrain(entries: Entry[]): Brain {
  const choice = import.meta.env.PUBLIC_BRAIN ?? 'static';
  return choice === 'llm' ? createLlmBrain(entries) : createStaticBrain(entries);
}
