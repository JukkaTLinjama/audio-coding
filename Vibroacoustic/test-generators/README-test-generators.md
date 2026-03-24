# Path Loop Gen

Experimental geometry-driven audio oscillator.

## Overview

This project generates loopable audio from a closed 3D path instead of a
traditional oscillator.

Core idea:

-   Generate a closed 3D Catmull-Rom curve
-   Rotate the curve in world space
-   Project it onto a fixed horizontal plane (XZ, normal +Y)
-   Bake one full cycle into a 1-second AudioBuffer
-   Control pitch using playbackRate
-   Display the exact loop buffer in a waveform scope

## Current Version

See: readme-v2.md

## Concept

Sound is treated as a 1D observation of a higher-dimensional geometric
system:

    waveform(u) = projection( rotated_curve(u) )

This keeps visual and audio domains physically consistent.

## Status

Experimental prototype. Mono output. Buffer-based loop synthesis.
