import React from "react";
import { ArrowLeftRight, Trash2, Coins, CheckCircle2, CalendarDays } from "lucide-react";
import CosmeticOwnerThumb from "@/components/admin/CosmeticOwnerThumb";

const ACTIONS = [
  {
    mode: "replace",
    label: "Remplacer",
    icon: ArrowLeftRight,
    title: "Remplacer cet article",
    color: "#c084fc",
    bg: "rgba(168,85,247,0.10)",
    border: "rgba(168,85,247,0.30)",
  },
  {
    mode: "compensate",
    label: "Dédommager",
    icon: Coins,
    title: "Créditer un dédommagement en Trix",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.30)",
  },
  {
    mode: "remove",
    label: "Retirer",
    icon: Trash2,
    title: "Retirer l'article de l'inventaire",
    color: "#f87171",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.30)",
  },
];

export default function CosmeticOwnerRow({ owner, user, onAction }) {
  const name = user?.pseudo
    ? `${user.pseudo}${user.pseudo_tag ? `#${user.pseudo_tag}` : ""}`
    : user?.full_name || owner.user_email;

  const acquired = owner.created_date
    ? new Date(owner.created_date).toLocaleDateString("fr-FR")
    : "—";

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-white/5 p-3 sm:flex-row sm:items-center"
      style={{ background: "#16121d" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <CosmeticOwnerThumb item={owner} size={46} />

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
          style={{ background: "rgba(168,85,247,0.18)" }}
        >
          {(user?.pseudo || user?.full_name || owner.user_email || "?").slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-xs font-bold text-white">{name}</p>
            {owner.is_equipped && (
              <span className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Équipé
              </span>
            )}
          </div>
          <p className="truncate text-[10px] text-white/35">{owner.user_email}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[9px] text-white/25">
            <CalendarDays className="h-2.5 w-2.5" /> Obtenu le {acquired}
            <span className="mx-1 text-white/15">·</span>
            <span className="font-mono">×{owner.quantity || 1}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:shrink-0 sm:border-l sm:border-white/5 sm:pl-3">
        {ACTIONS.map(({ mode, label, icon: Icon, title, color, bg, border }) => (
          <button
            key={mode}
            onClick={() => onAction(mode, owner)}
            title={title}
            className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[10px] font-bold transition hover:brightness-125"
            style={{ background: bg, border: `1px solid ${border}`, color }}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}