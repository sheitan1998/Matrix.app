import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatTrix } from "@/lib/format";

const PACKS = [
  { trix: 500, price: "4,99€", bonus: 0, tag: null },
  { trix: 1200, price: "9,99€", bonus: 200, tag: "Populaire" },
  { trix: 3000, price: "24,99€", bonus: 750, tag: null },
  { trix: 7000, price: "49,99€", bonus: 2000, tag: "Meilleure offre" },
  { trix: 15000, price: "99,99€", bonus: 5000, tag: null },
  { trix: 40000, price: "249,99€", bonus: 15000, tag: "Whale 🐋" },
];

export default function TrixStore() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(null);

  const load = () => base44.auth.me().then(setUser).catch(() => setUser(null));
  useEffect(() => { load(); }, []);

  const buy = async (pack) => {
    if (!user) return;
    setLoading(pack.trix);
    const total = pack.trix + pack.bonus;
    await base44.auth.updateMe({ trix_balance: (user.trix_balance || 0) + total });
    await base44.entities.TrixTransaction.create({
      user_email: user.email,
      type: "purchase",
      amount: total,
      description: `Achat pack ${pack.trix} TRIX (+${pack.bonus} bonus)`,
    });
    setLoading(null);
    toast.success(`+${formatTrix(total)} TRIX !`, { description: "Ton solde est mis à jour 🪙" });
    load();
  };

  return (
    <div className="px-4 lg:px-6 py-10 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 gradient-trix text-background">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">TRIX Store</p>
            <h1 className="text-4xl md:text-5xl font-black mt-2">Achète des TRIX</h1>
            <p className="mt-3 max-w-md">Soutiens tes créateurs préférés en direct et débloquer des abonnements premium aux chaînes.</p>
          </div>
          <div className="px-6 py-4 rounded-2xl bg-background/15 backdrop-blur">
            <p className="text-xs font-semibold opacity-80">Solde actuel</p>
            <p className="text-3xl font-black font-mono flex items-center gap-2">
              <Coins className="w-6 h-6" />
              {formatTrix(user?.trix_balance || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {PACKS.map((p) => (
          <div
            key={p.trix}
            className={cn(
              "relative rounded-2xl border-2 p-6 bg-card transition hover:scale-[1.02]",
              p.tag ? "border-trix/60 shadow-glow" : "border-border"
            )}
          >
            {p.tag && (
              <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full gradient-trix text-background text-xs font-bold">
                {p.tag}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-trix" />
              <span className="text-3xl font-black font-mono">{formatTrix(p.trix)}</span>
            </div>
            {p.bonus > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-trix font-semibold">
                <Sparkles className="w-3 h-3" /> +{formatTrix(p.bonus)} bonus offerts
              </div>
            )}
            <p className="text-3xl font-black mt-5">{p.price}</p>
            <Button
              onClick={() => buy(p)}
              disabled={loading === p.trix || !user}
              className="w-full mt-5 h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold"
            >
              {loading === p.trix ? "Traitement..." : "Acheter"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}