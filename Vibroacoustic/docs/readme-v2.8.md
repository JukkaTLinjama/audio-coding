# Vibro Keyboard v2.8 — Offline WAV Export

## What changed in v2.8
- Added **OfflineAudioContext rendering** for glitch-free, deterministic export.
- Added **in-browser WAV encoding (16‑bit PCM, RIFF/WAVE)**.
- Added **client-side .wav download** (“Render WAV” button).
- Removed the dependency on external JS module imports for export (everything needed is inside the single HTML file).

## New UI
- **Render WAV** button
  - Renders audio offline and downloads a `.wav` file (default name `v2_8_render.wav`).

## How it works (high level)
1. A snapshot of the current synth/loop settings is taken from the live state.
2. An **OfflineAudioContext** is created with:
   - `channels = 2`
   - `length = durationSec * sampleRate`
3. The synth graph is **rebuilt** inside the offline context (live nodes are not reused).
4. Offline rendering produces an `AudioBuffer`.
5. The buffer is encoded as **16-bit PCM WAV** and downloaded via a temporary object URL.

## Export behavior
- **Duration**:
  - If a loop exists: uses `loopState.loopDuration` (one full loop).
  - Otherwise: defaults to **5 seconds**.
- **Sample rate**: defaults to **48 kHz** (you can change in code).
- **Loop support**:
  - If loop events exist, offline render schedules them to reproduce the looped performance.
  - If no loop, it renders a continuous tone based on current settings.

## File(s)
- `vibro-keyboard-v2.8.html`
  - Single-file app.
  - Contains the offline render + WAV encode + download implementation.

## Key functions (v2.8)
- `downloadBlob(blob, filename)`
  - Triggers a browser download without server interaction.
- `encodeWavFromAudioBuffer(audioBuffer)`
  - RIFF/WAVE header + interleaved PCM16 samples.
- `renderOfflineToBuffer({ durationSec, sampleRate, stateSnapshot, loopSnapshot })`
  - Builds the offline graph and returns an `AudioBuffer`.
- `renderAndSaveWav({ ... })`
  - Orchestrates render → encode → download.
- `bindUI()`
  - Adds handler for `#wavBtn`.

## Known limitations / notes
- **Offline autopan parity**:
  - The offline export implementation may simplify some pan/phase behaviors compared to the live engine.
  - If you notice a mismatch, the next step is to refactor both live+offline to share a single `buildGraph(ctx, state)` function.
- **Memory usage**:
  - Offline render holds the whole output in memory. Very long exports can be heavy.

## Next recommended refactor (optional)
If you later want cleaner architecture:
- Extract a shared `buildSynthGraph(ctx, state)` used by both:
  - realtime `AudioContext`
  - offline `OfflineAudioContext`
This guarantees exported WAV matches realtime playback exactly.

## Quick test checklist
- Click **Start Audio** (if required) and play notes → sound works.
- Record a loop → **Play loop** reproduces it.
- Click **Render WAV** → download starts, file plays in any player.
