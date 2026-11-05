---
stack: ["Python", "LiveKit", "Sarvam", "ElevenLabs", "OpenAI", "FastAPI", "Postgres", "Next.js"]
facts:
  - value: "Hindi + English"
    label: "Callers can mix them mid-sentence, the way people really talk."
  - value: "Confirmed first"
    label: "Every booking change is confirmed with the caller, and the code enforces it, not the prompt."
  - value: "₹ per call"
    label: "What every call costs is tracked in rupees, against the vendors' own bills."
demo:
  kind: "call"
  title: "Listen in on a call."
  lead: "Play one example call a turn at a time. Watch what is working at each step, then try to make it break its own rule."
---

## How a call works

The caller picks Hindi or English in the browser and starts talking. The audio
travels over LiveKit to a Python worker that listens, decides what the caller
wants, uses the booking tools and answers out loud, one turn at a time. Each
language has its own pipeline, kept for the whole call, so the voice never
changes halfway through.

## The rules are not in the prompt

How booking works (what is free, what can be moved, what needs confirming) lives
in plain Python and is tested without any voice or model. A prompt can be
talked around. Code can't.

## Around the call

Clinic staff get a dashboard: the day at a glance, a diary with a column per
doctor, visit marks, and every call with what was said. The operator gets an
admin panel with each call's step-by-step timings, vendor errors and clinic
health. It never shows patients unless a reason is written down and logged.
Problems are flagged on every page, in plain words for the clinic and in
technical detail for the operator.

<!-- Write more here: the demo video, the voice latency story, what broke and how
     it was fixed. Anything Markdown can do works. -->
