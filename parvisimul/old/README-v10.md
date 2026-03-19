# Fish School Simulation — v10

## Overview

Version 10 builds on the fixed-step simulation introduced in v6.9 and
adds interactive path control, debug visualization, and steering-based metrics.

Focus:
- controllability
- observability
- expressive motion

---

## Key Additions

### Path Interaction (A ↔ B)
- Click moves fish to Path B
- Click again returns to Path A
- Path B acts as temporary attractor

### Click Impulse
- Adds velocity boost on click
- Direction biased toward camera (+ optional upward)
- Improves responsiveness

### Path B Framing
- Positioned relative to camera
- Scaled to fit viewport
- Acts as foreground test space

### Steering Effort Metrics
- effort = |acceleration|
- mean + variance across school

### Effort HUD
- visual bars for effort metrics
- throttled updates (~5 Hz)

### Timing Display
- dt and accumulator shown in milliseconds
- internal simulation still uses seconds

---

## Behaviour Notes

- Faster approach to Path B via impulse
- Reduced special-case logic
- Remaining issue: small jump when exiting Path B

---

## Architecture

Fixed-step loop:

    accumulator += realDt * simSpeed

    while accumulator >= fixedDt:
        step(fixedDt)
        accumulator -= fixedDt

Steering:

    totalForce =
        pathFollow
      + separation
      + alignment
      + cohesion
      + impulse

---

## Known Issues

- backward jump on exit from Path B
- slight vertical snap
- approach still parameter-sensitive

---

## Next Steps

- remove remaining mode-like logic
- ensure velocity-continuous transitions
- allow multiple fish on Path B
- add audio driven by effort metrics

---

## Summary

v10 adds:
- path interaction system
- impulse-based control
- effort visualization
- improved debug HUD

Transition:
stable simulation → controllable + measurable system
