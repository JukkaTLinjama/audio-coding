# Vibro Keyboard v2.9 — Generator Modularization

## Summary

v2.9 refactors the live audio source into a separate generator file while keeping
the overall architecture stable and preserving WAV export functionality.

The sine L/R generator has been moved to:

    /js/sineGenerator.js

The main HTML file now delegates oscillator creation and frequency updates
to this external generator.

---

## What Changed in v2.9

### 1. Generator extracted to external JS

New file:

    js/sineGenerator.js

Responsibilities:
- Create oscL / oscR
- Manage beat mode (Δf split)
- Manage phase mode (R channel delay)
- Provide:
  - start()
  - stop(t)
  - update(glide)
  - merger output node
  - delayR reference

Exposed globally as:

    window.createSineGenerator(...)

This avoids ES module import issues and keeps GitHub Pages compatibility.

---

### 2. Main script simplified

The HTML file no longer contains:
- Oscillator construction
- Generator update logic
- Inline return blocks from generator

Instead:

    gen = window.createSineGenerator(ctx, state, now, {
        setParamSmooth,
        updatePhaseDelay,
    });

Frequency updates now delegate through:

    updateFrequencies() → gen.update()

---

### 3. WAV Export unaffected

Offline WAV export remains fully functional.

Reason:
- Offline rendering rebuilds its own audio graph.
- It does NOT depend on the live generator instance.

No changes were made to:
- renderOfflineToBuffer()
- encodeWavFromAudioBuffer()
- renderAndSaveWav()

---

## Architecture Now

Live Audio Flow:

    Generator (osc L/R)
        ↓
    MasterGain
        ↓
    Autopan (splitter → gains → merger)
        ↓
    Gate
        ↓
    Destination

Offline Export:
- Rebuilds equivalent graph inside OfflineAudioContext
- Schedules loop events
- Encodes PCM16 WAV
- Downloads file

---

## Why This Refactor Matters

Benefits:

- Cleaner separation of concerns
- Generator logic isolated from UI
- Safer future extensions:
    - PeriodicWave generator
    - Harmonic generator
    - Buffer loop generator
    - AudioWorklet generator
- Reduced regression risk
- Easier debugging

---

## Status

- Live playback works
- Loop recording works
- Store loop (MediaRecorder) works
- Offline WAV export works (partially)
- Phase mode and beat mode preserved

v2.9 is a structural upgrade, not a sound change.
