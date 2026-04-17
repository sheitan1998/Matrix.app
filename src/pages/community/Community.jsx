import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Mic, ArrowLeft } from "lucide-react";
import PostFeed from "@/components/community/PostFeed";
import VoiceRooms from "@/components/community/VoiceRooms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "feed", label: "Fil d'actualité", icon: MessageSquare },
  { key: "voice", label: "Salons vocaux", icon: Mic },
];

export default function Community() {
  const [tab, setTab] = useState("feed");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl px-4 lg:px-8 py-3 flex items-center gap-4">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-black text-lg">
          <span className="text-premium">M</span>ATRIX Community
        </span>
        <div className="ml-auto flex gap-1 bg-secondary/60 p-1 rounded-xl">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition",
                  tab === t.key ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === "feed" && <PostFeed />}
        {tab === "voice" && <VoiceRooms />}
      </div>
    </div>
  );
}