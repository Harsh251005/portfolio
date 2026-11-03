---
question: "Code that fixes its own mistakes"
short: "Code that fixes itself"
aliases: ["phoenix", "code generation", "strangest", "weirdest", "most interesting project", "code generator", "writes code"]
group: things-built
card: project
order: 2
moment: "You ask for a small app. The first version crashes, the way first versions always do."
tagline: "Code that fixes its own mistakes"
plain: "This one writes the app, runs it, reads its own error, and fixes the broken part. After five tries it stops and tells you, instead of trying forever."
blurb: "Writes an app, runs it, reads its own errors and fixes them. Stops after five tries."
link: "https://github.com/Harsh251005/PhoenixAI"
followups: ["document-reader", "how-i-work"]
---

You describe an app in plain English. It writes the files and runs them.

When something breaks, it reads the error, works out which file caused it, and
rewrites that file. It gets five attempts. After that it stops and says it
couldn't, because a system like this left alone will keep paying to try the
same broken fix.

The code it writes runs in a sealed box, away from the rest of the computer.
Letting a machine write and run its own code anywhere else would be a bad idea.
