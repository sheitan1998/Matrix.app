import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Euro } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PRESETS = [2, 5, 10, 20, 50, 100];

export default function EuroDonationDialog({ open, onOpenChange, video, channel, user, onSent }) {
  const [amount, setAmount] = useState(5);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!user || !video || amount <= 0) return;
    setLoading(true);

    // Post in chat as euro donation
    await base44.entities.ChatMessage.create({
      video_id: video.id,
      author_email: user.email,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content: message || `a envoyé ${amount}€`,
      type: "trix_donation",       // reuse same type for display
      trix_amount: 0,
      euro_amount: amount,
      is_premium: !!user.is_premium,
    });

    setLoading(false);
    toast.success(`Don de ${amount}€ envoyé !`, { description: "Merci pour ton soutien 💚" });
    setMessage("");
    setAmount(5);
    onSent?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border max-h-[90vh] overflow-y-auto overscroll-contain">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Euro className="w-5 h-5 text-green-400" />
            Super Chat — Don en euros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Montant (€)</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={cn(
                    "px-3 h-9 rounded-lg text-sm font-mono font-semibold border transition",
                    amount === a
                      ? "bg-green-500 text-background border-green-500"
                      : "bg-secondary/60 border-border hover:bg-secondary"
                  )}
                >
                  {a}€
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
              className="font-mono bg-secondary/60 border-border"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Message (optionnel)</p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ton message affiché dans le chat..."
              className="bg-secondary/60 border-border resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-400 font-medium">
            Ton nom et message s'afficheront en évidence dans le chat 🎉
          </div>

          <Button
            onClick={send}
            disabled={loading || amount <= 0}
            className="w-full h-11 rounded-full bg-green-500 text-background font-bold hover:bg-green-500/90"
          >
            {loading ? "Envoi..." : `Envoyer ${amount}€`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}