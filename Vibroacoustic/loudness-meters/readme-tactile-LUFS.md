
# Tactile Loudness Framework (TUFS)

## Overview

This document defines a proposed framework for **Tactile Loudness Units relative to Full Scale (TUFS)**,
inspired by LUFS (audio loudness), but adapted for **audiotactile perception**.

Goal:
- Maintain consistent tactile intensity across content
- Avoid irritating vibration artifacts (e.g. 80–100 Hz “buzz”)
- Provide a standardizable measurement + control system

---

## Key Insight

LUFS measures perceived audio loudness over time.

TUFS should measure perceived tactile usefulness over time.

---

## System Architecture

audio signal
  ├─ tactile support path (20–63 Hz)
  ├─ tactile irritation path (80–125 Hz)
  ├─ optional audio path (125 Hz+)
  └─ full-band RMS reference

---

## Frequency Model

### Support band (positive)
- 20–63 Hz
- body-coupled vibration
- perceived as “weight”, “pressure”, “immersion”

### Transition band
- 63–80 Hz
- neutral / weak contribution

### Irritation band (negative)
- 80–125 Hz
- neck/back “buzz”, “tickle”, discomfort

---

## TUFS Definition

### Energy-based

E_support = energy(20–63 Hz weighted)  
E_irritation = energy(80–125 Hz weighted)

TUFS_net = 10 log10(E_support) − k * 10 log10(E_irritation)

Where:
- k ≈ 1.0–1.5 (tunable)

---

## Time Windows (LUFS analogy)

- Momentary TUFS: 400 ms
- Short-term TUFS: 3 s
- Integrated TUFS: gated over full program

---

## Gating

### Absolute gate
Remove segments below tactile threshold

### Relative gate
Remove segments below:

mean − 20 TU

---

## TUFS-LRA (Tactile Loudness Range)

1. compute short-term TUFS  
2. apply gating  
3. L10 = 10th percentile  
4. L95 = 95th percentile  
5. TUFS-LRA = L95 − L10  

---

## Irritation Metric (TII)

Separate metric:

TII = energy(80–125 Hz weighted)

Used to:
- detect “buzziness”
- constrain compression/limiting

---

## Practical Control Use

### Playback normalization

gain = target_TUFS − measured_TUFS

### Constraints

- Max TUFS-M (momentary)
- Max TII (irritation)
- TUFS-LRA within target range

---

## Design Principles

- Not all tactile energy is beneficial
- Separate support vs irritation
- Use time integration + gating
- Keep audio and tactile domains distinct

---

## Known Limitations

- Depends on chair/mechanical coupling
- Not a standardized unit (yet)
- Thresholds must be calibrated empirically

---

## References

Loudness standards:
- ITU-R BS.1770: https://www.itu.int/rec/R-REC-BS.1770
- EBU R128: https://tech.ebu.ch/loudness

Vibration standards:
- ISO 2631 (whole-body vibration)
- ISO 5349 (hand-arm vibration)

Research:
- Vibrotactile perception: https://pmc.ncbi.nlm.nih.gov/articles/PMC6684274/
- Tactile perception of music: https://www.dhi.ac.uk/books/icmem2015/tactile-perception-of-music/

---

## Next Steps

- Implement TUFS real-time meter
- Add adjustable support/irritation weighting
- Validate with user testing
- Define target TUFS levels for content types

---
