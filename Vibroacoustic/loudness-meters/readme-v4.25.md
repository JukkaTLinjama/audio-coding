# Web Loudness Meter – v4.25

## Overview

This project is a browser-based loudness analysis tool implemented as a single HTML + JavaScript file using the Web Audio API.

The system supports:
- Real-time analysis (microphone / internal test signals)
- Offline analysis (audio file input)
- Time-domain energy model
- K-weighted loudness approximation
- Histogram + gating-based statistics
- Short-term and long-term temporal views

The design prioritizes:
- transparency (explicit signal path)
- physical correctness (linear energy domain)
- minimal abstraction (single-file architecture)

---

# 1. Core Signal Model

All loudness-related quantities are derived from:

energy = mean(x²)

Key principles:
- Averaging is always performed in linear energy domain
- dB conversion is applied only at the end:

dB = 10 * log10(energy)

---

# 2. K-weighting (Approximation)

input → high-shelf (1500 Hz, +4 dB) → high-pass (60 Hz) → analyser

Notes:
- Not full ITU-R BS.1770 compliance
- Used consistently in realtime and offline modes

---

# 3. Realtime Analysis

- Update rate: ~60 FPS
- Loudness update: 10 Hz
- Short-term window: 3 s
- Long-term window: 30 s

Histories:
- kWeightedShortHistory (3 s)
- kWeightedLongExposure (30 s)
- levelScopeHistory (20 s)

---

# 4. LRA Estimation (Realtime)

- Source: K-weighted 3 s short-term
- Sampling: 1 Hz
- Absolute gate: -70 dB
- Relative gate: mean - 20 LU

LRA = p95 - p10

---

# 5. Offline Analysis

Using OfflineAudioContext:
- Full file rendered through K-weighting
- Mono energy computed

Arrays:
- peak04
- rms04
- rms3
- k3
- k30

---

# 6. Integrated Loudness (LUFS-I estimate)

From 400 ms K blocks:

- Absolute gate: -70 dB
- Relative gate: mean - 10 LU
- Integrated = mean(linear accepted blocks) → dB

---

# 7. Offline LRA

From k3:
- 1 Hz sampling
- same gating (-70 / -20)
- p10 / p95

---

# 8. Offline Scope (v4.25)

- 20 s window
- scrollable
- follow playback ON/OFF

Separation:
- file seek = playback
- scope slider = analysis window

---

# 9. Histogram

Uses K-weighted short-term values

Outputs:
- distribution
- percentiles
- LRA-like

---

# 10. Architecture

- Audio input
- Linear analysis
- Statistics
- Rendering

No dB averaging.

---

# 11. Limitations

- Not BS.1770 compliant
- Approximate K-weighting
- No true peak
- No channel weighting

---

# 12. Future (from session)

- 30 s segment comparison
- full timeline envelope
- multi-scale view
- better compliance

---

# Summary

Realtime → sliding windows  
Offline → full precomputation  
Scope → local  
Scrollable scope → navigation  
Histogram → distribution  
LRA → dynamics  
LUFS-I → integrated

Core principle:
Use linear energy consistently.
