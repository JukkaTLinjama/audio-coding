# Vibro Keyboard -- Architecture Diagram (v2.5)

``` mermaid
flowchart LR

    subgraph UI_Layer
        Buttons[Rec / Play Buttons]
        Sliders[Sliders: BaseHz, BeatHz, Phase, Glide, MasterVol]
        PanControls[Pan LFO Controls]
    end

    subgraph Loop_Engine
        Recorder[Event Recorder]
        EventList[Recorded Events]
        Scheduler[Loop Scheduler]
    end

    subgraph Audio_Engine
        OscL[Oscillator L]
        OscR[Oscillator R]
        ModeLogic[Beat / Phase Logic]
        Merger[Stereo Merger]
        MasterGain[Master Gain]
        PanLFO[Pan LFO (rate = beat/2)]
        Gate[Gate Envelope]
        Output[Audio Output]
    end

    Sliders --> ModeLogic
    Buttons --> Recorder
    Buttons --> Scheduler
    PanControls --> PanLFO

    OscL --> ModeLogic
    OscR --> ModeLogic
    ModeLogic --> Merger
    Merger --> MasterGain
    MasterGain --> PanLFO
    PanLFO --> Gate
    Gate --> Output

    Recorder --> EventList
    EventList --> Scheduler
    Scheduler --> ModeLogic
```

------------------------------------------------------------------------

## Notes

-   Pan LFO operates at master stereo level (after Master Gain).
-   Loop Engine feeds frequency and gate events back into the Audio
    Engine.
-   UI layer modifies state but does not directly manipulate audio
    nodes.
