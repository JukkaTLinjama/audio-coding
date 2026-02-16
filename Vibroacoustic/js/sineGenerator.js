// js/sineGenerator.js
// EN: Sine generator (stereo L/R) with optional R-delay for phase mode.
// EN: Exposed via window.createSineGenerator to avoid ES module import issues.

(function () {
    window.createSineGenerator = function createSineGenerator(ctx, state, nowFn, helpers) {
        const { setParamSmooth, updatePhaseDelay } = helpers;

        // EN: Generator owns oscillators + per-channel gains + optional R-delay.
        const delayR = ctx.createDelay(0.1);
        delayR.delayTime.value = 0;

        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        oscL.type = "sine";
        oscR.type = "sine";

        const gainL = ctx.createGain();
        const gainR = ctx.createGain();
        gainL.gain.value = 0.9;
        gainR.gain.value = 0.9;

        const merger = ctx.createChannelMerger(2);

        oscL.connect(gainL);
        gainL.connect(merger, 0, 0);

        oscR.connect(gainR);
        gainR.connect(delayR);
        delayR.connect(merger, 0, 1);

        function update(glide = true) {
            const g = glide ? state.glideS : 0;

            if (state.lrMode === "phase") {
                // EN: Phase mode => same freq; phase via R channel delay.
                setParamSmooth(oscL.frequency, state.baseHz, g);
                setParamSmooth(oscR.frequency, state.baseHz, g);
                updatePhaseDelay(glide); // uses global delayR in main script
            } else {
                // EN: Beat mode => split Δf symmetrically around baseHz; disable delay.
                const half = state.beatHz * 0.5;
                const fLeft = Math.max(0.001, state.baseHz - half);
                const fRight = state.baseHz + half;

                setParamSmooth(oscL.frequency, fLeft, g);
                setParamSmooth(oscR.frequency, fRight, g);

                delayR.delayTime.setValueAtTime(0, nowFn());
            }
        }

        function start() { oscL.start(); oscR.start(); }
        function stop(t) { oscL.stop(t); oscR.stop(t); }

        return { merger, delayR, update, start, stop, _oscL: oscL, _oscR: oscR };
    };
})();
