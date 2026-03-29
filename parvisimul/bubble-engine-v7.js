// bubble audio engine v7.0
// EN: Introduces directional coherence → dissonance mapping,
// EN: chord warping, and overlap-based texture control.
// EN: BREAKING: adds 'dissonance' to public controls.

export function createBubbleAudioEngine(initialDefaults = {}) {
    function clamp(v, min, max) {
        return Math.min(max, Math.max(min, v));
    }

    const PUBLIC_CONTROL_KEYS = [
        "rate",
        "depth01",
        "pan",
        "volume",
        "baseMidi",
        "maxRate",
        "burstiness",
        "overlap",
        "dissonance"
    ];

    let engineDefaults = {
        masterVolume: initialDefaults.masterVolume ?? 0.72,
        baseMidi: initialDefaults.baseMidi ?? 57,
        maxRate: initialDefaults.maxRate ?? 20,
        burstiness: initialDefaults.burstiness ?? 1.0,
        overlap: initialDefaults.overlap ?? 0.25
    };

    const apiOverrides = {
        rate: null,
        depth01: null,
        pan: null,
        volume: 1.0,
        baseMidi: null,
        maxRate: null,
        burstiness: null,
        overlap: null,
        dissonance: null
    };

    let ctx = null;
    let masterGain = null;
    let analyser = null;
    let outTimeData = null;
    let bubbleNoiseBuffer = null;

    let isOn = false;
    let schedulerTimer = null;

    // EN: Expanded major chord with octave support for a wider harmonic texture.
    //const chordSemitones = [-12, 0, 4, 7, 12];
    const chordSemitones = [0, 1, 6, 11];
    let nextVoiceTimes = chordSemitones.map(() => 0); // EN: Per-voice next scheduler time
    let arpIndex = 0;

    let simBridge = null;
    let eventGenerator = null; // Optional external event generator for testing without the simBridge.

    let hostCallbacks = {
        onPublicStateChanged: null
    };

    function getContext() {
        return ctx;
    }

    function getCurrentTime() {
        return ctx ? ctx.currentTime : 0;
    }

    function notifyPublicStateChanged() {
        if (typeof hostCallbacks.onPublicStateChanged === "function") {
            hostCallbacks.onPublicStateChanged(getActiveState());
        }
    }

    function semitoneRatio(semitones) {
        return Math.pow(2, semitones / 12);
    }

    function midiToFreq(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    // EN: Randomly detune a voice more when the school headings are less coherent.
    // EN: disagreement01 = 0 -> pure chord, 1 -> strongest detune.
    function applyDirectionalDetune(freq, disagreement01) {
        const d = clamp(disagreement01, 0, 1);

        // EN: Random fine detune. This adds unstable pitch when the school loses coherence.
        const maxCents = 32;

        const cents = (Math.random() * 2 - 1) * maxCents * d;
        return freq * Math.pow(2, cents / 1200);
    }

    // EN: Warp chord intervals toward more dissonant semitone offsets when coherence is low.
    // EN: This is much more audible than cents-only detune.
    function applyDirectionalChordWarp(semitoneOffset, disagreement01) {
        const d = clamp(disagreement01, 0, 1);

        // EN: Keep original chord when the school is coherent.
        if (d < 0.18) return semitoneOffset;

        // EN: More dissonant alternatives around the major triad / octave stack.
        const warpedChoices = [
            -12, -11, -9,
            0, 1, 2, 5, 6, 8, 9, 11, 13
        ];

        // EN: Probability rises strongly with disorder.
        const warpProb = 0.25 + 0.75 * d;

        if (Math.random() < warpProb) {
            return warpedChoices[Math.floor(Math.random() * warpedChoices.length)];
        }

        return semitoneOffset;
    }

    function durationScaleFromFreq(freq, baseMidi) {
        const baseFreq = midiToFreq(baseMidi);
        const ratio = baseFreq / Math.max(40, freq);
        return clamp(Math.pow(ratio, 0.55), 0.65, 1.75);
    }

    function sanitizePublicControls(update = {}) {
        const sanitized = {};
        for (const key of PUBLIC_CONTROL_KEYS) {
            if (Object.prototype.hasOwnProperty.call(update, key)) {
                sanitized[key] = update[key];
            }
        }

        if (sanitized.volume != null) sanitized.volume = clamp(sanitized.volume, 0, 1);
        if (sanitized.baseMidi != null) sanitized.baseMidi = clamp(sanitized.baseMidi, 36, 84);
        if (sanitized.maxRate != null) sanitized.maxRate = clamp(sanitized.maxRate, 5, 40);
        if (sanitized.burstiness != null) sanitized.burstiness = clamp(sanitized.burstiness, 0.4, 2.0);
        if (sanitized.overlap != null) sanitized.overlap = clamp(sanitized.overlap, 0.0, 0.85);
        if (sanitized.dissonance != null) sanitized.dissonance = clamp(sanitized.dissonance, 0, 1);
        if (sanitized.pan != null) sanitized.pan = clamp(sanitized.pan, -1, 1);
        if (sanitized.depth01 != null) sanitized.depth01 = clamp(sanitized.depth01, 0, 1);
        if (sanitized.rate != null) sanitized.rate = Math.max(0, sanitized.rate);

        return sanitized;
    }

    function getControls() {
        return { ...apiOverrides };
    }

    function getActiveState() { //// EN: Return the effective public control state, not only the engine-default-backed subset.
        return {
            rate: apiOverrides.rate,
            depth01: apiOverrides.depth01,
            pan: apiOverrides.pan,
            volume: clamp(apiOverrides.volume ?? 1, 0, 1),
            baseMidi: apiOverrides.baseMidi ?? engineDefaults.baseMidi,
            maxRate: apiOverrides.maxRate ?? engineDefaults.maxRate,
            burstiness: apiOverrides.burstiness ?? engineDefaults.burstiness,
            overlap: apiOverrides.overlap ?? engineDefaults.overlap,
            dissonance: apiOverrides.dissonance ?? 0
        };
    }

    function getActiveControls() {
        return getActiveState();
    }

    function getStatus() {
        return {
            isRunning: isOn,
            audioReady: !!ctx,
            contextState: ctx ? ctx.state : "uninitialized"
        };
    }

    function setHostCallbacks(callbacks = {}) {
        hostCallbacks = {
            ...hostCallbacks,
            ...callbacks
        };
    }

    function setEventGenerator(fn) { // EN: Host injects event generation logic so the engine no longer depends on path/simulation internals
        eventGenerator = (typeof fn === "function") ? fn : null;
    }    

    function setUiParams(nextParams) {
        engineDefaults = {
            ...engineDefaults,
            masterVolume: nextParams.masterVolume,
            baseMidi: nextParams.baseMidi,
            maxRate: nextParams.maxRate,
            burstiness: nextParams.burstiness,
            overlap: nextParams.overlap
        };
    }

    function setControls(update) {
        const sanitized = sanitizePublicControls(update);
        Object.assign(apiOverrides, sanitized);
        notifyPublicStateChanged();
    }

    function updateControl(update) {
        setControls(update);
    }

    function resetControls() {
        apiOverrides.rate = null;
        apiOverrides.depth01 = null;
        apiOverrides.pan = null;
        apiOverrides.volume = 1.0;
        apiOverrides.baseMidi = null;
        apiOverrides.maxRate = null;
        apiOverrides.burstiness = null;
        apiOverrides.overlap = null;
        apiOverrides.dissonance = null;
        notifyPublicStateChanged();
    }

    function resetControl() {
        resetControls();
    }

    function createNoiseBuffer(audioCtx, durationSec = 0.12) {
        const sr = audioCtx.sampleRate;
        const len = Math.max(1, Math.floor(durationSec * sr));
        const buf = audioCtx.createBuffer(1, len, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        return buf;
    }

    function computeDerivedGrain(sr, maxRate = engineDefaults.maxRate, overlap = engineDefaults.overlap) {
        const safeMaxRate = Math.max(0.1, maxRate);
        const ov = Math.min(0.85, Math.max(0.0, overlap));

        const meanIntervalSec = 1 / safeMaxRate;
        const grainSec = meanIntervalSec / Math.max(0.05, (1 - ov));

        const grainLen = Math.max(64, Math.floor(grainSec * sr));
        const hopLen = Math.max(1, Math.floor(meanIntervalSec * sr));

        return { grainLen, hopLen, grainMs: (grainLen / sr) * 1000, hopMs: (hopLen / sr) * 1000 };
    }

    function getOutputWaveform() {
        if (!ctx || !analyser || !outTimeData) return null;
        analyser.getFloatTimeDomainData(outTimeData);
        return new Float32Array(outTimeData);
    }

    function triggerBubbleEvent(when, duration, c) {
        const osc = ctx.createOscillator();
        const noise = ctx.createBufferSource();
        const toneFilter = ctx.createBiquadFilter();
        const noiseFilter = ctx.createBiquadFilter();
        const toneAmp = ctx.createGain();
        const noiseAmp = ctx.createGain();
        const sumAmp = ctx.createGain();
        const panner = ctx.createStereoPanner();

        const attack = Math.min(0.012, duration * 0.22);
        const release = Math.min(0.024, duration * 0.40);
        const sustainEnd = Math.max(when + attack, when + duration - release);

        osc.type = "sine";
        osc.frequency.setValueAtTime(c.freq * 1.10, when);
        osc.frequency.exponentialRampToValueAtTime(c.freq, when + Math.max(0.01, duration * 0.85));

        noise.buffer = bubbleNoiseBuffer;
        noise.playbackRate.setValueAtTime(1.0, when);

        const size = Math.pow(Math.random(), 1.5);
        const toneGain = 0.25 + size * 0.15;
        const noiseGain = 0.015 + size * 0.08;

        const rawAmp = 1.0;
        const finalAmp = rawAmp * engineDefaults.masterVolume * clamp(c.volume ?? 1, 0, 1);

        toneFilter.type = "bandpass";
        toneFilter.frequency.setValueAtTime(Math.max(160, c.freq * 1.25), when);
        toneFilter.Q.setValueAtTime(4.0, when);

        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(Math.max(180, c.freq * 1.5), when);
        noiseFilter.Q.setValueAtTime(3.5, when);

        toneAmp.gain.setValueAtTime(0.0001, when);
        toneAmp.gain.exponentialRampToValueAtTime(toneGain, when + attack);
        toneAmp.gain.exponentialRampToValueAtTime(0.0001, sustainEnd + release);

        noiseAmp.gain.setValueAtTime(0.0001, when);
        noiseAmp.gain.exponentialRampToValueAtTime(noiseGain, when + attack * 0.9);
        noiseAmp.gain.exponentialRampToValueAtTime(0.0001, sustainEnd + release * 0.9);

        sumAmp.gain.setValueAtTime(0.9 * finalAmp, when);
        panner.pan.setValueAtTime(c.pan, when);

        osc.connect(toneFilter);
        toneFilter.connect(toneAmp);
        toneAmp.connect(sumAmp);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseAmp);
        noiseAmp.connect(sumAmp);

        sumAmp.connect(panner);
        panner.connect(masterGain);

        osc.start(when);
        noise.start(when);
        osc.stop(when + duration + 0.03);
        noise.stop(when + duration + 0.03);

        return c;
    }

    function ensureAudio() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = ctx.createGain();
        masterGain.gain.value = 1.0;

        analyser = ctx.createAnalyser();
        analyser.fftSize = 16384;
        outTimeData = new Float32Array(analyser.fftSize);
        bubbleNoiseBuffer = createNoiseBuffer(ctx, 0.12);

        masterGain.connect(analyser);
        analyser.connect(ctx.destination);
    }

    function scheduleNextIntervalFromRate(rate, depth01 = 0.5) {
        let interval = 0.05;

        if (rate > 0.001) {
            const meanInterval = 1 / rate;
            const ctrl = getActiveState();
            const burstiness = clamp(ctrl.burstiness, 0.4, 2.0);
            const depth = clamp(depth01, 0, 1);
            const uBase = Math.max(1e-6, 1 - Math.random());
            const poissonInterval = -Math.log(uBase) * meanInterval;
            const denseBias = 1.0 - clamp((burstiness - 0.4) / 1.6, 0, 1);
            const microBurstChance = 0.04 + depth * 0.24 + denseBias * 0.18;

            if (Math.random() < microBurstChance) {
                const minGap = 0.006;
                const maxGap = Math.min(0.060, meanInterval * (0.55 - depth * 0.20));
                const u = Math.random();
                interval = minGap + Math.pow(u, 1.8) * Math.max(0.004, maxGap - minGap);
            } else {
                const shape = burstiness;
                interval = Math.pow(poissonInterval / meanInterval, shape) * meanInterval;
                const longGapChance = 0.03 + depth * 0.10;
                if (Math.random() < longGapChance) interval *= 1.4 + Math.random() * 2.2;
            }

            interval = clamp(interval, 0.006, 2.5);
        }

        return interval;
    }

    function schedulerTick() {
        if (!isOn || !ctx) return;
        if (!eventGenerator) return; // EN: No event generator means the engine is idle and waiting for the host to inject events (e.g. from the simBridge or test code).

        const sr = ctx.sampleRate;
        const ctrl = getActiveState();
        const d = computeDerivedGrain(sr, ctrl.maxRate, ctrl.overlap);
        const baseGrainSec = d.grainLen / sr;
        const lookaheadSec = 0.15;

        for (let voiceIndex = 0; voiceIndex < chordSemitones.length; voiceIndex++) {
            while (nextVoiceTimes[voiceIndex] < ctx.currentTime + lookaheadSec) {
                const when = nextVoiceTimes[voiceIndex];
                const event = eventGenerator(when);

                if (!event) {
                    nextVoiceTimes[voiceIndex] += 0.05;
                    continue;
                }

                const baseCtrl = {
                    pan: apiOverrides.pan ?? event.pan,
                    freq: event.freq,
                    rate: apiOverrides.rate ?? event.rate,
                    depth01: apiOverrides.depth01 ?? (event.depth01 ?? 0.5),
                    volume: clamp(apiOverrides.volume ?? 1, 0, 1)
                };

                if (baseCtrl.rate > 0.001) {
                    let semitoneOffset;
                    if (Math.random() < 0.82) {
                        semitoneOffset = chordSemitones[arpIndex];
                        arpIndex = (arpIndex + 1) % chordSemitones.length;
                    } else {
                        const randomIndex = Math.floor(Math.random() * chordSemitones.length);
                        semitoneOffset = chordSemitones[randomIndex];
                    }

                    const disagreement01 = apiOverrides.dissonance ?? 0;

                    // EN: First warp the harmonic interval itself, then add smaller fine detune.
                    semitoneOffset = applyDirectionalChordWarp(semitoneOffset, disagreement01);

                    let voiceFreq = baseCtrl.freq * semitoneRatio(semitoneOffset);
                    voiceFreq = applyDirectionalDetune(voiceFreq, disagreement01);

                    const voiceCtrl = {
                        pan: baseCtrl.pan,
                        freq: voiceFreq,
                        rate: baseCtrl.rate,
                        volume: baseCtrl.volume
                    };

                    const durScale = durationScaleFromFreq(voiceCtrl.freq, ctrl.baseMidi);
                    const grainSecPitchScaled = baseGrainSec * durScale;
                    const grainSecThisEvent = clamp(grainSecPitchScaled, baseGrainSec * 0.40, baseGrainSec * 2.40);
                    triggerBubbleEvent(when, grainSecThisEvent, voiceCtrl);
                }

                nextVoiceTimes[voiceIndex] += scheduleNextIntervalFromRate(baseCtrl.rate, baseCtrl.depth01);
            }
        }
    }

    function startAudio() {
        ensureAudio();
        isOn = true;
        nextVoiceTimes = chordSemitones.map(() => ctx.currentTime + 0.02 + Math.random() * 0.08);
        if (schedulerTimer) clearInterval(schedulerTimer);
        schedulerTimer = setInterval(schedulerTick, 25);
    }

    function stopAudio() {
        isOn = false;
        if (schedulerTimer) clearInterval(schedulerTimer);
        schedulerTimer = null;
    }

    return {
        getContext,
        getCurrentTime,
        getControls,
        getActiveState,
        getActiveControls,
        getStatus,
        setHostCallbacks,
        setEventGenerator,
        setUiParams,
        computeDerivedGrain,
        getOutputWaveform,
        setControls,
        updateControl,
        resetControls,
        resetControl,
        ensureAudio,
        startAudio,
        stopAudio
    };
}