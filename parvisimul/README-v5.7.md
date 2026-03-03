# Fish School v5.7

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
