import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Radio, Tv2, Info } from "lucide-react";
import { toast } from "sonner";

const CATS = ["music", "gaming", "education", "entertainment", "sports", "news", "tech", "lifestyle", "comedy", "other"];

export default function StudioSetup() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [channel, setChannel] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", category: "gaming" });
  const [streamKey, setStreamKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [liveId, setLiveId] = useState(null);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
      if (me?.channel_id) {
        const c = await base44.entities.Channel.filter({ id: me.channel_id });
        setChannel(c[0] || null);
      }
    })();
  }, []);

  const createChannelIfNeeded = async () => {
    if (channel) return channel;
    const handle = (user.full_name || "user").toLowerCase().replace(/\s+/g, "");
    const c = await base44.entities.Channel.create({
      name: user.full_name || "Ma chaîne",
      handle,
      owner_email: user.email,
      subscribers_count: 0,
    });
    await base44.auth.updateMe({ channel_id: c.id });
    setChannel(c);
    return c;
  };

  const generateKey = () => {
    const k = `mtx_live_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
    setStreamKey(k);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(streamKey);
    setCopied(true);
    toast.success("Clé copiée !");
    setTimeout(() => setCopied(false), 2000);
  };

  const startLive = async () => {
    if (!form.title.trim() || !user) return;
    setCreating(true);
    const ch = await createChannelIfNeeded();
    const key = streamKey || `mtx_live_${Math.random().toString(36).slice(2, 10)}`;
    const created = await base44.entities.Video.create({
      title: form.title,
      description: form.description,
      category: form.category,
      is_live: true,
      viewers_count: 0,
      channel_id: ch.id,
      channel_name: ch.name,
      channel_avatar: ch.avatar_url,
      thumbnail_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop",
    });
    setLiveId(created.id);
    setCreating(false);
    toast.success("Diffusion créée ! Configure OBS puis démarre.", { duration: 5000 });
  };

  return (
    <div className="px-4 lg:px-6 py-10 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-live/15 flex items-center justify-center">
          <Tv2 className="w-6 h-6 text-live" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Studio — Lancer un live</h1>
          <p className="text-sm text-muted-foreground">Configure ta diffusion et connecte OBS</p>
        </div>
      </div>

      {/* Step 1 — Details */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-bold flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black">1</span> Informations du direct</h2>
        <div>
          <Label>Titre du live</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de ta diffusion" className="bg-secondary/60 border-border mt-1.5" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="bg-secondary/60 border-border mt-1.5 resize-none" />
        </div>
        <div>
          <Label>Catégorie</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="bg-secondary/60 border-border mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={startLive} disabled={creating || !form.title.trim() || !user || !!liveId} className="w-full h-11 rounded-full bg-live text-white font-bold hover:bg-live/90">
          {creating ? "Création..." : liveId ? "✓ Diffusion créée" : "Créer la diffusion"}
        </Button>
      </div>

      {/* Step 2 — OBS Config */}
      <div className={`rounded-2xl border bg-card p-6 space-y-4 transition ${liveId ? "border-live/40" : "border-border opacity-60 pointer-events-none"}`}>
        <h2 className="font-bold flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-black">2</span> Configuration OBS / Logiciel de stream</h2>

        <div className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2 text-sm">
          <p className="flex items-center gap-2 font-semibold"><Info className="w-4 h-4 text-primary" /> Dans OBS Studio :</p>
          <ol className="list-decimal ml-5 space-y-1 text-muted-foreground">
            <li>Ouvre <strong>Paramètres → Flux</strong></li>
            <li>Service : <strong>Personnalisé</strong></li>
            <li>URL du serveur : <code className="bg-secondary px-1 rounded text-foreground">rtmp://stream.matrix.live/live</code></li>
            <li>Clé de stream : <strong>colle ta clé ci-dessous</strong></li>
            <li>Clique sur <strong>Démarrer la diffusion</strong> dans OBS</li>
          </ol>
        </div>

        <div>
          <Label>Clé de stream</Label>
          <div className="flex gap-2 mt-1.5">
            <Input value={streamKey} readOnly placeholder="Génère une clé..." className="bg-secondary/60 border-border font-mono text-xs" />
            <Button onClick={generateKey} variant="outline" className="shrink-0">Générer</Button>
            <Button onClick={copyKey} size="icon" variant="outline" disabled={!streamKey} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">⚠ Ne partage jamais ta clé de stream</p>
        </div>
      </div>

      {/* Step 3 — Go live */}
      {liveId && (
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 space-y-3">
          <h2 className="font-bold flex items-center gap-2 text-primary"><Radio className="w-5 h-5 animate-live-pulse" /> Prêt à démarrer</h2>
          <p className="text-sm text-muted-foreground">Une fois OBS configuré et démarré, rejoins ta page live pour interagir avec tes spectateurs.</p>
          <Button onClick={() => nav(`/live/${liveId}`)} className="rounded-full bg-live text-white font-bold hover:bg-live/90 gap-2">
            <Radio className="w-4 h-4" /> Rejoindre mon live
          </Button>
        </div>
      )}
    </div>
  );
}