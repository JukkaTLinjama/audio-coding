# Web Loudness Meter – v5.22 TFC preview headroom

## Overview

This version continues the transition from a LUFS-style loudness analyser toward an experimental **TFC – Tactile Feelness Control** test tool.

The project now separates three concepts:

- **K / LUFS-like analysis**: auditory loudness context
- **T / TUFS-like analysis**: tactile low-frequency feelness context
- **TFC preview processing**: audible test processing after the analyser

The current build is still an analysis and listening-test prototype. It is not yet an automatic leveler or production limiter.

---

## Main changes since v5.0

### Audio input and file support

- Microphone input
- Internal pink-noise and sine test source
- Audio file loading and playback
- File seek and 20 s scope-follow control
- Offline file analysis for stable program-level metrics

### LUFS / K analysis

- K-weighted parallel analysis path
- 0.4 s K momentary estimate
- 3 s K short-term estimate
- K adaptive context envelope
- Running K integrated estimate
- Offline K integrated estimate
- LRA-style program dynamics estimates

### TFC / tactile analysis

The tactile side is experimental and uses TUFS-like terminology.

Implemented channels:

- **T Support**: low-bass tactile foundation
- **T Irritation**: upper-bass tactile overload / boom risk

Current tactile metrics:

- T 0.4 s
- T 3 s
- T adapt
- T Support Need
- T Irritation Excess
- T Support modulation
- T Support crest
- Offline T integrated estimates
- Offline T LRA-style estimates

---

## TFC concept

TFC is intended as a tactile analogue to loudness control.

The practical goal is not simply “more bass”. The intended model is:

```text
Program loudness context
→ tactile expectation
→ support / irritation balance
→ optional tactile-aware correction
```

Two different control roles are emerging:

### T Support

Constructive tactile energy.

Potential later control role:

```text
if support is too weak → possible upward support boost
```

### T Irritation

Potentially excessive tactile / upper-bass energy.

Potential later control role:

```text
if irritation exceeds tolerance → limiter / reduction
```

The current version focuses more on irritation limiting because tactile peaks are the more urgent practical risk.

---

## v5.22: preview headroom

v5.22 changes the listening-level preview path.

Earlier, the Listening Level slider directly raised or lowered the audible preview gain. This made upward tests easy to clip and made EQ cuts feel like the whole output was simply getting quieter.

The new model uses fixed preview headroom:

```text
previewHeadroom = -12 dB
outputGain = previewHeadroom + Listening Level
```

Examples:

```text
Listening Level -12 dB → output gain -24 dB
Listening Level   0 dB → output gain -12 dB
Listening Level +12 dB → output gain   0 dB
```

This gives room for preview EQ / limiter experiments while still making the slider audible.

Important:

- The preview gain is after the analyser.
- K/T analysis remains dry.
- Output gain is only a listening-test tool.
- This is not automatic TFC gain control.

---

## T Irritation preview EQ

The optional T Irritation preview EQ is an audible-only test stage.

Current chain:

```text
source → analyser → T Irr preview EQ → preview output gain → destination
```

Consequences:

- Analysis shows the original signal.
- The user hears the preview-processed signal.
- The EQ reduction does not yet feed back into the K/T meters.

This is intentional for now: it keeps the analysis stable while allowing listening tests.

A later wet-analysis version may use:

```text
source → dry analyser
source → TFC processor → wet analyser → output
```

That would allow dry/wet comparison and visible measured reduction.

---

## File playback end freeze

v5.22 improves file-end handling.

When file playback reaches the decoded duration:

- playback is marked as ended
- realtime history updates stop
- file/cursor display freezes at the final offline state
- status text remains stable

This prevents 3 s / adaptive histories from continuing to drift after the song has ended.

---

## Current status table structure

The status text is intentionally grouped into fixed-width monospace tables.

### Offline Program Summary

Static file-level values:

- K Integrated
- T Support Integrated
- T Irritation Integrated
- Gate thresholds
- LRA estimates
- p10 / p95 values
- accepted block counts

### Live / Cursor Monitor

Moving values at the playback cursor or realtime input:

- K 0.4 s / 3 s / adapt
- T Support 0.4 s / 3 s / adapt / need
- T Irritation 0.4 s / 3 s / adapt / excess
- T Support modulation and crest
- Listening context
- Output gain
- Headroom
- Irritation limit
- Irritation EQ cut

---

## Important limitations

- TUFS is not a standard.
- T Support and T Irritation are experimental band models.
- Offline T bands are approximate and not yet final standardized filters.
- Preview EQ is a simple fixed-band peaking filter.
- The preview EQ is after analysis, so the meters do not yet show processed output.
- Listening Level currently combines model context and audible preview gain for quick testing.
- Later versions may split those into separate controls again.

---

## Next likely steps

1. Test v5.22 with varied material:
   - quiet acoustic music
   - bass-heavy music
   - vibroacoustic / drone material
   - speech
   - noisy or rumbly recordings

2. Evaluate T Irritation preview EQ:
   - does the cut reduce unpleasant tactile/upper-bass feel?
   - does it reduce too much musical warmth?
   - is 90 Hz the right center?
   - is Q = 1.1 too wide or too narrow?

3. Decide whether to add a wet analysis path:

```text
dry T Irritation vs wet T Irritation
```

4. Only later consider automatic leveler gain control.

---

## Development principle

The current priority is:

```text
analysis → audible preview → dry/wet verification → control
```

Do not add automatic gain control until the analysis and preview behavior are understood across real material.
