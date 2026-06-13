import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Trash2, Copy, Shield, Ban, MicOff, Crown, Plus, X, Hash, Volume2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VISUAL_THEMES } from "@/lib/visualThemes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLES = [
  { key: "member", label: "Membre", color: "#888" },
  { key: "moderator", label: "Modérateur", color: "#3b82f6" },
  { key: "admin", label: "Admin", color: "#f59e0b" },
];

const CH_ICONS = { text: Hash, voice: Volume2, announce: Megaphone };

const BAN_DURATIONS = [
  { key: "1h", label: "1 heure" },
  { key: "24h", label: "24 heures" },
  { key: "7d", label: "7 jours" },
  { key: "perm", label: "Permanent" },
];

function durationToDate(key) {
  if (key === "perm") return null;
  const ms = { "1h": 3600000, "24h": 86400000, "7d": 604800000 }[key] || 0;
  return new Date(Date.now() + ms).toISOString();
}

export default function ServerSettings({ server, theme, onClose, onUpdate, onDelete, uploadIcon, uploadBanner, uploadingIcon, uploadingBanner, copyInvite, channels = [] }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState("general");
  const [memberAction, setMemberAction] = useState(null);
  const [banDuration, setBanDuration] = useState("24h");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("#3b82f6");
  const [customRoles, setCustomRoles] = useState(server.custom_roles || []);
  const [assigningRole, setAssigningRole] = useState(null); // member id

  const { data: members = [], refetch: refetchMembers } = useQuery({
    queryKey: ["server-members", server.id],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: server.id }, "-created_date", 100),
  });

  const updateMember = async (memberId, data) => {
    await base44.entities.ServerMember.update(memberId, data);
    refetchMembers();
    toast.success("Membre mis à jour");
    setMemberAction(null);
  };

  const handleBan = async (member) => {
    const until = banDuration === "perm" ? null : durationToDate(banDuration);
    await updateMember(member.id, {
      is_banned: true,
      ban_until: until,
    });
  };

  const handleUnban = async (member) => {
    await updateMember(member.id, { is_banned: false, ban_until: null });
  };

  const handleMuteText = async (member) => {
    const until = banDuration === "perm" ? null : durationToDate(banDuration);
    await updateMember(member.id, { is_muted_text: true, mute_text_until: until });
  };

  const handleMuteVoice = async (member) => {
    const until = banDuration === "perm" ? null : durationToDate(banDuration);
    await updateMember(member.id, { is_muted_voice: true, mute_voice_until: until });
  };

  const handleSetRole = async (member, role) => {
    await base44.entities.ServerMember.update(member.id, { role });
    refetchMembers();
    toast.success(`Rôle "${role}" attribué à ${member.user_name || member.user_email}`);
    setMemberAction(null);
  };

  const accent = theme?.accent || "hsl(var(--primary))";

  return (
    <div className="absolute inset-0 z-30 overflow-hidden flex flex-col" style={{ background: theme?.bg || "hsl(var(--background))" }}>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 p-4 border-b" style={{ borderColor: theme?.border }}>
        <button onClick={onClose} className="text-muted-foreground hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-black text-lg text-white">Paramètres — {server.name}</h2>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex gap-1 px-4 py-2 border-b overflow-x-auto no-scrollbar" style={{ borderColor: theme?.border }}>
        {[
          { key: "general", label: "Général" },
          { key: "appearance", label: "Apparence" },
          { key: "roles", label: "Rôles" },
          { key: "channels", label: "Salons" },
          { key: "members", label: "Membres" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn("shrink-0 px-4 py-1.5 rounded-xl text-xs font-bold transition",
              tab === t.key ? "text-black" : "text-muted-foreground hover:text-white")}
            style={tab === t.key ? { background: accent } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* GENERAL */}
        {tab === "general" && (
          <>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Code d'invitation</p>
              <div className="flex items-center gap-2 p-3 rounded-xl border font-mono text-sm text-white" style={{ borderColor: theme?.border }}>
                <span className="flex-1">{server.invite_code || "—"}</span>
                {server.invite_code && (
                  <button onClick={() => copyInvite(server.invite_code)} className="text-muted-foreground hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <Button onClick={onDelete} variant="destructive" className="w-full font-bold">
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer ce serveur
            </Button>
          </>
        )}

        {/* APPEARANCE */}
        {tab === "appearance" && (
          <>
            {/* Icon */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Icône du serveur</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: accent + "60" }}>
                  {server.icon_url
                    ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" />
                    : <span className="text-2xl">{server.icon_emoji || "🏠"}</span>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{uploadingIcon ? "Envoi..." : "Changer l'icône"}</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadIcon(e.target.files[0])} disabled={uploadingIcon} />
              </label>
            </div>

            {/* Banner */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Bannière</p>
              <label className="cursor-pointer block">
                <div className="w-full h-24 rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: accent + "60" }}>
                  {server.banner_url
                    ? <img src={server.banner_url} className="w-full h-full object-cover" alt="" />
                    : <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <Upload className="w-5 h-5" />
                        <span className="text-xs">{uploadingBanner ? "Envoi..." : "Ajouter une bannière"}</span>
                      </div>}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadBanner(e.target.files[0])} disabled={uploadingBanner} />
              </label>
            </div>

            {/* Theme */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Thème visuel</p>
              <div className="grid grid-cols-4 gap-2">
                {VISUAL_THEMES.map((t) => (
                  <button key={t.key} onClick={() => onUpdate({ visual_theme: t.key })}
                    className={cn("flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition text-xs font-semibold",
                      (server.visual_theme || "default") === t.key ? "scale-105" : "border-transparent hover:border-white/20")}
                    style={{ background: t.bg, borderColor: (server.visual_theme || "default") === t.key ? t.accent : undefined }}>
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-white/80 text-[10px]">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ROLES */}
        {tab === "roles" && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rôles personnalisés</p>
            <p className="text-xs text-muted-foreground">Créez des rôles pour vos membres. Vous pouvez ensuite les assigner depuis l'onglet Membres.</p>

            {/* Existing custom roles */}
            <div className="space-y-2">
              {customRoles.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">Aucun rôle personnalisé</p>
              )}
              {customRoles.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-xl border" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: r.color }} />
                  <span className="flex-1 text-sm font-semibold text-white">{r.name}</span>
                  <button onClick={() => {
                    const updated = customRoles.filter((_, j) => j !== i);
                    setCustomRoles(updated);
                    onUpdate({ custom_roles: updated });
                  }} className="text-muted-foreground hover:text-red-400 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new role */}
            <div className="p-3 rounded-2xl border space-y-3" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
              <p className="text-xs font-bold text-white">Nouveau rôle</p>
              <div className="flex gap-2 items-center">
                <input type="color" value={newRoleColor} onChange={(e) => setNewRoleColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5" style={{ background: "transparent" }} />
                <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Nom du rôle..."
                  className="flex-1 h-8 px-3 text-xs rounded-xl outline-none text-white placeholder:text-white/30"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Button size="sm" onClick={() => {
                  if (!newRoleName.trim()) return;
                  const updated = [...customRoles, { name: newRoleName.trim(), color: newRoleColor }];
                  setCustomRoles(updated);
                  onUpdate({ custom_roles: updated });
                  setNewRoleName("");
                  toast.success("Rôle créé !");
                }} style={{ background: accent }}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* CHANNELS */}
        {tab === "channels" && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Configuration des salons</p>
            <p className="text-xs text-muted-foreground">Définissez les permissions pour chaque salon. Seul le propriétaire peut modifier ces paramètres.</p>
            {channels.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucun salon à configurer</p>
            ) : (
              channels.map((ch) => {
                const settings = ch.settings || {};
                const updateChannel = async (key, value) => {
                  const updated = channels.map((c) =>
                    c.id === ch.id ? { ...c, settings: { ...settings, [key]: value } } : c
                  );
                  await onUpdate({ channels: updated });
                };
                return (
                  <div key={ch.id} className="p-4 rounded-2xl border space-y-3" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center gap-2">
                      {React.createElement(CH_ICONS[ch.type] || Hash, { className: "w-4 h-4", style: { color: accent } })}
                      <span className="font-bold text-white">#{ch.name}</span>
                      <span className="text-[10px] text-muted-foreground">{ch.type}</span>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Permissions générales</p>
                    <div className="space-y-2">
                      {[
                        { key: "visible", label: "Voir le salon", default: true },
                        { key: "manage_channel", label: "Gérer le salon", ownerOnly: true },
                        { key: "manage_permissions", label: "Gérer les permissions", ownerOnly: true },
                        { key: "manage_webhooks", label: "Gérer les webhooks", ownerOnly: true },
                        { key: "create_invite", label: "Créer une invitation", default: true },
                      ].map(p => {
                        const val = p.ownerOnly ? false : (settings[p.key] !== false);
                        return (
                          <label key={p.key} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{p.label}{p.ownerOnly ? " (fondateur)" : ""}</span>
                            <button onClick={() => !p.ownerOnly && updateChannel(p.key, !val)}
                              className={cn("w-10 h-5 rounded-full transition", p.ownerOnly ? "opacity-40 cursor-not-allowed" : "", val ? "bg-green-500" : "bg-white/20")}>
                              <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", val ? "translate-x-5" : "translate-x-0.5")} />
                            </button>
                          </label>
                        );
                      })}
                    </div>

                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-3">Permissions des messages</p>
                    <div className="space-y-2">
                      {[
                        { key: "send_messages", label: "Envoyer des messages", default: true },
                        { key: "embed_links", label: "Intégrer des liens", default: true },
                        { key: "add_reactions", label: "Ajouter des réactions", default: true },
                        { key: "use_external_emoji", label: "Utiliser des émojis externes", default: true },
                        { key: "use_external_stickers", label: "Utiliser des autocollants externes", default: true },
                        { key: "mention_everyone", label: "Mentionner @everyone, @here et tous les rôles", default: true },
                        { key: "manage_messages", label: "Gérer les messages", default: false },
                        { key: "ignore_slowmode", label: "Ignorer le mode lent", default: false },
                        { key: "read_history", label: "Voir les anciens messages", default: true },
                        { key: "send_tts", label: "Envoyer des messages de synthèse vocale", default: false },
                        { key: "send_voice", label: "Envoyer des messages vocaux", default: true },
                        { key: "create_polls", label: "Créer des sondages", default: true },
                      ].map(p => {
                        const val = settings[p.key] !== false;
                        return (
                          <label key={p.key} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{p.label}</span>
                            <button onClick={() => updateChannel(p.key, !val)}
                              className={cn("w-10 h-5 rounded-full transition", val ? "bg-green-500" : "bg-white/20")}>
                              <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", val ? "translate-x-5" : "translate-x-0.5")} />
                            </button>
                          </label>
                        );
                      })}
                    </div>

                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-3">Permissions vocales</p>
                    <div className="space-y-2">
                      {[
                        { key: "voice_connect", label: "Se connecter", default: true },
                        { key: "voice_speak", label: "Parler", default: true },
                        { key: "voice_video", label: "Vidéo", default: false },
                        { key: "voice_soundboard", label: "Utiliser Soundboard", default: true },
                        { key: "voice_external_sounds", label: "Utiliser des sons externes", default: true },
                        { key: "voice_activity", label: "Utiliser la Détection de la voix", default: true },
                        { key: "voice_priority", label: "Voix prioritaire", default: false },
                        { key: "voice_mute_members", label: "Rendre les membres muets", default: false },
                        { key: "voice_deafen_members", label: "Mettre en sourdine des membres", default: false },
                        { key: "voice_move_members", label: "Déplacer des membres", default: false },
                        { key: "voice_set_status", label: "Définir un statut pour le salon vocal", default: false },
                      ].map(p => {
                        const val = settings[p.key] !== false;
                        return (
                          <label key={p.key} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{p.label}</span>
                            <button onClick={() => updateChannel(p.key, !val)}
                              className={cn("w-10 h-5 rounded-full transition", val ? "bg-green-500" : "bg-white/20")}>
                              <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", val ? "translate-x-5" : "translate-x-0.5")} />
                            </button>
                          </label>
                        );
                      })}
                    </div>

                    <p className="text-[10px] font-bold text-muted-foreground uppercase mt-3">Permissions d'événements</p>
                    <div className="space-y-2">
                      {[
                        { key: "create_events", label: "Créer des événements", default: true },
                        { key: "manage_events", label: "Gérer les événements", default: false },
                      ].map(p => {
                        const val = settings[p.key] !== false;
                        return (
                          <label key={p.key} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{p.label}</span>
                            <button onClick={() => updateChannel(p.key, !val)}
                              className={cn("w-10 h-5 rounded-full transition", val ? "bg-green-500" : "bg-white/20")}>
                              <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", val ? "translate-x-5" : "translate-x-0.5")} />
                            </button>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* MEMBERS */}
        {tab === "members" && (
          <>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{members.length} membres</p>
            {members.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Aucun membre enregistré</p>
            )}
            {members.map((m) => {
              const role = ROLES.find((r) => r.key === m.role) || ROLES[0];
              return (
                <div key={m.id} className="p-3 rounded-2xl border space-y-2" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                      style={{ background: accent + "30" }}>
                      {(m.user_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{m.user_name || m.user_email}</p>
                      <p className="text-[10px] text-muted-foreground">{m.user_email}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: role.color + "20", color: role.color }}>
                      {m.custom_role || role.label}
                    </span>
                  </div>

                  {/* Status badges */}
                  <div className="flex gap-2 flex-wrap">
                    {m.is_banned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">🚫 Banni</span>}
                    {m.is_muted_text && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">🔇 Muet texte</span>}
                    {m.is_muted_voice && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">🎙️ Muet vocal</span>}
                  </div>

                  {/* Actions */}
                  {memberAction?.member?.id === m.id ? (
                    <div className="space-y-2 pt-1 border-t" style={{ borderColor: theme?.border }}>
                      {memberAction.action === "role" && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Rôles système</p>
                          <div className="flex gap-2 flex-wrap">
                            {ROLES.map((r) => (
                              <button key={r.key} onClick={() => handleSetRole(m, r.key)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold border transition"
                                style={{ borderColor: r.color + "40", color: r.color, background: r.color + "10" }}>
                                {r.label}
                              </button>
                            ))}
                          </div>
                          {customRoles.length > 0 && (
                            <>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Rôles personnalisés</p>
                              <div className="flex gap-2 flex-wrap">
                                {customRoles.map((r, i) => (
                                  <button key={i} onClick={() => updateMember(m.id, { custom_role: r.name })}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition"
                                    style={{ borderColor: r.color + "40", color: r.color, background: r.color + "10" }}>
                                    {r.name}
                                  </button>
                                ))}
                                <button onClick={() => updateMember(m.id, { custom_role: null })}
                                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/10 text-muted-foreground hover:text-white transition">
                                  Aucun rôle personnalisé
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      {(memberAction.action === "ban" || memberAction.action === "mute_text" || memberAction.action === "mute_voice") && (
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            {BAN_DURATIONS.map((d) => (
                              <button key={d.key} onClick={() => setBanDuration(d.key)}
                                className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition",
                                  banDuration === d.key ? "text-white" : "border-white/10 text-muted-foreground")}
                                style={banDuration === d.key ? { background: accent + "30", borderColor: accent } : {}}>
                                {d.label}
                              </button>
                            ))}
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => {
                            if (memberAction.action === "ban") handleBan(m);
                            else if (memberAction.action === "mute_text") handleMuteText(m);
                            else handleMuteVoice(m);
                          }} className="w-full text-xs font-bold">
                            Confirmer
                          </Button>
                        </div>
                      )}
                      <button onClick={() => setMemberAction(null)} className="text-xs text-muted-foreground hover:text-white">Annuler</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 flex-wrap pt-1 border-t" style={{ borderColor: theme?.border }}>
                      <button onClick={() => setMemberAction({ member: m, action: "role" })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition">
                        <Crown className="w-3 h-3" /> Rôle
                      </button>
                      <button onClick={() => setMemberAction({ member: m, action: "mute_text" })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-orange-500/20 text-orange-400 hover:bg-orange-500/10 transition">
                        <MicOff className="w-3 h-3" /> Muet texte
                      </button>
                      <button onClick={() => setMemberAction({ member: m, action: "mute_voice" })}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 transition">
                        <MicOff className="w-3 h-3" /> Muet vocal
                      </button>
                      {m.is_banned ? (
                        <button onClick={() => handleUnban(m)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-green-500/20 text-green-400 hover:bg-green-500/10 transition">
                          <Shield className="w-3 h-3" /> Débannir
                        </button>
                      ) : (
                        <button onClick={() => setMemberAction({ member: m, action: "ban" })}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-red-500/20 text-red-400 hover:bg-red-500/10 transition">
                          <Ban className="w-3 h-3" /> Bannir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}