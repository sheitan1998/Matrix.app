import React from "react";
import { Link } from "react-router-dom";
import SeoContentBlock from "@/components/seo/SeoContentBlock";
import { SITE_URL } from "@/lib/seoRoutes";

const HUB = { href: "/tuto-gaming", label: "Guides et tutoriels gaming" };
const SERVERS = { href: "/best-serveurs", label: "Best Serveur : annuaire de serveurs" };
const CREATORS = { href: "/best-creator", label: "Best Creator : classement des créateurs" };
const NEXUS = { href: "/nexus", label: "Nexus : serveurs communautaires" };

const PAGES = {
  landing: {
    eyebrow: "Questions fréquentes",
    title: "Découvrir Matrix Hub en quelques questions",
    intro: "Matrix Hub s'adresse aux joueurs, aux créateurs et aux communautés francophones. Vous pouvez regarder des vidéos et des lives, publier des shorts, rejoindre des serveurs de discussion, consulter des guides de jeux ou poser vos questions à l'assistant Matrix AI, le tout depuis un même compte.",
    faq: [
      { question: "Matrix Hub est-il gratuit ?", answer: "La navigation et la consultation des guides sont libres. Certaines fonctionnalités communautaires, comme les votes, les serveurs ou les profils, nécessitent un compte." },
      { question: "Comment trouver un serveur pour mon jeu ?", answer: "L'annuaire Best Serveur classe les serveurs par catégorie et par votes mensuels. Vous pouvez aussi explorer les serveurs publics de Nexus." },
      { question: "Comment mettre en avant ma chaîne ou mon serveur ?", answer: "Inscrivez votre serveur dans Best Serveur ou votre chaîne dans Best Creator : la communauté peut alors voter pour vous." },
      { question: "Où trouver des guides pour Minecraft, Dofus ou Fortnite ?", answer: "Le hub des guides gaming réunit les pages dédiées à chaque jeu, avec leurs outils et catalogues." }
    ],
    links: [SERVERS, CREATORS, NEXUS, HUB, { href: "/matrix-ai", label: "Matrix AI" }, { href: "/about", label: "À propos" }],
    itemList: [
      { name: "Best Serveur", url: `${SITE_URL}/best-serveurs` },
      { name: "Best Creator", url: `${SITE_URL}/best-creator` },
      { name: "Nexus", url: `${SITE_URL}/nexus` },
      { name: "Guides gaming", url: `${SITE_URL}/tuto-gaming` },
      { name: "Shorts", url: `${SITE_URL}/shorts` },
      { name: "Lives en direct", url: `${SITE_URL}/live` },
      { name: "Matrix AI", url: `${SITE_URL}/matrix-ai` }
    ]
  },
  about: {
    eyebrow: "Matrix Hub",
    title: "Ce que vous pouvez faire sur Matrix Hub",
    intro: "Matrix Hub veut simplifier la vie des joueurs et des créateurs en regroupant au même endroit ce qui est souvent dispersé : des vidéos et des lives à regarder, des serveurs de discussion à rejoindre, des guides de jeux à consulter et des outils pour créer. Chaque espace est pensé pour se compléter : on découvre un jeu dans un guide, on trouve une communauté dans l'annuaire, puis on échange dans Nexus.",
    sections: [
      { title: "Découvrir", text: "Parcourez les tendances, les lives et les shorts de la communauté pour trouver de nouveaux créateurs." },
      { title: "Rejoindre", text: "Trouvez un serveur adapté à votre jeu grâce à l'annuaire Best Serveur et aux serveurs Nexus." },
      { title: "Apprendre", text: "Consultez les guides, catalogues et outils dédiés à vos jeux préférés." }
    ],
    faq: [
      { question: "À qui s'adresse Matrix Hub ?", answer: "Aux joueurs, aux créateurs de contenu et aux communautés qui cherchent un espace commun pour se retrouver." },
      { question: "Comment contacter l'équipe ?", answer: "Rendez-vous sur la page Contact pour écrire à l'équipe." },
      { question: "Comment participer à la communauté ?", answer: "Créez un compte, rejoignez un serveur Nexus, votez pour vos serveurs favoris ou proposez le vôtre dans l'annuaire." }
    ],
    links: [{ href: "/contact", label: "Nous contacter" }, SERVERS, CREATORS, NEXUS, HUB]
  },
  contact: {
    eyebrow: "Support",
    title: "Avant de nous écrire",
    intro: "Pour une question, un problème technique, une demande de partenariat ou un signalement, utilisez le formulaire ou l'adresse e-mail ci-dessus. Précisez la page concernée et décrivez ce que vous avez observé afin de faciliter la réponse. Pour découvrir la plateforme, consultez d'abord la page À propos.",
    links: [{ href: "/about", label: "À propos de Matrix Hub" }, { href: "/privacy", label: "Politique de confidentialité" }, SERVERS, HUB]
  },
  privacy: {
    links: [{ href: "/about", label: "À propos de Matrix Hub" }, { href: "/contact", label: "Nous contacter" }]
  },
  ai: {
    eyebrow: "Matrix AI",
    title: "À quoi sert Matrix AI ?",
    intro: "Matrix AI est un assistant conversationnel pour les joueurs et les créateurs. Posez-lui une question sur un jeu, demandez une idée de contenu ou une aide pour rédiger une description. Les réponses sont générées automatiquement : vérifiez les informations importantes avant de vous y fier.",
    faq: [
      { question: "Que puis-je demander à Matrix AI ?", answer: "Des conseils de jeu, des idées de vidéos, une aide à la rédaction ou des réponses rapides sur la plateforme." },
      { question: "Faut-il un compte ?", answer: "Vous pouvez découvrir l'assistant, mais la connexion permet de retrouver l'historique de vos conversations." },
      { question: "Les réponses sont-elles toujours exactes ?", answer: "Non, une IA peut se tromper. Recoupez les informations importantes avec les guides ou les sources officielles." }
    ],
    links: [HUB, SERVERS, { href: "/minecraft", label: "Guides Minecraft" }]
  },
  shorts: {
    eyebrow: "Shorts",
    title: "Les shorts de Matrix Hub",
    intro: "Les shorts sont des vidéos verticales courtes : meilleurs moments, astuces express et clips de la communauté. Faites défiler pour passer d'une vidéo à l'autre. Si aucun short n'est disponible pour l'instant, revenez un peu plus tard ou parcourez les tendances.",
    links: [{ href: "/trending", label: "Tendances" }, { href: "/live", label: "Lives en direct" }, CREATORS]
  },
  live: {
    eyebrow: "Lives",
    title: "Regarder les lives de la communauté",
    intro: "Cette page liste les chaînes en direct du moment, avec leur nombre de spectateurs lorsqu'il est disponible. Ouvrez un live pour suivre le stream et discuter dans le chat. S'il n'y a aucun direct pour le moment, découvrez les vidéos tendances ou les créateurs du classement Best Creator.",
    faq: [
      { question: "Pourquoi n'y a-t-il aucun live ?", answer: "La liste dépend des chaînes réellement en direct. Elle se remplit dès que des créateurs lancent un stream." },
      { question: "Comment trouver de nouveaux créateurs ?", answer: "Consultez le classement Best Creator ou les tendances pour repérer des chaînes à suivre." }
    ],
    links: [{ href: "/trending", label: "Tendances" }, { href: "/shorts", label: "Shorts" }, CREATORS, SERVERS]
  },
  trending: {
    eyebrow: "Tendances",
    title: "Comment sont choisies les vidéos tendances ?",
    intro: "Cette page présente les vidéos les plus vues, issues de la plateforme et de YouTube. La liste évolue au fil du temps et peut être vide si la source est momentanément indisponible. Pour aller plus loin, consultez les lives, les shorts ou les guides de jeux.",
    links: [{ href: "/live", label: "Lives en direct" }, { href: "/shorts", label: "Shorts" }, CREATORS, HUB]
  },
  stream: {
    eyebrow: "Streaming",
    title: "Vidéos et créateurs à découvrir",
    intro: "La page streaming réunit les vidéos récentes de la communauté et de YouTube. Faites défiler pour charger d'autres résultats, puis ouvrez une vidéo pour la regarder. Besoin d'idées ? Passez par les tendances, les lives ou le classement des créateurs.",
    links: [{ href: "/trending", label: "Tendances" }, { href: "/live", label: "Lives en direct" }, { href: "/shorts", label: "Shorts" }, CREATORS]
  }
};

