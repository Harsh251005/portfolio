---
question: "Show me something you built"
short: "The receptionist"
aliases: ["projects", "what have you built", "show me your work", "portfolio", "what have you made"]
group: things-built
card: project
featured: true
order: 1
tagline: "A receptionist that never sleeps"
plain: "You call a clinic. It picks up on the first ring, understands what you want, and books you in. It is not a person."
followups: ["accents-question", "code-that-fixes-itself"]
---

Small clinics lose appointments for a boring reason: one person is on reception,
and when they are with a patient the phone rings out. The caller doesn't leave a
message. They call a different clinic.

So I'm building something that picks up instead. It listens, it understands what
you're asking for, it talks back, and it books the appointment. In your language,
at your pace, at eleven at night.

I'm in the middle of this one right now — the conversation loop works, and the
rest is being built stage by stage. I'd rather tell you that than show you a
finished thing that isn't.

:::more[How it's put together]
A realtime voice pipeline: speech-to-text streaming in, a language model deciding
what to say, text-to-speech streaming back out, with turn-taking handled by the
speech recogniser's own endpointing rather than a separate voice-activity
detector — running two of those against each other causes double-triggered
interruptions.

Every vendor sits behind a builder function returning the framework's own
interface, selected by an environment variable, so swapping the speech or
language provider is a one-line change and no other file knows which one is in
use.
:::
