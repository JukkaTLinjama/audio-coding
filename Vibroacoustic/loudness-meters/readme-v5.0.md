# Web Loudness Meter – v5.0

## Overview

This project is a browser-based loudness analysis tool implemented as a single HTML + JavaScript file using the Web Audio API.

The system supports:
- Realtime analysis (microphone / internal test signals)
- Offline analysis (audio file input)
- K-weighted loudness estimation
- Integrated loudness (LUFS-style estimate)
- Loudness Range (LRA-like)
- Segment-based dynamics analysis
- Scrollable time-domain scope

---

# 1. Core Principle

All calculations are based on:

energy = mean(x²)

Averaging is always done in linear domain, not dB.

dB = 10 * log10(energy)

---

# 2. Analysis Modes

## Realtime
- Sliding windows
- Continuous update
- Running estimates

## Offline (file)
- Full precomputation
- Deterministic results
- Time-indexed arrays

---

# 3. K-weighting

input → high-shelf (+4 dB @ 1500 Hz) → high-pass (60 Hz)

Approximation of BS.1770 K-weighting.

---

# 4. Program Loudness

## K Integrated (estimate)

Computed from 400 ms K-weighted blocks

Gating:
- Absolute: -70 dB
- Relative: mean - 10 LU

Realtime:
- Running estimate
- Warm-up phase (~10 s)

---

# 5. Program Dynamics

## LRA (3 s)
- Source: K-weighted 3 s
- Sampling: 1 Hz
- Gate: -70 / (mean - 20)

LRA = p95 - p10

## Segment Range (30 s)
- max(segment) - min(segment)
- macro dynamics indicator

---

# 6. Segment Analysis

Per 30 s:
- K integrated estimate
- fallback: K30 mean
- delta vs program

Outputs:
- loudest / quietest segment
- current segment
- segment range

---

# 7. Time Scope

Realtime:
- 20 s sliding window

Offline:
- 20 s scrollable window
- follow / manual mode

---

# 8. Histogram

Based on K-weighted short-term values

Used for:
- distribution
- gating diagnostics

---

# 9. Architecture

Audio → Linear energy → Statistics → Rendering

No dB averaging.

---

# 10. System Goal (Next Stage)

Goal:
Use LUFS-style dynamics to control low-frequency balance.

Approach:
- Extract lowest-band energy (third-octave)
- Apply loudness-style smoothing
- Compute dynamics (short + long)
- Generate control signal

Applications:
- bass leveler
- dynamic EQ
- multiband compression sidechain
- adaptive mixing

---

# 11. Limitations

- Not BS.1770 compliant
- Approximate K-weighting
- No true peak
- No multichannel weighting

---

# 12. Future Directions

- Band-limited LUFS
- Low-frequency dynamics control
- DSP integration

---

# Summary

Realtime → running estimates  
Offline → full analysis  
Scope → local  
Segments → structure  
LRA → dynamics  
K-I → loudness  

Core principle:
Use linear energy consistently.
