import React from "react";
import { Link } from "react-router-dom";
import { formatViews, formatTimeAgo } from "@/lib/format";
import { Radio, CheckCircle2 } from "lucide-react";

export default function SearchResultVideo({ video }) {
  const to = video.is_live ? `/live/${video.id}` : `/watch/${video.id}`;

  return (
    <Link to={to} className="flex gap-3 group py-2">
      <div className="relative w-40 md:w-64 shrink-0 aspect-video rounded-xl overflow-hidden bg-secondary">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full grid-bg" />
        )}
        {video.is_live ? (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 bg-live text-white rounded text-[10px] font-bold">
            <Radio className="w-2.5 h-2.5 animate-live-pulse" /> LIVE
          </div>
        ) : video.duration ? (
          <div className="absolute bottom-1.5 right-1.5 px-1 py-0.5 bg-black/80 rounded text-[10px] font-mono font-medium text-white">
            {video.duration}
          </div>
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {formatViews(video.views)} vues{video.created_date ? ` • ${formatTimeAgo(video.created_date)}` : ""}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          {video.channel_avatar && (
            <img src={video.channel_avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
          )}
          <span className="text-xs text-muted-foreground truncate">{video.channel_name}</span>
          {video.channel_name && <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />}
        </div>
        {video.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 hidden md:block">
            {video.description}
          </p>
        )}
      </div>
    </Link>
  );
}