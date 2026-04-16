import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload as UploadIcon, Video as VideoIcon, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const CATS = ["music", "gaming", "education", "entertainment", "sports", "news", "tech", "lifestyle", "comedy", "other"];

export default function Upload() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [channel, setChannel] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "other", is_live: false,
    thumbnail_url: "", video_url: "", duration: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const me = await base44.auth.me().catch(() => null);
      setUser(me);
      if (me?.channel_id) {
        const c = await base44.entities.Channel.filter({ id: me.channel_id });
        setChannel(c[0]);
      }
    })();
  }, []);

  const uploadFile = async (file, key) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, [key]: file_url }));
    toast.success("Fichier téléversé");
  };

  const createChannelIfNeeded = async () => {
    if (channel) return channel;
    const handle = user.full_name?.toLowerCase().replace(/\s+/g, "") || `user${Date.now()}`;
    const c = await base44.entities.Channel.create({
      name: user.full_name || "Ma chaîne",
      handle,
      owner_email: user.email,
      avatar_url: user.avatar_url,
      subscribers_count: 0,
    });
    await base44.auth.updateMe({ channel_id: c.id });
    setChannel(c);
    return c;
  };

  const submit = async () => {
    if (!form.title.trim() || !user) return;
    setUploading(true);
    const ch = await createChannelIfNeeded();
    const created = await base44.entities.Video.create({
      ...form,
      channel_id: ch.id,
      channel_name: ch.name,
      channel_avatar: ch.avatar_url,
    });
    setUploading(false);
    toast.success("Vidéo publiée !");
    nav(form.is_live ? `/live/${created.id}` : `/watch/${created.id}`);
  };

  return (
    <div className="px-4 lg:px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl gradient-matrix flex items-center justify-center shadow-glow">
          <UploadIcon className="w-6 h-6 text-background" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Publier sur MATRIX</h1>
          <p className="text-sm text-muted-foreground">Partage une vidéo ou lance un direct</p>
        </div>
      </div>

      <div className="space-y-5 bg-card border border-border rounded-2xl p-6">
        <div>
          <Label>Titre</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Titre accrocheur de la vidéo"
            className="bg-secondary/60 border-border mt-1.5"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Décris ta vidéo..."
            rows={4}
            className="bg-secondary/60 border-border mt-1.5 resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-secondary/60 border-border mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Durée (MM:SS)</Label>
            <Input
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              placeholder="12:34"
              className="bg-secondary/60 border-border mt-1.5 font-mono"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Miniature</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "thumbnail_url")}
              className="bg-secondary/60 border-border mt-1.5"
            />
            {form.thumbnail_url && <img src={form.thumbnail_url} alt="" className="mt-2 w-full aspect-video object-cover rounded-lg" />}
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><VideoIcon className="w-3.5 h-3.5" /> Vidéo</Label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => e.target.files[0] && uploadFile(e.target.files[0], "video_url")}
              className="bg-secondary/60 border-border mt-1.5"
            />
            {form.video_url && <p className="text-xs text-primary mt-2 truncate">✓ Vidéo téléversée</p>}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border">
          <div>
            <p className="font-semibold text-sm">Démarrer un direct</p>
            <p className="text-xs text-muted-foreground">Active le mode live avec chat et TRIX</p>
          </div>
          <Switch checked={form.is_live} onCheckedChange={(v) => setForm({ ...form, is_live: v })} />
        </div>

        <Button
          onClick={submit}
          disabled={uploading || !form.title.trim() || !user}
          className="w-full h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 font-bold"
        >
          {uploading ? "Publication..." : form.is_live ? "Lancer le live" : "Publier la vidéo"}
        </Button>
      </div>
    </div>
  );
}