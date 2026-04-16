import React from "react";
import { Link } from "react-router-dom";
import { formatViews, formatTimeAgo } from "@/lib/format";
import { Radio, CheckCircle2 } from "lucide-react";

export default function VideoCard({ video, size = "default" }) {
  const to = video.is_live ? `/live/${video.id}` : `/watch/${video.id}`;

  return (
    <Link to={to} className="group flex flex-col gap-3">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full grid-bg" />
        )}

        {/* Duration / Live */}
        {video.is_live ? (
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-live text-white rounded-md text-xs font-bold">
            <Radio className="w-3 h-3 animate-live-pulse" />
            LIVE
            <span className="opacity-80">• {formatViews(video.viewers_count)}</span>
          </div>
        ) : video.duration ? (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-background/90 rounded text-xs font-mono font-medium">
            {video.duration}
          </div>
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex gap-3">
        {video.channel_avatar && (
          <img
            src={video.channel_avatar}
            alt={video.channel_name}
            className="w-9 h-9 rounded-full shrink-0 object-cover mt-0.5"
          />
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
            <span className="truncate hover:text-foreground transition-colors">{video.channel_name}</span>
            <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatViews(video.views)} vues • {formatTimeAgo(video.created_date)}
          </p>
        </div>
      </div>
    </Link>
  );
}