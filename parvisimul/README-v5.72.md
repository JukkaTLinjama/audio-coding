# Fish School v5.7 --- 5.72

Single-file Three.js fish school simulation with:

-   Dual path architecture (Path A + Path B)
-   Optional second school
-   Acceleration-driven visual cues (tail thrust + bank)
-   HUD-controlled density, reaction lag, and zoom
-   Camera-relative focus interaction for test fish

Main file: kalat-v5.7-two-schools.html

------------------------------------------------------------------------

## What changed since v3.6

### 1. Dual path architecture

#### Path A (primary school)

-   Random closed Catmull-Rom curve
-   Single moving leader point
-   Whole school follows leader (no nearest-point snapping)
-   Z-thin ribbon behavior around world Z=0

#### Path B (secondary system)

-   Independent radius, jitter, Z amplitude, and center offset
-   Positioned closer to camera (pathCenterZB)
-   Has its own leader and optional path rendering
-   Can run even when fish count = 0

This enables foreground test motion without disturbing the main school.

------------------------------------------------------------------------

### 2. Optional second school

-   N_B = 0 supported
-   Path B and its leader animate even without fish
-   Architecture ready for future full B flock dynamics

Currently: - School A = full boids - School B = leader + path (fish
optional)

------------------------------------------------------------------------

### 3. Test fish routing

testFishUsePathB flag:

-   If true → fish #0 follows Path B
-   Others follow Path A
-   Allows debugging eye/mouth expressions on a clean foreground path

------------------------------------------------------------------------

### 4. Leader-based path following

Instead of nearest-point locking:

-   Persistent curve parameter `u`
-   Leader advances by arc-length approximation
-   Fish steer toward leader position + lateral corridor correction

Benefits: - No snapping on curve crossings - Smooth global flow
direction - More natural schooling motion

------------------------------------------------------------------------

### 5. Reaction lag system

Per-fish exponential smoothing of desired velocity:

alpha = 1 - exp(-dt / tau_i)

-   Mean controlled by slider
-   Per-fish jitter adds realism
-   Prevents synchronized turns

------------------------------------------------------------------------

### 6. Acceleration-driven visuals

Per fish:

1.  a = (v - vPrev) / dt
2.  Decompose into forward + lateral components
3.  EMA smoothing (\~100ms)

Mapped to:

-   Tail length (forward accel only)
-   Tail emissive glow
-   Bank angle (lateral accel)
-   Eye scale (alertness) TBD
-   Mouth scale (subtle expression) TBD

------------------------------------------------------------------------

## Controls

-   View zoom\
    Adjusts camera distance with fog compensation.

-   Solo independence\
    Controls decoupling from school forces.

-   Density\
    Adjusts neighbor radius, alignment/cohesion strength, separation
    force, and path attraction scaling.

-   Target speed\
    Leader speed along Path A.

-   Reaction lag\
    Mean response time (per-fish jitter applied).

-   Scatter / Regroup\
    Toggle solo fish behavior.

------------------------------------------------------------------------

## Architecture (v5.7)

Scene ├── Path A (curve, samples, leader, marker) ├── Path B (curve,
samples, leader, marker) ├── Fish array (School A) │ ├── position,
velocity │ ├── reaction lag │ ├── noise state │ ├── solo state │ └──
acceleration smoothing └── Camera + HUD

------------------------------------------------------------------------

## Known limitations

-   School B flock dynamics not implemented yet
-   Coordinate scaling between paths still experimental
-   No collision resolution pass (soft separation only)
-   O(N²) neighbor scan (fine for small N)

------------------------------------------------------------------------

## Recommended commit tag

v5.7: dual-path architecture, optional secondary school, leader-based
steering

# Fish Two Schools – v5.72 (Orientation / WorldUp Status)

This note documents the current coordinate/orientation model and why the “upright vs. sideways” issue is **not solved yet**.

## 1) World coordinate system

Three.js world axes:

- **X**: right
- **Y**: up  ✅ (global up reference)
- **Z**: depth / forward (camera space)

The simulation uses:

