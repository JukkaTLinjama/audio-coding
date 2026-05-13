# Tactile Feelness Control (TFC) -- Loudness & TUFS Analyzer

## Overview

This tool analyzes audio using both traditional loudness (LUFS) and
tactile-oriented metrics (TUFS):

-   **K-weighted loudness (LUFS)** → auditory perception\
-   **Tactile Support (low bass)** → foundation / body feel\
-   **Tactile Irritation (upper bass)** → risk of discomfort

------------------------------------------------------------------------

## Core Concepts

**Audio loudness (LUFS) ≠ Tactile feel (TUFS)**

### Tactile bands

-   Support (\~20--70 Hz) → body / foundation\
-   Irritation (\~70--120 Hz) → discomfort risk

### TFC Limiter

    dry → analysis → limit → reduction → wet

------------------------------------------------------------------------

## Features

### Realtime

-   K-weighted loudness (0.4s / 3s / adaptive)
-   T Support & T Irr bands
-   20 s scope
-   TFC limiter visualization

### Offline

-   Integrated values
-   LRA
-   p10 / p95 / p99
-   Max values
-   Over-limit %

------------------------------------------------------------------------

## UI (v5.42)

### Primary

-   Support (cyan)
-   Irritation (amber)
-   Loudness (mint)

### Secondary

-   Audio / Full (gray)

### Overlay

-   Integrated tactile / Support
-   Integrated tactile / Irritation
-   Integrated loudness / K

------------------------------------------------------------------------

## Design Principles

-   Causal control\
-   Separation of concerns\
-   Observability first\
-   Minimal coupling

------------------------------------------------------------------------

## Status

### Stable

-   limiter
-   realtime + offline analysis
-   stepped sine
-   UI hierarchy

### Experimental

-   TUFS interpretation
-   recommendation heuristics

------------------------------------------------------------------------

## Notes

This is not a standard loudness meter.

**Sound → Vibration → Somatic experience**
