# loudness-meter-v2.6

Browser-based microphone spectrum and level meter using Web Audio API.

## Summary

Version v2.6 keeps the v2.4 meter behavior as the reference and only freezes the spectrum scale.

Main layout:
- Spectrum on the left
- Tactile level meter
- Audio level meter
- Full band level meter

## What changed in v2.6

### 1) Fixed spectrum scale
The spectrum scale is no longer linked to the current RMS value.
It now stays fixed, so the visual reference does not move up and down over time.

### 2) Meter order changed
The vertical meters are now ordered as:
1. Tactile
2. Audio
3. Full band

### 3) RMS / full band meter kept as reference
The full band meter still uses the original RMS-based logic:
- raw RMS is measured from time-domain input
- calibration offset is added
- the result is shown as calibrated level

This was intentionally kept close to the previous working version.

## Meter definitions

### Tactile level
Uses the low octave bands:
- 31.5 Hz
- 63 Hz

These two bands are summed as linear energy and then converted back to dB.

### Audio level
Uses octave bands from:
- 125 Hz and above

These octave bands are summed as linear energy and then converted back to dB.

### Full band level
Uses time-domain RMS of the full input signal.
This acts as the main reference meter.

## Calibration

The calibration slider adds an offset in dB to displayed values:

calibrated_dB = raw_dB + offset

This is a display calibration only.
It is useful for matching the visual output to another meter, but it is not a true SPL calibration unless the whole system is calibrated against a known reference.

## Technical notes

- Input is captured with `getUserMedia()`
- Analysis is done with `AnalyserNode`
- RMS level uses time-domain data
- Octave bands use analyser frequency-domain data
- Band sums for tactile and audio meters use linear-energy summation

## Known limitations

- Octave bands are still based on average dB values inside each band, not full energy integration across FFT bins
- Display calibration is not the same as absolute SPL calibration
- Browser microphone behavior depends on browser permissions and secure context

## Suggested next steps

- Add peak hold for all meters
- Add slow / fast meter ballistics
- Convert octave-band calculation to true energy summation from FFT bins
- Add optional smoothing separately for spectrum and meters
