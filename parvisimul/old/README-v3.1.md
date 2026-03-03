# Fish School (Boids) – v3.1

Single-file Three.js demo: a calm fish school with a few “solo” fish, a minimal HUD (sliders + buttons), and simple touch-drag orbit camera controls.

This README describes **how the current `kalat-v3.html` is structured**, what each subsystem does, and why certain behaviors happen (e.g. school splitting, sliders feeling weak, camera start direction).

> Source file: `kalat-v3.html` (single HTML file, ES module import of Three.js)

---

## What you get

- **30 fish agents** (boids-inspired) moving in **3D world units**
- **School behavior** from local neighborhood rules:
  - *Alignment* (match heading)
  - *Cohesion* (move toward neighbors)
  - *Separation* (avoid collisions)
- **Orbit field** that encourages motion around a circle in the XY plane
- **“Solo” fish** are colored differently and have reduced “school coupling”
- **HUD controls**:
  - `Density` → affects cohesion/alignment + neighbor radius
  - `Solo independence` → reduces how much solo fish follow the school
  - Buttons: `Scatter 30%`, `Regroup`

---

## Architecture (high level)

Everything lives in one HTML file, but conceptually it’s 4 layers:

1. **UI Layer (DOM HUD)**
   - Reads slider values and maps them into simulation parameters.
   - Calls apply-functions (`applyDensity`, `applySoloIndependence`) and mode setters (`setMode`).

2. **Simulation Layer (agent state + step loop)**
   - Holds arrays of per-fish state: positions, velocities, noise, solo flags, and “flock blend”.
   - Implements `step(dt)` which updates positions and velocities.

3. **Render Layer (Three.js scene + meshes)**
   - Creates `renderer`, `scene`, `camera`, lights.
   - Creates `geom` (cone) and **N separate `Mesh` objects** (reliable coloring across browsers).
   - Implements `renderMeshes()` that copies simulation position/orientation into each mesh.

4. **Main Loop (requestAnimationFrame)**
   - Computes `dt` (delta time).
   - Calls `step(dt)`, then `renderMeshes()`, then `renderer.render(scene, camera)`.

---

## Data model (simulation state)

Per fish (indexed `i = 0..N-1`):

- `P[i] : Vector3` — position
- `V[i] : Vector3` — velocity
- `noise[i] : Vector3` and `noiseTarget[i] : Vector3` — smoothed random direction
- `isSolo[i] : Uint8` — 1 if solo, else 0
- `flock[i] : Float32` — current “how much I follow the school” (0..1)
- `flockTarget[i] : Float32` — target value for `flock[i]` (driven by UI/mode)

Global params (in `params` object) include:
- neighborhood radii, weights, speed/steer clamps
- orbit circle radius/speed and a radial spring (`radiusK`)
- smoothed noise strength
- z-thickness pull (`zWanderK`)

---

## Simulation loop details

### 1) Time step handling
`dt` is capped:

- `dt = Math.min(0.033, dt);`

This prevents “explosions” when the browser stutters (mobile-friendly stability).

### 2) Flock blending (smooth response to UI)
Each frame:

- `flock[i] += (flockTarget[i] - flock[i]) * aBlend`

`aBlend` is computed from a time constant (`tau`). Smaller `tau` → more immediate slider response.

### 3) Neighbor scan (O(N²))
For each fish `i`, loop over all other fish `j` and collect:

- `sumPos` (neighbors’ positions) → cohesion direction
- `sumVel` (neighbors’ velocities) → alignment direction
- `sep` (repulsion direction) → separation

Because `N=30`, O(N²) is fine and keeps code simple.

### 4) Desired velocity approach (“fishy” feel)
Instead of directly summing accelerations, the code builds a **desired velocity direction** and then steers toward it:

- `steer = desiredVel - currentVel`
- clamp steering magnitude (`maxSteer`)
- integrate velocity and clamp speed (`minSpeed..maxSpeed`)

This tends to look smoother (more “fish”, less “bird twitch”).

### 5) Global glue (anti-splitting)
A “global center” is computed (excluding solo fish), and each fish gets a mild pull toward it.
This reduces the chance of the school splitting into multiple clusters.

### 6) Orbit field
For each fish, the code computes:

- radial vector in XY: `r2 = p - center; r2.z = 0`
- tangent direction: `(-r2.y, r2.x, 0)`
- adds tangent motion (orbit) and radial correction back toward `orbitRadius`

---

## Rendering

### Geometry
Uses `ConeGeometry` pointing +Y by default.
Orientation is set so +Y aligns to the fish’s velocity direction:

- `quat.setFromUnitVectors(up, velocityDir)`

### Meshes (non-instanced)
The file uses **N separate meshes**:
- Easiest to debug and reliable per-fish coloring on all devices.
- Instancing can be reintroduced later for large N.

---

## UI wiring

- Sliders use `input` events (live updates).
- Each slider updates the corresponding `params` value and calls an apply function.

Important: in this version, `density` is mapped into:
- `wCohesion`
- `wAlignment`
- `neighborRadius`

“Solo independence” maps into `flockTarget` for solo fish, via:

- `soloFlockTarget = 0.9 - 0.7 * ind`

So higher independence → smaller flock coupling.

---

## Camera controls (why “start on Z axis” can fail)

Your orbit camera uses:

- `x = cos(yaw) * cos(pitch) * R`
- `z = sin(yaw) * cos(pitch) * R`
- `y = sin(pitch) * R`

Key implication:

- **yaw = 0, pitch = 0** → camera at **(R, 0, 0)** (X axis), not Z.
- To start on **+Z axis**, you want **yaw = PI/2** and **pitch = 0**:
  - camera at (0, 0, R)

So: **front view on Z axis** = `yaw = Math.PI / 2; pitch = 0;`

(That’s why “yaw=0 pitch=0” didn’t produce Z-axis start.)

---

## Why the school can still “split”

Even with glue, splitting can happen if:

- `neighborRadius` becomes too small (low density) → clusters stop interacting
- orbit field is strong relative to cohesion/alignment
- solos are excluded from glue and drift away, pulling a subgroup with them

Typical fixes (in order of “least invasive”):
1. Increase `neighborRadius` slightly (or increase density mapping range).
2. Increase glue coefficient a bit (e.g. 0.35 → 0.5).
3. Reduce `orbitSpeed` slightly so local rules dominate.

---

## Troubleshooting checklist

### “Slider doesn’t do much”
- Ensure the parameter it controls actually feeds into `step()` each frame.
- Reduce `tau` (faster response), or snap `flock[i]=flockTarget[i]` on slider input.

### “Camera doesn’t start on Z axis”
- Set initial `yaw = Math.PI/2; pitch = 0;` before first `updateCamera()` call.

### “Fish colors wrong / black”
- This version uses `MeshBasicMaterial` per fish to avoid lighting and instancing color edge cases.

---

## Next refactor (recommended once stable)

If you later move out of single-file mode:

- `src/sim.js` — simulation state + `step(dt)`
- `src/render.js` — Three.js setup + render update
- `src/ui.js` — HUD bindings and mapping slider values to params
- `src/main.js` — entry point + loop

This makes debugging faster and avoids “one big file” regressions.

---
