import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Volume2, Loader2, Activity, Waves } from "lucide-react";
import { useAudioSettings } from "@/hooks/useAudioSettings";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition shrink-0 relative tap-sm ${checked ? "bg-green-500" : "bg-white/20"}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function AudioSettingsPanel() {
  const { settings, inputDevices, outputDevices, updateSetting, refreshDevices, getAudioConstraints } = useAudioSettings();
  const [testing, setTesting] = useState(false);
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const testAudioRef = useRef(null);

  const stopTest = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
    }
    setTesting(false);
    setLevel(0);
  }, []);

  const startTest = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;
      setTesting(true);

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const avg = sum / data.length;
        setLevel(Math.min(100, Math.round((avg / 128) * 100)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      setTesting(false);
    }
  }, [getAudioConstraints]);

  useEffect(() => {
    return () => stopTest();
  }, [stopTest]);

  // Restart test when settings change during testing
  useEffect(() => {
    if (testing) {
      stopTest();
      startTest();
    }
  }, [settings.inputDeviceId, settings.noiseSuppression, settings.echoCancellation, settings.autoGainControl]);

  const hasInputDevices = inputDevices.length > 0;
  const hasOutputDevices = outputDevices.length > 0;

  return (
    <div className="space-y-3">
      {/* Input device */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Mic className="w-4 h-4" style={{ color: "#3b82f6" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Périphérique d'entrée</p>
            <p className="text-xs text-white/40 mt-0.5">Sélectionnez votre microphone.</p>
          </div>
        </div>
        <div className="ml-12">
          {!hasInputDevices ? (
            <p className="text-xs text-white/30 italic">Autorisez l'accès au microphone pour voir les périphériques disponibles.</p>
          ) : (
            <select
              value={settings.inputDeviceId}
              onChange={(e) => updateSetting("inputDeviceId", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              <option value="" style={{ background: "#18191c", color: "#fff" }}>Périphérique par défaut</option>
              {inputDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId} style={{ background: "#18191c", color: "#fff" }}>
                  {d.label || `Microphone ${d.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Output device */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
            <Volume2 className="w-4 h-4" style={{ color: "#a855f7" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Périphérique de sortie</p>
            <p className="text-xs text-white/40 mt-0.5">Casque ou haut-parleurs.</p>
          </div>
        </div>
        <div className="ml-12">
          {!hasOutputDevices ? (
            <p className="text-xs text-white/30 italic">Périphérique de sortie non modifiable sur ce navigateur.</p>
          ) : (
            <select
              value={settings.outputDeviceId}
              onChange={(e) => updateSetting("outputDeviceId", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.3)" }}
            >
              <option value="" style={{ background: "#18191c", color: "#fff" }}>Périphérique par défaut</option>
              {outputDevices.map((d) => (
                <option key={d.deviceId} value={d.deviceId} style={{ background: "#18191c", color: "#fff" }}>
                  {d.label || `Sortie ${d.deviceId.slice(0, 6)}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Mic test */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>
            <Activity className="w-4 h-4" style={{ color: "#22c55e" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Test du microphone</p>
            <p className="text-xs text-white/40 mt-0.5">Parlez et vérifiez que le niveau audio réagit correctement.</p>
          </div>
          <button
            onClick={testing ? stopTest : startTest}
            className="px-3 py-2 rounded-xl text-xs font-bold text-white transition tap-sm shrink-0"
            style={{ background: testing ? "rgba(239,68,68,0.2)" : "linear-gradient(135deg, #22c55e, #16a34a)" }}
          >
            {testing ? "Arrêter" : "Tester"}
          </button>
        </div>
        {testing && (
          <div className="ml-12">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${level}%`,
                  background: level > 80 ? "#ef4444" : level > 50 ? "#fbbf24" : "#22c55e",
                }}
              />
            </div>
            <p className="text-[10px] text-white/40 mt-1">Niveau: {level}%</p>
          </div>
        )}
      </div>

      {/* VAD sensitivity */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(251,191,36,0.15)" }}>
            <Waves className="w-4 h-4" style={{ color: "#fbbf24" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Sensibilité de la voix</p>
            <p className="text-xs text-white/40 mt-0.5">Ajuste le seuil de détection de la voix (VAD).</p>
          </div>
        </div>
        <div className="ml-12">
          <input
            type="range"
            min="0"
            max="100"
            value={settings.vadSensitivity}
            onChange={(e) => updateSetting("vadSensitivity", Number(e.target.value))}
            className="w-full accent-yellow-400"
          />
          <div className="flex justify-between text-[9px] text-white/30 mt-1">
            <span>Plus sensible</span>
            <span className="font-bold text-white/50">{settings.vadSensitivity}%</span>
            <span>Moins sensible</span>
          </div>
        </div>
      </div>

      {/* Noise suppression & processing */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <p className="text-xs font-bold text-white/60 uppercase">Traitement audio</p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Suppression du bruit</p>
            <p className="text-xs text-white/40 mt-0.5">Filtre les bruits parasites de fond.</p>
          </div>
          <Toggle checked={settings.noiseSuppression} onChange={(v) => updateSetting("noiseSuppression", v)} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Annulation d'écho</p>
            <p className="text-xs text-white/40 mt-0.5">Évite que votre voix revienne dans le micro.</p>
          </div>
          <Toggle checked={settings.echoCancellation} onChange={(v) => updateSetting("echoCancellation", v)} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">Gain automatique</p>
            <p className="text-xs text-white/40 mt-0.5">Normalise automatiquement le volume de votre voix.</p>
          </div>
          <Toggle checked={settings.autoGainControl} onChange={(v) => updateSetting("autoGainControl", v)} />
        </div>
      </div>
    </div>
  );
}