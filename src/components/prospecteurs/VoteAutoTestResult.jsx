import React from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

function describe(result) {
  switch (result.status) {
    case "voted":
      return { Icon: CheckCircle2, color: "#22c55e", text: `Vote enregistré (${result.votes_month} votes ce mois)` };
    case "cooldown":
      return { Icon: Clock, color: "#fbbf24", text: `Cooldown actif, encore ${result.remaining_minutes} min` };
    case "not_owner":
      return { Icon: AlertTriangle, color: "#ef4444", text: "Ce serveur ne t'appartient plus" };
    case "not_found":
      return { Icon: AlertTriangle, color: "#ef4444", text: "Serveur introuvable" };
    default:
      return { Icon: AlertTriangle, color: "#ef4444", text: `Erreur : ${result.error || "inconnue"}` };
  }
}

export default function VoteAutoTestResult({ result }) {
  const { Icon, color, text } = describe(result);
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.03)" }}>
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <span className="text-[10px] font-bold text-white truncate">{result.title || "Serveur"}</span>
      <span className="text-[9px] ml-auto shrink-0" style={{ color }}>{text}</span>
    </div>
  );
}