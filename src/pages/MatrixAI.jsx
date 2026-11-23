import React, { useCallback, useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import AiSidebar from "@/components/matrix-ai/AiSidebar";
import AiQuotaBar from "@/components/matrix-ai/AiQuotaBar";
import AiEmptyState from "@/components/matrix-ai/AiEmptyState";
import AiMessageBubble from "@/components/matrix-ai/AiMessageBubble";
import AiComposer from "@/components/matrix-ai/AiComposer";
import AiUpgradeModal from "@/components/matrix-ai/AiUpgradeModal";
import AiConnectorsPanel from "@/components/matrix-ai/AiConnectorsPanel";
import AuthModal from "@/components/landing/AuthModal";
import useAiQuota from "@/hooks/useAiQuota";
import { checkFileBeforeUpload, MAX_ATTACHMENTS } from "../../base44/shared/aiFiles.ts";
import { isImageRequest } from "../../base44/shared/aiIntent.ts";

const THINKING_STEPS = [
  "Matrix AI réfléchit...",
  "Matrix AI recherche sur Matrix...",
  "Matrix AI vérifie les données Matrix...",
];
const IMAGE_STEPS = ["Matrix AI génère ton image...", "Matrix AI peaufine les détails..."];
const DRAFT_KEY = "matrix_ai_pending_draft";

const readDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const draft = raw ? JSON.parse(raw) : null;
    return draft && typeof draft.content === "string" && draft.content.trim() ? draft : null;
  } catch {
    return null;
  }
};
const writeDraft = (draft) => {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Stockage indisponible : le brouillon reste au moins dans le champ de saisie.
  }
};

