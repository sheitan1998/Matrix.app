import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Coins } from "lucide-react";
import TrixIcon from "@/components/TrixIcon";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PRESET_AMOUNTS = [50, 100, 500, 1000, 5000];

export default function TrixDonationDialog({ open, onOpenChange, video, channel, user, onSent }) {
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!user || !video || amount <= 0) return;
    setLoading(true);
    try {
      await base44.functions.invoke("walletSpend", {
        action: "liveDonation",
        amount,
        videoId: video.id,
        channelId: channel?.id,
        channelName: channel?.name || video.channel_name,
        message,
      });
      toast.success(`${amount} TRIX envoyés !`, { description: "Merci pour ton soutien 💚" });
      setMessage("");
      setAmount(100);
      onSent?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border max-h-[90vh] overflow-y-auto overscroll-contain">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <TrixIcon size={20} />
            Envoyer des TRIX
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Destinataire</p>
            <p className="font-semibold">{video?.channel_name}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Montant</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={cn(
                    "px-3 h-9 rounded-lg text-sm font-mono font-semibold border transition",
                    amount === a
                      ? "bg-trix text-background border-trix"
                      : "bg-secondary/60 border-border hover:bg-secondary"
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="font-mono bg-secondary/60 border-border"
            />
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Message (optionnel)</p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Laisse un message..."
              className="bg-secondary/60 border-border resize-none"
              rows={3}
              maxLength={200}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/60 border border-border">
            <span className="text-sm text-muted-foreground">Solde après envoi</span>
            <span className="font-mono font-bold">
              {Math.max(0, (user?.trix_balance || 0) - amount).toLocaleString("fr-FR")} TRIX
            </span>
          </div>

          <Button
            onClick={send}
            disabled={loading || amount <= 0 || (user?.trix_balance || 0) < amount}
            className="w-full h-11 rounded-full gradient-trix text-background font-bold hover:opacity-90"
          >
            {loading ? "Envoi..." : `Envoyer ${amount} TRIX`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}