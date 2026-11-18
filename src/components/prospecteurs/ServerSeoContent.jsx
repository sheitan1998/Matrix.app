import React from "react";
import { Link } from "react-router-dom";
import { serverCategories, serverGames, serverTypeLabel } from "@/lib/serverSeo";
import { serverTags } from "@/lib/serverTags";
import { slugify } from "@/lib/serverDirectory";

const cardStyle = {
  background: "rgba(18,9,28,0.6)",
  border: "1px solid rgba(138,79,255,0.15)",
};

const chipStyle = {
  background: "rgba(168,85,247,0.12)",
  color: "#d8b4fe",
  border: "1px solid rgba(168,85,247,0.25)",
};

/**
 * Contenu descriptif réel de la fiche serveur : rendu dans le DOM
 * (donc lisible par les moteurs de recherche) et construit uniquement
 * à partir des informations de l'annonce.
 */
export default function ServerSeoContent({ server }) {
  const games = serverGames(server);
  const categories = serverCategories(server);
  const tags = serverTags(server);
  const categorySlugs = server.category_slugs || [];
  const type = serverTypeLabel(server);
  const votes = Number(server.votes || 0);
  const monthVotes = Number(server.votes_month || 0);
  const boosts = Number(server.boosts || 0);

  const updated = server.updated_date || server.created_date;
  const updatedLabel = updated
    ? new Date(updated).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const slugFor = (name, index) => categorySlugs[index] || slugify(name);

  return (
    <section className="rounded-xl p-4 mb-4" style={cardStyle}>
      <h2 className="text-xs font-black uppercase tracking-wider text-white mb-2">
        À propos de {server.title}
      </h2>
      <p className="text-sm text-white/70 leading-relaxed">
        {server.title} est un {type.toLowerCase()} référencé dans l'annuaire Best Serveur de Matrix Hub.
        {games.length > 0 && ` Il s'adresse aux joueurs de ${games.slice(0, 3).join(", ")}.`}
        {categories.length > 0 && ` Catégories : ${categories.join(", ")}.`}
        {` Il totalise ${votes} vote${votes > 1 ? "s" : ""} et ${monthVotes} vote${monthVotes > 1 ? "s" : ""} ce mois-ci`}
        {boosts > 0 ? `, avec ${boosts} boost${boosts > 1 ? "s" : ""} reçu${boosts > 1 ? "s" : ""}.` : "."}
      </p>

      {games.length > 0 && (
        <div className="mt-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Jeux</h3>
          <p className="text-sm text-white/60">{games.join(" · ")}</p>
        </div>
      )}

      {categories.length > 0 && (
        <div className="mt-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Catégories</h3>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((name, index) => (
              <Link
                key={name}
                to={`/best-serveurs/category/${slugFor(name, index)}`}
                className="text-[10px] font-bold px-2 py-0.5 rounded tap-sm"
                style={chipStyle}
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Étiquettes</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/best-serveurs?view=list&tag=${encodeURIComponent(tag)}`}
                className="text-[10px] font-bold px-2 py-0.5 rounded tap-sm"
                style={chipStyle}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-white/40">
        {updatedLabel && <>Fiche mise à jour le {updatedLabel}. </>}
        <Link to="/best-serveurs" className="text-purple-400 hover:text-purple-300 transition">
          Parcourir tous les serveurs de l'annuaire
        </Link>
      </p>
    </section>
  );
}