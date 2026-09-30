import { useEffect, useState } from "react";

/**
 * Live voice-activity detection on a MediaStream (Web Audio API).
 * Measures the RMS volume of the raw microphone waveform ~20x per second.
 *
 * @param {MediaStream|null} stream - the mic stream to analyze
 * @param {object} opts
 *   threshold: RMS volume (0-1) above which the user counts as speaking (default 0.02)
 *   releaseMs: how long the volume must stay under the threshold before "speaking" turns off,
 *              so the indicator does not flicker between syllables (default 150)
 *   interval:  analysis period in ms (default 50)
 * @returns {{ speaking: boolean }}
 */
export function useSpeakingDetection(stream, opts = {}) {
  const { threshold = 0.02, releaseMs = 150, interval = 50 } = opts;
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setSpeaking(false);
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser); // analysis only: not routed to the speakers, so no echo

    const samples = new Float32Array(analyser.fftSize);
    let lastLoud = -Infinity;
    let current = false;

    const timer = setInterval(() => {
      // Browsers can create the context suspended (autoplay policy): make sure it runs
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
      const rms = Math.sqrt(sum / samples.length);
      const now = performance.now();
      if (rms > threshold) lastLoud = now;
      const next = now - lastLoud < releaseMs;
      if (next !== current) {
        current = next;
        setSpeaking(next);
      }
    }, interval);

    return () => {
      clearInterval(timer);
      try { source.disconnect(); } catch { /* noop */ }
      if (ctx.state !== "closed") ctx.close().catch(() => {});
      setSpeaking(false);
    };
  }, [stream, threshold, releaseMs, interval]);

  return { speaking };
}