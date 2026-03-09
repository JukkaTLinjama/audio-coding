# Fish School Simulation -- v6.9

## Overview

Version 6.9 introduces a **fixed‑step accumulator simulation loop** and
a **dynamic simulation speed control**.\
The goal is to allow both real‑time exploration and accelerated
simulation without destabilizing the physics.

The simulation is built with **Three.js** and runs in a
`requestAnimationFrame` render loop while physics advances using a fixed
timestep.

------------------------------------------------------------------------

# Key Changes in v6.9

## 1. Fixed‑Step Accumulator Simulation

The simulation no longer advances physics using a single variable
timestep per frame.

Previous approach:

    step(realDt * simSpeed)

New architecture:

    accumulator += realDt * simSpeed

    while accumulator >= fixedDt
        step(fixedDt)
        accumulator -= fixedDt

This ensures that physics always sees a stable timestep.

### Parameters

    simFixedDt = 1/60 s
    maxSimStepsPerFrame = 240

Meaning:

-   physics runs at **60 Hz**
-   render rate is independent of simulation speed
-   large speed multipliers remain stable

------------------------------------------------------------------------

## 2. Dynamic Simulation Speed

A UI slider allows real‑time adjustment of simulation speed.

    simSpeed: 0.1 → 100

Examples:

  simSpeed   effect
  ---------- ---------------------------------------
  1          real time
  10         10× faster simulation
  50         fast exploration of emergent behavior

Simulation time advances as:

    simAccumulator += realDt * simSpeed

------------------------------------------------------------------------

## 3. Simulation Diagnostics HUD

The simulation status display now shows:

    Sim speed
    Sim time
    dt
    acc
    simRate

Example:

    Sim speed 10.00x · Sim time 42.3 s · dt 0.017 s · acc 0.010 s · simRate 9.8x

Meaning:

  Field      Meaning
  ---------- ------------------------------------------
  simSpeed   user‑set speed multiplier
  simTime    accumulated simulated time
  dt         physics timestep (fixedDt)
  acc        simulation time waiting in accumulator
  simRate    actual simulated seconds per real second

The `acc` value indicates whether the CPU keeps up with the simulation.

Normal range:

    0 ≤ acc ≤ fixedDt

If `acc` grows large, the simulation cannot keep up with the requested
speed.

------------------------------------------------------------------------

## 4. CPU Safety Limit

To avoid runaway catch‑up loops:

    maxSimStepsPerFrame = 240

If exceeded, the accumulator backlog is cleared.

    simAccumulator = 0

This prevents the simulation from freezing when extremely high speeds
are requested.

Tradeoff:

Some simulation time may be skipped if the CPU cannot keep up.

------------------------------------------------------------------------

## 5. Stable Physics Behaviour

The new architecture improves stability of:

-   boid steering
-   separation forces
-   reaction lag
-   leader following

because physics always runs with:

    dt = fixedDt

instead of large variable timesteps.

------------------------------------------------------------------------

# Architecture Summary

Render loop:

    requestAnimationFrame(loop)

Inside loop:

    realDt = frameDelta
    simAccumulator += realDt * simSpeed

    while simAccumulator >= fixedDt
        step(fixedDt)
        updateBubbles(fixedDt)
        simAccumulator -= fixedDt
        simTime += fixedDt

    renderMeshes()
    renderer.render()

Key property:

    render rate ≠ simulation rate

------------------------------------------------------------------------

# Practical Limits

Typical behaviour observed:

  simSpeed   physics steps per frame
  ---------- -------------------------
  1          \~1
  10         \~10
  50         \~50

At high values CPU becomes the limiting factor.

The accumulator HUD value helps diagnose this.

------------------------------------------------------------------------

# Next Possible Improvements

Future directions being considered:

### Offline simulation rendering

Deterministic frame export pipeline:

    simulation → PNG frames → ffmpeg → MP4

### Long‑timescale swarm analysis

Use accelerated simulation to observe:

-   formation changes
-   spatial distributions
-   leader influence zones

### Recording mode

Capture frames at fixed simulation intervals:

    if frameIndex % N == 0 → render + saveFrame()

------------------------------------------------------------------------

# Version Summary

**v6.9 highlights**

-   accumulator‑based fixed timestep simulation
-   dynamic simulation speed control
-   simulation diagnostics HUD
-   CPU safety limit for high speed runs

This version establishes a robust architecture for both **interactive
exploration** and **future offline simulation rendering**.
