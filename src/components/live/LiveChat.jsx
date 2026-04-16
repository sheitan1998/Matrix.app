import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coins, Crown, Star, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TrixDonationDialog from "./TrixDonationDialog";

function MessageItem({ m }) {
  if (m.type === "trix_donation") {
    return (
      <div className="rounded-lg p-3 gradient-trix text-background shadow-lg">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{m.author_name}</span>
          <div className="flex items-center gap-1 font-mono font-black">
            <Coins className="w-4 h-4" />
            {m.trix_amount}
          </div>
        </div>
        {m.content && <p className="text-sm mt-1">{m.content}</p>}
      </div>
    );
  }

  return (
    <div className="text-sm leading-snug">
      <span className="inline-flex items-center gap-1 mr-1.5 align-middle">
        {m.sub_tier === "vip" && <Crown className="w-3.5 h-3.5 text-trix" />}
        {m.sub_tier === "supporter" && <Star className="w-3.5 h-3.5 text-primary" />}
        {m.is_premium && <Crown className="w-3.5 h-3.5 text-premium" />}
        <span
          className={cn(
            "font-semibold",
            m.sub_tier === "vip" ? "text-trix" :
            m.sub_tier === "supporter" ? "text-primary" :
            m.is_premium ? "text-premium" : "text-foreground"
          )}
        >
          {m.author_name || "Anon"}
        </span>
      </span>
      <span className="text-muted-foreground">: </span>
      <span>{m.content}</span>
    </div>
  );
}

export default function LiveChat({ video, channel, user, onUserUpdate }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [donateOpen, setDonateOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!video?.id) return;
    let active = true;
    const load = async () => {
      const list = await base44.entities.ChatMessage.filter({ video_id: video.id }, "-created_date", 80);
      if (active) setMessages(list.reverse());
    };
    load();
    const interval = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [video?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const [userSub, setUserSub] = useState(null);
  useEffect(() => {
    if (!user || !channel?.id) return;
    base44.entities.Subscription.filter({ user_email: user.email, channel_id: channel.id }).then((l) => setUserSub(l[0] || null));
  }, [user, channel?.id, messages.length]);

  const send = async () => {
    if (!text.trim() || !user || !video) return;
    await base44.entities.ChatMessage.create({
      video_id: video.id,
      author_email: user.email,
      author_name: user.full_name,
      author_avatar: user.avatar_url,
      content: text.trim(),
      type: "message",
      is_premium: !!user.is_premium,
      is_subscriber: !!userSub,
      sub_tier: userSub?.tier,
    });
    setText("");
  };

  return (
    <>
      <div className="flex flex-col h-full border border-border rounded-xl bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Chat en direct</span>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-2 min-h-0">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sois le premier à écrire 🎬</p>
          ) : (
            messages.map((m) => <MessageItem key={m.id} m={m} />)
          )}
        </div>

        <div className="p-3 border-t border-border space-y-2">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Envoie un message..."
              disabled={!user}
              className="bg-secondary/60 border-border"
            />
            <Button onClick={send} size="icon" className="bg-foreground text-background hover:bg-foreground/90 shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => setDonateOpen(true)}
            disabled={!user}
            className="w-full gradient-trix text-background font-bold hover:opacity-90"
          >
            <Coins className="w-4 h-4 mr-1.5" />
            Envoyer des TRIX
          </Button>
        </div>
      </div>

      <TrixDonationDialog
        open={donateOpen}
        onOpenChange={setDonateOpen}
        video={video}
        channel={channel}
        user={user}
        onSent={onUserUpdate}
      />
    </>
  );
}