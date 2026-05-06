import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Twitter, Facebook, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ShareDialog({ open, onOpenChange, url, title }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: title || "MATRIX", url: shareUrl });
    }
  };

  const socials = [
    {
      label: "Twitter / X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title || "")}`,
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent((title ? title + " " : "") + shareUrl)}`,
    },
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title || "MATRIX")}&body=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-card border-border max-h-[90vh] overflow-y-auto overscroll-contain">
        <DialogHeader>
          <DialogTitle>Partager</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="bg-secondary/60 border-border font-mono text-xs" />
            <Button onClick={copy} size="icon" variant="outline" className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-sm font-medium transition"
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </a>
              );
            })}
          </div>

          {navigator.share && (
            <Button onClick={share} variant="outline" className="w-full">
              Partager via l'appareil
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}