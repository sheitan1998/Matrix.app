import React, { useState } from "react";
import {
  Plus, Trash2, Crown, Shield, Eye, Settings, Users, MessageSquare,
  Mic, Upload, Lock, ChevronDown, ChevronRight, Check, X, UserCog, Zap, Ban, LogOut, UserCheck, FileText, Link2, Smile, Sticker, Image, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNexusPermissions } from "@/hooks/useNexusPermissions";

const CATEGORY_ICONS = {
  "Général": Settings,
  "Membres": Users,
  "Messages": MessageSquare,
  "Vocal": Mic,
};

const SYSTEM_ROLES = [
  { key: "owner", label: "Fondateur", color: "#f59e0b", isSystem: true },
  { key: "admin", label: "Admin", color: "#ef4444", isSystem: true },
  { key: "moderator", label: "Modérateur", color: "#3b82f6", isSystem: true },
  { key: "member", label: "Membre", color: "#888888", isSystem: true },
];

export default function RoleManager({ server, theme, onUpdate, members, onUpdateMember, accent: propAccent, currentBoostLevel }) {
  const accent = propAccent || theme?.accent || "#a855f7";
  const customRoles = server.custom_roles || [];
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("#a855f7");
  const [showAssign, setShowAssign] = useState(null);
  const [collapsedCats, setCollapsedCats] = useState({});

  // Dynamic permissions loaded from the database (NexusPermission entity)
  // Admin creates/modifies permissions in the panel — they appear here automatically
  const { permissionCategories, permDefaults } = useNexusPermissions();

  const allRoles = [
    ...SYSTEM_ROLES.map(r => ({ ...r, id: r.key, permissions: {} })),
    ...customRoles.map(r => ({ ...r, permissions: r.permissions || {} })),
  ];

  const selectedRole = selectedRoleId ? allRoles.find(r => r.id === selectedRoleId) : null;

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const role = {
      id,
      name: newRoleName.trim(),
      color: newRoleColor,
      icon: "",
      permissions: { ...permDefaults },
    };
    onUpdate({ custom_roles: [...customRoles, role] });
    setNewRoleName("");
    setSelectedRoleId(id);
    toast.success("Rôle créé !");
  };

  const handleDeleteRole = (roleId) => {
    const updated = customRoles.filter(r => r.id !== roleId);
    onUpdate({ custom_roles: updated });
    if (selectedRoleId === roleId) setSelectedRoleId(null);
    toast.success("Rôle supprimé");
  };

  const handleUpdateRole = (roleId, data) => {
    const updated = customRoles.map(r => r.id === roleId ? { ...r, ...data } : r);
    onUpdate({ custom_roles: updated });
  };

  const handleTogglePermission = (roleId, permKey, value) => {
    const role = customRoles.find(r => r.id === roleId);
    if (!role) return;
    const updatedPerms = { ...(role.permissions || {}), [permKey]: value };
    if (permKey === "administrator" && value) {
      for (const cat of permissionCategories) {
        for (const p of cat.permissions) {
          if (p.key !== "administrator") updatedPerms[p.key] = true;
        }
      }
    }
    handleUpdateRole(roleId, { permissions: updatedPerms });
  };

  const handleRoleIconUpload = async (roleId, file) => {
    try {
      const { uploadImageWithToast } = await import("@/lib/imageModeration");
      const { file_url } = await uploadImageWithToast(file);
      handleUpdateRole(roleId, { icon: file_url });
      toast.success("Icône du rôle mise à jour !");
    } catch { /* error already toasted */ }
  };

  const handleAssignRole = (memberId, roleId) => {
    const role = allRoles.find(r => r.id === roleId);
    if (!role) return;
    const customRoleName = role.isSystem ? null : role.name;
    let systemRole = "member";
    if (role.key === "admin" || role.key === "owner") systemRole = "admin";
    else if (role.key === "moderator") systemRole = "moderator";
    onUpdateMember(memberId, { role: systemRole, custom_role: customRoleName });
    toast.success(`Rôle "${role.label}" attribué`);
    setShowAssign(null);
  };

  const toggleCat = (catTitle) => {
    setCollapsedCats(prev => ({ ...prev, [catTitle]: !prev[catTitle] }));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Gestion des rôles</p>
        <p className="text-xs text-muted-foreground">Créez des rôles personnalisés, configurez les permissions granulaires et attribuez-les aux membres.</p>
      </div>

      {/* Role list */}
      <div className="space-y-1.5">
        {allRoles.map((r) => {
          const isSelected = selectedRoleId === r.id;
          return (
            <div key={r.id}
              className={cn("flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition",
                isSelected ? "scale-[1.01]" : "hover:bg-white/5")}
              style={{
                borderColor: isSelected ? r.color : theme?.border,
                background: isSelected ? r.color + "15" : "rgba(255,255,255,0.03)",
              }}
              onClick={() => setSelectedRoleId(r.id)}
            >
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: r.color }} />
              {r.icon && <img src={r.icon} alt="" className="w-4 h-4 rounded-full shrink-0" />}
              <span className="flex-1 text-sm font-semibold text-white">{r.name}</span>
              {r.isSystem && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">Système</span>}
              {!r.isSystem && (
                <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(r.id); }}
                  className="text-muted-foreground hover:text-red-400 transition shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* New role form */}
      <div className="p-3 rounded-2xl border space-y-2" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
        <p className="text-xs font-bold text-white">Créer un rôle</p>
        <div className="flex gap-2 items-center">
          <input type="color" value={newRoleColor} onChange={(e) => setNewRoleColor(e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5" style={{ background: "transparent" }} />
          <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="Nom du rôle..."
            className="flex-1 h-8 px-3 text-xs rounded-xl outline-none text-white placeholder:text-white/30"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <button onClick={handleCreateRole} disabled={!newRoleName.trim()}
            className="h-8 px-3 rounded-xl text-xs font-bold text-black flex items-center gap-1 transition hover:opacity-90 disabled:opacity-40"
            style={{ background: accent }}>
            <Plus className="w-3.5 h-3.5" /> Créer
          </button>
        </div>
      </div>

      {/* Role editor */}
      {selectedRole && !selectedRole.isSystem && (
        <div className="p-3 rounded-2xl border space-y-3" style={{ borderColor: selectedRole.color, background: selectedRole.color + "08" }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: selectedRole.color }} />
            <input value={selectedRole.name}
              onChange={(e) => handleUpdateRole(selectedRole.id, { name: e.target.value })}
              className="flex-1 h-8 px-3 text-sm font-bold text-white rounded-xl outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <input type="color" value={selectedRole.color}
              onChange={(e) => handleUpdateRole(selectedRole.id, { color: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0.5" style={{ background: "transparent" }} />
            {currentBoostLevel >= 2 ? (
              <label className="cursor-pointer shrink-0" title="Icône du rôle">
                <Upload className="w-3.5 h-3.5 text-muted-foreground hover:text-white" />
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files[0] && handleRoleIconUpload(selectedRole.id, e.target.files[0])} />
              </label>
            ) : (
              <Lock className="w-3 h-3 text-white/20" title="Niveau 2 requis" />
            )}
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Permissions</p>
            {permissionCategories.map((cat) => {
              const isCollapsed = collapsedCats[cat.title];
              const CatIcon = CATEGORY_ICONS[cat.title] || Settings;
              return (
                <div key={cat.title} className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <button onClick={() => toggleCat(cat.title)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/70 hover:text-white transition">
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <CatIcon className="w-3.5 h-3.5" style={{ color: accent }} />
                    {cat.title}
                  </button>
                  {!isCollapsed && (
                    <div className="px-3 pb-2 space-y-1.5">
                      {cat.permissions.map((p) => {
                        const val = selectedRole.permissions?.[p.key] ?? p.default;
                        return (
                          <label key={p.key} className="flex items-center justify-between">
                            <span className={cn("text-xs", p.highlight ? "text-red-400 font-bold" : "text-muted-foreground")}>{p.label}</span>
                            <button onClick={() => handleTogglePermission(selectedRole.id, p.key, !val)}
                              className={cn("w-10 h-5 rounded-full transition shrink-0", val ? "bg-green-500" : "bg-white/20")}>
                              <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", val ? "translate-x-5" : "translate-x-0.5")} />
                            </button>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Member assignment */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Attribuer aux membres</p>
            <div className="space-y-1">
              {(members || []).map((m) => {
                const hasRole = m.custom_role === selectedRole.name || (selectedRole.key === "member" && !m.custom_role);
                return (
                  <div key={m.id} className="flex items-center gap-2 p-1.5 rounded-lg" style={{ background: hasRole ? selectedRole.color + "10" : "transparent" }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: accent + "30" }}>
                      {(m.user_name || "?")[0].toUpperCase()}
                    </div>
                    <span className="flex-1 text-xs text-white truncate">{m.user_name || m.user_email}</span>
                    {hasRole ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: selectedRole.color }}>
                        <Check className="w-2.5 h-2.5 inline" /> Attribué
                      </span>
                    ) : (
                      <button onClick={() => handleAssignRole(m.id, selectedRole.id)}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg border transition hover:bg-white/10"
                        style={{ borderColor: selectedRole.color + "40", color: selectedRole.color }}>
                        Attribuer
                      </button>
                    )}
                  </div>
                );
              })}
              {(!members || members.length === 0) && (
                <p className="text-xs text-muted-foreground">Aucun membre à qui attribuer ce rôle.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedRole && selectedRole.isSystem && (
        <div className="p-3 rounded-2xl border space-y-2" style={{ borderColor: theme?.border, background: "rgba(255,255,255,0.03)" }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: selectedRole.color }} />
            <span className="text-sm font-bold text-white">{selectedRole.name}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">Rôle système</span>
          </div>
          <p className="text-xs text-muted-foreground">Les rôles système ont des permissions prédéfinies qui ne peuvent pas être modifiées. Vous pouvez les attribuer aux membres depuis l'onglet Membres.</p>
        </div>
      )}
    </div>
  );
}