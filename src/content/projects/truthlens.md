---
stack: ["Flutter", "Dart", "TensorFlow Lite", "Keras", "ML Kit", "Firebase", "OpenAI API"]
facts:
  - value: "On the phone"
    label: "The model runs on the phone itself. The photo is never uploaded, and there is no server to pay for."
  - value: "4 checks"
    label: "Is there a face, what the model sees, what the hidden camera data says, then a reason in plain words."
  - value: "Pixel for pixel"
    label: "A test checks the phone prepares each photo exactly the way the model saw photos in training."
build:
  title: "From a photo to a verdict you can understand."
  steps:
    - step: "Face check"
      does: "Makes sure there is a face. If not, it asks for a clear face photo."
      tools: ["ML Kit"]
    - step: "Prepare"
      does: "Shrinks the photo to 224 × 224, exactly as in training. A test compares it pixel for pixel."
      tools: ["Dart"]
    - step: "Model"
      does: "A model built on EfficientNetB0 scores it from real to fake, on the phone."
      tools: ["Keras", "TensorFlow Lite"]
    - step: "Camera data"
      does: "Reads the EXIF data inside the file: editing apps, no camera, edited long after it was taken."
      tools: ["EXIF"]
    - step: "Explain"
      does: "Turns the score into two or three plain sentences. Without an API key, it uses built-in text."
      tools: ["OpenAI API"]
demo:
  kind: "scan"
  title: "Pick a photo. Watch it decide."
  lead: "Five kinds of photo, each run through the same four checks. Notice when it stops early, and when it says it isn't sure."
---

## How a scan works

1. **Face check.** ML Kit looks for a face. No face, no verdict.
2. **The model.** The photo is resized to 224 × 224 and scored by a model
   built on EfficientNetB0, trained on real and fake faces and converted to
   TensorFlow Lite. Above 0.5 it says fake. The further from 0.5,
   the surer it is.
3. **Camera data.** The EXIF reader flags known editing and AI tools, a missing
   camera, and a photo edited more than a day after it was taken. A screenshot
   or web image is never flagged just for having no data.
4. **Explanation.** The verdict, the score and the flags (never the photo,
   location, dates or anything about the user) go to a language model, which
   writes two or three plain sentences. With no key or no internet, built-in
   text is used instead.

## The bug that taught me the most

The model was trained in Python and runs in Dart on the phone. If the phone
resizes a photo even slightly differently, the model sees a different picture
and the verdict drifts without any error. Dividing the pixels by 255, a habit
from other models, made it call every photo real. So there is a test that
compares the phone's prepared photo with Python's, pixel for pixel, on a real
device.

## From a server to the phone

The first version sent photos to a FastAPI server. Moving everything onto the
phone meant no server to host or pay for, and the photo never leaves the
device. Accounts, scan history, badges and the leaderboard live in Firebase.

## Around the scanner

Batch scans, a real-or-fake challenge game, streaks and a news feed about
deepfakes. The scanner is the core; these keep people coming back to it.
