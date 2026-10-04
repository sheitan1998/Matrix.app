import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { buildCustomTheme, MAX_CUSTOM_THEMES } from "@/lib/visualThemes";
import CustomThemeForm from "@/components/community/CustomThemeForm";

export default function ServerCustomThemes({ server, onUpdate, accent }) {
  const themes = server.custom_themes || [];
  const activeKey = server.visual_theme || "default";

  const create = async (data) => {
    if (themes.length >= MAX_CUSTOM_THEMES) {
      toast.error(`Maximum ${MAX_CUSTOM_THEMES} thèmes personnalisés`);
      return;
    }
    const theme = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ...data };
    await onUpdate({ custom_themes: [...themes, theme], visual_theme: `custom_${theme.id}` });
    toast.success("Thème créé et appliqué !");
  };

  const remove = async (id) => {
    const updated = themes.filter((t) => t.id !== id);
    await onUpdate(activeKey === `custom_${id}` ? { custom_themes: updated, visual_theme: "default" } : { custom_themes: updated });
    toast.success("Thème supprimé");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Thèmes personnalisés</p>
        <span className="text-[10px] font-bold text-white/40">{themes.length}/{MAX_CUSTOM_THEMES}</span>
      </div>

      {themes.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {themes.map((raw) => {
            const t = buildCustomTheme(raw);
            const active = activeKey === t.key;
            return (
              <div key={t.key} className="relative">
                <button onClick={() => onUpdate({ visual_theme: t.key })}
                  className={`w-full flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition ${active ? "scale-105" : "hover:border-white/20"}`}
                  style={{ background: t.bg, borderColor: active ? t.accent : "transparent" }}>
                  <span className="text-xl">{t.emoji}</span>
                  <span className="text-white/80 text-[10px] font-semibold truncate max-w-full">{t.label}</span>
                </button>
                <button onClick={() => remove(raw.id)} title="Supprimer"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 text-white/60 hover:text-red-400 flex items-center justify-center tap-sm">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {themes.length < MAX_CUSTOM_THEMES ? (
        <CustomThemeForm onCreate={create} accent={accent} />
      ) : (
        <p className="text-[10px] text-white/30">Limite de {MAX_CUSTOM_THEMES} thèmes atteinte — supprimez-en un pour en créer un nouveau.</p>
      )}
    </div>
  );
}