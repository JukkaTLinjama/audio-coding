# Fish School v3.6

Single-file Three.js boids-style “fish school” demo with a minimal HUD, orbit camera controls, and acceleration-driven visual cues (tail thrust + bank).

> Main file: `kalat-v3.6.html`

---

## What changed in v3.6

### Visual cues: acceleration → thrust + bank
- **Tail length** indicates **forward acceleration** (only positive accel).
- **Tail emissive glow** increases with the same thrust value.
- **Bank angle** (roll around the forward axis) indicates **lateral acceleration**, with a stronger gain so it’s clearly visible even in calm motion.

### Less overlap: separation keeps magnitude
Previously separation was normalized, which removed the “very close = very strong push” behavior.  
In v3.6:
- Separation **keeps its magnitude** (stronger when fish are too close),
- Then it’s **clamped** to avoid instability.

This noticeably reduces fish overlapping / stacking while keeping the motion calm.

### Sensitivity tuning for calm movement
Because the overall school motion is intentionally smooth, acceleration signals can be small.  
v3.6 increases visibility by lowering caps (more sensitive mapping) and increasing gains:
- forward accel cap `fCap` reduced
- lateral accel cap `latCap` reduced
- thrust scale and emissive gains increased
- bank max increased

---

## Controls

- **Solo independence**  
  Higher → solo fish follow the school less (reduced “flock coupling”).

- **Density**  
  Higher → fish respond to more neighbors + stronger alignment/cohesion (tighter school).

- **Scatter 30%**  
  Marks ~30% as solo fish (colored differently).

- **Regroup**  
  Sets all fish back to school mode.

---

## Key implementation notes

### Acceleration decomposition
Per fish:
1. Compute acceleration: `a = (v - vPrev) / dt`
2. Build local basis from velocity:
   - `fwd = normalize(v)`
   - `right = normalize(fwd × worldUp)`
3. Components:
   - `aForward = dot(a, fwd)`
   - `aLateral = dot(a, right)`
4. Smooth both with an exponential moving average (EMA) for stable visuals.

### Tail thrust + glow
- `thrust = clamp(max(0, aForward), 0..fCap) / fCap`
- Tail scale (Y) and `emissiveIntensity` are mapped from `thrust`.

### Bank indicator
- `bank = clamp(aLateral, -latCap..latCap) / latCap * bankMax`
- Applied after the fish is aligned to its velocity direction (`quaternion`), using a local-axis rotation.

### Separation (anti-overlap)
- Separation vector is accumulated as an inverse-square repulsion.
- **No normalize** (keeps magnitude), then:
  - `clampLen(sep, maxSepImpulse)` before adding to desired velocity.

---

## Suggested next steps (optional)

If you want even fewer overlaps without “nervous” motion:
1. Add a **post-step min-distance resolve pass** (1-pass collision solve).
2. Ensure initialization uses a minimum separation (Poisson-disc style) so the sim doesn’t start overlapped.

If you want more “fish” appearance:
- replace cones with a small body + fin geometry, or a custom shader silhouette.

---

## Commit message (recommended)

```
v3.6: stronger spacing + acceleration-driven tail thrust/bank
```
