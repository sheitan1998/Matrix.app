import React from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";

export default function CreatorAgreementCheckbox({ checked, onChange, accent = "#7DA627" }) {
  return (
    <label
      className="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition"
      style={{
        background: checked ? accent + "0D" : "rgba(255,255,255,0.03)",
        border: `1px solid ${checked ? accent + "50" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition"
        style={{
          background: checked ? accent : "transparent",
          border: `1.5px solid ${checked ? accent : "rgba(255,255,255,0.3)"}`,
        }}
      >
        {checked && <Check className="w-3.5 h-3.5" style={{ color: "#0a0a0a" }} strokeWidth={3} />}
      </button>
      <div className="flex-1">
        <p className="text-xs text-white/80 leading-relaxed">
          Je certifie sur l'honneur être l'auteur ou avoir les droits nécessaires pour publier ce contenu, et j'accepte les{" "}
          <Link
            to="/privacy#creators"
            target="_blank"
            className="font-bold underline hover:opacity-80"
            style={{ color: accent }}
          >
            CGU créateurs de Matrix
          </Link>
          .
        </p>
      </div>
    </label>
  );
}