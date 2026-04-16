import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import SubTierDialog from "./SubTierDialog";

export default function SubscribeButton({ channel, user, onSubscribed }) {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);

  useEffect(() => {
    if (!user || !channel?.id) return;
    base44.entities.Subscription.filter({ user_email: user.email, channel_id: channel.id }).then((list) => {
      setSub(list[0] || null);
    });
  }, [user, channel?.id]);

  const handleFree = async () => {
    if (!user || !channel?.id) return;
    setLoading(true);
    if (sub) {
      await base44.entities.Subscription.delete(sub.id);
      await base44.entities.Channel.update(channel.id, {
        subscribers_count: Math.max(0, (channel.subscribers_count || 0) - 1),
      });
      setSub(null);
    } else {
      const created = await base44.entities.Subscription.create({
        user_email: user.email,
        channel_id: channel.id,
        channel_name: channel.name,
        tier: "free",
        notifications_enabled: true,
      });
      await base44.entities.Channel.update(channel.id, {
        subscribers_count: (channel.subscribers_count || 0) + 1,
      });
      setSub(created);
    }
    setLoading(false);
    onSubscribed?.();
  };

  const isSubbed = !!sub;
  const paidTier = sub && sub.tier !== "free";

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleFree}
        disabled={loading}
        className={cn(
          "rounded-full h-10 px-5 font-semibold",
          isSubbed
            ? "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
            : "bg-foreground text-background hover:bg-foreground/90"
        )}
      >
        {isSubbed ? (
          <>
            <Bell className="w-4 h-4 mr-1.5" /> Abonné
          </>
        ) : (
          "S'abonner"
        )}
      </Button>

      <Button
        variant="outline"
        onClick={() => setTierOpen(true)}
        className={cn(
          "rounded-full h-10 px-4 border-trix/40 hover:bg-trix/10",
          paidTier ? "bg-trix/15 text-trix" : "text-trix"
        )}
      >
        <Heart className="w-4 h-4 mr-1.5" />
        {paidTier ? `SUB ${sub.tier.toUpperCase()}` : "Soutenir"}
      </Button>

      <SubTierDialog
        open={tierOpen}
        onOpenChange={setTierOpen}
        channel={channel}
        user={user}
        currentSub={sub}
        onDone={(newSub) => {
          setSub(newSub);
          onSubscribed?.();
        }}
      />
    </div>
  );
}