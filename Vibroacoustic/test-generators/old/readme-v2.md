# Path Loop Gen v2 --- 3D Path Projection Loop Generator

## What this is

A standalone Three.js + WebAudio experiment that generates a loopable
waveform from a closed 3D curve.

Instead of defining sound mathematically (sin, saw, etc.), the waveform
is derived from geometry.

------------------------------------------------------------------------

## Core Architecture

### 1. Closed 3D Curve

A random closed Catmull-Rom curve is generated:

-   pathRadius
-   pathJitter
-   pathZAmplitude
-   pathControlPoints

Closed curve ensures strict periodicity.

------------------------------------------------------------------------

### 2. Fixed Projection Plane

Projection plane: - XZ plane (horizontal) - Normal: +Y

Base signal:

    s(u) = y_rot(u)

Where the rotated curve point is projected onto the +Y axis.

------------------------------------------------------------------------

### 3. World-Space Rotation

User rotates the curve via pointer drag.

Important: The same Euler rotation is applied to:

-   Visual curve object
-   Audio sampling points

This guarantees audio/visual consistency.

------------------------------------------------------------------------

### 4. Loop Buffer Synthesis

-   1 second AudioBuffer (sampleRate length)
-   Represents 1 Hz base cycle
-   playbackRate controls pitch
-   source.loop = true

This ensures stable seamless looping.

------------------------------------------------------------------------

## Impact Mode (v2 Feature)

Adds transients when curve crosses projection plane.

Crossing detection:

    sign(y[i-1]) != sign(y[i])

At each crossing: - Short triangular pulse added - Width = impactWidth -
Strength ∝ crossing slope

This increases harmonic content while keeping geometric interpretation
intact.

------------------------------------------------------------------------

## Signal Flow

Curve → Rotate → Project → Normalize → Add Impact → Shape → AudioBuffer
→ Loop

------------------------------------------------------------------------

## Waveform Scope

Displays exact buffer content:

-   DC-centered visualization
-   Auto amplitude scaling
-   0-level reference line
-   Mean (DC) line
-   Endpoint-safe rendering

------------------------------------------------------------------------

## Controls

Audio: - Frequency - Volume - Sharpness

Path: - Radius - Jitter - Z amplitude - Control points - Regenerate

Impact: - On/Off - Gain - Width

------------------------------------------------------------------------

## Known Limitations

-   Buffer rebuild required after rotation
-   Mono only
-   Catmull-Rom smoothness limits sharpness without impact

------------------------------------------------------------------------

## Conceptual Insight

This generator treats sound as:

    A measurement of geometry.

Waveform is not defined --- it is observed.

------------------------------------------------------------------------

Version: v2 Status: Experimental
