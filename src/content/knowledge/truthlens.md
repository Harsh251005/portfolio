---
question: "A second opinion on a face photo"
short: "Spotting fake photos"
aliases: ["truthlens", "deepfake", "fake photo", "fake image", "ai generated image", "image detection", "computer vision", "flutter", "mobile app", "is this photo real"]
group: things-built
card: project
order: 2
moment: "A photo of someone is going round the family WhatsApp group. It looks real. Is it?"
tagline: "A second opinion on a face photo"
plain: "This phone app looks at a face photo and says real or fake, how sure it is, and why, in plain words. It all runs on the phone, so the photo is never uploaded."
blurb: "Says if a face photo is *real or fake*, *how sure it is*, and *why*. Runs *on the phone*."
link: "https://github.com/Harsh251005/TruthLens-AI"
followups: ["document-reader", "how-i-work"]
---

You pick a face photo. The app checks there really is a face in it, then a
model trained on real and AI-made faces scores it from real to fake.

It also reads the camera data hidden inside the file. A photo edited in a
face-editing app, or changed days after it was taken, leaves traces there.
Missing data on its own is not treated as suspicious: screenshots and
forwarded images never have any.

Then it explains the result in two or three plain sentences, and says so when
the reading is too close to call. No check like this is proof, and the app
tells you that too.
