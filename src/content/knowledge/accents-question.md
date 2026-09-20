---
question: "Does it actually understand how people really talk?"
short: "Accents & real speech"
aliases: ["accents", "does it understand me", "indian english", "hindi", "languages", "does it work with accents"]
group: things-built
card: story
order: 2
followups: ["hardest-one", "what-i-get-wrong"]
---

This is the question that decides whether a voice system is real or a toy.

Nobody speaks the way the demo video speaks. Real callers trail off. They change
their mind halfway through a sentence. They switch between two languages inside a
single sentence — which in India is not an edge case, it's just Tuesday. They
speak over you before you've finished.

A system that only works on clean, patient, single-language speech isn't finished.
It's a prototype wearing a suit.

So the work is less about the clever part and more about all the ordinary ways a
conversation goes sideways, and making sure each one has an answer that isn't
"sorry, I didn't catch that."

:::more[The specific problems]
Code-switching between Hindi and English mid-utterance degrades transcripts badly
and tends to make the model reply in mixed script. Mitigations include
romanising the transcript before it reaches the model, so it stays in one script.

Interruption handling is the other hard one: the user speaking over the agent has
to cut playback immediately, which means streaming audio out in chunks you can
actually abandon rather than a single synthesised blob.
:::
