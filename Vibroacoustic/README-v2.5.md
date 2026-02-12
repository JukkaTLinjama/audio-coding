# Vibro Keyboard v2.5

Low-frequency stereo synthesizer for tactile / vibro experiments with:

-   Beat mode (Δf stereo difference)
-   Phase mode (right-channel delay)
-   Loop recorder (Rec toggle + Play toggle)
-   Master Autopan (Pan LFO, rate = beat / 2)

------------------------------------------------------------------------

## Signal Architecture

Osc L/R → (Phase or Beat logic) → Stereo Merger → Master Gain →\
Pan LFO (stereo gain modulation) → Gate → Output

Pan is applied at master stereo level, so it does not interfere with
beat/phase generation logic.

------------------------------------------------------------------------

```mermaid
flowchart LR

  subgraph UI_Layer
    UI_Keys[Keyboard input]
    UI_Params[Sliders and Mode]
    UI_Pan[Pan LFO Controls]
    UI_LoopBtns[Rec and Play Buttons]
  end

  subgraph Loop_Engine
    L_Rec[Event Recorder]
    L_Ev[Recorded Events]
    L_Sch[Loop Scheduler]
  end

  subgraph Audio_Engine
    C_Mode[Mode Logic]
    O_L[Oscillator L]
    O_R[Oscillator R]
    A_Mix[Stereo Merger]
    A_Master[Master Gain]
    A_Pan[Pan LFO]
    A_Gate[Gate]
    A_Out[Output]
  end

  %% --- Control / parameter flow ---
  UI_Params -.-> C_Mode
  UI_Keys -.-> C_Mode
  UI_Pan  -.-> A_Pan

  UI_LoopBtns -.-> L_Rec
  UI_LoopBtns -.-> L_Sch
  L_Rec -.-> L_Ev
  L_Ev  -.-> L_Sch
  L_Sch -.-> C_Mode

  %% Mode logic drives oscillator params and gate
  C_Mode -.-> O_L
  C_Mode -.-> O_R
  C_Mode -.-> A_Gate
  C_Mode -.-> A_Pan

  %% --- Audio signal flow ---
  O_L --> A_Mix
  O_R --> A_Mix
  A_Mix --> A_Master
  A_Master --> A_Pan
  A_Pan --> A_Gate
  A_Gate --> A_Out
```

```mermaid
flowchart TD

  subgraph Mode_Logic

    IN_Base[baseHz]
    IN_Mode[lrMode]
    IN_Beat[beatHz]
    IN_Phase[phaseDeg]
    IN_Glide[glideS]
    IN_Loop[Loop Events]

    CALC_Beat[Compute fL and fR]
    CALC_Phase[Compute delayR]
    CALC_Pan[Compute panRate]
    CALC_Gate[Gate control]

    OUT_fL[fL to Osc L]
    OUT_fR[fR to Osc R]
    OUT_delay[delayR time]
    OUT_gate[Gate gain]
    OUT_pan[panRate abs beatHz half]

    IN_Base --> CALC_Beat
    IN_Beat --> CALC_Beat
    IN_Mode --> CALC_Beat
    IN_Glide --> CALC_Beat

    IN_Base --> CALC_Phase
    IN_Phase --> CALC_Phase
    IN_Mode --> CALC_Phase

    IN_Beat --> CALC_Pan
    IN_Loop --> CALC_Gate

    CALC_Beat --> OUT_fL
    CALC_Beat --> OUT_fR

    CALC_Phase --> OUT_delay
    CALC_Phase --> OUT_fL
    CALC_Phase --> OUT_fR

    CALC_Gate --> OUT_gate
    CALC_Pan --> OUT_pan

  end
```


# Parameters

## Base Frequency (Hz)

Fundamental oscillator frequency.

-   Affects both channels equally.
-   Used as reference for phase delay calculation.

------------------------------------------------------------------------

## Mode

### Beat Mode

Stereo difference is created by frequency offset.

-   L = baseHz - beatHz / 2\
-   R = baseHz + beatHz / 2\
-   Beat frequency = \|Δf\|

### Phase Mode

Both channels use the same frequency.

-   R channel is delayed relative to L.
-   Delay = (phaseDeg / 360) \* period

------------------------------------------------------------------------

## Beat Hz

Frequency difference between L and R in Beat mode.

-   Pan LFO rate = beatHz / 2
-   If beatHz = 0 → no autopan movement

------------------------------------------------------------------------

## Phase (deg)

Phase offset applied to right channel in Phase mode.

Displayed as: - Degrees - Equivalent delay in milliseconds

------------------------------------------------------------------------

## Glide (s)

Time constant for frequency transitions.

-   Uses exponential smoothing.
-   Affects note changes and loop playback.

------------------------------------------------------------------------

## Master Volume (0--1)

Controls final output gain.

Default: 0.5

------------------------------------------------------------------------

# Loop Recorder

## Rec loop (toggle)

-   First press → start recording
-   Second press → stop recording and finalize loop

Loop duration equals the time between first and last recorded event. No
artificial tail is added.

Recorded events: - gateOn (with hz) - setHz (glide moves) - gateOff

------------------------------------------------------------------------

## Play (toggle)

-   Starts loop playback
-   Press again to stop loop

Loop playback does not modify recorded events.

------------------------------------------------------------------------

# Pan LFO (Master Autopan)

Rate is automatically linked:

    panRate = beatHz / 2

This ensures one full left→right→left cycle per beat period.

Parameters:

## Enable

Turns autopan on/off.

## Depth (0--1)

Amount of stereo movement.

Gain mapping:

    pan = depth * sin(2π * rate * t + phase)
    gainL = 0.5 * (1 + pan)
    gainR = 0.5 * (1 - pan)

Depth 0 → centered\
Depth 1 → full L/R swing

## Phase (deg)

Initial phase of autopan LFO.

------------------------------------------------------------------------

# Design Principles

-   Deterministic loop playback
-   Separation of:
    -   Audio engine
    -   Loop engine
    -   UI layer
-   Minimal global coupling
-   Suitable for low-frequency tactile experimentation

------------------------------------------------------------------------

# Version

v2.5
