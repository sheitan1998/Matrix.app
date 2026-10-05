import { Users, Star, Eye, Calendar } from "lucide-react";

const fmt = (n) => Number(n || 0).toLocaleString("fr-FR");

/** Real Helix stats: followers (channels/followers), subscribers (subscriptions), live viewers, creation date. */
export default function TwitchChannelStats({ followers, subscribers, viewers, createdAt }) {
  const items = [
    followers !== null && followers !== undefined && { icon: Users, label: "Followers", value: fmt(followers) },
    subscribers !== null && subscribers !== undefined && { icon: Star, label: "Abonnés", value: fmt(subscribers) },
    viewers !== null && viewers !== undefined && { icon: Eye, label: "Spectateurs", value: fmt(viewers), live: true },
    createdAt && { icon: Calendar, label: "Créée le", value: new Date(createdAt).toLocaleDateString("fr-FR") },
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map(({ icon: Icon, label, value, live }) => (
        <div key={label} className="rounded-xl bg-[#1a0f2e] border border-[#2a1f3e] px-3 py-2">
          <p className={`text-[10px] uppercase tracking-wide flex items-center gap-1 ${live ? "text-[#ef4444]" : "text-[#a0a0b0]"}`}>
            <Icon className="w-3 h-3" />
            {label}
          </p>
          <p className="text-white font-bold text-sm mt-0.5">{value}</p>
        </div>
      ))}
    </div>
  );
}