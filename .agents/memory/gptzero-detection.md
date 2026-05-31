---
name: GPTZero short-text reliability
description: Behavior/quirks of the GPTZero leg of the AI-authorship detector in this app
---

# GPTZero short-text reliability

The static AI-detection leg calls GPTZero `v2/predict/text`. The document response
exposes `documents[0].class_probabilities` (ai/human/mixed), `completely_generated_prob`,
and a `sentences[]` array with per-sentence `generated_prob` (used for the red/yellow/green
color-coding).

**Quirk:** GPTZero is unreliable on short / informal answers (roughly < ~250 chars).
It can return ~1.0 (max AI) for genuinely human casual text *and* under-score real AI text.
Observed: a lowercase, typo-laden human answer scored 0.85 and flagged.

**Why it matters:** The flag threshold is `aiScore >= 0.55` (blend `0.85*gptzero + 0.15*heuristic`).
On short text this yields both false positives and false negatives — inherent to GPTZero,
not the surrounding code.

**How to apply:** Do NOT chase threshold tuning from a single short-text example. Only
adjust weights/thresholds with a real fixture set (known ChatGPT-copied vs human answers)
across both GPTZero-available and GPTZero-down paths. For trustworthy scores, longer answers
are required; the UI gates scanning at a low char count for responsiveness, not accuracy.
