---
question: "What do you actually do all day?"
short: "What I do"
aliases: ["what is your job", "what do you work on", "what is an ai engineer", "what do you build", "tell me about your work"]
group: short-version
card: story
featured: true
order: 1
followups: ["three-am-problem", "show-me-something"]
---

I teach computers to do the jobs that used to need a person sitting there.

Answering the phone. Reading through a stack of documents to find the one line
that matters. Writing code. Chasing an overdue payment without being rude about
it.

The part people expect to be hard — making it work at all — usually isn't. You
can get something impressive running in an afternoon. The hard part is making it
work at three in the morning, on the four hundredth call, when the person on the
other end says something nobody planned for.

That gap is most of my job.

:::more[What that means technically]
Day to day this is agent engineering: orchestrating language models into systems
that hold state, call tools, recover from their own failures, and stay inside
hard business rules. Mostly Python — LangGraph, LiveKit, retrieval pipelines,
structured outputs, evaluation harnesses. The interesting design work is almost
always about constraining the model, not prompting it better.
:::
