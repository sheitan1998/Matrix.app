import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Sparkles, Code, BookOpen, Swords, Image, MessageSquare, Trash2, Loader2, Crown, Video, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const AI_MODELS = [
  { key: "auto", label: "Auto (MATRIX)", icon: "🤖", desc: "Meilleur modèle automatique", model: "automatic" },
  { key: "gpt4", label: "GPT-4o", icon: "🟢", desc: "OpenAI • Très performant", model: "gpt_5_4" },
  { key: "claude", label: "Claude", icon: "🟠", desc: "Anthropic • Raisonnement avancé", model: "claude_sonnet_4_6" },
  { key: "gemini", label: "Gemini Pro", icon: "🔵", desc: "Google • Web + Vision", model: "gemini_3_1_pro" },
  { key: "mini", label: "Fast (mini)", icon: "⚡", desc: "Ultra rapide, économique", model: "gpt_5_mini" },
];

const MODES = [
  { key: "general", label: "Chat", icon: MessageSquare, color: "hsl(135 100% 50%)", prompt: "Tu es un assistant IA polyvalent, intelligent et bienveillant." },
  { key: "creative", label: "Créatif", icon: Sparkles, color: "hsl(280 100% 65%)", prompt: "Tu es une IA ultra-créative. Aide avec l'écriture créative, poèmes, scénarios, idées originales." },
  { key: "code", label: "Code", icon: Code, color: "hsl(200 100% 55%)", prompt: "Tu es un expert développeur full-stack. Explique le code clairement, propose des solutions optimisées." },
  { key: "story", label: "Histoire", icon: BookOpen, color: "hsl(45 100% 55%)", prompt: "Tu es un conteur extraordinaire. Crée des histoires captivantes et des univers fantastiques." },
  { key: "debate", label: "Débat", icon: Swords, color: "hsl(0 84% 60%)", prompt: "Tu es un débatteur intellectuel. Défends des positions avec arguments solides." },
  { key: "image_prompt", label: "Prompts", icon: Image, color: "hsl(25 100% 55%)", prompt: "Tu es expert en génération de prompts pour IA image (Midjourney, DALL-E). Génère des prompts détaillés." },
];

const FREE_DAILY_LIMIT = 10;
const PLAN_LIMITS = { free: 10, explorer: 100, creator: 500, pro: -1 };

function getDayKey() { return new Date().toISOString().slice(0, 10); }
function getUsage() { const d = JSON.parse(localStorage.getItem("ai_usage") || "{}"); return d[getDayKey()] || 0; }
function incrementUsage() {
  const today = getDayKey();
  const d = JSON.parse(localStorage.getItem("ai_usage") || "{}");
  d[today] = (d[today] || 0) + 1;
  localStorage.setItem("ai_usage", JSON.stringify(d));
}

