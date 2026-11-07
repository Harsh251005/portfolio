---
stack: ["Python", "LangChain", "Qdrant", "BM25", "FlashRank", "RAGAS", "LangSmith", "Streamlit"]
facts:
  - value: "0.97"
    label: "Faithfulness: how closely answers stick to what the document says, scored on 50 test questions."
  - value: "46 of 50"
    label: "Test answers backed by a real page number from the document."
  - value: "0.80"
    label: "The quality bar. A change that scores lower is rejected automatically."
build:
  title: "From a PDF to an answer you can check."
  steps:
    - step: "Upload"
      does: "The PDF is split into passages and stored in its own collection."
      tools: ["Streamlit", "LangChain", "Qdrant"]
    - step: "Two searches"
      does: "Search by meaning and by keyword, merged into one ranked list."
      tools: ["Qdrant", "BM25"]
    - step: "Second opinion"
      does: "A reranker re-scores the top ten passages and keeps the best four."
      tools: ["FlashRank"]
    - step: "Answer with pages"
      does: "Every claim carries a page number, and it only counts if that page was retrieved."
      tools: ["OpenAI", "LangChain"]
    - step: "Tests itself"
      does: "50 known questions score every code change. Below 0.80, it is rejected."
      tools: ["RAGAS", "LangSmith"]
demo:
  kind: "retrieval"
  title: "Ask the same question twice."
  lead: "Once to an ordinary chatbot, once to this reader. Then step through how the reader finds its answer."
---

## From PDF to answer

When you upload a document, it is split up and stored in its own private
collection, so one person's document can never leak into another's. A question
is then answered in stages:

1. **Two ways of searching.** Meaning-based search finds passages that say the
   same thing in different words. Keyword search catches exact terms. Using both
   beats either alone.
2. **A second opinion.** A reranker re-scores the top ten passages and keeps the
   best four.
3. **An answer with receipts.** Every claim must carry a page number, and a page
   number only counts if that page was actually retrieved for the question.

If the document doesn't say, the answer says so.

## It tests itself

A fixed set of 50 questions with known answers runs after every change, scoring
the answers for faithfulness, relevance and citations. In the automated checks, a
score below 0.80 rejects the change.

<!-- Write more here: the screenshots, how retrieval improved over time, the
     lessons. Check any score you quote against the repo. -->
