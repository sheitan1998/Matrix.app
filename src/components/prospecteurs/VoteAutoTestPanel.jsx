import React, { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import VoteAutoTestResult from "./VoteAutoTestResult";

export default function VoteAutoTestPanel({ configured }) {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const runTest = async () => {
    setRunning(true);
    setError("");
    setReport(null);
    try {
      const res = await base44.functions.invoke("serverSearch", { action: "runMyAutoVotes" });
      setReport(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || "Le script a échoué");
    }
    setRunning(false);
  };

  return (
    <div className="rounded-lg p-3 space-y-2" style={{ background: "rgba(34,197,94,0.05)", border: "1px dashed rgba(34,197,94,0.3)" }}>
      <button
        onClick={runTest}
        disabled={running || !configured}
        className="w-full h-9 rounded-lg text-[10px] font-black tracking-wider uppercase transition disabled:opacity-50 flex items-center justify-center gap-1.5 tap-sm"
        style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.35)" }}
      >
        {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
        Tester les votes automatiques maintenant
      </button>
      <p className="text-[9px] text-white/35">
        {configured
          ? "Exécute le script sur ta configuration enregistrée (cooldown respecté). Le traitement automatique tourne aussi toutes les heures."
          : "Enregistre d'abord ta configuration pour pouvoir tester."}
      </p>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
      {report?.results && (
        <div className="space-y-1">
          {report.results.map((r) => <VoteAutoTestResult key={r.server_id} result={r} />)}
        </div>
      )}
    </div>
  );
}