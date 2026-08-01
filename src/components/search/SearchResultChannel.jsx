import React from "react";
import { Link } from "react-router-dom";
import { formatViews } from "@/lib/format";
import { CheckCircle2, Users } from "lucide-react";

export default function SearchResultChannel({ channel }) {
  return (
    <div className="flex gap-4 py-3 items-start">
      <Link to={`/channel/${channel.id}`} className="shrink-0">
        {channel.avatar_url ? (
          <img
            src={channel.avatar_url}
            alt={channel.name}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary" />
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/channel/${channel.id}`} className="flex items-center gap-1.5 group">
          <h3 className="font-medium text-sm md:text-base group-hover:text-primary transition-colors">
            {channel.name}
          </h3>
          {channel.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {formatViews(channel.subscribers_count)} abonnés
          {channel.total_views ? ` • ${formatViews(channel.total_views)} vues` : ""}
        </p>
        {channel.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{channel.description}</p>
        )}
      </div>
    </div>
  );
}