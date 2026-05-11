# TFC Dev Readme v5.31

## Purpose

TFC prototype for tactile irritation limiting using low-frequency band
energy (\~70--100 Hz). Focus: observable behavior and controllability.

------------------------------------------------------------------------

## Signal Architecture

source → (TFC EQ) → analyser → output

-   dry = before EQ\
-   wet = after EQ\
-   control uses ONLY dry

``` js
// EN: Control path must never use processed (wet) signal to avoid drift.
```

------------------------------------------------------------------------

## Limiter Model

tIrrRef = p95 (offline) or adapt (fallback)\
tIrrLimit = tIrrRef - headroom - listeningLevel

reduction = softKnee(tIrrDry - tIrrLimit)

EQ gain = -reduction (\~90 Hz band)

------------------------------------------------------------------------

## Critical Fixes

-   Single analysis bus (no duplicate routing)
-   EQ gain write unified
-   Control uses DRY only
-   Reference frozen when TFC enabled

------------------------------------------------------------------------

## Known Behavior

-   K-weighting ≈ +1 dB vs RMS @ \~80 Hz (expected)
-   Limiter currently single-band (90 Hz EQ)
-   No multiband yet

------------------------------------------------------------------------

## Test Method

Use 70--90 Hz sine

Step test: - amplitude steps - listeningLevel sweep

Expected: - wet \< dry - reduction stable - no long-term drift

------------------------------------------------------------------------

## Next Steps

-   envelope follower tuning
-   absolute ceiling definition
-   TFC scope mode
-   possible multiband extension
