---
question: "Can a machine handle an awkward conversation?"
short: "Awkward conversations"
aliases: ["payments", "debt", "difficult conversation", "awkward", "collections", "empathy"]
group: things-built
card: project
order: 5
tagline: "Asking people for money, carefully"
plain: "A system that contacts people about money they owe. It has to be polite, it has to follow the rules exactly, and it is not allowed to improvise about your bank details."
followups: ["what-i-refuse-to-do", "how-i-work"]
---

Chasing an overdue payment is the kind of conversation that goes wrong in both
directions. Too soft and nothing happens. Too firm and you've lost a customer and
possibly broken a regulation.

It's also a conversation where a language model absolutely cannot be left in
charge. It can be talked into things. It can agree to a payment plan nobody
authorised. It can get a card number one digit wrong and sound completely sure.

So it's built in two halves that don't trust each other. A rigid set of rules owns
everything that matters — what's allowed, what gets verified, how many attempts
before a lockout, what the final answer is. The language model only handles the
part it's genuinely good at: working out what a person meant when they said
"yeah, do the second one."

The rules never ask the model's opinion. The model never gets to touch the rules.

:::more[The split]
A deterministic state machine holds business logic, validation, verification
attempts, payment flow and terminal states. The model is confined to extraction
via structured outputs — account identifiers, names, dates of birth, amounts —
plus coreference resolution and response phrasing.

Every value the model extracts is validated by the state machine before it's
acted on. A malformed or out-of-range extraction is a rejected turn, not a
downstream bug.
:::
