import React from "react";
import SeoContentBlock from "@/components/seo/SeoContentBlock";
import { serverCategories, serverGames, serverTypeLabel, guideLinksFor } from "@/lib/serverSeo";
import { slugify } from "@/lib/serverDirectory";

/**
 * FAQ courte d'une fiche serveur, construite uniquement à partir des données
 * réelles de l'annonce (nom, type, jeux, catégories). Complète ServerSeoContent.
 */
export default function ServerFaqBlock({ server }) {
  const name = server.title;
  const type = serverTypeLabel(server).toLowerCase();
  const games = serverGames(server);
  const categories = serverCategories(server);
  const categorySlugs = server.category_slugs || [];
  const isDiscord = server.server_type === "discord";

  const faq = [
    {
      question: `Comment rejoindre ${name} ?`,
      answer: isDiscord
        ? `${name} est un ${type} : utilisez le bouton d'invitation de cette fiche pour rejoindre la communauté directement sur Discord.`
        : `${name} est un ${type} hébergé sur Matrix Hub : connectez-vous puis rejoignez-le depuis cette fiche ou depuis la page Nexus pour accéder à ses salons.`,
    },
    {
      question: `Comment soutenir ${name} dans le classement ?`,
      answer: `Chaque visiteur peut voter pour ${name} une fois toutes les 2 heures. Les votes du mois déterminent sa place dans l'annuaire Best Serveur.`,
    },
  ];

  if (games.length > 0) {
    faq.push({
      question: `À quels jeux s'adresse ${name} ?`,
      answer: `${name} accueille les joueurs de ${games.slice(0, 4).join(", ")}.`,
    });
  }

  const links = [
    ...categories.slice(0, 3).map((label, index) => ({
      href: `/best-serveurs/category/${categorySlugs[index] || slugify(label)}`,
      label: `Autres serveurs ${label}`,
    })),
    { href: "/best-serveurs", label: "Tous les serveurs Best Serveur" },
    ...guideLinksFor(games, categories),
  ];

  return (
    <SeoContentBlock
      title={`Rejoindre et soutenir ${name}`}
      faq={faq}
      links={links}
    />
  );
}