- `worldUp = (0, 1, 0)` (global Y-up)

## 2) Fish local axis convention (intended)

Fish orientation is built assuming the fish model uses:

- **local +X**: right
- **local +Y**: forward
- **local +Z**: up

Orientation is constructed per-frame in `renderMeshes()` using an orthonormal basis:

- `dir` = normalized velocity (`V[i]`)
- `right = dir × worldUp`
- `basisUp = right × dir`
- `m4.makeBasis(right, dir, basisUp)`
- `quat.setFromRotationMatrix(m4)`
- `fish.quaternion.copy(quat)`

### Key consequence (important)

`basisUp` is **not guaranteed to equal** `worldUp`.
It is the “flight-style up” perpendicular to `dir`.

So even without explicit roll, the fish can appear “tilted” when `dir.y != 0`.

## 3) Roll / Bank (current implementation)

Roll (bank) is applied as an additional rotation around the forward axis (`dir`):

- `bank = f(aLateralSm)`
- `bankQ = axisAngle(dir, bankGated)`
- `fish.quaternion.premultiply(bankQ)`

`bankGated` was introduced to suppress roll during mostly horizontal motion:

- `allowRoll = smoothstep(|dir.y|)`
- `bankGated = bank * allowRoll`

## 4) What we measured (debug)

We added debug to measure “uprightness”:

- `dotUpX/Y/Z = (localAxis · worldUp)`
- `upAngleDeg = acos( (local +Z transformed) · worldUp )`

Findings:

- `dotUpZ` is usually close to 1.0 pre-bank → **local +Z is the correct “up axis” for the model**
- `upAngleDeg` still varies significantly in some cases → tilt is mainly coming from the **basis construction** (flight frame) and/or **post-bank state** depending on when debug is measured.

## 5) Current problem (NOT solved)

Even with roll gating:

- the test fish can still appear sideways / “on its side” after interactions (e.g. click/focus)
- debug may show small `bankDeg` at the same time, implying the remaining issue is not just roll magnitude.

This indicates at least one of these is still happening:

1. **Debug is measured at the wrong time** (pre-bank vs post-bank), giving misleading conclusions.
2. **Basis instability** when `dir` changes rapidly or approaches `worldUp` (cross products become ill-conditioned).
3. **Focus/click mode** changes motion/orientation behavior so the perceived “up” does not match expectations.
4. The visual “sideways” impression is driven by **pitch/flight-frame tilt**, not roll, especially because the fish body is flattened.

## 6) What “upright relative to worldUp” would mean

There are two different goals:

### A) Flight-style frame (current)

- Always keep an orthonormal frame tied to `dir`
- Allows pitch/tilt naturally
- Does **not** guarantee fish up equals worldUp

### B) WorldUp-locked upright (desired for “no sideways”)

- Fish local up should be forced close to `(0,1,0)` during horizontal swim
- Requires either:
  - blending `basisUp` toward `worldUp`, AND/OR
  - explicit “righting” dynamics (spring/damping) to drive rollAngle → 0 in horizontal motion

v5.72 attempted blending/gating, but the issue is not fully resolved.

## 7) Next steps (to finish the fix)

Minimal, fact-first plan:

1. **Measure POST-bank uprightness only**
   - Move dotUp / upAngle logs to after `premultiply(bankQ)`
   - Confirm whether roll is still being applied when it shouldn’t.

2. **Add a hard “no-roll zone” for horizontal swim**
   - If `|dir.y| < threshold`, force `bankGated = 0` (no smoothstep ambiguity)

3. **Stabilize basis when `dir × worldUp` is near-zero**
   - Use a stable fallback `right` derived from previous orientation (not a fixed `(1,0,0)`)

4. (Optional) Add true “righting physics”
   - Maintain `bankAngle` + `bankRate` per fish
   - Righting spring toward 0 when horizontal

## 8) Status summary

- Coordinate system documented ✅
- Local model up axis verified as +Z ✅
- Roll gating added ✅
- Test fish still can appear sideways after focus/click ❌
- Root cause not fully isolated yet ❌
