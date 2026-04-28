# Loudness Meter (v4.15)

## Overview

Browser-based loudness analysis tool using Web Audio API.

Focus: - Physically consistent energy modeling - Dual-timescale
perception (3 s + 30 s) - Experimental perceptual metrics (delta, future
adaptive gate)

------------------------------------------------------------------------

## Key Features

### Signal Paths

-   Microphone input
-   Internal pink noise generator
-   Independent gain control

### Loudness Metrics

-   Short-term (3 s) loudness
-   Long-term exposure (30 s)
-   Delta (short − long)

### K-weighting (experimental)

-   Parallel K-weighted signal path
-   K 3 s / 30 s / delta
-   Direct comparison vs Full and Audio

### Histogram & Gating

-   LUFS-style histogram
-   Absolute + relative gating
-   Event-based gate visualization (flash on rejection)
-   Histogram now based on K-weighted signal

------------------------------------------------------------------------

## FFT & Spectrum

### Third-octave bands

-   Linear-energy summation per band (no dB averaging)
-   Fractional bin overlap at band edges (improves low-frequency
    accuracy)

### Important

-   FFT used for spectral diagnostics only
-   Loudness derived from time-domain energy

------------------------------------------------------------------------

## Energy Model (Core Principle)

All calculations use:

    energy = mean(x²)  OR  Σ |X[k]|²

No: - dB averaging - visual-only scaling

This ensures consistency across: - spectrum - loudness - histogram -
delta

------------------------------------------------------------------------

## Visualization

-   Semi-transparent bars (histogram visible through)
-   Unified dB scale across spectrum and loudness bars
-   Larger fonts for readability

------------------------------------------------------------------------

## Version Highlights

### v4.10

-   Introduced 30 s exposure model

### v4.11

-   Event-based gating visualization
-   Stop audio → feeds silence for decay testing

### v4.12

-   Added K-weighted path

### v4.13

-   Corrected FFT energy calculation

### v4.14

-   Unified physical energy model

### v4.15

-   Fixed octave band edge handling
-   Moved histogram to K-path
-   Improved visual layering

------------------------------------------------------------------------

## Next Steps

Planned: - Adaptive gate (delta-based) - Soft weighting instead of hard
gating - VDV-style (x⁴) exposure comparison

------------------------------------------------------------------------

## Notes

-   Not a full BS.1770 implementation
-   K-weighting is approximate
-   Designed for experimentation and learning