export default function MatrixAI() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const authenticated = Boolean(isAuthenticated && user?.id);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(() => readDraft()?.content || "");
  const [imageMode, setImageMode] = useState(() => Boolean(readDraft()?.image));
  const [sending, setSending] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [connectorsOpen, setConnectorsOpen] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [error, setError] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectorsVersion, setConnectorsVersion] = useState(0);
  const bottomRef = useRef(null);
  const initializedFor = useRef(null);
  const oauthHandled = useRef(false);
  const sendRef = useRef(null);
  const { quota, setQuota, refresh, remainingMs } = useAiQuota(authenticated);

  const loadConversations = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const res = await base44.entities.AiConversation.filter(
        { user_id: user.id },
        "-last_message_at",
        40
      );
      const items = res?.items || res || [];
      setConversations(items);
      return items;
    } catch {
      setConversations([]);
      return [];
    }
  }, [user?.id]);

  const fetchMessages = useCallback(
    async (conversationId) => {
      try {
        const res = await base44.entities.AiMessage.filter(
          { conversation_id: conversationId, user_id: user.id },
          "created_date",
          200
        );
        return res?.items || res || [];
      } catch {
        return [];
      }
    },
    [user?.id]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, error]);

  useEffect(() => {
    if (!sending) {
      setThinkingStep(0);
      return;
    }
    const timer = setInterval(() => {
      setThinkingStep((step) => step + 1);
    }, 2200);
    return () => clearInterval(timer);
  }, [sending]);

  const sendMessage = async (rawText, options = {}) => {
    const typed = String(rawText ?? input).trim();
    const files = options.attachments ?? attachments;
    if ((!typed && !files.length) || sending || uploading) return;
    const content = typed || "Analyse le ou les fichiers joints et résume-les.";
    const asImage = Boolean(options.image ?? imageMode) || (!files.length && isImageRequest(content));

    // Lecture libre pour les visiteurs : l'envoi exige une connexion, le message est gardé en brouillon.
    if (!authenticated) {
      writeDraft({ content, image: asImage });
      setInput(content);
      setImageMode(asImage);
      setAuthOpen(true);
      return;
    }

    if (quota && (quota.remaining ?? 1) <= 0) {
      setUpgradeOpen(true);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content, attachments: files }]);
    setInput("");
    setAttachments([]);
    setImageMode(false);
    setError("");
    setSending(true);
    setSendingImage(asImage);

    try {
      const res = await base44.functions.invoke("matrixAi", {
        action: asImage ? "generateImage" : "chat",
        conversation_id: activeId || undefined,
        content,
        attachments: files.map(({ url, name, type, size }) => ({ url, name, type, size })),
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
      setInput(typed);
      setAttachments(files);
      setImageMode(asImage);

      if (status === 429) {
        if (payload?.quota) setQuota(payload.quota);
        setUpgradeOpen(true);
      } else if (status === 401) {
        writeDraft({ content, image: asImage });
        setAuthOpen(true);
      } else if (status === 503) {
        setError(payload?.message || "Matrix AI est très sollicité. Réessaie dans quelques secondes.");
      } else {
        setError(payload?.message || payload?.error || "Matrix AI est momentanément indisponible. Réessaie dans un instant.");
      }
    } finally {
      setSending(false);
    }
  };

  const addFiles = async (files) => {
    if (!authenticated) {
      setAuthOpen(true);
      return;
    }
    const room = MAX_ATTACHMENTS - attachments.length;
    if (files.length > room) toast.error(`${MAX_ATTACHMENTS} fichiers maximum par message.`);
    const batch = files.slice(0, Math.max(room, 0));
    if (!batch.length) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of batch) {
        const problem = checkFileBeforeUpload(file);
        if (problem) {
          toast.error(`${file.name} : ${problem}`);
          continue;
        }
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          uploaded.push({ url: file_url, name: file.name, type: file.type, size: file.size });
        } catch {
          toast.error(`${file.name} : envoi impossible, réessaie.`);
        }
      }
      if (uploaded.length) setAttachments((prev) => [...prev, ...uploaded].slice(0, MAX_ATTACHMENTS));
    } finally {
      setUploading(false);
    }
  };

  const openConversation = async (conversation) => {
    setMobileOpen(false);
    setActiveId(conversation.id);
    setError("");
    setMessages(await fetchMessages(conversation.id));
  };

  const startNewConversation = () => {
    setActiveId(null);
    setMessages([]);
    setInput("");
    setImageMode(false);
    setAttachments([]);
    setError("");
    setMobileOpen(false);
  };

  // À l'ouverture : liste des discussions de l'utilisateur, discussion active affichée directement,
  // puis envoi automatique du brouillon enregistré avant la connexion.
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!authenticated) {
      initializedFor.current = null;
      setConversations([]);
      setActiveId(null);
      setMessages([]);
      setLoadingConversations(false);
      return;
    }
    if (initializedFor.current === user.id) return;
    initializedFor.current = user.id;

    let active = true;
    (async () => {
      setLoadingConversations(true);
      const items = await loadConversations();
      if (!active) return;
      setLoadingConversations(false);
      const draft = readDraft();
      if (draft) {
        writeDraft(null);
        setInput("");
        setImageMode(false);
        sendRef.current(draft.content, { image: Boolean(draft.image) });
        return;
      }
      if (items[0]) {
        setActiveId(items[0].id);
        const loaded = await fetchMessages(items[0].id);
        if (active) setMessages(loaded);
      }
    })();
    return () => {
      active = false;
    };
  }, [isLoadingAuth, authenticated, user?.id, loadConversations, fetchMessages]);

  useEffect(() => {
    sendRef.current = sendMessage;
  });

  // Retour OAuth Google Drive : ?code=...&state=... (ou ?error=...).
  useEffect(() => {
    if (!authenticated || oauthHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");
    if (!state || (!code && !oauthError)) return;
    oauthHandled.current = true;
    window.history.replaceState({}, "", window.location.pathname);

    base44.functions
      .invoke("aiConnectors", { action: "callback", code, state, error: oauthError })
      .then(() => toast.success("Google Drive connecté"))
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Connexion Google Drive impossible");
      })
      .finally(() => setConnectorsVersion((v) => v + 1));
  }, [authenticated]);

  const deleteConversation = async (conversation) => {
    try {
      await base44.entities.AiMessage.deleteMany({ conversation_id: conversation.id, user_id: user.id });
      await base44.entities.AiConversation.delete(conversation.id);
      setConversations((prev) => prev.filter((item) => item.id !== conversation.id));
      if (activeId === conversation.id) startNewConversation();
      toast.success("Discussion supprimée");
    } catch {
      toast.error("Impossible de supprimer la discussion");
    }
  };

  const handleUpgraded = async () => {
    await refresh();
    setConnectorsVersion((v) => v + 1);
    toast.success("Abonnement activé, ton quota est mis à jour !");
  };

  const openAuth = () => {
    setUpgradeOpen(false);
    const draft = String(input).trim();
    if (draft) writeDraft({ content: draft, image: imageMode });
    setAuthOpen(true);
  };

  const handleInputChange = (value) => {
    setInput(value);
    if (!authenticated) writeDraft(value.trim() ? { content: value, image: imageMode } : null);
  };

  const activeConversation = conversations.find((item) => item.id === activeId);
  const thinkingLabel = sendingImage
    ? IMAGE_STEPS[thinkingStep % IMAGE_STEPS.length]
    : THINKING_STEPS[thinkingStep % THINKING_STEPS.length];

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
        loading={loadingConversations || isLoadingAuth}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        guest={!authenticated}
        onLogin={openAuth}
        onOpenConnectors={() => setConnectorsOpen(true)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <AiQuotaBar
          quota={quota}
          remainingMs={remainingMs}
          guest={!authenticated}
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
                  <p className="text-[11px] text-white/50 animate-pulse">{thinkingLabel}</p>
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
          onChange={handleInputChange}
          onSend={() => sendMessage()}
          sending={sending}
          disabled={sending}
          imageMode={imageMode}
          onToggleImageMode={() => setImageMode((value) => !value)}
          attachments={attachments}
          uploading={uploading}
          onAddFiles={addFiles}
          onRemoveAttachment={(index) => setAttachments((prev) => prev.filter((_, i) => i !== index))}
        />
      </div>

      {authenticated && (
        <AiConnectorsPanel
          open={connectorsOpen}
          onClose={() => setConnectorsOpen(false)}
          quota={quota}
          refreshToken={connectorsVersion}
          onUpgrade={() => {
            setConnectorsOpen(false);
            setUpgradeOpen(true);
          }}
          onMemoryToggled={(enabled) => setQuota((prev) => (prev ? { ...prev, memory_enabled: enabled } : prev))}
        />
      )}

      <AiUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        quota={quota}
        remainingMs={remainingMs}
        onUpgraded={handleUpgraded}
        guest={!authenticated}
        onLogin={openAuth}
      />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} redirectTo="/matrix-ai" />
    </div>
  );
}
