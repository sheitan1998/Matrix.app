import React, { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import AiSidebar from "@/components/matrix-ai/AiSidebar";
import AiQuotaBar from "@/components/matrix-ai/AiQuotaBar";
import AiEmptyState from "@/components/matrix-ai/AiEmptyState";
import AiMessageBubble from "@/components/matrix-ai/AiMessageBubble";
import AiComposer from "@/components/matrix-ai/AiComposer";
import AiUpgradeModal from "@/components/matrix-ai/AiUpgradeModal";
import useAiQuota from "@/hooks/useAiQuota";

const THINKING_STEPS = [
  "Matrix AI réfléchit...",
  "Matrix AI recherche sur Matrix...",
  "Matrix AI vérifie les données Matrix...",
];

export default function MatrixAI() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [error, setError] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const bottomRef = useRef(null);
  const { quota, setQuota, refresh, remainingMs } = useAiQuota();

  const loadConversations = useCallback(async (email) => {
    const target = email || user?.email;
    if (!target) return;
    try {
      const res = await base44.entities.AiConversation.filter(
        { user_email: target },
        "-last_message_at",
        40
      );
      setConversations(res?.items || res || []);
    } catch {
      setConversations([]);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (!active) return;
        setUser(me);
        await loadConversations(me.email);
      } catch {
        if (active) setLoadingConversations(false);
        return;
      }
      if (active) setLoadingConversations(false);
    };
    init();
    return () => {
      active = false;
    };
  }, [loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, error]);

  useEffect(() => {
    if (!sending) {
      setThinkingStep(0);
      return;
    }
    const timer = setInterval(() => {
      setThinkingStep((step) => (step + 1) % THINKING_STEPS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [sending]);

  const openConversation = async (conversation) => {
    setMobileOpen(false);
    setActiveId(conversation.id);
    setError("");
    try {
      const res = await base44.entities.AiMessage.filter(
        { conversation_id: conversation.id },
        "created_date",
        200
      );
      setMessages(res?.items || res || []);
    } catch {
      setMessages([]);
    }
  };

  const startNewConversation = () => {
    setActiveId(null);
    setMessages([]);
    setInput("");
    setError("");
    setMobileOpen(false);
  };

  const deleteConversation = async (conversation) => {
    try {
      await base44.entities.AiMessage.deleteMany({ conversation_id: conversation.id });
      await base44.entities.AiConversation.delete(conversation.id);
      setConversations((prev) => prev.filter((item) => item.id !== conversation.id));
      if (activeId === conversation.id) startNewConversation();
      toast.success("Discussion supprimée");
    } catch {
      toast.error("Impossible de supprimer la discussion");
    }
  };

  const sendMessage = async (rawText) => {
    const content = String(rawText ?? input).trim();
    if (!content || sending) return;

    if (quota && !quota.unlimited && (quota.remaining ?? 0) <= 0) {
      setUpgradeOpen(true);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content }]);
    setInput("");
    setError("");
    setSending(true);

    try {
      const res = await base44.functions.invoke("matrixAi", {
        action: "chat",
        conversation_id: activeId || undefined,
        content,
      });
      const data = res.data || {};
      setActiveId(data.conversation_id || activeId);
      setMessages((prev) => [
        ...prev.map((item) => (item.id === tempId ? { ...item, id: `${tempId}-ok` } : item)),
        data.message,
      ].filter(Boolean));
      if (data.quota) setQuota(data.quota);
      loadConversations();
    } catch (err) {
      const status = err?.response?.status;
      const payload = err?.response?.data;
      setMessages((prev) => prev.filter((item) => item.id !== tempId));

      if (status === 429) {
        if (payload?.quota) setQuota(payload.quota);
        setUpgradeOpen(true);
      } else {
        setError(payload?.error || "Matrix AI est momentanément indisponible. Réessaie dans un instant.");
        setInput(content);
      }
    } finally {
      setSending(false);
    }
  };

  const handleUpgraded = async () => {
    await refresh();
    toast.success("Abonnement activé, ton quota est mis à jour !");
  };

  const activeConversation = conversations.find((item) => item.id === activeId);

  return (
    <div
      className="flex h-[100dvh] md:h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(1100px 600px at 15% -10%, rgba(138,79,255,0.16), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(34,211,238,0.10), transparent 55%), #0b0614",
      }}
    >
      <AiSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={openConversation}
        onNew={startNewConversation}
        onDelete={deleteConversation}
        loading={loadingConversations}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <AiQuotaBar
          quota={quota}
          remainingMs={remainingMs}
          onUpgrade={() => setUpgradeOpen(true)}
          onOpenHistory={() => setMobileOpen(true)}
        />

        {activeConversation && (
          <div className="px-4 sm:px-6 pt-3">
            <h2 className="text-[11px] font-black text-white/60 truncate flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" style={{ color: "#a855f7" }} />
              {activeConversation.title}
            </h2>
          </div>
        )}

        {messages.length === 0 && !sending ? (
          <AiEmptyState onSelectPrompt={sendMessage} />
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin px-3 sm:px-6 py-4 space-y-4">
            {messages.map((message, index) => (
              <AiMessageBubble key={message.id || index} message={message} user={user} />
            ))}

            {sending && (
              <div className="flex gap-2">
                <div
                  className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: "linear-gradient(135deg, #8a4fff, #22d3ee)" }}
                >
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-3.5 py-2.5"
                  style={{ background: "rgba(20,12,34,0.85)", border: "1px solid rgba(138,79,255,0.18)" }}
                >
                  <p className="text-[11px] text-white/50 animate-pulse">{THINKING_STEPS[thinkingStep]}</p>
                </div>
              </div>
            )}

            {error && (
              <div
                className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <p className="text-[11px] text-red-200/80">{error}</p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}

        <AiComposer
          value={input}
          onChange={setInput}
          onSend={() => sendMessage()}
          sending={sending}
          disabled={sending}
        />
      </div>

      <AiUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        quota={quota}
        remainingMs={remainingMs}
        onUpgraded={handleUpgraded}
      />
    </div>
  );
}