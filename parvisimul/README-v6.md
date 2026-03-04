# Fish School v6 -- Calm Target Lock & Smooth Steering

## Overview

Version 6 focuses on steering refinement and behavioral stability.

The main objective was to:

-   Prevent uncontrolled drifting when the target slows
-   Eliminate aggressive direction flips on tight curves
-   Introduce physically plausible turning behavior
-   Separate Path A and Path B control logic cleanly

This version emphasizes calmness, damping, and control authority.

------------------------------------------------------------------------

# Core Steering Architecture (v6)

## 1. Target-Aware Stop Mode

When the active leader slows:

-   Tangent flow is reduced
-   Direct pull toward leader increases
-   Noise amplitude decreases
-   Cruise speed scales down
-   Minimum speed lowers dynamically

Result: The school can now settle naturally when the leader stops.

------------------------------------------------------------------------

## 2. Dynamic Minimum Speed

Previously: speed \>= params.minSpeed

Now: minSpeed → near zero when leader speed → 0

This allows true near-rest behavior while remaining numerically stable.

------------------------------------------------------------------------

## 3. Cruise Speed Scaling

Cruise speed now depends on leader motion:

cruise \*= cruiseStopScale

When the leader slows, fish no longer receive artificial forward thrust.

Effect: - No more circling inertia - Proper calm-down behavior

------------------------------------------------------------------------

# Path A vs Path B -- Steering Differences

## Path A (Main School)

-   Full boids behavior (alignment, cohesion, separation)
-   Target-following via leader point
-   Density-aware cohesion
-   Noise scaling by independence
-   Global center glue
-   Stop-mode damping

Produces a natural, adaptive schooling structure.

------------------------------------------------------------------------

## Path B (Test Fish / Tight Orbit Mode)

Path B behaves differently by design:

### Smoothed Tangent Tracking

Leader tangent is time-filtered to avoid micro-direction flips on small
curves.

### Turn-Rate Limiting

Heading changes are bounded by a maximum turn rate (rad/s).

Produces: - Swim-like arcs - No aggressive snapping - Stable motion on
small-radius paths

### Independent Stop Logic

Path B: - Uses its own leader speed - Has its own stop-ease factor -
Follows the same target speed slider - Calms down consistently with Path
A

Ensures synchronized yet independently controlled behavior.

------------------------------------------------------------------------

# Behavioral Philosophy of v6

v6 shifts from:

"Geometric curve tracking"

to:

"Mass with inertia and damping"

Key characteristics:

-   Steering is limited, not instantaneous
-   Energy dissipates when targets stop
-   Flow bias is contextual
-   Tight curves are followed plausibly, not mathematically

------------------------------------------------------------------------

# Resulting Behavior

  Scenario           Pre-v6                  v6
  ------------------ ----------------------- ----------------------
  Leader stops       School keeps drifting   School settles
  Tight Path B       Twitchy flips           Smooth arcs
  Low target speed   High residual motion    Damped response
  Small orbit        Over-correction         Controlled curvature

------------------------------------------------------------------------

# Technical Focus of v6

-   Stop-mode damping system
-   Cruise scaling linked to leader speed
-   Dynamic minimum speed
-   Path B tangent smoothing
-   Turn-rate limiting
-   Separate A/B leader handling

No major visual changes --- purely behavioral refinement.

------------------------------------------------------------------------

# Version Identity

Fish School v6 -- Calm Target Lock & Smooth Steering

This version establishes a stable behavioral foundation for:

-   Interaction experiments
-   Multi-school coupling
-   Energy modulation systems
-   Audio-reactive steering
-   Further biomechanical realism
