import React, { useEffect, useMemo, useState } from "react";

function epicThumbnail(url) {
  if (typeof url !== "string") return "";
  return url.replace(/landscape_comp\.jpeg(\?.*)?$/i, "landscape_comp_s.jpeg$1");
}

export default function FortniteMapImage({ map, detail = false, className = "" }) {
  const original = map?.image_url || map?.api_thumbnail || "";
  const preferred = useMemo(() => {
    if (detail) return original;
    return map?.thumbnail_url || map?.api_thumbnail_url || epicThumbnail(original);
  }, [detail, map?.api_thumbnail_url, map?.thumbnail_url, original]);
  const [source, setSource] = useState(preferred);

  useEffect(() => setSource(preferred), [preferred]);

  if (!source) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <span aria-hidden="true" className="text-3xl opacity-30">🗺️</span>
        <span className="sr-only">Aucun visuel fourni</span>
      </div>
    );
  }

  return (
    <img
      src={source}
      alt={map?.title || "Carte Fortnite"}
      width={640}
      height={360}
      loading={detail ? "eager" : "lazy"}
      decoding="async"
      sizes={detail ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
      onError={() => {
        if (source !== original && original) setSource(original);
        else setSource("");
      }}
      className={className}
    />
  );
}
