// js/audioExport.js
// EN: Utilities for offline rendering + WAV encoding + client-side download.

export function downloadBlob(blob, filename = "render.wav") {
    // EN: Trigger a client-side download without a server.
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function encodeWavFromAudioBuffer(buffer) {
    // EN: Encode an AudioBuffer as 16-bit PCM WAV (RIFF/WAVE).
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const numFrames = buffer.length;

    const bitsPerSample = 16;
    const blockAlign = numChannels * (bitsPerSample / 8);
    const byteRate = sampleRate * blockAlign;
    const dataSize = numFrames * blockAlign;

    const out = new ArrayBuffer(44 + dataSize);
    const view = new DataView(out);

    let o = 0;
    const ws = (s) => { for (let i = 0; i < s.length; i++) view.setUint8(o++, s.charCodeAt(i)); };
    const u32 = (v) => { view.setUint32(o, v, true); o += 4; };
    const u16 = (v) => { view.setUint16(o, v, true); o += 2; };

    ws("RIFF"); u32(36 + dataSize); ws("WAVE");
    ws("fmt "); u32(16); u16(1); u16(numChannels);
    u32(sampleRate); u32(byteRate); u16(blockAlign); u16(bitsPerSample);
    ws("data"); u32(dataSize);

    const chData = Array.from({ length: numChannels }, (_, ch) => buffer.getChannelData(ch));

    for (let i = 0; i < numFrames; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            let x = chData[ch][i];
            x = Math.max(-1, Math.min(1, x));
            const s = x < 0 ? Math.round(x * 0x8000) : Math.round(x * 0x7fff);
            view.setInt16(o, s, true);
            o += 2;
        }
    }

    return new Blob([out], { type: "audio/wav" });
}

export async function renderOfflineToBuffer({
    durationSec = 5,
    sampleRate = 48000,
    stateSnapshot,
} = {}) {
    // EN: OfflineAudioContext requires rebuilding the audio graph; you cannot reuse live nodes.
    const channels = 2;
    const length = Math.floor(durationSec * sampleRate);
    const offline = new OfflineAudioContext(channels, length, sampleRate);

    // ---- Minimal graph mirroring your v2.7 topology ----
    // oscL -> gainL -> merger L
    // oscR -> gainR -> delayR -> merger R
    // merger -> masterGain -> (optional pan) -> gate -> destination
    const s = stateSnapshot;

    const delayR = offline.createDelay(0.1);
    delayR.delayTime.value = 0;

    const oscL = offline.createOscillator();
    const oscR = offline.createOscillator();
    oscL.type = "sine";
    oscR.type = "sine";

    const gainL = offline.createGain();
    const gainR = offline.createGain();
    gainL.gain.value = 0.9;
    gainR.gain.value = 0.9;

    const merger = offline.createChannelMerger(2);

    const masterGain = offline.createGain();
    masterGain.gain.value = Number(s.masterVol ?? 0.5);

    const gateGain = offline.createGain();
    gateGain.gain.value = 1.0; // EN: Offline render usually wants sound "on" for the duration.

    oscL.connect(gainL).connect(merger, 0, 0);
    oscR.connect(gainR).connect(delayR).connect(merger, 0, 1);
    merger.connect(masterGain);

    // Optional autopan (same concept as v2.7; simplified)
    let finalNode = masterGain;
    if (s.panEnabled && Number(s.panDepth) > 0) {
        const splitter = offline.createChannelSplitter(2);
        const panGainL = offline.createGain();
        const panGainR = offline.createGain();
        const panMerger = offline.createChannelMerger(2);

        masterGain.connect(splitter);
        splitter.connect(panGainL, 0);
        splitter.connect(panGainR, 1);
        panGainL.connect(panMerger, 0, 0);
        panGainR.connect(panMerger, 0, 1);

        // EN: Use an LFO oscillator to modulate pan in offline mode.
        const lfo = offline.createOscillator();
        const lfoGain = offline.createGain();

        const rate = Math.max(0, Math.abs(Number(s.beatHz) || 0) * 0.5);
        const depth = Math.max(0, Math.min(1, Number(s.panDepth) || 0));
        lfo.frequency.value = rate;
        lfoGain.gain.value = 0.5 * depth; // scale for +/- around 0.5

        // Base 0.5 + lfo*depth for L, and 0.5 - lfo*depth for R
        const baseL = offline.createConstantSource();
        const baseR = offline.createConstantSource();
        baseL.offset.value = 0.5;
        baseR.offset.value = 0.5;

        const inv = offline.createGain();
        inv.gain.value = -1;

        lfo.connect(lfoGain);
        lfoGain.connect(panGainL.gain);
        lfoGain.connect(inv).connect(panGainR.gain);

        baseL.connect(panGainL.gain);
        baseR.connect(panGainR.gain);

        baseL.start(0); baseR.start(0);
        lfo.start(0);

        finalNode = panMerger;
    }

    finalNode.connect(gateGain);
    gateGain.connect(offline.destination);

    // Frequencies + optional phase delay
    const baseHz = Number(s.baseHz || 27.5);
    if (s.lrMode === "phase") {
        oscL.frequency.value = baseHz;
        oscR.frequency.value = baseHz;

        const phaseDeg = ((Number(s.phaseDeg || 0) % 360) + 360) % 360;
        const delaySec = (phaseDeg / 360) * (1 / Math.max(1e-6, baseHz));
        delayR.delayTime.value = delaySec;
    } else {
        const half = (Number(s.beatHz || 0) * 0.5);
        oscL.frequency.value = Math.max(0.001, baseHz - half);
        oscR.frequency.value = baseHz + half;
        delayR.delayTime.value = 0;
    }

    oscL.start(0);
    oscR.start(0);
    oscL.stop(durationSec);
    oscR.stop(durationSec);

    return await offline.startRendering();
}

export async function renderAndSaveWav({
    durationSec = 5,
    sampleRate = 48000,
    stateSnapshot,
    filename = "v2_8_render.wav",
} = {}) {
    const buffer = await renderOfflineToBuffer({ durationSec, sampleRate, stateSnapshot });
    const wav = encodeWavFromAudioBuffer(buffer);
    downloadBlob(wav, filename);
}
