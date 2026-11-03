---
question: "A receptionist that never sleeps"
short: "The receptionist"
aliases: ["projects", "what have you built", "show me your work", "portfolio", "what have you made", "voice agent", "clinic", "receptionist", "phone", "accents", "hindi", "does it understand accents", "languages", "hardest", "what was hardest", "most difficult thing youve built", "hardest project"]
group: things-built
card: project
featured: true
order: 1
moment: "It's nine at night. Your child has a fever, and the clinic's phone just rings and rings."
tagline: "A receptionist that never sleeps"
plain: "So I built one that always picks up. It talks to callers in Hindi or English, books, moves or cancels their appointment, and the clinic sees it on their screen."
link: "https://github.com/Harsh251005/clinic-voice-agent"
form: voice
example:
  kind: call
  caption: "An example call, simplified."
  lines:
    - who: "Caller"
      text: "Hello, kal subah doctor ka appointment mil sakta hai?"
      gloss: "Can I get a doctor's appointment tomorrow morning?"
      me: true
    - who: "Receptionist"
      text: "Haan ji. Kal subah 10 baje ya 11:30 baje, kaunsa theek rahega?"
      gloss: "Yes. Tomorrow at 10:00 or 11:30. Which suits you?"
    - who: "Caller"
      text: "10 baje."
      gloss: "10 o'clock."
      me: true
    - who: "Receptionist"
      text: "Ho gaya. Kal subah 10 baje ka appointment book ho gaya hai."
      gloss: "Done. Your appointment for 10:00 tomorrow is booked."
      tag: "Booked"
      state: ok
note: "The hard part is speed. Pause too long on a phone call and the caller starts saying “hello?”"
followups: ["code-fixer", "the-problem"]
---

Small clinics usually have one person on the front desk. When that person is
busy with a patient, the phone rings out, and the caller tries another clinic.

So I built a receptionist that picks up every call. It listens, works out what
the caller wants, answers out loud, and books the appointment. It speaks Hindi
and English, including the mix of the two that most people actually use.

Voice was the hardest thing I have built. In a chat, a short pause while the
system thinks goes unnoticed. On a phone call, the same pause makes the caller
talk again, right over the answer. Everything has to happen while the person is
still speaking.
