import { useCallback, useEffect, useRef } from 'react';

/**
 * Announces a line with the browser's native speech synthesis,
 * using the locale that matches the user's interface language.
 */
export default function useSpeechAnnounce() {
  const supportedRef = useRef(false);

  useEffect(() => {
    supportedRef.current = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return () => {
      if (supportedRef.current) window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text, locale = 'en-US') => {
    if (!supportedRef.current || !text) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.98;
    utterance.pitch = 1.05;
    const voices = synth.getVoices() || [];
    const prefix = locale.slice(0, 2).toLowerCase();
    const voice = voices.find(v => v.lang?.toLowerCase().startsWith(prefix));
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (supportedRef.current) window.speechSynthesis.cancel();
  }, []);

  return { speak, cancel };
}