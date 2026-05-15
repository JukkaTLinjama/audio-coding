# Tactile-loudness-meter v6.0

Experimental browser-based loudness and tactile analysis prototype.

This version continues the transition from a LUFS-style loudness meter toward a tactile loudness / Tactile Feelness Control (TFC) research tool. The main change in v6.0 is UI clarity: the tool now explains its purpose, current status, and limitations more clearly for first-time users.

## Purpose

The project explores whether loudness-style analysis can be extended toward low-frequency tactile perception.

The current prototype compares:

- **K / LUFS-style loudness**: K-weighted loudness-style estimates.
- **T Support**: low-bass tactile foundation / support region.
- **T Irritation**: upper-bass tactile overload / irritation region.
- **TFC**: Tactile Feelness Control, currently implemented only as an irritation-band limiter experiment.

The goal is not to replace standardized loudness measurement. The goal is to build an observable control model for tactile low-frequency content before adding a full automatic leveler.

## Reference

K-weighted loudness measurement is conceptually related to ITU-R BS.1770 loudness measurement:

- ITU-R BS.1770 recommendation page: https://www.itu.int/rec/R-REC-BS.1770

This prototype is **not** a certified BS.1770 / EBU R128 implementation.

## Current status in v6.0

### Implemented

- Browser-based single-file HTML prototype.
- Microphone input.
- Internal pink-noise / sine test signal.
- Stepped sine hold test for low-frequency probing.
- Audio file playback and offline analysis.
- K-weighted loudness-style estimates.
- T Support and T Irritation band estimates.
- 20 s scope view with K and TFC modes.
- TFC A/B irritation limiter.
- Dry-control / wet-diagnostic separation.
- Single analysis bus preserved.
- Device strength calibration:

```text
effectiveLimit = baseLimit - deviceGainDb
```

- TFC control-model observability:

```text
errorDb = T_Irr_dry - effectiveLimit
expectedReductionDb = softKneeReductionDb(errorDb)
actualReductionDb = T_Irr_dry - T_Irr_wet
modelErrorDb = expectedReductionDb - actualReductionDb
```

- Passive leveler observer values are calculated but not applied:

```text
state.levelerGainDb = 0
levelerTargetFromP95Db
levelerTargetFromLimitDb
levelerSlowEstimateDb
```

### Not implemented yet

- No full automatic tactile leveler.
- No support-band boost/control path.
- No multiband tactile compressor.
- No certified SPL calibration.
- No certified LUFS compliance.
- No standardized tactile loudness unit.
- Relative T-adapt error is observer-only and does not drive DSP.
- Wet signal is not allowed to control the limiter.

## Important design constraints

The current control model is intentionally conservative.

The active limiter uses absolute dry-referenced irritation error:

```text
errorDb = T_Irr_dry - effectiveLimit
```

T-adapt-style relative error can be observed:

```text
relativeErrorDb = T_Irr_dry - T_Irr_adapt
```

However, relative T-adapt error should not yet drive the limiter. If the limiter target follows the same band being limited, a constant 90 Hz irritation tone can raise the adaptation reference and hide the problem.

## Validation checklist

Before implementing a full leveler, validate the current control model with:

- Stepped sine, especially 70–100 Hz.
- Pink noise.
- Real music.
- Low-LRA material.
- High-LRA material.

Expected monotonic chain:

```text
listeningLevel ↑ or deviceGain ↑
→ effectiveLimit ↓
→ errorDb ↑
→ expectedReductionDb ↑
→ actualReductionDb follows smoothly
```

Check specifically:

- Does `modelErrorDb` stay understandable?
- Does actual reduction follow expected reduction smoothly?
- Does the limiter avoid sudden jumps?
- Does the passive leveler observer remain stable?
- Do `levelerTargetFromP95Db` and `levelerTargetFromLimitDb` use the intended sign convention?

Sign convention for future leveler work:

```text
negative target = reduce gain
positive target = no cut / possible boost later
```

## UI structure in v6.0

- Header title: `Tactile-loudness-meter-v6.0`
- Info/about button in the title area.
- Info panel has two columns:
  - **Background**: motivation and conceptual framing.
  - **Status**: what is implemented and what is missing.
- Source controls at the top.
- Live test signal controls in their own box.
- Tactile Feelness Control (TFC) controls in their own box.
- Live Analysis controls directly above the canvas.
- 20 s scope button stays on the right side of the Live Analysis row.
- Scope colors:
  - K / LUFS scope = green.
  - TFC / irritation scope = orange.

## Development notes

Keep future changes minimal and local unless a larger refactor is explicitly planned.

Do not change these without a clear test plan:

- Limiter DSP.
- Single analysis bus.
- Dry-control / wet-diagnostic separation.
- Wet-to-control isolation.
- Passive leveler being observer-only.

Recommended next steps:

1. Test v6.0 with stepped sine and music.
2. Improve text readouts only if diagnostics are still hard to interpret.
3. Keep the full leveler disabled until the TFC control model has been validated.
4. Consider adding `relativeErrorDb` as a clearer text-only observer if needed.

## Copyright

(c) Jukka Linjama 2026
