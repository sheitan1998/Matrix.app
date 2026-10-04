import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Eye, EyeOff, Shield, Check, Save, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import UserSettingsModal from "@/components/profile/UserSettingsModal";

export default function PrivacyPanel({ user, onUpdate }) {
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  const togglePrivate = async () => {
    setSavingPrivacy(true);
    try {
      const newValue = !user?.is_private;
      await base44.auth.updateMe({ is_private: newValue });
      onUpdate({ is_private: newValue });
      toast.success(newValue ? "Profil privé — masqué des recherches" : "Profil public — visible dans les recherches");
    } catch { toast.error("Erreur lors de la mise à jour"); }
    setSavingPrivacy(false);
  };

  const saveEmail = async () => {
    if (!emailValue.trim()) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({ email: emailValue.trim() });
      onUpdate({ email: emailValue.trim() });
      setEditingEmail(false);
      toast.success("E-mail mis à jour");
    } catch { toast.error("Erreur lors de la mise à jour"); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Private info notice */}
      <div className="p-4 rounded-2xl flex items-start gap-3" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
        <Shield className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-white">Confidentialité</p>
          <p className="text-xs text-white/50 mt-1">Vos informations privées (e-mail, méthode de connexion, données personnelles) ne sont jamais visibles par les autres utilisateurs.</p>
        </div>
      </div>

      {/* Email */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: "#a855f7" }} /> Adresse e-mail</h3>
          <button onClick={() => setEditingEmail(!editingEmail)} className="text-xs font-bold text-white/50 hover:text-white">{editingEmail ? "Annuler" : "Modifier"}</button>
        </div>
        {editingEmail ? (
          <div className="flex gap-2">
            <input value={emailValue} onChange={e => setEmailValue(e.target.value)} type="email"
              className="flex-1 px-3 py-2 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(168,85,247,0.3)" }} />
            <button onClick={saveEmail} disabled={saving} className="px-4 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #a855f7, #6d28d9)" }}>
              <Save className="w-3.5 h-3.5" /> OK
            </button>
          </div>
        ) : (
          <p className="text-sm text-white/60 font-mono">{user?.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Lock className="w-4 h-4" style={{ color: "#a855f7" }} /> Mot de passe</h3>
        <p className="text-xs text-white/50 mb-3">Pour modifier votre mot de passe, utilisez la procédure de réinitialisation.</p>
        <Link to="/forgot-password" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <Lock className="w-3.5 h-3.5" /> Réinitialiser le mot de passe
        </Link>
      </div>

      {/* Profile visibility */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Eye className="w-4 h-4" style={{ color: "#a855f7" }} /> Visibilité du profil</h3>
        <div className="flex items-center justify-between">
          <div className="flex-1 pr-3">
            <p className="text-xs text-white/70">{user?.is_private ? "Profil privé" : "Profil public"}</p>
            <p className="text-[11px] text-white/40 mt-0.5">{user?.is_private ? "Votre profil est masqué des recherches publiques (Prospecteur)." : "Votre profil apparaît dans les résultats de recherche publique."}</p>
          </div>
          <button
            onClick={togglePrivate}
            disabled={savingPrivacy}
            className={`w-10 h-5 rounded-full transition shrink-0 ${user?.is_private ? "bg-white/20" : "bg-green-500"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user?.is_private ? "translate-x-0.5" : "translate-x-5"}`} />
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3"><Shield className="w-4 h-4" style={{ color: "#a855f7" }} /> Informations du compte</h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">Compte créé le</span>
            <span className="text-white/70">{user?.created_date ? new Date(user.created_date).toLocaleDateString("fr-FR") : "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Rôle</span>
            <span className="text-white/70 capitalize">{user?.role || "user"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Pseudo</span>
            <span className="text-white/70 font-mono">{user?.pseudo || "—"}</span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={() => base44.auth.logout("/")} className="w-full p-4 rounded-2xl text-sm font-bold text-red-400 transition" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
        Se déconnecter
      </button>

      {/* User Settings */}
      <button onClick={() => setShowSettings(true)} className="w-full p-4 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(109,40,217,0.1))", border: "1px solid rgba(168,85,247,0.3)" }}>
        <SlidersHorizontal className="w-4 h-4" style={{ color: "#a855f7" }} /> Paramètres de notification et confidentialité
      </button>

      <UserSettingsModal open={showSettings} onClose={() => setShowSettings(false)} user={user} />
    </div>
  );
}