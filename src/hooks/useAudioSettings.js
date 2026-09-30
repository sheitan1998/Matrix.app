import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "matrix_audio_settings";

export const DEFAULT_AUDIO_SETTINGS = {
  inputDeviceId: "",
  outputDeviceId: "",
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
  vadSensitivity: 30, // 0-100, lower = more sensitive
  soundEffectsEnabled: true,
  soundEffectsVolume: 0.5, // 0-1
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

/**
 * Shared hook for audio device selection, noise suppression, and VAD sensitivity.
 * Persists to localStorage and syncs across components via a custom event.
 */
export function useAudioSettings() {
  const [settings, setSettings] = useState(() => loadFromStorage() || DEFAULT_AUDIO_SETTINGS);
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);

  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setInputDevices(devices.filter((d) => d.kind === "audioinput"));
      setOutputDevices(devices.filter((d) => d.kind === "audiooutput"));
    } catch {
      /* permissions not granted yet */
    }
  }, []);

  useEffect(() => {
    refreshDevices();
    const unsub = navigator.mediaDevices.addEventListener?.("devicechange", refreshDevices);
    return () => {
      if (unsub) navigator.mediaDevices.removeEventListener?.("devicechange", refreshDevices);
    };
  }, [refreshDevices]);

  // Sync from other tabs/components
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY) {
        const next = loadFromStorage();
        if (next) setSettings(next);
      }
    };
    const customHandler = () => {
      const next = loadFromStorage();
      if (next) setSettings(next);
    };
    window.addEventListener("storage", handler);
    window.addEventListener("matrix-audio-settings-updated", customHandler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("matrix-audio-settings-updated", customHandler);
    };
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      window.dispatchEvent(new Event("matrix-audio-settings-updated"));
      return next;
    });
  }, []);

  /**
   * Builds getUserMedia constraints from the current settings.
   */
  const getAudioConstraints = useCallback(() => {
    const c = {
      echoCancellation: settings.echoCancellation,
      noiseSuppression: settings.noiseSuppression,
      autoGainControl: settings.autoGainControl,
    };
    if (settings.inputDeviceId) {
      c.deviceId = { exact: settings.inputDeviceId };
    }
    return { audio: c, video: false };
  }, [settings]);

  /**
   * Attaches the selected output device to an <audio> element.
   */
  const attachOutputDevice = useCallback(async (audioElement) => {
    if (!audioElement || !settings.outputDeviceId) return;
    try {
      if (typeof audioElement.setSinkId === "function") {
        await audioElement.setSinkId(settings.outputDeviceId);
      }
    } catch {
      /* not supported (Firefox) */
    }
  }, [settings.outputDeviceId]);

  return {
    settings,
    inputDevices,
    outputDevices,
    updateSetting,
    refreshDevices,
    getAudioConstraints,
    attachOutputDevice,
  };
}