export default function AIStudio() {
  const [mode, setMode] = useState("general");
  const [selectedModel, setSelectedModel] = useState("mini");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [usage, setUsage] = useState(getUsage());
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState(6);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUsage, setVideoUsage] = useState(0);
  const bottomRef = useRef(null);

  const currentMode = MODES.find((m) => m.key === mode);
  const currentAI = AI_MODELS.find((m) => m.key === selectedModel);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const plan = user?.ai_plan || "free";
  const dailyLimit = PLAN_LIMITS[plan] ?? FREE_DAILY_LIMIT;
  const isLimitReached = dailyLimit !== -1 && usage >= dailyLimit;
  const remaining = dailyLimit === -1 ? "∞" : Math.max(0, dailyLimit - usage);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (isLimitReached) { toast.error("Limite quotidienne atteinte !"); return; }
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    incrementUsage();
    setUsage(getUsage());

    const history = newMessages.slice(-6).map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n");
    const prompt = `${currentMode.prompt}\n\n${history}\n\nRéponds concisément à la dernière question.`;

    const modelKey = currentAI?.model || "gpt_5_mini";
    const useInternet = modelKey === "gemini_3_1_pro" || modelKey === "gemini_3_flash";

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: modelKey !== "automatic" ? modelKey : undefined,
      add_context_from_internet: useInternet,
    });
    setMessages((prev) => [...prev, { role: "assistant", content: response, model: currentAI?.label }]);
    setLoading(false);
  };

  const FREE_VIDEO_LIMIT = 3;
  const videoRemaining = Math.max(0, FREE_VIDEO_LIMIT - videoUsage);

  const generateVideo = async () => {
    if (!videoPrompt.trim()) return;
    const isPremium = plan !== "free";
    if (videoDuration > 6 && !isPremium) {
      toast.error("Vidéo > 6s réservée aux abonnés !");
      return;
    }
    if (!isPremium && videoUsage >= FREE_VIDEO_LIMIT) {
      toast.error("Limite de vidéos gratuites atteinte !");
      return;
    }
    setGeneratingVideo(true);
    toast.info(`Génération vidéo ${videoDuration}s en cours (~40 secondes)...`);
    const result = await base44.integrations.Core.GenerateVideo({ prompt: videoPrompt, duration: videoDuration });
    setGeneratedVideo(result.url);
    if (!isPremium) setVideoUsage((u) => u + 1);
    setGeneratingVideo(false);
    toast.success("Vidéo générée !");
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center gap-2 flex-wrap">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition"><ArrowLeft className="w-5 h-5" /></Link>
        <span className="font-black text-lg">
          <span style={{ color: currentMode.color }}>M</span>ATRIX AI
        </span>

        {/* Mode selector */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar ml-1">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button key={m.key} onClick={() => { setMode(m.key); setMessages([]); setShowVideo(false); }}
                className={cn("shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
                  mode === m.key ? "text-background border-transparent" : "border-border text-muted-foreground hover:text-foreground")}
                style={mode === m.key ? { background: m.color } : {}}>
                <Icon className="w-3 h-3" />{m.label}
              </button>
            );
          })}
          <button onClick={() => { setShowVideo(!showVideo); setMessages([]); }}
            className={cn("shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
              showVideo ? "text-background border-transparent bg-pink-500" : "border-border text-muted-foreground hover:text-foreground")}>
            <Video className="w-3 h-3" /> Vidéo IA
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          {/* Model picker */}
          <div className="relative">
            <button onClick={() => setShowModelPicker(!showModelPicker)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border hover:bg-secondary transition">
              <span>{currentAI?.icon}</span>
              <span className="hidden sm:block">{currentAI?.label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showModelPicker && (
              <div className="absolute right-0 top-10 w-56 rounded-2xl border border-border bg-popover shadow-xl z-50 overflow-hidden">
                {AI_MODELS.map((m) => (
                  <button key={m.key} onClick={() => { setSelectedModel(m.key); setShowModelPicker(false); }}
                    className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition text-left",
                      selectedModel === m.key ? "bg-secondary" : "")}>
                    <span className="text-lg">{m.icon}</span>
                    <div>
                      <p className="text-xs font-bold">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/ai/subscription" className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
            isLimitReached ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-border text-muted-foreground")}>
            {plan !== "free" && <Crown className="w-3 h-3 text-trix" />}
            {isLimitReached ? "Limite" : `${remaining} msgs`}
          </Link>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-muted-foreground hover:text-foreground"><Trash2 className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {/* Video generation tab */}
      {showVideo ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl mx-auto w-full">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center bg-pink-500/20 border border-pink-500/30">
              <Video className="w-8 h-8 text-pink-400" />
            </div>
            <h2 className="text-xl font-black">Génération Vidéo IA</h2>
            <p className="text-sm text-muted-foreground">Décris une scène — durées de 4, 6 ou 8 secondes.</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {[4, 6, 8].map((d) => (
                <button key={d} onClick={() => setVideoDuration(d)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                    videoDuration === d ? "bg-pink-500/30 border-pink-400 text-pink-300" : "border-border text-muted-foreground hover:border-pink-500/30"
                  }`}>
                  {d}s {d > 6 && plan === "free" ? "🔒" : ""}
                </button>
              ))}

            </div>
            {plan === "free" && (
              <p className="text-xs text-muted-foreground">
                <Clock className="w-3 h-3 inline mr-1" />{videoRemaining} vidéos gratuites restantes · 
                <Link to="/ai/subscription" className="text-premium hover:underline ml-1">Premium illimité</Link>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Textarea
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="Ex: Un coucher de soleil sur la mer, vagues douces, lumière dorée, cinématique..."
              className="resize-none h-28 bg-secondary/60 border-border"
            />
            <Button onClick={generateVideo} disabled={generatingVideo || !videoPrompt.trim()}
              className="w-full h-11 font-bold gap-2 bg-pink-500 hover:bg-pink-500/90 text-white">
              {generatingVideo ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération (~40s)...</> : <><Video className="w-4 h-4" /> Générer la vidéo</>}
            </Button>
          </div>

          {generatedVideo && (
            <div className="space-y-3">
              <p className="font-bold text-sm">✅ Vidéo générée :</p>
              <video src={generatedVideo} controls className="w-full rounded-2xl border border-border" />
              <a href={generatedVideo} download className="block text-center text-xs text-muted-foreground hover:text-foreground transition">
                Télécharger la vidéo →
              </a>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
                  style={{ background: `${currentMode.color}20`, border: `1px solid ${currentMode.color}40` }}>
                  {React.createElement(currentMode.icon, { className: "w-10 h-10", style: { color: currentMode.color } })}
                </div>
                <div>
                  <h2 className="text-xl font-black">Mode {currentMode.label}</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Modèle actif : <span className="font-semibold">{currentAI?.icon} {currentAI?.label}</span>
                  </p>
                  {plan === "free" && (
                    <p className="text-xs text-muted-foreground mt-2">{remaining} msgs gratuits · <Link to="/ai/subscription" className="text-premium hover:underline">Passer Premium</Link></p>
                  )}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-lg mr-2 shrink-0 flex items-center justify-center mt-0.5 text-sm"
                    style={{ background: `${currentMode.color}25` }}>
                    {currentAI?.icon}
                  </div>
                )}
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user" ? "bg-secondary text-foreground" : "bg-card border border-border")}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  ) : msg.content}
                  {msg.model && <p className="text-[10px] text-muted-foreground mt-1 text-right">{msg.model}</p>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-lg mr-2 flex items-center justify-center text-sm" style={{ background: `${currentMode.color}25` }}>
                  {currentAI?.icon}
                </div>
                <div className="px-4 py-3 rounded-2xl bg-card border border-border">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {isLimitReached && (
            <div className="shrink-0 mx-4 mb-2 p-3 rounded-xl border border-destructive/40 bg-destructive/10 flex items-center justify-between gap-3">
              <p className="text-sm text-destructive font-semibold">Limite atteinte.</p>
              <Link to="/ai/subscription">
                <Button size="sm" className="gap-1 shrink-0" style={{ background: "hsl(280 100% 65%)", color: "#000" }}>
                  <Crown className="w-3.5 h-3.5" /> Débloquer
                </Button>
              </Link>
            </div>
          )}

          <div className="shrink-0 border-t border-border bg-background/90 backdrop-blur p-4">
            <div className="max-w-3xl mx-auto flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={isLimitReached ? "Limite atteinte" : `Message (${currentAI?.label})... Entrée pour envoyer`}
                disabled={isLimitReached}
                className="resize-none min-h-[44px] max-h-36 bg-secondary/60 border-border disabled:opacity-50"
                rows={1}
              />
              <Button onClick={sendMessage} disabled={!input.trim() || loading || isLimitReached}
                size="icon" className="h-11 w-11 shrink-0"
                style={{ background: currentMode.color, color: "hsl(0 0% 5%)" }}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}