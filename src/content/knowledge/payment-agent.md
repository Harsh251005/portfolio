---
question: "Asking people for money, carefully"
short: "Awkward conversations"
aliases: ["payments", "debt", "difficult conversation", "awkward", "collections", "empathy", "payment agent"]
group: things-built
card: project
order: 4
moment: "Nobody enjoys a call about money they owe, including the person making it."
tagline: "Asking people for money, carefully"
plain: "This agent makes that call politely. It checks who it's talking to before sharing anything private, and fixed rules, not the AI, decide what it's allowed to agree to."
link: "https://github.com/Harsh251005/payment-agent"
flow:
  - "Person speaks"
  - "Work out what they meant"
  - "Check the rules"
  - "Rules decide"
  - "Reply"
flowNote: "The AI only works out what the person meant. The rules make every decision."
followups: ["receptionist", "how-i-work"]
---

A call about an overdue payment can go wrong both ways. Too soft and nothing
happens. Too pushy and you lose the customer.

It is also a call where an AI can't be left in charge. It can be talked into a
deal nobody approved, or get a number wrong and sound sure about it.

So the system is split in two. Fixed rules handle everything that matters: who
the caller is, how many wrong answers are allowed, what can be agreed. The AI
only does what it is good at, which is understanding what a person meant.
