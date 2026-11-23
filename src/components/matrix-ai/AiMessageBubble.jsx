import React from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, User } from "lucide-react";
import AiRecommendationCards from "./AiRecommendationCards";
import AiImageCard from "./AiImageCard";
import AiAttachmentImage from "./AiAttachmentImage";
import { isImageAttachment } from "@/lib/aiFiles";

export default function AiMessageBubble({ message, user }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end gap-2">
        <div
          className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-br-sm px-3.5 py-2.5"
          style={{ background: "linear-gradient(135deg, rgba(138,79,255,0.9), rgba(109,40,217,0.9))" }}
        >
          <p className="text-[12px] text-white leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          {Array.isArray(message.attachments) && message.attachments.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {message.attachments.map((file, index) =>
                isImageAttachment(file) ? (
                  <a
                    key={`${file.url || file.name}-${index}`}
                    href={file.url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <AiAttachmentImage
                      file={file}
                      imgClassName="max-h-48 max-w-full rounded-lg object-cover"
                    />
                  </a>
                ) : (
                  <span
                    key={`${file.name}-${index}`}
                    className="max-w-[180px] truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white/90"
                    style={{ background: "rgba(255,255,255,0.14)" }}
                  >
                    📎 {file.name}
                  </span>
                )
              )}
            </div>
          )}
        </div>
        <div
          className="w-7 h-7 rounded-lg shrink-0 overflow-hidden flex items-center justify-center mt-0.5"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar du membre" className="w-full h-full object-cover" />
          ) : (
            <User className="w-3.5 h-3.5 text-white/50" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div
        className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
        style={{ background: "linear-gradient(135deg, #8a4fff, #22d3ee)" }}
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="min-w-0 max-w-[88%] sm:max-w-[80%]">
        <div
          className="rounded-2xl rounded-tl-sm px-3.5 py-2.5"
          style={{ background: "rgba(20,12,34,0.85)", border: "1px solid rgba(138,79,255,0.18)" }}
        >
          <div className="rich-text-content text-[12px] text-white/85 leading-relaxed break-words">
            {message.kind === "image" && message.image_url ? (
              <AiImageCard url={message.image_url} prompt={String(message.content || "").replace(/^Image générée : /, "")} />
            ) : (
              <ReactMarkdown>{message.content || ""}</ReactMarkdown>
            )}
          </div>
        </div>
        <AiRecommendationCards cards={message.attached_cards || []} />
      </div>
    </div>
  );
}