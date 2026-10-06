import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Check, Crown, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIERS = [
  {
    key: "supporter",
    name: "Supporter",
    price: 500,
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    perks: ["Badge exclusif dans le chat", "Emotes custom", "Accès au Discord de la chaîne"],
  },
  {
    key: "vip",
    name: "VIP",
    price: 2000,
    icon: Crown,
    color: "text-trix",
    bg: "bg-trix/10 border-trix/40",
    perks: ["Tous les avantages Supporter", "Messages prioritaires en live", "Lives VIP exclusifs", "Mention du créateur"],
  },
];

export default function SubTierDialog({ open, onOpenChange, channel, user, currentSub, onDone }) {
  const [loading, setLoading] = useState(false);

  const subscribe = async (tier) => {
    if (!user || !channel) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("walletSpend", {
        action: "channelSubscription",
        tier: tier.key,
        channelId: channel.id,
        channelName: channel.name,
      });
      toast.success(`Abonnement ${tier.name} activé !`);
      onDone?.(res?.data);
      onOpenChange(false);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Erreur lors de l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Soutenir {channel?.name}</DialogTitle>
          <DialogDescription>
            Choisis un niveau d'abonnement payant pour profiter d'avantages exclusifs.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-2">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isCurrent = currentSub?.tier === tier.key;
            return (
              <div
                key={tier.key}
                className={cn(
                  "rounded-2xl p-5 border-2 flex flex-col",
                  isCurrent ? tier.bg : "border-border bg-secondary/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-5 h-5", tier.color)} />
                  <h3 className="font-bold text-lg">{tier.name}</h3>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <Coins className="w-4 h-4 text-trix" />
                  <span className="text-2xl font-black font-mono">{tier.price.toLocaleString("fr-FR")}</span>
                  <span className="text-xs text-muted-foreground">TRIX / mois</span>
                </div>
                <ul className="mt-4 space-y-2 flex-1">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <Check className={cn("w-4 h-4 mt-0.5 shrink-0", tier.color)} />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled={loading || isCurrent}
                  onClick={() => subscribe(tier)}
                  className={cn(
                    "mt-5 rounded-full font-semibold",
                    isCurrent ? "bg-secondary" : "bg-foreground text-background hover:bg-foreground/90"
                  )}
                >
                  {isCurrent ? "Abonnement actif" : `S'abonner`}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}