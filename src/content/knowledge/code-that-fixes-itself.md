---
question: "What's the strangest thing you've built?"
short: "Code that fixes itself"
aliases: ["phoenix", "code generation", "strangest", "weirdest", "most interesting project", "code generator"]
group: things-built
card: project
order: 3
tagline: "Code that fixes its own mistakes"
plain: "You describe an app in a sentence. It writes the app, runs it, watches it break, works out why, and rewrites it. Then it tries again."
flow:
  - "You describe it"
  - "It writes code"
  - "It runs it"
  - "It breaks"
  - "It rewrites it"
flowNote: "The loop closes on itself — and gives up after five tries instead of burning money forever."
followups: ["reading-documents", "what-i-get-wrong"]
---

Describe what you want in plain English. It writes the files. It runs them.

And then the interesting part: when the thing it just wrote falls over, it reads
its own error message, works out which file caused it, and rewrites that file. It
gets a fixed number of attempts before it gives up and tells you it couldn't.

That limit matters more than it sounds. Without it, a system like this will
cheerfully burn money forever trying the same broken fix in slightly different
words. Knowing when to stop is a feature.

The generated code runs boxed off from everything else, because handing a machine
the ability to write and execute code on your actual computer is a bad idea even
when it's your own machine.

:::more[The architecture]
A four-stage graph: a coder producing a project spec and source files through
structured output, a writer committing them to disk, an executor running the
build and capturing stdout, stderr and the exit code, and a critic that reads the
failure and routes the offending files back to the coder. Capped at five repair
cycles.

Execution is isolated in a container, so a generated file that tries to touch the
host filesystem or the network simply can't.
:::
