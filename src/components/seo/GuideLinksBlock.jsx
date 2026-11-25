import React from "react";
import SeoContentBlock from "@/components/seo/SeoContentBlock";

const KINDS = {
  game: (name) => ({
    title: `Le wiki ${name} sur Matrix Hub`,
    intro: `Ce wiki ${name} est alimenté par la communauté de Matrix Hub : fiches, quêtes et astuces y sont regroupées pour retrouver rapidement une information. Utilisez la recherche et les sections pour parcourir le contenu, ou rejoignez un serveur de jeu pour échanger avec d'autres joueurs.`,
  }),
  quest: (name) => ({
    title: `À propos de cette quête ${name}`,
    intro: `Cette fiche de quête fait partie du wiki ${name} de Matrix Hub, enrichi par la communauté. Retrouvez les autres quêtes et fiches dans le guide du jeu, ou rejoignez un serveur pour demander de l'aide à d'autres joueurs.`,
  }),
  wiki: (name) => ({
    title: `À propos de cette fiche ${name}`,
    intro: `Cette fiche fait partie du wiki ${name} de Matrix Hub, enrichi par la communauté. Parcourez le guide du jeu pour retrouver d'autres fiches, ou rejoignez un serveur pour échanger avec d'autres joueurs.`,
  }),
  open: (name) => ({
    title: `À propos de la fiche ${name}`,
    intro: `Cette fiche ${name} présente des données publiques du jeu, regroupées par onglet. Retrouvez les autres guides gaming de Matrix Hub, ou rejoignez un serveur pour discuter du jeu avec la communauté.`,
  }),
};

/**
 * Bloc visible de fin de page pour les fiches de guides : court texte + liens internes.
 * kind : "game" | "quest" | "wiki" | "open".
 */
export default function GuideLinksBlock({ kind = "game", gameName, gameSlug, gameHref }) {
  const { title, intro } = (KINDS[kind] || KINDS.game)(gameName);
  const links = [];
  const backHref = gameHref || (gameSlug ? `/tuto-gaming/${gameSlug}` : null);
  if (backHref && kind !== "game" && kind !== "open") {
    links.push({ href: backHref, label: `Retour au wiki ${gameName}` });
  }
  links.push({ href: "/tuto-gaming", label: "Tous les guides gaming" });
  links.push({ href: "/best-serveurs", label: "Trouver un serveur de jeu" });
  return <SeoContentBlock title={title} intro={intro} links={links} />;
}
