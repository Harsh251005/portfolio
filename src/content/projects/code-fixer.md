---
stack: ["Python", "LangGraph", "OpenAI API", "Pydantic", "Docker", "LangSmith"]
facts:
  - value: "5 tries"
    label: "Then it stops and says so, instead of paying to repeat the same broken fix."
  - value: "4 stages"
    label: "Write the code, save it, run it, then read what went wrong."
  - value: "Sealed box"
    label: "The code it writes runs in isolation, away from the rest of the computer."
---

## The loop

You describe an app in plain English. A graph of four stages takes it from
there:

1. **Coder** writes the project plan and every source file.
2. **Writer** saves the files to disk.
3. **Executor** runs the project and captures what it printed and how it exited.
4. **Critic** reads any failure and sends the broken files back to the coder.

A successful run ends the loop. A failed one goes round again, up to five times.

## Why it stops

A system like this, left alone, will keep trying the same broken fix and keep
costing money. So there is a hard limit, and when it is reached the agent says it
couldn't do it. Knowing when to stop is part of the design.

## Keeping it honest

The messages passed between stages are checked against fixed schemas, so a
malformed answer is caught at the boundary instead of crashing a later step. Every
decision the agent makes can be traced, step by step, in LangSmith.

<!-- Write more here: a recorded run, the bugs I hit, what I'd change. -->
