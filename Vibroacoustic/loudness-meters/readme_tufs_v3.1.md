# Loudness Meter v3.x – TUFS Prototype

## Overview

This project is a browser-based real-time audio analyzer using Web Audio API.

It started as a frequency + RMS debug tool (v2.6) and evolved into a prototype for:

**TUFS (Tactile Units Full Scale)** – a perceptual metric for audiotactile energy.

---

## Core Idea

Audio:
Audio → LUFS → normalize playback loudness

Tactile:
Audio → TUFS → normalize tactile intensity

Key difference:
Not all tactile energy is beneficial.

---

## System Architecture

Microphone → FFT → Octave bands →

- Support (20–63 Hz)
- Irritation (80–125 Hz)
- Audio (125 Hz+)
- Full band (RMS)

→ Linear energy → 3 s smoothing → Visualization

---

## Frequency Model

Support (20–63 Hz):
- body-coupled
- pressure / weight

Irritation (80–125 Hz):
- neck/back buzz
- discomfort

Audio (125 Hz+):
- reference band

---

## TUFS Definition (prototype)

E_support = sum(20–63 Hz)
E_irritation = energy(80–125 Hz)

TUFS_net ≈ E_support / (E_irritation ^ k)

k = irritation penalty

---

## Time Model

- Instant: frame
- Short-term: 3 s smoothing
- Integrated: not yet implemented

---

## Meters

- Tactile Support
- Tactile Irritation
- TUFS Net
- Audio Level
- Full Band RMS

---

## Calibration

display_dB = raw_dB + offset

Separation:
- calibration ≠ scale ≠ computation

---

## Scaling (v3.1 fix)

Fixed range:
-60 dB … +12 dB

Reason:
- stable reference
- preserves low-level visibility

---

## Version History

### v2.6
- octave spectrum
- RMS meters
- stable scaling

### v3.0
- TUFS introduced
- support / irritation split
- 3 s smoothing
- scaling issue

### v3.1
- restored fixed scaling
- fixed visibility
- decoupled systems

---

## Limitations

- irritation band too coarse (125 Hz)
- no gating
- no perceptual validation

---

## Next Steps

- proper bandpass (80–100 Hz)
- TUFS integrated
- gating
- TUFS-LRA
- normalization

---

## Summary

Evolution:
signal visualization → perceptual tactile metric → control system

---

Status: Prototype
