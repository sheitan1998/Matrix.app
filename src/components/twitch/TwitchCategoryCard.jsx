import { Link } from "react-router-dom";

/**
 * TwitchCategoryCard — square card for a Twitch category (game).
 * Shows box art image + game name.
 */
export default function TwitchCategoryCard({ category, square = false }) {
  if (!category) return null;

  return (
    <Link
      to={`/twitch/search?q=${encodeURIComponent(category.name)}&filter=categories`}
      className="group block w-full"
    >
      <div className={`relative ${square ? "aspect-square" : "aspect-[3/4]"} rounded-xl overflow-hidden bg-[#161321] hover:ring-2 hover:ring-[#db2777] transition-all`}>
        {category.box_art_url ? (
          <img
            src={category.box_art_url}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#a0a0b0] text-xs p-2 text-center">
            {category.name}
          </div>
        )}
      </div>
      <p className="text-white text-xs font-medium truncate mt-1.5">{category.name}</p>
    </Link>
  );
}