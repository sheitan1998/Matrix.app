import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Star, Send, MessageCircle, Euro, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import TrixDonationDialog from "./TrixDonationDialog";
import EuroDonationDialog from "./EuroDonationDialog";
import TrixIcon from "@/components/TrixIcon";

const EMOJIS = ["😂", "❤️", "🔥", "👏", "😍", "🎉", "💯", "🤣", "😮", "👍", "💚", "🎮"];

function MessageItem({ m }) {
  if (m.type === "trix_donation") {
    const isEuro = m.euro_amount > 0;
    return (
      <div className={cn("rounded-lg p-3 shadow-lg", isEuro ? "bg-green-600 text-white" : "gradient-trix text-background")}>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{m.author_name}</span>
          {isEuro ? (
            <div className="flex items-center gap-1 font-mono font-black">
              <Euro className="w-4 h-4" />
              {m.euro_amount}
            </div>
          ) : (
            <div className="flex items-center gap-1 font-mono font-black">
              <TrixIcon size={16} />
              <span className="ml-0.5">{m.trix_amount}</span>
            </div>
          )}
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
        <span className={cn("font-semibold",
          m.sub_tier === "vip" ? "text-trix" :
          m.sub_tier === "supporter" ? "text-primary" :
          m.is_premium ? "text-premium" : "text-foreground"
        )}>
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
  const [euroOpen, setEuroOpen] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
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
    return () => { active = false; clearInterval(interval); };
  }, [video?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const [userSub, setUserSub] = useState(null);
  useEffect(() => {
    if (!user || !channel?.id) return;
    base44.entities.Subscription.filter({ user_email: user.email, channel_id: channel.id }).then((l) => setUserSub(l[0] || null));
  }, [user, channel?.id]);

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
    setShowEmojis(false);
  };

  const addEmoji = (e) => {
    setText((t) => t + e);
    setShowEmojis(false);
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

        {/* Emoji picker */}
        {showEmojis && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 border-t border-border pt-2">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:scale-125 transition">{e}</button>
            ))}
          </div>
        )}

        <div className="p-3 border-t border-border space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowEmojis((s) => !s)}
              className="p-2 rounded-lg hover:bg-secondary transition shrink-0"
            >
              <Smile className="w-5 h-5 text-muted-foreground" />
            </button>
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => setDonateOpen(true)}
              disabled={!user}
              className="gradient-trix text-background font-bold hover:opacity-90 gap-1.5"
            >
              <TrixIcon size={16} />
              TRIX
            </Button>
            <Button
              onClick={() => setEuroOpen(true)}
              disabled={!user}
              className="bg-green-600 text-white font-bold hover:bg-green-600/90 gap-1.5"
            >
              <Euro className="w-4 h-4" />
              Super Chat
            </Button>
          </div>
        </div>
      </div>

      <TrixDonationDialog open={donateOpen} onOpenChange={setDonateOpen} video={video} channel={channel} user={user} onSent={onUserUpdate} />
      <EuroDonationDialog open={euroOpen} onOpenChange={setEuroOpen} video={video} channel={channel} user={user} onSent={onUserUpdate} />
    </>
  );
}