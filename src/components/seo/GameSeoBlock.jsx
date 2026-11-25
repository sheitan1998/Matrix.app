import React from "react";
import SeoContentBlock from "@/components/seo/SeoContentBlock";

const HUB = { href: "/tuto-gaming", label: "Hub des guides gaming" };
const SERVERS = { href: "/best-serveurs", label: "Trouver un serveur Discord" };

const L = {
  farming: { href: "/farming", label: "Farming Simulator 25" },
  minecraft: { href: "/minecraft", label: "Minecraft" },
  dofus: { href: "/dofus", label: "Dofus" },
  rocket: { href: "/rocket-league", label: "Rocket League" },
  valheim: { href: "/valheim", label: "Valheim" },
  rust: { href: "/rust", label: "Rust" },
  valorant: { href: "/valorant", label: "Valorant" },
  gta: { href: "/gta-6", label: "GTA VI" },
  maps: { href: "/fortnite-maps", label: "Codes de maps Fortnite" },
  shop: { href: "/fortnite-shop", label: "Boutique Fortnite" },
  cosmetics: { href: "/fortnite-cosmetics", label: "Cosmétiques Fortnite" },
  stats: { href: "/fortnite-stats", label: "Statistiques Fortnite" }
};

const PAGES = {
  hub: {
    eyebrow: "Guides gaming",
    title: "Les guides gaming de Matrix Hub",
    intro: "Le hub réunit les guides, catalogues et outils de Matrix Hub pour vos jeux préférés : mods et catégories pour Farming Simulator 25, encyclopédie Minecraft, outils Dofus, boutique et presets Rocket League, ou encore fiches Valheim, Rust et Valorant. Utilisez la recherche pour retrouver rapidement un jeu, puis ouvrez sa page pour consulter les informations utiles avant de lancer une partie. Chaque guide s'appuie sur des sources ouvertes ou officielles lorsqu'elles existent et indique clairement quand une donnée n'est pas disponible. Vous cherchez des partenaires de jeu ? L'annuaire Best Serveur référence des serveurs Discord classés par catégorie.",
    faq: [
      { question: "Comment trouver le guide d'un jeu précis ?", answer: "Saisissez le nom du jeu dans la barre de recherche du hub : la liste se filtre et chaque carte mène vers la page dédiée." },
      { question: "Les guides sont-ils gratuits ?", answer: "Oui, la consultation des guides est libre. Certaines fonctionnalités communautaires demandent simplement de se connecter." },
      { question: "Où trouver des joueurs pour un jeu ?", answer: "Parcourez l'annuaire Best Serveur par catégorie pour repérer un serveur Discord adapté à votre jeu." }
    ],
    links: [SERVERS, L.farming, L.minecraft, L.dofus, L.rocket, L.gta]
  },
  farming: {
    eyebrow: "Farming Simulator 25",
    title: "Mods et guides pour Farming Simulator 25",
    intro: "Cette page rassemble les mods de Farming Simulator 25 classés par catégories : véhicules, outils, bâtiments, cartes et améliorations de confort. Parcourez une catégorie pour comparer les mods proposés, puis consultez leur fiche avant de les télécharger. Pensez à vérifier la compatibilité avec votre version du jeu et à ne conserver que les mods dont vous avez réellement besoin, afin de garder une partie stable. Les mods restent la propriété de leurs créateurs, et les liens de téléchargement renvoient vers leurs sources. Si vous jouez en multijoueur, rejoignez un serveur Discord dédié à la ferme pour monter une partie à plusieurs.",
    howTo: {
      name: "Installer un mod Farming Simulator 25",
      description: "Étapes générales pour ajouter un mod à votre partie.",
      steps: [
        { name: "Choisir le mod", text: "Parcourez les catégories et ouvrez la fiche du mod qui vous intéresse." },
        { name: "Télécharger l'archive", text: "Récupérez le fichier du mod, généralement une archive au format zip, sans la décompresser." },
        { name: "Placer le fichier", text: "Copiez l'archive dans le dossier mods du jeu, situé dans vos documents." },
        { name: "Activer en partie", text: "Lancez le jeu, ouvrez votre sauvegarde et activez le mod dans la liste avant de démarrer." }
      ]
    },
    faq: [
      { question: "Comment installer un mod sur Farming Simulator 25 ?", answer: "Placez l'archive zip du mod dans le dossier mods du jeu sans la décompresser, puis activez-le dans les options de votre sauvegarde." },
      { question: "Les mods fonctionnent-ils en multijoueur ?", answer: "Oui, mais tous les joueurs doivent disposer des mêmes mods, dans la même version, que l'hôte de la partie." },
      { question: "Un mod ralentit mon jeu, que faire ?", answer: "Désactivez les mods les plus lourds un par un pour identifier le responsable, et vérifiez qu'ils sont à jour pour votre version du jeu." },
      { question: "Où trouver une communauté pour jouer ?", answer: "L'annuaire Best Serveur permet de trouver des serveurs Discord de joueurs de simulation agricole." }
    ],
    links: [HUB, SERVERS, L.minecraft, L.valheim, L.rust]
  },
  minecraft: {
    eyebrow: "Minecraft",
    title: "Encyclopédie et mods Minecraft",
    intro: "Retrouvez ici un catalogue de contenus Minecraft alimenté par une source open source ainsi qu'une encyclopédie pour consulter blocs, objets et créatures. Le catalogue vous aide à explorer des mods, packs de textures et autres ressources, tandis que l'encyclopédie sert de référence rapide pendant vos parties en survie ou en créatif. Les noms officiels restent ceux fournis par la source, et les champs non publiés sont indiqués comme non disponibles. Avant d'ajouter un mod, vérifiez la version du jeu et le chargeur de mods qu'il demande. Pour jouer en équipe, l'annuaire Best Serveur référence des serveurs Discord Minecraft.",
    faq: [
      { question: "Comment choisir un mod compatible ?", answer: "Vérifiez la version de Minecraft et le chargeur de mods indiqués sur la fiche, puis installez uniquement les mods qui correspondent." },
      { question: "À quoi sert l'encyclopédie ?", answer: "Elle permet de rechercher rapidement un bloc, un objet ou une créature et de consulter ses informations sans quitter le jeu trop longtemps." },
      { question: "Où trouver un serveur Minecraft avec une communauté ?", answer: "Parcourez l'annuaire Best Serveur et filtrez par catégorie pour repérer les serveurs Discord liés à Minecraft." }
    ],
    links: [HUB, SERVERS, L.farming, L.valheim, L.rust]
  },
  dofus: {
    eyebrow: "Dofus",
    title: "Outils Dofus : équipements, almanax et quêtes",
    intro: "Cette page propose des outils pour préparer vos aventures dans le monde des Douze : catalogue d'équipements, panoplies et ressources, almanax du jour, carte du monde, succès et suivi de quêtes. Les fiches affichent caractéristiques et recettes pour comparer des équipements avant de les fabriquer ou de les acheter. Les données proviennent de DofusDB et, si cette source est indisponible, d'un catalogue de référence sauvegardé. Que vous incarniez un Crâ, un Iop ou un Eniripsa, ces outils vous aident à organiser votre progression. Besoin d'une guilde ? Cherchez un serveur Discord Dofus dans l'annuaire Best Serveur.",
    faq: [
      { question: "À quoi sert l'almanax ?", answer: "L'almanax propose chaque jour une offrande à déposer en échange d'une récompense. La page vous permet de la consulter rapidement." },
      { question: "Comment comparer des équipements ?", answer: "Ouvrez la fiche d'un objet ou d'une panoplie pour voir ses caractéristiques et sa recette, puis comparez avec d'autres résultats du catalogue." },
      { question: "D'où viennent les données ?", answer: "Elles viennent de DofusDB. En cas d'indisponibilité, un catalogue de référence sauvegardé prend le relais." },
      { question: "Comment trouver une guilde ?", answer: "L'annuaire Best Serveur référence des serveurs Discord où retrouver des joueurs de Dofus." }
    ],
    links: [HUB, SERVERS, L.minecraft, L.valheim, L.farming]
  },
  rocket: {
    eyebrow: "Rocket League",
    title: "Boutique, garage et rang Rocket League",
    intro: "Cette page regroupe les outils Rocket League de Matrix Hub : un aperçu de la boutique d'objets, un garage pour composer et partager des presets de voiture, et un suivi de statistiques pour suivre votre rang. Le garage permet d'essayer des combinaisons de carrosserie, de roues et de décalcomanies avant de vous décider, puis de conserver vos presets sous forme de lien. Le suivi de statistiques donne un aperçu de vos performances à partir des informations disponibles. Pour trouver des coéquipiers et progresser en équipe, consultez l'annuaire Best Serveur et ses serveurs Discord dédiés aux jeux compétitifs.",
    faq: [
      { question: "Comment partager un preset de voiture ?", answer: "Composez votre voiture dans le garage puis copiez le lien du preset pour l'envoyer à un ami." },
      { question: "À quoi sert la boutique de cette page ?", answer: "Elle permet de consulter les objets proposés afin de repérer ceux qui vous plaisent avant d'ouvrir le jeu." },
      { question: "Comment suivre mon rang ?", answer: "Utilisez l'onglet des statistiques et renseignez votre profil de joueur pour afficher les informations disponibles." },
      { question: "Où trouver des coéquipiers ?", answer: "Les serveurs Discord de l'annuaire Best Serveur sont un bon point de départ pour former une équipe." }
    ],
    links: [HUB, SERVERS, L.valorant, L.maps, L.minecraft]
  },
  valheim: {
    eyebrow: "Valheim",
    title: "Guides et fiches Valheim",
    intro: "Valheim est un jeu de survie et d'exploration inspiré de la mythologie nordique. Cette page présente des fiches pratiques sur les créatures, les armes, les armures et les ressources afin de préparer vos expéditions. Ouvrez une fiche pour consulter ses informations, comme les faiblesses d'un ennemi, la santé ou le niveau d'un équipement. Jouer à plusieurs est souvent plus simple pour affronter les boss et bâtir un camp solide : rejoignez un serveur Discord de l'annuaire Best Serveur pour trouver des compagnons de voyage. Les noms et visuels appartiennent à leurs ayants droit respectifs.",
    faq: [
      { question: "Que trouve-t-on dans les fiches ?", answer: "Chaque fiche présente les informations disponibles sur un élément du jeu, par exemple ses points de vie, ses faiblesses ou son niveau." },
      { question: "Vaut-il mieux jouer seul ou à plusieurs ?", answer: "Valheim se joue des deux façons. À plusieurs, la construction et les combats de boss sont souvent plus accessibles." },
      { question: "Comment trouver des joueurs ?", answer: "Parcourez l'annuaire Best Serveur pour repérer des serveurs Discord où organiser vos parties." }
    ],
    links: [HUB, SERVERS, L.rust, L.minecraft, L.farming]
  },
  rust: {
    eyebrow: "Rust",
    title: "Guides et fiches Rust",
    intro: "Rust est un jeu de survie multijoueur où chaque serveur possède ses propres règles et sa propre communauté. Cette page propose des fiches classées par catégories pour mieux connaître les objets, les armes et les ressources du jeu. Ouvrez une carte pour afficher ses détails et son niveau, puis préparez votre équipement avant de rejoindre une partie. Comme la survie en solitaire est exigeante, beaucoup de joueurs s'organisent en équipe : l'annuaire Best Serveur référence des serveurs Discord qui facilitent la recherche de partenaires. Les noms et visuels restent la propriété de leurs ayants droit.",
    faq: [
      { question: "Comment utiliser les fiches ?", answer: "Choisissez une catégorie, ouvrez une carte et consultez ses informations pour préparer votre équipement." },
      { question: "Est-il préférable de jouer en équipe ?", answer: "Beaucoup de joueurs préfèrent s'associer pour partager les ressources, la défense et la construction de leur base." },
      { question: "Où trouver des coéquipiers ?", answer: "Les serveurs Discord de l'annuaire Best Serveur permettent de rencontrer d'autres joueurs et de planifier des sessions." }
    ],
    links: [HUB, SERVERS, L.valheim, L.valorant, L.minecraft]
  },
  valorant: {
    eyebrow: "Valorant",
    title: "Agents, armes et skins Valorant",
    intro: "Cette page présente les agents, les armes et les skins de Valorant à partir de données officielles issues de valorant-api.com. Ouvrez une fiche pour lire la description d'un agent, son rôle ou les informations d'une arme, afin de mieux choisir votre composition avant un match. Connaître les rôles de chacun aide à équilibrer une équipe et à communiquer plus facilement. Valorant étant un jeu de tir tactique en équipe, jouer avec des partenaires réguliers fait la différence : l'annuaire Best Serveur référence des serveurs Discord pour trouver des coéquipiers. Les noms et visuels appartiennent à leurs ayants droit.",
    faq: [
      { question: "D'où viennent les informations ?", answer: "Les fiches s'appuient sur les données de valorant-api.com, indiquées dans la description lorsqu'elles sont utilisées." },
      { question: "Comment choisir un agent ?", answer: "Consultez son rôle et sa description, puis tenez compte des agents déjà choisis par votre équipe." },
      { question: "Comment trouver une équipe ?", answer: "Parcourez l'annuaire Best Serveur pour rejoindre un serveur Discord de joueurs de jeux de tir compétitifs." }
    ],
    links: [HUB, SERVERS, L.rocket, L.rust, L.cosmetics]
  },
  gta: {
    eyebrow: "GTA VI",
    title: "GTA VI : informations et suivi",
    intro: "Cette page rassemble les informations publiques disponibles sur GTA VI, organisées par onglets pour retrouver facilement la présentation du jeu et les éléments déjà dévoilés. Le contenu reste factuel : Matrix Hub n'avance aucune date de sortie et ne présente pas de rumeur comme une certitude. Consultez les fiches pour suivre ce qui a été montré officiellement et revenez régulièrement, car les informations évoluent au fil des annonces de l'éditeur. En attendant, vous pouvez échanger avec d'autres fans sur les serveurs Discord référencés dans l'annuaire Best Serveur. Les noms et visuels appartiennent à leurs ayants droit.",
    faq: [
      { question: "Quelle est la date de sortie de GTA VI ?", answer: "Cette page ne communique pas de date. Reportez-vous aux annonces officielles de l'éditeur pour toute information à ce sujet." },
      { question: "Que trouve-t-on sur cette page ?", answer: "Des fiches organisées par onglets sur les éléments rendus publics, présentées de façon factuelle." },
      { question: "Où discuter du jeu avec d'autres joueurs ?", answer: "L'annuaire Best Serveur référence des serveurs Discord communautaires où échanger sur vos jeux favoris." }
    ],
    links: [HUB, SERVERS, L.rust, L.minecraft, L.valorant]
  },
  fortniteMaps: {
    eyebrow: "Fortnite",
    title: "Codes de maps Fortnite créatives",
    intro: "Retrouvez ici des codes de maps Fortnite partagés par la communauté : parcours, jeux de survie, modes entre amis et créations originales. Chaque carte indique son code, que vous pouvez copier puis saisir dans le jeu pour la lancer. Vous avez créé une map ? Connectez-vous pour la proposer et la faire découvrir aux autres joueurs. Les cartes appartiennent à leurs créateurs respectifs. Pour jouer à plusieurs, l'annuaire Best Serveur référence des serveurs Discord où organiser des parties, et les pages boutique, cosmétiques et statistiques complètent votre univers Fortnite.",
    howTo: {
      name: "Lancer une map Fortnite avec son code",
      steps: [
        { name: "Copier le code", text: "Ouvrez la carte de votre choix et copiez son code." },
        { name: "Ouvrir la recherche en jeu", text: "Dans Fortnite, accédez à la recherche de îles ou de modes de jeu." },
        { name: "Saisir le code", text: "Collez le code dans la barre de recherche puis sélectionnez la carte." },
        { name: "Lancer la partie", text: "Lancez la partie seul ou invitez vos amis dans votre groupe." }
      ]
    },
    faq: [
      { question: "Comment jouer à une map avec un code ?", answer: "Copiez le code, collez-le dans la recherche du jeu, sélectionnez la carte puis lancez la partie." },
      { question: "Puis-je proposer ma propre map ?", answer: "Oui, après connexion vous pouvez soumettre votre carte avec son code pour qu'elle soit présentée à la communauté." },
      { question: "Où trouver des joueurs pour mes parties ?", answer: "Rejoignez un serveur Discord de l'annuaire Best Serveur pour constituer un groupe." }
    ],
    links: [HUB, SERVERS, L.shop, L.cosmetics, L.stats]
  },
  fortniteShop: {
    eyebrow: "Boutique Fortnite",
    title: "Consulter la boutique d'objets Fortnite",
    intro: "Cette page affiche les objets de la boutique Fortnite pour vous aider à repérer les tenues, accessoires et emotes qui vous intéressent. Ouvrez un objet pour voir ses détails, puis chargez davantage de résultats si vous souhaitez parcourir tout le catalogue. La boutique évolue régulièrement : l'affichage reflète les données disponibles au moment du chargement et ne remplace pas la boutique du jeu pour acheter. Retrouvez aussi les cosmétiques, les codes de maps et le suivi de statistiques, et rejoignez un serveur Discord de l'annuaire Best Serveur pour partager vos trouvailles.",
    faq: [
      { question: "Puis-je acheter directement depuis cette page ?", answer: "Non, la page sert à consulter les objets. Les achats se font dans la boutique officielle du jeu." },
      { question: "Pourquoi les objets changent-ils ?", answer: "La boutique est renouvelée régulièrement, l'affichage dépend donc des données disponibles au moment de votre visite." },
      { question: "Où retrouver un objet qui m'intéresse ?", answer: "Consultez aussi la page des cosmétiques pour parcourir le catalogue et ouvrir la fiche d'un objet." }
    ],
    links: [HUB, SERVERS, L.cosmetics, L.maps, L.stats]
  },
  fortniteCosmetics: {
    eyebrow: "Cosmétiques Fortnite",
    title: "Catalogue des cosmétiques Fortnite",
    intro: "Parcourez le catalogue des cosmétiques Fortnite : tenues, sacs à dos, pioches, planeurs et emotes. Utilisez la recherche et les filtres pour retrouver un objet, ouvrez sa fiche pour voir ses détails, puis sélectionnez-le pour le comparer ou le garder en repère. Certains objets disposent d'un score issu des votes de la communauté, qui reflète l'avis des visiteurs et non une évaluation officielle. Les visuels appartiennent à leurs ayants droit. Pour compléter votre visite, consultez la boutique, les codes de maps et les statistiques, ou discutez avec d'autres joueurs sur les serveurs de l'annuaire Best Serveur.",
    faq: [
      { question: "Comment retrouver un cosmétique précis ?", answer: "Utilisez la recherche et les filtres du catalogue, puis ouvrez la fiche de l'objet pour voir ses détails." },
      { question: "Que signifie le score affiché sur certains objets ?", answer: "Il provient des votes des visiteurs de Matrix Hub et exprime l'avis de la communauté, pas une note officielle." },
      { question: "Où voir ce qui est en vente actuellement ?", answer: "La page boutique présente les objets proposés d'après les données disponibles lors du chargement." }
    ],
    links: [HUB, SERVERS, L.shop, L.maps, L.stats]
  },
  fortniteStats: {
    eyebrow: "Statistiques Fortnite",
    title: "Suivre ses statistiques Fortnite",
    intro: "Cette page permet de consulter les statistiques d'un joueur Fortnite à partir des informations publiques disponibles : parties jouées, victoires, éliminations et ratios. Saisissez un pseudo pour afficher son profil, puis comparez vos résultats au fil du temps pour mesurer votre progression. Les statistiques d'un compte ne s'affichent que si ce dernier les rend publiques dans le jeu. Pour progresser, formez une équipe régulière : l'annuaire Best Serveur référence des serveurs Discord où trouver des partenaires, et les pages boutique, cosmétiques et maps complètent votre expérience Fortnite.",
    faq: [
      { question: "Pourquoi mes statistiques ne s'affichent-elles pas ?", answer: "Elles ne sont visibles que si votre compte les rend publiques dans les paramètres du jeu." },
      { question: "Quelles informations sont affichées ?", answer: "Les parties, victoires, éliminations et ratios disponibles pour le joueur recherché." },
      { question: "Comment trouver une équipe ?", answer: "Rejoignez un serveur Discord de l'annuaire Best Serveur pour jouer avec des partenaires réguliers." }
    ],
    links: [HUB, SERVERS, L.shop, L.cosmetics, L.maps]
  }
};

export default function GameSeoBlock({ page }) {
  const data = PAGES[page];
  if (!data) return null;
  return (
    <div className="px-0">
      <SeoContentBlock {...data} />
    </div>
  );
}
