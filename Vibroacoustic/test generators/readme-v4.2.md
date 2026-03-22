# Path Generator v4.2 – Screen-Space Bubble System

Interactive HTML/JS prototype combining:
- 3D path (curve-based, Three.js)
- Continuous motion (time-based transport)
- Stochastic event triggering (rate-based)
- Bubble synthesis (Web Audio API)

---

## Overview

Path (3D) → Continuous motion → Stochastic sampling → Bubble events → Sound

---

## Key Architecture Change (v4.2)

Audio is now mapped to **screen-space / camera-space**, not local path coordinates.

This fixes mismatch between:
- what you see
- what you hear

---

## Path System

- Closed 3D curve (Catmull-Rom)
- Two modes:
  - random
  - pulse (wavelet-like Z)

---

## Motion

- Path traversal is **continuous and time-based**
- Independent from event timing
- Indicator shows true position on loop

---

## Audio Engine

Each event = one “bubble”:
- sine oscillator (pitch)
- filtered noise (texture)
- envelope (short, click-free)

---

## Mapping (v4.2)

Screen-space mapping:

- X → pan (left/right)
- Y → pitch (vertical)
- Z (camera depth) → event rate (density)

Key idea:
- **what is visually near = more bubbles**
- **what is far = fewer bubbles**

---

## Event System

- Rate controlled by Z-depth:

  rate = minRate + depth01 * (maxRate - minRate)

- Stochastic timing (Poisson-like)
- Optional burst injection (short intervals)

---

## Bubble Variation

Each bubble has random “size”:
- gain
- slight variation in texture

This avoids static repetition.

---

## Improvements from v3.1

- Removed pseudo-3D projection
- True 3D with camera + depth
- Continuous motion (no phase freeze)
- Event-based audio instead of continuous waveform
- Screen-aligned mapping (intuitive control)
- Depth-driven density (spatial rhythm)

---

## Notes

- Depth normalization may need tuning per scene scale
- Event distribution uses stochastic intervals → naturally irregular rhythm
- Mapping is now perceptual (view-based), not geometric

---

## Version

v4.2
