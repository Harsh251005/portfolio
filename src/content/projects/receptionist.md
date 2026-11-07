---
stack: ["Python", "LiveKit", "Sarvam", "ElevenLabs", "OpenAI", "FastAPI", "Postgres", "Next.js"]
facts:
  - value: "Hindi first"
    label: "Callers can mix in English words, the way people really talk. Marathi and English are next."
  - value: "Confirmed first"
    label: "Every booking change is confirmed with the caller, and the code enforces it, not the prompt."
  - value: "₹ per call"
    label: "What every call costs is tracked in rupees, against the vendors' own bills."
build:
  - step: "The call"
    does: "The patient opens the clinic's call page and talks in Hindi."
    tools: ["Browser", "WebRTC"]
  - step: "Live audio"
    does: "Carries the voice both ways, in a fresh room for every call."
    tools: ["LiveKit"]
  - step: "Listen, think, speak"
    does: "Knows when the caller has finished, writes it down, decides, and answers out loud."
    tools: ["Python", "Silero VAD", "Sarvam"]
  - step: "Booking rules"
    does: "Free slots, the read-back and the caller's yes are checked in code, not the prompt."
    tools: ["Python", "Postgres"]
  - step: "Clinic screen"
    does: "Staff see every booking, and what was said on every call."
    tools: ["FastAPI", "Next.js"]
demo:
  kind: "call"
  title: "Listen in on a call."
  lead: "Play one example call a turn at a time. Watch what is working at each step, then try to make it break its own rule."
---

## How a call works

The caller starts talking in Hindi, mixing in English words the way people do.
The audio travels over LiveKit to a Python worker that listens, decides what the
caller wants, uses the booking tools and answers out loud, one turn at a time.
Marathi and English are already built and switched off for now: they go live
once they sound as natural as the Hindi.

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
