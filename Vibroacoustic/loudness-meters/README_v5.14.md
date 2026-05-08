# Web Loudness Meter -- v5.14

## Overview

This version introduces a second analysis domain alongside LUFS:

-   **K (auditory)** → perceived loudness
-   **T (tactile)** → low-frequency physical sensation (TUFS,
    experimental)

The goal is to model not only what is heard, but what is physically
felt.

------------------------------------------------------------------------

## Tactile Support Channel

The first implemented tactile channel is **Support** (20--63 Hz).

It represents: - low-frequency foundation - physical "weight" or
pressure - absence → thin sound - presence → grounded sound

------------------------------------------------------------------------

## Metrics

-   **T04 (0.4 s)**\
    Instant tactile energy

-   **T3 (3 s)**\
    Short-term tactile energy

-   **T adapt**\
    Adaptive context (envelope follower, currently same parameters as K)

-   **T Need**

        Need = T adapt - T reference

------------------------------------------------------------------------

## Critical Design Question: What is the correct reference?

This is currently the most important open problem.

### Option A: Fast reference

    Need = T adapt - T04

Pros: - fast response - reacts to sudden drops

Cons: - overreacts to transients - may create unstable control later

------------------------------------------------------------------------

### Option B: Slow reference

    Need = T adapt - T3

Pros: - stable - reflects program-level balance

Cons: - too slow - misses short-term deficiencies

------------------------------------------------------------------------

### Option C: Hybrid reference (recommended direction)

    Tref = w * T04 + (1 - w) * T3
    Need = T adapt - Tref

Typical:

    w ≈ 0.6–0.8

This balances: - responsiveness (T04) - stability (T3)

------------------------------------------------------------------------

## Fundamental Insight

Need is not just a signal difference.

It represents:

> "How much the current tactile state falls below expected context"

However, perception depends on:

-   **absolute level**
-   **recent exposure (adaptation)**
-   **temporal structure**

This means:

-   Same Need value at low level ≠ same perception at high level
-   Need may require level-dependent weighting later

------------------------------------------------------------------------

## Important Limitation

Current model assumes:

    Need = adapt - signal

But real perception is likely closer to:

    Need = f(adapt, signal, absolute_level)

This is not yet implemented.

------------------------------------------------------------------------

## Visualization (v5.14)

-   Support bar:
    -   fill = T04
    -   white line = T3
    -   dashed line = T adapt
-   Separate Support program section:
    -   shows T04, T3, T adapt, Need

------------------------------------------------------------------------

## Status

-   Analysis only (no gain control)
-   Single tactile channel (Support)
-   Adaptation uses K parameters (temporary)
-   Need definition still under exploration

------------------------------------------------------------------------

## Next Steps

-   Add **T Irritation channel** (80--100 Hz)
-   Separate adaptation parameters:
    -   Support → slower, \~30 dB range
    -   Irritation → faster, \~40--50 dB range
-   Refine Need:
    -   hybrid reference
    -   possibly level-dependent scaling
-   Later: introduce control (leveler)

------------------------------------------------------------------------

## Summary

This version establishes:

-   dual-domain loudness model (K + T)
-   tactile support as independent perceptual channel
-   Need as candidate control signal

The main open problem is:

→ defining a perceptually correct reference for Need
