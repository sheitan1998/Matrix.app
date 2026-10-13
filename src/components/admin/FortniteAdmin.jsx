import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Star, Trash2, RefreshCw, KeyRound, Save, AlertTriangle, CheckCircle2, GripVertical, Plus, Clock } from "lucide-react";
import { toast } from "sonner";

export default function FortniteAdmin() {
  const [tab, setTab] = useState("maps");
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [purging, setPurging] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [configForm, setConfigForm] = useState({
    client_id: "",
    client_secret: "",
    fortnite_api_key: "",
    product_id: "",
    application_id: "",
    sandbox_id: "",
    cache_ttl_minutes: 12,
    sync_enabled: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mapsRes, configRes] = await Promise.all([
        base44.entities.FortniteMap.filter({}, { sort: "sort_order", limit: 200 }),
        base44.functions.invoke("fortniteApi", { action: "getConfig" }),
      ]);
      setMaps(mapsRes?.items || mapsRes || []);
      const cfg = configRes.data;
      setConfig(cfg);
      setConfigForm({
        client_id: "",
        client_secret: "",
        fortnite_api_key: "",
        product_id: "",
        application_id: "",
        sandbox_id: "",
        cache_ttl_minutes: cfg?.cache_ttl_minutes || 12,
        sync_enabled: cfg?.sync_enabled ?? true,
      });
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleFeatured = async (map) => {
    try {
      await base44.entities.FortniteMap.update(map.id, { is_featured: !map.is_featured });
      setMaps(prev => prev.map(m => m.id === map.id ? { ...m, is_featured: !m.is_featured } : m));
      toast.success(map.is_featured ? "Retiré des vedettes" : "Mis en vedette");
    } catch { toast.error("Erreur"); }
  };

  const updateSortOrder = async (map, newOrder) => {
    try {
      await base44.entities.FortniteMap.update(map.id, { sort_order: newOrder });
      setMaps(prev => prev.map(m => m.id === map.id ? { ...m, sort_order: newOrder } : m));
    } catch { toast.error("Erreur"); }
  };

  const deleteMap = async (map) => {
    if (!confirm(`Supprimer "${map.title}" ?`)) return;
    try {
      await base44.entities.FortniteMap.delete(map.id);
      setMaps(prev => prev.filter(m => m.id !== map.id));
      toast.success("Map supprimée");
    } catch { toast.error("Erreur"); }
  };

  const handlePurgeCache = async () => {
    setPurging(true);
    try {
      const res = await base44.functions.invoke("fortniteApi", { action: "purgeCache" });
      toast.success(res.data?.message || "Cache purgé");
    } catch { toast.error("Erreur"); }
    setPurging(false);
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const payload = {
        cache_ttl_minutes: configForm.cache_ttl_minutes,
        sync_enabled: configForm.sync_enabled,
      };
      if (configForm.client_id) payload.client_id = configForm.client_id;
      if (configForm.client_secret) payload.client_secret = configForm.client_secret;
      if (configForm.product_id) payload.product_id = configForm.product_id;
      if (configForm.application_id) payload.application_id = configForm.application_id;
      if (configForm.sandbox_id) payload.sandbox_id = configForm.sandbox_id;
      if (configForm.fortnite_api_key) payload.fortnite_api_key = configForm.fortnite_api_key;

      const res = await base44.functions.invoke("fortniteApi", { action: "updateConfig", ...payload });
      toast.success(res.data?.message || "Configuration mise à jour");
      loadData();
    } catch { toast.error("Erreur"); }
    setSavingConfig(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await base44.functions.invoke("fortniteApi", { action: "testConnection" });
      setTestResult(res.data);
      if (res.data?.ok) toast.success("Connexion EOS réussie");
      else toast.error(res.data?.error || "Échec");
    } catch { toast.error("Erreur"); }
    setTesting(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>;
  }

  const featuredMaps = maps.filter(m => m.is_featured);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        <TabButton active={tab === "maps"} onClick={() => setTab("maps")} icon={Star} label="Codes Islands" />
        <TabButton active={tab === "sync"} onClick={() => setTab("sync")} icon={RefreshCw} label="Sync & Cache" />
        <TabButton active={tab === "keys"} onClick={() => setTab("keys")} icon={KeyRound} label="Clés API" />
      </div>

      {/* ── Maps tab ── */}
      {tab === "maps" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Cartes Fortnite ({maps.length})</h3>
            <span className="text-[10px] text-white/40">{featuredMaps.length} en vedette</span>
          </div>

          {maps.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-8">Aucune map. Ajoutez-en depuis la page Fortnite Maps.</p>
          ) : (
            <div className="space-y-2">
              {maps.map((map, idx) => (
                <div key={map.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <GripVertical className="w-4 h-4 text-white/20 shrink-0" />
                  {map.image_url && <img src={map.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{map.title}</p>
                    <p className="text-[10px] text-white/40">{map.creator_name} · <span className="font-mono">{map.map_code}</span></p>
                  </div>
                  {map.is_featured && map.live_players > 0 && (
                    <span className="text-[9px] font-bold text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> {map.live_players}
                    </span>
                  )}
                  <input
                    type="number"
                    value={map.sort_order || 0}
                    onChange={(e) => updateSortOrder(map, parseInt(e.target.value) || 0)}
                    className="w-12 h-8 px-1 rounded text-[11px] text-center text-white outline-none"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
                    title="Ordre d'affichage"
                  />
                  <button
                    onClick={() => toggleFeatured(map)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition tap-sm"
                    style={map.is_featured ? { background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" } : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    title={map.is_featured ? "Retirer des vedettes" : "Mettre en vedette"}
                  >
                    <Star className="w-3.5 h-3.5" style={{ color: map.is_featured ? "#f59e0b" : "rgba(255,255,255,0.3)" }} fill={map.is_featured ? "#f59e0b" : "none"} />
                  </button>
                  <button onClick={() => deleteMap(map)} className="w-8 h-8 rounded-lg flex items-center justify-center transition hover:bg-red-500/10 tap-sm" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)" }} title="Supprimer">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Sync & Cache tab ── */}
      {tab === "sync" && (
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-sm font-black text-white mb-3">Paramètres de synchronisation</h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider">Durée du cache (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={configForm.cache_ttl_minutes}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, cache_ttl_minutes: parseInt(e.target.value) || 12 }))}
                  className="w-full h-10 px-3 mt-1 rounded-lg text-sm text-white outline-none"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <p className="text-[9px] text-white/30 mt-1">Recommandé: 10-15 minutes pour respecter les quotas gratuits</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">Sync automatique</label>
                  <p className="text-[9px] text-white/30">Enrichit les maps vedettes avec les metrics live</p>
                </div>
                <button
                  onClick={() => setConfigForm(prev => ({ ...prev, sync_enabled: !prev.sync_enabled }))}
                  className="w-11 h-6 rounded-full transition relative"
                  style={{ background: configForm.sync_enabled ? "rgba(191,90,242,0.4)" : "rgba(255,255,255,0.1)" }}
                >
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: configForm.sync_enabled ? "22px" : "2px" }} />
                </button>
              </div>
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
              style={{ background: "linear-gradient(135deg, #BF5AF2, #7C3AED)" }}
            >
              {savingConfig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Enregistrer
            </button>
          </div>

          <div className="rounded-xl p-4" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(239,68,68,0.1)" }}>
            <h3 className="text-sm font-black text-white mb-1">Purge du cache</h3>
            <p className="text-[10px] text-white/40 mb-3">Vide immédiatement toutes les réponses API en cache (cartes + joueurs).</p>
            <button
              onClick={handlePurgeCache}
              disabled={purging}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
              style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              {purging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Purger le cache
            </button>
          </div>

          {config?.last_sync_at && (
            <div className="flex items-center gap-2 text-[10px] text-white/30">
              <Clock className="w-3 h-3" />
              Dernière sync: {new Date(config.last_sync_at).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* ── Keys tab ── */}
      {tab === "keys" && (
        <div className="space-y-4">
          <div className="rounded-xl p-4" style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-sm font-black text-white mb-1">Clés Epic Games EOS</h3>
            <p className="text-[10px] text-white/40 mb-4">Mettez à jour les clés si elles changent. Laissez vide pour conserver l'existante.</p>

            <div className="space-y-3">
              <KeyInput label="Client ID" value={configForm.client_id} onChange={(v) => setConfigForm(prev => ({ ...prev, client_id: v }))} placeholder={config?.client_id || "Non configuré"} />
              <KeyInput label="Client Secret" value={configForm.client_secret} onChange={(v) => setConfigForm(prev => ({ ...prev, client_secret: v }))} placeholder={config?.client_secret || "Non configuré"} type="password" />
              <KeyInput label="Clé API fortnite-api.com" value={configForm.fortnite_api_key} onChange={(v) => setConfigForm(prev => ({ ...prev, fortnite_api_key: v }))} placeholder={config?.fortnite_api_key || "Non configuré"} type="password" />
              <KeyInput label="Product ID" value={configForm.product_id} onChange={(v) => setConfigForm(prev => ({ ...prev, product_id: v }))} placeholder={config?.product_id || "Non configuré"} />
              <KeyInput label="Application ID" value={configForm.application_id} onChange={(v) => setConfigForm(prev => ({ ...prev, application_id: v }))} placeholder={config?.application_id || "Non configuré"} />
              <KeyInput label="Sandbox (Deployment) ID" value={configForm.sandbox_id} onChange={(v) => setConfigForm(prev => ({ ...prev, sandbox_id: v }))} placeholder={config?.sandbox_id || "Non configuré"} />
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "linear-gradient(135deg, #BF5AF2, #7C3AED)" }}
              >
                {savingConfig ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Enregistrer les clés
              </button>
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition hover:opacity-90 tap-sm"
                style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}
              >
                {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Tester la connexion
              </button>
            </div>

            {testResult && (
              <div className="mt-3 p-3 rounded-lg flex items-center gap-2" style={{ background: testResult.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${testResult.ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                {testResult.ok ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                <span className="text-xs text-white/70">{testResult.ok ? testResult.message : testResult.error}</span>
              </div>
            )}
          </div>

          <div className="rounded-xl p-3" style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}>
            <p className="text-[10px] text-white/40">
              <strong className="text-white/60">Note:</strong> L'API Fortnite Data (cartes + metrics) est publique et ne nécessite pas d'authentification.
              Les clés EOS sont utilisées pour l'authentification Epic Online Services et le lookup de comptes joueurs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition border-b-2 -mb-px tap-sm ${active ? "text-white border-[#BF5AF2]" : "text-white/40 border-transparent hover:text-white/60"}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function KeyInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 mt-1 rounded-lg text-xs text-white font-mono outline-none placeholder:text-white/20"
        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
      />
    </div>
  );
}