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
    if ((user.trix_balance || 0) < amount) {
      toast.error("Solde TRIX insuffisant");
      return;
    }
    setLoading(true);

    // debit user
    await base44.auth.updateMe({ trix_balance: (user.trix_balance || 0) - amount });

    // credit channel
    if (channel?.id) {
      await base44.entities.Channel.update(channel.id, {
        trix_received: (channel.trix_received || 0) + amount,
      });
    }

    // chat message
    await base44.entities.ChatMessage.create({
      video_id: video.id,
      author_email: user.email,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content: message || `a envoyé ${amount} TRIX`,
      type: "trix_donation",
      trix_amount: amount,
      is_premium: !!user.is_premium,
    });

    // transaction
    await base44.entities.TrixTransaction.create({
      user_email: user.email,
      type: "donation",
      amount: -amount,
      target_channel_id: channel?.id,
      target_channel_name: channel?.name || video.channel_name,
      video_id: video.id,
      description: `Don de ${amount} TRIX à ${video.channel_name}`,
    });

    setLoading(false);
    toast.success(`${amount} TRIX envoyés !`, { description: "Merci pour ton soutien 💚" });
    setMessage("");
    setAmount(100);
    onSent?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
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