import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";

/** Image jointe : aperçu local d'abord, URL distante en repli, puis pastille avec le nom du fichier. */
export default function AiAttachmentImage({ file, className = "", imgClassName = "" }) {
  const sources = [file?.previewUrl, file?.url].filter(Boolean);
  const signature = sources.join("|");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [signature]);

  const src = sources[index];
  if (!src) {
    return (
      <span
        className={`inline-flex items-center gap-1 max-w-[180px] truncate rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white/90 ${className}`}
        style={{ background: "rgba(255,255,255,0.14)" }}
      >
        <FileText className="w-3 h-3 shrink-0" />
        <span className="truncate">{file?.name || "Image"}</span>
      </span>
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt={file?.name || "Image jointe"}
      loading="eager"
      referrerPolicy="no-referrer"
      onError={() => setIndex((current) => current + 1)}
      className={imgClassName}
    />
  );
}
