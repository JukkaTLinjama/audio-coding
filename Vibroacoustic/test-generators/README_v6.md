# Path Generator v6 – Modular Audio Engine + Event Injection

Interactive HTML/JS prototype combining:
- 3D path (Three.js)
- Continuous motion (time-based transport)
- Stochastic event scheduling
- Modular bubble audio engine (Web Audio API)

---

## Overview

Path (3D) → Continuous motion → Event generator → Audio engine → Sound

---

## Key Architecture Changes (v6)

### 1. Audio Engine Modularization
- Extracted into separate file: `bubble-engine.js`
- Engine is now self-contained and reusable
- No dependency on:
  - DOM
  - Three.js
  - UI state (`uiParams`)

---

### 2. Clean Engine ↔ Host Separation

**Engine responsibilities:**
- scheduling (time / lookahead)
- stochastic timing
- synthesis (bubble sound)
- control blending (overrides + defaults)

**Host responsibilities:**
- path generation (Three.js)
- phase / motion
- point sampling
- mapping → audio controls
- UI + visualization

---

### 3. Event Injection (Major Change)

Old model:
startAudio(simBridge)
engine → simBridge → mapping

New model:
setEventGenerator(fn)
engine → fn(when) → event

Engine no longer knows:
- curves
- coordinates
- mapping logic

---

### 4. Waveform Decoupling

- Engine no longer draws to canvas
- Provides data via:
  - getOutputWaveform()
- UI handles rendering

---

### 5. UI Param Decoupling

- Removed direct uiParams access inside engine
- Initial values injected via:

createBubbleAudioEngine(initialDefaults)

- Runtime updates via:
setUiParams()

---

## Audio Engine API

Core methods:

- startAudio()
- stopAudio()
- setEventGenerator(fn)
- setControls(update)
- resetControls()
- setUiParams(params)
- getActiveState()
- getOutputWaveform()

---

## Event Generator Contract

Host must provide:

(when: number) => {
  pan: number
  freq: number
  rate: number
  depth01?: number
}

This defines one bubble event at time `when`.

---

## Mapping (Host)

Current mapping:

- X → pan
- Y → pitch (MIDI → frequency)
- Z → event rate (density)

Key principle:
- visual proximity → auditory density

---

## Scheduling Model

- Lookahead scheduler (~150 ms)
- Per-voice timing
- Poisson-like intervals
- Burst shaping via “burstiness”
- Overlap controls grain length

---

## Sound Model

Each bubble:
- sine oscillator (core tone)
- filtered noise (texture)
- short envelope (click-free)
- stereo panning

Triad-based pitch variation:
- offsets: [0, +4, +7]

---

## Improvements from v5.5

- Engine extracted to module
- Removed UI + DOM dependencies
- Introduced eventGenerator abstraction
- Simplified startAudio() API
- Waveform rendering moved to host
- Explicit dependency injection (initialDefaults)

---

## Architectural Result

Clear separation:

Host (simulation / UI)
        ↓
Event Generator
        ↓
Audio Engine (pure)

Engine is now:
- reusable
- testable
- independent

---

## Notes

- Scheduler uses setInterval (25 ms) → not sample-accurate
- Further split possible:
  - scheduler
  - music logic
  - synthesis

---

## Version

v6