export default function PageSeoBlock({ page, collapsible = false, summary, compact = false, overlay = false }) {
  const data = PAGES[page];
  if (!data || !data.title) return null;
  const block = <SeoContentBlock {...data} />;
  if (!collapsible) return block;
  if (compact) {
    return (
      <details className={overlay ? "w-full text-white/80 text-right" : "shrink-0 px-3 sm:px-6 text-white/80"}>
        <summary className="cursor-pointer select-none inline-block text-[10px] font-bold text-purple-400/80 hover:text-purple-300 transition py-1 px-2 rounded-full bg-black/40">
          {summary || "En savoir plus"}
        </summary>
        <div className={"text-left max-h-[45vh] overflow-y-auto " + (overlay ? "rounded-2xl bg-black/90 mt-1 p-1" : "pb-2")}>{block}</div>
      </details>
    );
  }
  return (
    <details className="mx-4 mb-4 max-h-[50vh] overflow-y-auto shrink-0 text-white/80">
      <summary className="cursor-pointer select-none text-xs font-bold text-purple-400 hover:text-purple-300 transition py-2 text-center">
        {summary || "En savoir plus"}
      </summary>
      {block}
    </details>
  );
}

export function PageLinksOnly({ page }) {
  const links = PAGES[page]?.links;
  if (!links?.length) return null;
  return (
    <nav aria-label="Pages liées" className="mt-6 flex flex-wrap gap-x-4 gap-y-2">
      {links.map((l) => (
        <Link key={l.href} to={l.href} className="text-xs font-bold text-purple-400 hover:text-purple-300 transition">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
