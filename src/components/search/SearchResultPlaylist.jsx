import React from "react";
import { Link } from "react-router-dom";
import { ListVideo } from "lucide-react";

export default function SearchResultPlaylist({ playlist }) {
  return (
    <Link
      to={`/channel/${playlist.channel_id}`}
      className="flex gap-3 group py-2"
    >
      <div className="relative w-40 md:w-64 shrink-0 aspect-video rounded-xl overflow-hidden bg-secondary">
        {playlist.thumbnail_url ? (
          <img
            src={playlist.thumbnail_url}
            alt={playlist.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full grid-bg" />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <ListVideo className="w-7 h-7 text-white" />
            <span className="text-white text-xs font-semibold">Playlist</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm md:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {playlist.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{playlist.channel_name}</p>
        {playlist.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 hidden md:block">
            {playlist.description}
          </p>
        )}
      </div>
    </Link>
  );
}