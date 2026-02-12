# Vibro L/R Beat Keyboard – v2.7

## Overview

Version **2.7** introduces a new **Store Loop** feature that allows rendering a recorded loop as a single-cycle audio file.

The loop is played once in "monitor mode", recorded in realtime from the master audio bus, and automatically downloaded as a file (typically `.webm`).

This update does **not** modify existing loop or playback behavior.

---

## New Feature: Store Loop

### What it does

- Requires an existing recorded loop (`Rec loop`)
- Forces STOP state before starting
- Plays exactly **one loop cycle**
- Records audio from the post-gate master bus
- Stops automatically after one cycle
- Prompts for filename
- Downloads audio file (webm blob)

### Design Principles

- Deterministic per current parameter state
- Does not require loop to be currently playing
- Playback and recording logic remain separated
- No modification of existing loop event logic

---

## Audio Routing (Recording Tap)

Recording taps the final master bus:

```
oscillators
  → masterGain
  → pan
  → gateGain
  → destination
  → MediaStreamDestination (recording tap)
```

This guarantees:

What you hear = what gets recorded

---

## Loop System (Unchanged)

### Event Loop
- Records gate and pitch events
- Stores `loopDuration`
- Plays cyclically via timeout scheduler

### One-Shot Scheduler (New)
Used only for Store Loop.
- Schedules loop events once
- Does not reschedule next cycle

---

## File Format

Current implementation uses:
- `MediaRecorder`
- Typical output: `audio/webm;codecs=opus`

This can later be extended to:
- WAV (PCM encoding via AudioWorklet or OfflineAudioContext)

---

## UI Changes

Added:
- `Store loop` button

Existing buttons unchanged:
- `Rec loop`
- `Play loop`

---

## Internal Additions

New components:

- `scheduleLoopOneShot()`
- `startBlobRecording()`
- `stopBlobRecordingAndSave()`
- `storeLoopOnce()`

Global state additions:
- `recDest`
- `mediaRecorder`
- `recChunks`
- `isStoring`

---

## Future Refactoring Plan

Recommended next step:

1. Extract recording and store logic into `recorder.js`
2. Keep loop state temporarily in main HTML
3. Later unify into a `Recorder` namespace

This staged approach minimizes regression risk.

---

## Version History

### v2.7
- Added Store Loop (one-shot + realtime blob recording)
- Added master-bus recording tap
- No breaking changes

---

Generated: 2026-02-12 17:24
