import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Smile, Image, Sticker as StickerIcon, Search, X } from "lucide-react";
import { EMOJI_CATEGORIES } from "@/lib/emojiData";

const TABS = [
  { id: "emojis", label: "Emojis", icon: Smile },
  { id: "gifs", label: "GIFs", icon: Image },
  { id: "stickers", label: "Stickers", icon: StickerIcon },
];

export default function UnifiedPicker({ open, onClose, onSelectEmoji, onSelectGif, onSelectSticker, accent = "#a855f7", serverEmojis = [] }) {
  const [activeTab, setActiveTab] = useState("emojis");
  const [emojiCat, setEmojiCat] = useState(0);
  const [gifQuery, setGifQuery] = useState("");
  const [gifs, setGifs] = useState([]);
  const [loadingGifs, setLoadingGifs] = useState(false);
  const [stickers, setStickers] = useState([]);
  const [loadingStickers, setLoadingStickers] = useState(false);
  const [stickerPacks, setStickerPacks] = useState([]);
  const [activePack, setActivePack] = useState("all");
  const gifSearchRef = useRef(null);
  const gifDebounceRef = useRef(null);

  // Fetch stickers on mount / when stickers tab opened
  const fetchStickers = useCallback(async () => {
    setLoadingStickers(true);
    try {
      const res = await base44.entities.Sticker.filter({ is_active: true }, "sort_order", 100);
      const items = res?.items || res || [];
      setStickers(items);
      const packs = [...new Set(items.map(s => s.pack || "Default"))];
      setStickerPacks(packs);
    } catch { setStickers([]); }
    setLoadingStickers(false);
  }, []);

  // Fetch GIFs
  const fetchGifs = useCallback(async (query) => {
    setLoadingGifs(true);
    try {
      const res = await base44.functions.invoke("gifSearch", { query, limit: 24 });
      setGifs(res?.data?.gifs || []);
    } catch { setGifs([]); }
    setLoadingGifs(false);
  }, []);

  // Load GIFs when tab opens
  useEffect(() => {
    if (open && activeTab === "gifs" && gifs.length === 0) {
      fetchGifs("");
    }
  }, [open, activeTab]);

  // Load stickers when tab opens
  useEffect(() => {
    if (open && activeTab === "stickers" && stickers.length === 0) {
      fetchStickers();
    }
  }, [open, activeTab]);

  // Debounced GIF search
  useEffect(() => {
    if (activeTab !== "gifs") return;
    if (gifDebounceRef.current) clearTimeout(gifDebounceRef.current);
    gifDebounceRef.current = setTimeout(() => fetchGifs(gifQuery), 400);
    return () => { if (gifDebounceRef.current) clearTimeout(gifDebounceRef.current); };
  }, [gifQuery, activeTab]);

  if (!open) return null;

  const filteredStickers = activePack === "all" ? stickers : stickers.filter(s => (s.pack || "Default") === activePack);
  const hasServerEmojis = serverEmojis && serverEmojis.length > 0;

  return (
    <div
      className="absolute bottom-full left-0 mb-2 rounded-2xl overflow-hidden flex flex-col z-50"
      style={{ background: "#13101a", border: "1px solid rgba(168,85,247,0.2)", width: "340px", maxHeight: "380px" }}
    >
      {/* Tab bar */}
      <div className="flex shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition ${isActive ? "text-white" : "text-white/40 hover:text-white/60"}`}
              style={isActive ? { borderBottom: `2px solid ${accent}` } : { borderBottom: "2px solid transparent" }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
        <button onClick={onClose} className="px-2.5 text-white/40 hover:text-white transition shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Emojis tab */}
        {activeTab === "emojis" && (
          <>
            {/* Category sidebar */}
            <div className="flex flex-col shrink-0 overflow-y-auto scrollbar-thin" style={{ width: "44px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
              {hasServerEmojis && (
                <button
                  onClick={() => setEmojiCat("server")}
                  className={`w-full h-10 flex items-center justify-center text-lg transition ${emojiCat === "server" ? "bg-white/10" : "hover:bg-white/5"}`}
                  title="Emojis du serveur"
                >
                  🎭
                </button>
              )}
              {EMOJI_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.name}
                  onClick={() => setEmojiCat(i)}
                  className={`w-full h-10 flex items-center justify-center text-lg transition ${emojiCat === i ? "bg-white/10" : "hover:bg-white/5"}`}
                  title={cat.name}
                >
                  {cat.icon}
                </button>
              ))}
            </div>
            {/* Emoji grid */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
              {emojiCat === "server" ? (
                <>
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-1.5 px-1">Emojis du serveur</p>
                  <div className="grid grid-cols-7 gap-0.5">
                    {serverEmojis.map((emoji, i) => (
                      <button
                        key={i}
                        onClick={() => onSelectEmoji?.(`:${emoji.name}:`)}
                        className="w-9 h-9 hover:bg-white/10 rounded-lg transition flex items-center justify-center tap-sm"
                        title={`:${emoji.name}:`}
                      >
                        <img src={emoji.url} alt={emoji.name} className="w-7 h-7 object-contain" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-bold text-white/40 uppercase mb-1.5 px-1">{EMOJI_CATEGORIES[emojiCat].name}</p>
                  <div className="grid grid-cols-7 gap-0.5">
                    {EMOJI_CATEGORIES[emojiCat].emojis.map((emoji, i) => (
                      <button
                        key={`${emoji}-${i}`}
                        onClick={() => onSelectEmoji?.(emoji)}
                        className="w-9 h-9 text-xl hover:bg-white/10 rounded-lg transition flex items-center justify-center tap-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* GIFs tab */}
        {activeTab === "gifs" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  ref={gifSearchRef}
                  value={gifQuery}
                  onChange={e => setGifQuery(e.target.value)}
                  placeholder="Rechercher un GIF..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-white placeholder:text-white/30 outline-none text-xs"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
              {loadingGifs ? (
                <div className="flex items-center justify-center py-8">
                  <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : gifs.length === 0 ? (
                <p className="text-center text-xs text-white/30 py-8">
                  {gifQuery ? "Aucun GIF trouvé" : "Aucun GIF disponible"}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {gifs.map(g => (
                    <button
                      key={g.id}
                      onClick={() => onSelectGif?.(g.url)}
                      className="relative rounded-lg overflow-hidden hover:opacity-80 transition"
                      style={{ aspectRatio: "1" }}
                    >
                      <img src={g.preview || g.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stickers tab */}
        {activeTab === "stickers" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {stickerPacks.length > 1 && (
              <div className="flex gap-1 p-2 shrink-0 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActivePack("all")}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition shrink-0 ${activePack === "all" ? "text-white" : "text-white/40 hover:text-white/60"}`}
                  style={activePack === "all" ? { background: accent + "30" } : { background: "rgba(255,255,255,0.03)" }}
                >
                  Tous
                </button>
                {stickerPacks.map(pack => (
                  <button
                    key={pack}
                    onClick={() => setActivePack(pack)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition shrink-0 ${activePack === pack ? "text-white" : "text-white/40 hover:text-white/60"}`}
                    style={activePack === pack ? { background: accent + "30" } : { background: "rgba(255,255,255,0.03)" }}
                  >
                    {pack}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
              {loadingStickers ? (
                <div className="flex items-center justify-center py-8">
                  <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              ) : filteredStickers.length === 0 ? (
                <p className="text-center text-xs text-white/30 py-8">Aucun sticker disponible</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {filteredStickers.map(s => (
                    <button
                      key={s.id}
                      onClick={() => onSelectSticker?.(s.image_url)}
                      className="relative rounded-lg overflow-hidden hover:opacity-80 transition"
                      style={{ aspectRatio: "1" }}
                    >
                      <img src={s.image_url} alt={s.name} className="w-full h-full object-contain" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}