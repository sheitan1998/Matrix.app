import React from "react";
import { Mic, MicOff, Users } from "lucide-react";
import SpeakingRing from "@/components/community/SpeakingRing";

function Avatar({ p, accent, size }) {
  return (
    <div className="relative shrink-0 rounded-full" style={{ width: size, height: size }}>
      <SpeakingRing speaking={!!p.speaking && p.micOn !== false} />
      <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-white overflow-hidden"
        style={{ background: accent + "30" }}>
        {p.avatar ? (
          <img src={p.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          (p.name || "?")[0].toUpperCase()
        )}
      </div>
    </div>
  );
}

export default function VoiceParticipants({ participants, accent, compact = false }) {
  if (compact) {
    return (
      <div className="shrink-0 flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
        {participants.map((p, i) => (
          <div key={p.email || i} className="shrink-0 flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full"
            style={{ background: accent + "10", border: `1px solid ${accent}20` }}>
            <Avatar p={p} accent={accent} size={28} />
            <span className="text-xs font-semibold text-white">{p.name || "—"}</span>
            {p.micOn === false && <MicOff className="w-3.5 h-3.5 text-red-400" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="shrink-0 space-y-2 mb-6">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
        <Users className="w-3.5 h-3.5" /> Participants ({participants.length})
      </p>
      {participants.map((p, i) => (
        <div key={p.email || i} className="flex items-center gap-3 p-3 rounded-2xl border"
          style={{ borderColor: p.speaking && p.micOn !== false ? accent + "60" : accent + "20", background: accent + "08" }}>
          <Avatar p={p} accent={accent} size={40} />
          <span className="font-semibold text-sm text-white flex-1">{p.name || "—"}{p.isSelf && " (toi)"}</span>
          {p.micOn === false ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" style={{ color: accent }} />}
        </div>
      ))}
    </div>
  );
}