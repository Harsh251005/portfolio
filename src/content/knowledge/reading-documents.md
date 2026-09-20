---
question: "Can AI be trusted to read something important?"
short: "Trustworthy reading"
aliases: ["rag", "documents", "hallucination", "can ai be trusted", "retrieval", "document reader", "making things up"]
group: things-built
card: project
order: 4
tagline: "A reader that shows its working"
plain: "Give it a long document and ask a question. It answers — and it points at the exact lines it got the answer from. If it can't find any, it tells you, instead of inventing something."
flow:
  - "Your question"
  - "Search the document"
  - "Rank what matters"
  - "Answer"
  - "Show the source"
flowNote: "If the last step cannot find a source, there is no answer — it says so instead."
followups: ["what-i-refuse-to-do", "the-difficult-conversation"]
---

Ask a chatbot a question about a hundred-page contract and you get a fluent,
confident, plausible answer. What you don't get is any way to know whether it's
true.

For anything that actually matters — a contract, a policy, a medical record —
that's useless. Worse than useless, because it's convincing.

So this one is built the other way around. Every answer has to be anchored to
specific lines in the source document, and you can see which ones. If the
document doesn't contain the answer, the correct response is "it isn't in here"
— and getting a system to say that reliably is harder than getting it to answer.

There's also a check that runs automatically over a fixed set of questions with
known answers. If a change makes the system worse, the check fails and the change
doesn't ship. That sounds obvious. Almost nobody does it.

:::more[The pipeline]
Multi-stage retrieval: hybrid sparse and dense search, then reranking, then a
generation step constrained to cite retrieved spans. Answers that can't be
grounded are refused rather than generated.

Quality is measured on a hand-built question set covering faithfulness, answer
relevancy, context precision and recall, plus a model-as-judge pass and a check
that citations point at real spans. It runs as a gate in CI with a threshold — a
regression below it fails the build.
:::
