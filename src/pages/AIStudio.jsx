import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, Sparkles, Code, BookOpen, Swords, Image, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const MODES = [
  { key: "general", label: "Chat", icon: MessageSquare, color: "hsl(135 100% 50%)", prompt: "Tu es un assistant IA polyvalent, intelligent et bienveillant." },
  { key: "creative", label: "Créatif", icon: Sparkles, color: "hsl(280 100% 65%)", prompt: "Tu es un IA ultra-créative. Aide avec l'écriture créative, poèmes, scénarios, idées originales. Sois inventif, surprenant, poétique." },
  { key: "code", label: "Code", icon: Code, color: "hsl(200 100% 55%)", prompt: "Tu es un expert développeur full-stack. Explique le code clairement, propose des solutions optimisées, corrige les bugs avec précision." },
  { key: "story", label: "Histoire", icon: BookOpen, color: "hsl(45 100% 55%)", prompt: "Tu es un conteur extraordinaire. Crée des histoires captivantes, des univers fantastiques, des personnages mémorables. L'utilisateur peut co-écrire avec toi." },
  { key: "debate", label: "Débat", icon: Swords, color: "hsl(0 84% 60%)", prompt: "Tu es un débatteur intellectuel. Défends des positions avec arguments solides, explore les deux côtés d'un sujet, stimule la réflexion critique." },
  { key: "image_prompt", label: "Prompts Image", icon: Image, color: "hsl(25 100% 55%)", prompt: "Tu es expert en génération de prompts pour IA image (Midjourney, DALL-E, Stable Diffusion). Génère des prompts détaillés, artistiques et optimisés." },
];

export default function AIStudio() {
  const [mode, setMode] = useState("general");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const currentMode = MODES.find((m) => m.key === mode);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const history = newMessages.map((m) => `${m.role === "user" ? "Utilisateur" : "IA"}: ${m.content}`).join("\n");
    const prompt = `${currentMode.prompt}\n\nHistorique de la conversation:\n${history}\n\nRéponds à la dernière question de l'utilisateur.`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-background/90 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-black text-lg">
          <span style={{ color: currentMode.color }}>M</span>ATRIX AI
        </span>
        <div className="flex gap-1 overflow-x-auto no-scrollbar ml-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); setMessages([]); }}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition",
                  mode === m.key ? "text-background border-transparent" : "border-border text-muted-foreground hover:text-foreground"
                )}
                style={mode === m.key ? { background: m.color } : {}}
              >
                <Icon className="w-3 h-3" />
                {m.label}
              </button>
            );
          })}
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="ml-auto text-muted-foreground hover:text-foreground transition">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl"
              style={{ background: `${currentMode.color}20`, border: `1px solid ${currentMode.color}40` }}>
              {React.createElement(currentMode.icon, { className: "w-10 h-10", style: { color: currentMode.color } })}
            </div>
            <div>
              <h2 className="text-xl font-black">Mode {currentMode.label}</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {mode === "creative" && "Laisse ton imagination s'exprimer. Demande-moi d'écrire, d'inventer, de créer."}
                {mode === "code" && "Colle ton code, décris ton problème. Je t'aide à coder comme un pro."}
                {mode === "story" && "On écrit une histoire ensemble ? Donne-moi un début ou un univers."}
                {mode === "debate" && "Propose un sujet, je défends une position et on débat !"}
                {mode === "image_prompt" && "Décris une scène ou une idée. Je génère le prompt parfait pour Midjourney."}
                {mode === "general" && "Pose-moi n'importe quelle question. Je suis là pour t'aider."}
              </p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-lg mr-2 shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: `${currentMode.color}25` }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: currentMode.color }} />
              </div>
            )}
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-secondary text-foreground"
                : "bg-card border border-border"
            )}>
              {msg.role === "assistant" ? (
                <ReactMarkdown className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-lg mr-2 flex items-center justify-center" style={{ background: `${currentMode.color}25` }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: currentMode.color }} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-card border border-border">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-background/90 backdrop-blur p-4">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Message en mode ${currentMode.label}... (Entrée pour envoyer)`}
            className="resize-none min-h-[44px] max-h-36 bg-secondary/60 border-border"
            rows={1}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || loading} size="icon" className="h-11 w-11 shrink-0"
            style={{ background: currentMode.color, color: "hsl(0 0% 5%)" }}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}