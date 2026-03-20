# Path Generator v3 – Bubble Grain Synthesis

Interactive HTML/JS prototype combining:
- 3D-like path generation (XY + Z)
- Path-driven event triggering
- Granular-style bubble synthesis (Web Audio API)

---

## Overview

Geometry → Motion → Events → Sound

---

## Path System

Smooth multi-harmonic radial modulation:

rMod = 1 + A2*sin(2a) + A3*sin(3a) + A5*sin(5a) + A7*sin(7a)

Z is also smoothly modulated.

---

## Projection (Pseudo-3D)

sx = cx + (x * viewTiltX + y * viewTiltY) * scale  
sy = cy - (y * viewLiftY + z * viewZGain) * scale  

---

## Motion

- Constant-speed traversal
- Looping
- Time-based triggering

---

## Audio Engine

Hybrid grain:
- sine core (pitch)
- filtered noise (texture)

---

## Envelope

- smoothed attack/release to avoid clicks
- optional Hann window

---

## Mapping

X → pan  
Z → pitch  

---

## Notes

- Not full granular engine yet
- Projection is linear (not perspective)

---

## Version

v3.1
