# Kalat v11

## Overview

`kalat-v11.html` adds the first working audio integration between the fish simulation and the external bubble audio engine.

The goal of this version is intentionally limited:
- keep the simulation behavior unchanged
- avoid changes inside the bubble engine unless absolutely necessary
- use the engine only through its public API
- prove that simulation state can drive audible sound in a stable way

This version is therefore a **minimal integration pass**, not a final sound design pass.

---

## Main idea

The simulation now sends a small set of control values to `bubble-engine.js` through the engine public API.

The integration is built around a lightweight bridge layer inside `kalat-v11.html`:
- the simulation still owns all motion and behavior
- the bubble engine still owns all sound generation and scheduling
- the new bridge only maps simulation values into audio control values

This keeps the architecture modular and reduces regression risk.

---

## Files

### `kalat-v11.html`
Main simulation file.

New responsibilities in v11:
- import the bubble audio engine
- create one engine instance
- hold a small `audioState` bridge object
- start audio from user interaction
- set the engine event generator once during setup
- push control updates from the simulation loop at a throttled rate

### `bubble-engine.js` (or local engine filename used in the project)
External audio engine.

Used only through public methods such as:
- `createBubbleAudioEngine(...)`
- `ensureAudio()`
- `startAudio()`
- `setEventGenerator(...)`
- `setControls(...)`

No simulation logic was moved into the engine.

---

## What was added in v11

### 1. Engine import and initialization
The simulation now imports the bubble audio engine and creates a single engine instance near the top of the module.

Purpose:
- keep audio lifetime separate from frame logic
- avoid re-creating the engine during runtime
- keep integration explicit and easy to debug

### 2. Audio bridge state
A small `audioState` object was added.

Typical fields:
- `started`
- `lastPushMs`
- `pushIntervalMs`
- `pan`
- `depth01`
- `rate`
- `volume`

Purpose:
- decouple simulation variables from engine API calls
- allow throttled updates
- provide a stable place for future mapping refinements

### 3. User-gesture audio start
Audio is started from an existing user interaction (`pointerup`).

Why:
- browsers typically require user gesture before audio playback
- this avoids autoplay failures
- keeps startup behavior simple

The startup routine:
1. ensures the audio context exists
2. resumes it if suspended
3. pushes an initial audible control state
4. starts the engine scheduler

### 4. One-time event generator setup
`setEventGenerator(...)` is called once during initialization.

Why:
- the engine expects an external event source
- this should not be rebuilt every frame
- keeps scheduling inside the engine and control logic outside it

### 5. Throttled control updates from the loop
The render loop now updates the audio bridge and pushes control values to the engine at a limited rate.

Reason for throttling:
- avoid unnecessary API calls on every render step
- reduce CPU overhead
- keep the first integration simple and stable

Approximate update rate:
- around every 80 ms
- roughly 12.5 updates per second

---

## First mapping used in v11

The first version uses intentionally simple mappings.

### `pan`
Mapped from fish #0 X position.

Interpretation:
- fish moving left/right shifts stereo position

Why this is good for first testing:
- easy to hear immediately
- easy to verify visually against the simulation

### `depth01`
Mapped from `pathBlend[0]`.

Interpretation:
- the audio responds to the transfer state between the main path and Path B

Why this replaced raw Z mapping:
- `pathBlend[0]` is a more meaningful behavioral signal
- it represents simulation state, not only spatial position
- gives more intentional coupling between motion mode and sound

### `rate`
Mapped from `schoolEffortMean`.

Interpretation:
- average school effort drives event density / activity

Why:
- effort is a natural proxy for how active the swarm is
- it gives a direct path from motion energy to sound density

### `volume`
Mapped from `schoolEffortMax`.

Interpretation:
- peak school effort influences output loudness

Why:
- strong local activity should sound stronger
- simple first-pass energy-to-loudness coupling

---

## What was deliberately NOT changed

To reduce risk, v11 does **not** do the following:
- no changes to fish steering logic
- no changes to path behavior
- no modifications to the engine synthesis internals
- no extra UI controls for audio yet
- no advanced pitch/harmony mapping yet
- no smoothing/filtering refinement beyond simple throttling

This is important: v11 is primarily an **integration checkpoint**.

---

## Why this architecture is safe

The main safety principle is separation of concerns.

### Simulation remains authoritative
The fish simulation still computes:
- motion
- path transitions
- effort metrics
- rendering

### Engine remains authoritative
The bubble engine still computes:
- audio scheduling
- event timing
- synthesis behavior
- playback routing

### Bridge only maps values
The new layer only:
- reads a few simulation outputs
- stores them in `audioState`
- sends them through the public API

This minimizes the chance of breaking existing simulation behavior.

---

## Known limitations in v11

This version is functional but still coarse.

### 1. Mapping scales are provisional
The current coefficients are test values.

Possible symptoms:
- pan may be too sensitive or too weak
- rate may stay in a narrow range
- volume may react too abruptly

### 2. Depth meaning is still indirect
`depth01` now follows `pathBlend[0]`, which is better than raw Z, but it still depends on how the engine interprets that control internally.

### 3. No pitch logic yet
The sound does not yet reflect:
- harmony
- school coherence
- dissonance
- path curvature
- direction changes

### 4. No dedicated audio debug UI yet
All debugging currently relies on code inspection, console logging, and audible behavior.

---

## Expected behavior in v11

After the first user interaction:
- audio starts reliably
- stereo position follows fish movement in a basic way
- sound density follows school effort
- loudness follows peak effort
- switching toward Path B changes the depth/control signal through `pathBlend[0]`

If this behavior is present, the first integration is successful.

---

## Suggested next steps

These are logical follow-ups after v11.

### Step 1: refine scaling
Tune the current mappings:
- X → pan sensitivity
- effort → rate curve
- effort → volume curve

### Step 2: add smoothing where needed
If the sound reacts too abruptly, add lightweight smoothing to selected control signals before sending them to the engine.

### Step 3: add pitch/harmony mapping
Good future candidates:
- school coherence → tuning stability
- school disorder → detune or note spread
- path state → pitch center or chord selection

### Step 4: expose audio controls in UI
Only after the base integration is stable.

Examples:
- audio enable/disable
- master audio amount
- mapping strengths
- debug readout

---

## Summary

v11 is the first working bridge between the simulation and the bubble audio engine.

It proves that:
- the engine can be controlled from the simulation through the public API
- audio can follow simulation state in real time
- this can be done without changing the simulation core behavior
- the architecture stays modular and low-risk

This makes v11 a solid base for later sound design and deeper simulation-to-audio mapping.
