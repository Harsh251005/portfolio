---
question: "A reader that shows its working"
short: "Trustworthy reading"
aliases: ["rag", "documents", "hallucination", "can ai be trusted", "retrieval", "document reader", "making things up", "does ai make things up", "pdf", "evident"]
group: things-built
card: project
order: 3
moment: "Someone hands you a hundred-page PDF and asks you one question about it."
tagline: "A reader that shows its working"
plain: "This reads it for you and answers, with the page number behind every part of the answer. If the answer isn't in there, it says so instead of making one up."
link: "https://github.com/Harsh251005/Evident-AI"
example:
  kind: answer
  caption: "An example, simplified."
  lines:
    - who: "You"
      text: "How much notice do I have to give to end the contract?"
      me: true
    - who: "Reader"
      text: "Sixty days, in writing."
      tag: "Page 14"
      state: ok
    - who: "You"
      text: "Is there a fee for paying late?"
      me: true
    - who: "Reader"
      text: "I couldn't find that in this document."
      tag: "Not found"
      state: stop
note: "No page to point at means no answer. It tells you it couldn't find one."
followups: ["receptionist", "the-problem"]
---

Ask an ordinary chatbot about a long document and you get a smooth, confident
answer, with no way to tell whether it is true.

This one works the other way round. Every part of the answer comes with the page
it came from, so you can check it. If the document doesn't say, it tells you
the answer isn't there.

It also tests itself. A fixed set of questions with known answers runs after
every change, and if the answers get worse, the change is rejected.
