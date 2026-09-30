import { useRef, useEffect, useState, useCallback } from "react";

/**
 * Hook: useSpeakingDetection
 * Analyzes a MediaStream's audio level via Web Audio API and returns
 * a boolean indicating whether the user is currently speaking.
 *
 * @param {MediaStream|null} stream — the mic stream to analyze
 * @param {object} opts
 *   threshold: number  — volume 0-1 above which the user is "speaking" (default 0.08)
 *   interval:  number  — analysis interval in ms (default 100)
 * @returns {{ speaking: boolean, level: number }}
 */
export function useSpeakingDetection(stream, opts = {}) {
  const { threshold = 0.08, interval = 100 } = opts;
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);
  const [speaking, setSpeaking] = useState(false);
  const [level, setLevel] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch { /* noop */ }
        sourceRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  // Setup audio analysis when a stream is provided
  useEffect(() => {
    if (!stream) {
      setSpeaking(false);
      setLevel(0);
      return;
    }

    // Teardown previous
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch { /* noop */ }
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.6;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    let lastUpdate = 0;

    const tick = (time) => {
      if (!analyserRef.current) return;
      if (time - lastUpdate >= interval) {
        analyser.getByteFrequencyData(buffer);
        // Compute RMS-like average of the frequency data
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) sum += buffer[i];
        const avg = sum / buffer.length / 255; // normalize 0-1
        setLevel(avg);
        setSpeaking(avg > threshold);
        lastUpdate = time;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { source.disconnect(); } catch { /* noop */ }
      if (ctx.state !== "closed") ctx.close().catch(() => {});
    };
  }, [stream, threshold, interval]);

  return { speaking, level };
}

/**
 * Hook: useMultipleSpeaking
 * Given a list of participants (each with an optional streamRef),
 * returns a Set of emails currently speaking.
 *
 * For simplicity, this hook only analyzes the local user's stream
 * (remote participants' audio would need WebRTC peer connections,
 * which are not yet implemented in this app).
 *
 * @param {MediaStream|null} localStream
 * @returns {{ speaking: boolean, level: number }}
 */
export function useLocalSpeaking(localStream) {
  return useSpeakingDetection(localStream, { threshold: 0.06, interval: 80 });
}