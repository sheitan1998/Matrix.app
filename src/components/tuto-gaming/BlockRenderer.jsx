import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import AccordionBlock from "@/components/tuto-gaming/AccordionBlock";

export default function BlockRenderer({ gameSlug, pageKey, className = "" }) {
  const [blocks, setBlocks] = useState([]);

  const fetchBlocks = useCallback(async () => {
    try {
      const data = await base44.entities.PageBlock.filter(
        { game_slug: gameSlug, page_key: pageKey, is_active: true },
        "position",
        100
      );
      setBlocks(data);
    } catch {
      setBlocks([]);
    }
  }, [gameSlug, pageKey]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  useEffect(() => {
    const unsub = base44.entities.PageBlock.subscribe(() => fetchBlocks());
    return unsub;
  }, [fetchBlocks]);

  if (blocks.length === 0) return null;

  return (
    <div className={className}>
      <div className="grid grid-cols-12 gap-3">
        {blocks.map((block) => {
          const colSpan = Math.min(12, Math.max(1, block.col_span || 12));
          return (
            <div
              key={block.id}
              style={{ gridColumn: `span ${colSpan} / span ${colSpan}` }}
            >
              {block.block_type === "accordion" && (
                <AccordionBlock
                  title={block.title}
                  content={block.content}
                  image_url={block.image_url}
                  link_url={block.link_url}
                  defaultOpen={block.default_open !== false}
                />
              )}
              {block.block_type === "banner" && block.image_url && (
                <a href={block.link_url || "#"} target={block.link_url ? "_blank" : undefined} rel="noopener noreferrer" className="block rounded-lg overflow-hidden">
                  <img src={block.image_url} alt={block.title} className="w-full" loading="lazy" />
                </a>
              )}
              {block.block_type === "image" && block.image_url && (
                <img src={block.image_url} alt={block.title} className="w-full rounded-lg" loading="lazy" />
              )}
              {block.block_type === "text" && (
                <div className="p-4 rounded-lg" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <h3 className="text-sm font-bold text-white mb-1.5">{block.title}</h3>
                  {block.content && <p className="text-sm text-white/70 whitespace-pre-wrap">{block.content}</p>}
                </div>
              )}
              {block.block_type === "section" && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="block w-1 h-5 rounded-full" style={{ background: "#7DA627" }} />
                    <h2 className="text-sm font-black uppercase tracking-wider text-white">{block.title}</h2>
                  </div>
                  {block.content && <p className="text-sm text-white/60 mb-3">{block.content}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}