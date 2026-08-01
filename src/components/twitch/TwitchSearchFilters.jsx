/**
 * TwitchSearchFilters — filter tabs for Twitch search.
 * Matches Twitch's search filters: Tous, Chaînes, Lives, Catégories.
 */
const FILTERS = [
  { id: "all", label: "Tous" },
  { id: "channels", label: "Chaînes" },
  { id: "lives", label: "Lives" },
  { id: "categories", label: "Catégories" },
];

export default function TwitchSearchFilters({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 border-b border-[#2a2a3e] overflow-x-auto no-scrollbar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors relative tap-sm ${
            active === f.id ? "text-white" : "text-[#a0a0b0] hover:text-white"
          }`}
        >
          {f.label}
          {active === f.id && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#db2777] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}