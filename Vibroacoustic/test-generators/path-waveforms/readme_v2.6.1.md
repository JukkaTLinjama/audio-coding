# Path Loop Generator v2.6.1 (Granular)

## Overview

This version introduces a key architectural fix:

**Source generation and signal projection are now fully decoupled**

This resolves previous issues where changing projection logic
unintentionally altered the underlying waveform (e.g. random path
behaving like pulse).

## Core Concept

The system is now explicitly split into three independent layers:

### 1. Source Shape (Geometry → Raw signal)

Defines the underlying 3D path and its intrinsic signal content.

-   Random\
    Irregular 3D closed curve\
    Produces complex waveform via projection

-   Pulse\
    Circular XY path\
    Z contains a Mexican hat (Ricker wavelet)

### 2. Signal Projection (How signal is read)

Defines how the signal is extracted from the 3D path.

-   Source Z (XY sweep)\
    Signal = Z\
    Sweep = XY projection\
    Stable waveform output

-   Display Y\
    Signal = screen-space Y\
    No monotonic X requirement\
    Oscilloscope-like view

### 3. Playback Warp (Timing modulation)

Optional phase warping applied during playback.

-   Based on XY projection\
-   Does not modify source buffer\
-   Only affects playback phase

## Signal Modes Summary

  Source   Projection   Result
  -------- ------------ --------------------------
  Random   Display Y    Original random waveform
  Random   Source Z     Experimental waveform
  Pulse    Source Z     Mexican hat waveform
  Pulse    Display Y    View-dependent waveform

## Design Principles

-   Do not couple geometry and signal extraction\
-   Do not couple projection and playback timing\
-   Allow non-monotonic projections\
-   Limit only extreme vertical segments

## Version Notes

### v2.6.1

-   Decoupled source shape and projection\
-   Fixed random waveform regression\
-   Stabilized projection modes
