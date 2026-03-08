# Fish School Simulation --- v6.8

## Summary

Version **6.8** introduces simulation instrumentation and user controls
without modifying the underlying physics model. A new **simulation speed
control** and **simulation time display** allow inspecting the system at
different pacing levels while keeping the numerical behavior of the fish
dynamics unchanged.

This version focuses on **observability and UI improvements**, not on
changes to steering or flock dynamics.

------------------------------------------------------------------------

## New Features

### Simulation Speed Control

Two new controls are available in the HUD:

Speed −\
Speed +

Speed changes are multiplicative:

-   Speed − → ×0.8\
-   Speed + → ×1.25

Allowed range:

0.10× -- 100×

This allows both slow inspection and rapid time skipping.

------------------------------------------------------------------------

### Simulation Time Display

The HUD now shows:

Sim speed 1.00x · Sim time 0.0 s

This line displays:

-   current simulation speed multiplier
-   accumulated simulated time

The UI is updated **once per second** to avoid unnecessary DOM updates.

------------------------------------------------------------------------

## Important Design Detail

Simulation speed **does not modify the physics timestep**.

Architecture:

render dt → physics step\
simSpeed → simulation clock only

Therefore the following remain unchanged regardless of speed multiplier:

-   leader path motion
-   fish velocity integration
-   reaction lag dynamics
-   steering behavior

Example:

pathLeaderSpeed = world units per simulation second

remains constant.

This design avoids instability that could occur if large time
multipliers were applied directly to the physics timestep.

------------------------------------------------------------------------

## Leader Motion

The path leader advances along the spline using:

du = pathLeaderSpeed \* dt / pathLength

This keeps motion independent of render frame rate.

------------------------------------------------------------------------

## Steering Model

Fish steering combines:

-   separation
-   alignment
-   cohesion
-   leader attraction
-   random noise
-   reaction lag

Reaction lag uses exponential smoothing:

alpha = 1 − exp(-dt / tau)

which prevents synchronous reactions across the entire school.

------------------------------------------------------------------------

## Stability Measures

The simulation includes several safeguards:

-   timestep clamp (dt ≤ 0.033)
-   speed limits
-   turn-rate limits
-   reaction lag smoothing

These keep the system stable even during frame drops.

------------------------------------------------------------------------

## UI Improvements

HUD refinements:

-   blur effects removed
-   translucent panels used instead
-   landscape HUD implemented as fixed side panel
-   title/version bar remains centered

------------------------------------------------------------------------

## Known Limitations

Simulation speed currently affects only the **displayed simulation
clock**.

It does not affect:

-   leader motion
-   fish dynamics
-   steering behavior

A future version could introduce **true simulation time scaling**:

dtSim = dt \* simSpeed

This would require additional stability testing.

------------------------------------------------------------------------

## Version Focus

v6.8 focuses on **monitoring and control** of the simulation:

-   simulation speed control
-   simulation time display
-   stable UI updates

The core flocking algorithm remains unchanged.
