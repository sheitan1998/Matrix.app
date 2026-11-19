import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

const ERROR_MESSAGES = {
  "not-allowed": "Micro refusé — autorise l'accès au microphone dans ton navigateur.",
  "service-not-allowed": "Micro refusé — autorise l'accès au microphone dans ton navigateur.",
  "audio-capture": "Aucun microphone détecté sur cet appareil.",
  network: "La dictée a besoin d'une connexion internet.",
  "no-speech": "Rien entendu — réessaie en parlant plus près du micro.",
};

function getRecognitionCtor() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/** Dictée vocale : transcrit la voix dans le champ sans envoyer le message. */
export default function AiVoiceInput({ value, onChange, disabled, onListeningChange }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const baseRef = useRef("");
  const finalRef = useRef("");
  const valueRef = useRef(value);
  const errorTimer = useRef(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onListeningChange?.(listening);
  }, [listening, onListeningChange]);

  useEffect(() => () => {
    clearTimeout(errorTimer.current);
    try {
      recognitionRef.current?.abort();
    } catch {
      /* déjà arrêté */
    }
  }, []);

  const showError = (message) => {
    setError(message);
    clearTimeout(errorTimer.current);
    errorTimer.current = setTimeout(() => setError(""), 6000);
  };

  const stop = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* déjà arrêté */
    }
    setListening(false);
  };

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      showError("Dictée vocale indisponible sur ce navigateur — utilise Chrome, Edge ou Safari.");
      return;
    }

    setError("");
    const recognition = new Ctor();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const current = String(valueRef.current || "").replace(/\s+$/, "");
    baseRef.current = current ? `${current} ` : "";
    finalRef.current = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript || "";
        if (result.isFinal) finalRef.current += `${text.trim()} `;
        else interim += text;
      }
      const merged = `${baseRef.current}${finalRef.current}${interim}`.replace(/\s+/g, " ");
      onChange(merged.trimStart().slice(0, 4000));
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        showError(ERROR_MESSAGES[event.error] || "Dictée interrompue — réessaie.");
      } else {
        showError(ERROR_MESSAGES["no-speech"]);
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      showError("Impossible de démarrer la dictée.");
      setListening(false);
    }
  };

  const toggle = () => (listening ? stop() : start());

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Arrêter la dictée vocale" : "Démarrer la dictée vocale"}
        title={listening ? "Arrêter la dictée" : "Dicter le message à la voix"}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition disabled:opacity-40 tap-sm"
        style={
          listening
            ? { background: "rgba(239,68,68,0.18)", color: "#f87171", border: "1px solid rgba(239,68,68,0.55)" }
            : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }
        }
      >
        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        {listening && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </button>

      {error && (
        <div
          className="absolute bottom-full right-0 mb-2 w-60 rounded-lg px-2.5 py-2 z-20"
          style={{ background: "rgba(30,10,16,0.98)", border: "1px solid rgba(239,68,68,0.4)" }}
          role="alert"
        >
          <p className="text-[9px] font-bold leading-snug" style={{ color: "#fca5a5" }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}