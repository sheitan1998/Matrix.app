// Guides de création de serveurs : 9 sections identiques pour chaque guide.
export const GUIDE_SECTION_TITLES = [
  "Pourquoi créer ce serveur & objectifs",
  "Prérequis techniques & hébergement",
  "Installation pas à pas",
  "Lancement et mise en ligne du serveur",
  "Plugins, Mods & Crossplay",
  "Sécurité & Anti-Cheat",
  "Optimisation & Performances",
  "API, Webhooks & Système de Récompenses",
  "FAQ Rapide",
];

const section = (intro, items = [], code = null) => ({ intro, items, code });

const voteSection = (platform, extra) => section(
  `Best Serveur propose une API de vote : à chaque vote validé, votre ${platform} peut recevoir un webhook et récompenser automatiquement le votant.`,
  [
    "Publiez votre serveur sur Best Serveur, ouvrez la fiche en mode édition et générez votre clé d'API serveur (à garder secrète, jamais dans un dépôt public).",
    "Renseignez l'URL de votre webhook : un point d'entrée HTTPS de votre serveur qui reçoit un POST JSON à chaque vote.",
    "Vérifiez la signature ou le jeton envoyé avec la requête avant de récompenser, sinon n'importe qui peut simuler un vote.",
    "Enregistrez l'identifiant du votant et la date du vote pour éviter de récompenser deux fois le même vote.",
    extra,
  ],
  `POST /votes-webhook
Authorization: Bearer <VOTRE_CLE_API>
{ "server": "mon-serveur", "voter": "pseudo_ou_id", "votedAt": "2026-01-01T12:00:00Z" }`
);

export const SERVER_GUIDES = [
  {
    slug: "creer-serveur-minecraft",
    title: "Créer un serveur Minecraft (Java, Bedrock & Crossplay)",
    short: "Minecraft",
    summary: "Installez un serveur Paper, ouvrez-le aux joueurs Bedrock avec GeyserMC et lancez une communauté stable.",
    difficulty: "Débutant",
    duration: "45 min",
    tags: ["minecraft", "java", "bedrock", "crossplay"],
    accent: "#22c55e",
    sections: [
      section("Un serveur Minecraft vous permet de fixer vos règles : survie, skyblock, mini-jeux, RP ou serveur privé entre amis.", [
        "Choisissez un format clair (survie vanilla, semi-RP, factions, créatif) : un serveur qui sait ce qu'il propose retient mieux ses joueurs.",
        "Décidez si vous visez Java seul ou Java + Bedrock : le crossplay double votre public (PC, consoles, mobile).",
        "Définissez votre objectif : cercle d'amis (5-10 joueurs) ou communauté publique (50+ joueurs), cela change tout l'hébergement.",
      ]),
      section("Les besoins dépendent du nombre de joueurs et des plugins.", [
        "RAM : 2 Go pour 5 joueurs, 4 Go pour 20 joueurs, 8 Go et plus pour 50 joueurs ou un modpack.",
        "CPU : Minecraft dépend surtout de la puissance d'un seul cœur ; privilégiez la fréquence (3,5 GHz et plus).",
        "Stockage : SSD/NVMe, 10 à 20 Go pour démarrer, davantage pour les sauvegardes et les cartes pré-générées.",
        "Hébergement : local (gratuit mais IP exposée, dépend de votre box), VPS (bon compromis) ou hébergeur Minecraft dédié (le plus simple).",
        "Ports à ouvrir : TCP 25565 (Java) et UDP 19132 (Bedrock via Geyser).",
        "Java : version 21 pour les versions récentes de Minecraft.",
      ]),
      section("Exemple avec Paper, le serveur le plus répandu et le plus performant.", [
        "Créez un dossier dédié, par exemple /opt/minecraft ou C:\\minecraft.",
        "Téléchargez paper.jar depuis papermc.io pour la version voulue et placez-le dans ce dossier.",
        "Lancez une première fois le serveur : il génère eula.txt, server.properties et les dossiers world, plugins, logs.",
        "Ouvrez eula.txt et passez eula=false à eula=true après avoir lu le contrat.",
        "Dans server.properties, réglez motd, max-players, difficulty, gamemode et online-mode=true.",
      ], `java -Xms2G -Xmx2G -jar paper.jar --nogui`),
      section("Un script de démarrage évite de retaper la commande et permet le redémarrage automatique.", [
        "Créez start.sh (Linux) ou start.bat (Windows) contenant la commande Java avec la RAM voulue.",
        "Sous Linux, lancez le serveur dans un screen ou un service systemd pour qu'il survive à la fermeture du terminal.",
        "Testez d'abord en local avec localhost:25565, puis avec votre IP publique depuis un autre réseau (4G).",
        "Si l'accès échoue : vérifiez le pare-feu, la redirection de port sur la box et que le serveur affiche « Done ».",
        "Associez un nom de domaine (enregistrement A, et SRV si le port n'est pas 25565) pour une adresse mémorisable.",
      ], `#!/bin/bash
while true; do
  java -Xms4G -Xmx4G -jar paper.jar --nogui
  echo "Redémarrage dans 5 secondes..."; sleep 5
done`),
      section("Le crossplay permet aux joueurs Bedrock (console, mobile, Windows) de rejoindre un serveur Java.", [
        "Installez GeyserMC dans le dossier plugins : il traduit le protocole Bedrock vers Java.",
        "Installez Floodgate en complément : les joueurs Bedrock se connectent sans compte Java, avec un préfixe sur leur pseudo.",
        "Ouvrez le port UDP 19132 et redémarrez ; les joueurs Bedrock utilisent la même adresse avec ce port.",
        "Plugins utiles : EssentialsX (commandes de base), LuckPerms (permissions), WorldEdit/WorldGuard (construction et protection), Vault (économie).",
        "Ajoutez ViaVersion pour accepter plusieurs versions de client Java.",
      ]),
      section("Un serveur public est attaqué : prévoyez la sécurité dès le premier jour.", [
        "Gardez online-mode=true pour vérifier les comptes ; ne le désactivez que derrière un proxy correctement configuré (Velocity + forwarding secret).",
        "Activez la whitelist pour un serveur privé : /whitelist on puis /whitelist add pseudo.",
        "Gérez les permissions avec LuckPerms : aucun grade « op » pour les joueurs, droits minimaux par rôle.",
        "Pare-feu : n'ouvrez que les ports nécessaires (25565, 19132) et jamais RCON (25575) ou SSH au monde entier.",
        "Anti-DDoS : choisissez un hébergeur avec protection, ou un tunnel/proxy qui masque l'IP réelle.",
        "Anti-cheat : Grim ou Vulcan détectent fly, killaura et x-ray ; ajoutez CoreProtect pour annuler les dégâts.",
        "Sauvegardes : planifiez une sauvegarde quotidienne du dossier world et des configurations, stockée hors du serveur.",
        "Failles courantes : mises à jour oubliées, plugins piratés, mots de passe SSH faibles.",
      ]),
      section("Quelques réglages suffisent à garder 20 TPS constants.", [
        "Utilisez Paper et réglez view-distance à 8-10 et simulation-distance à 6 dans server.properties.",
        "Allouez la RAM avec Xms = Xmx et ne dépassez pas 70 % de la mémoire de la machine.",
        "Pré-générez la carte avec le plugin Chunky pour éviter les lags d'exploration.",
        "Limitez les entités : réduisez les spawn-limits dans bukkit.yml et supprimez les fermes à mobs excessives.",
        "Surveillez avec /spark profiler ou /tps pour repérer le plugin ou la zone qui ralentit.",
      ]),
      voteSection("serveur Minecraft", "Plugin pratique : Votifier / NuVotifier reçoit les votes, puis un plugin comme VotingPlugin exécute des commandes de récompense (clés, argent, grade temporaire)."),
      section("Les erreurs de débutant les plus fréquentes :", [
        "« Connection refused » : le serveur n'est pas démarré, le port n'est pas ouvert ou l'IP est incorrecte.",
        "« Failed to bind to port » : un autre processus utilise déjà 25565 ; arrêtez-le ou changez server-port.",
        "« Outdated client/server » : installez ViaVersion ou demandez aux joueurs la bonne version.",
        "Le serveur lag : baissez view-distance, passez sur Paper et vérifiez la RAM avec spark.",
        "Les joueurs Bedrock ne se connectent pas : vérifiez Geyser, Floodgate et le port UDP 19132.",
      ]),
    ],
  },
  {
    slug: "creer-serveur-fivem",
    title: "Créer un serveur FiveM (GTA V RP)",
    short: "FiveM",
    summary: "Déployez un serveur FiveM avec txAdmin, ESX ou QBCore, et préparez-le pour une communauté RP.",
    difficulty: "Intermédiaire",
    duration: "2 h",
    tags: ["fivem", "gta v", "roleplay", "rp"],
    accent: "#f97316",
    sections: [
      section("FiveM permet de créer son propre monde GTA V multijoueur, avec ses règles, son économie et son histoire.", [
        "Choisissez le type de serveur : RP sérieux, semi-RP, freeroam, course ou serveur de gangs.",
        "Définissez le framework : ESX (très répandu, nombreuses ressources) ou QBCore (moderne et bien documenté).",
        "Fixez un objectif réaliste : une équipe de 3 à 5 personnes (admin, dev, modérateurs) est nécessaire pour un RP durable.",
      ]),
      section("FiveM est exigeant en ressources, surtout avec beaucoup de scripts.", [
        "Serveur : 4 vCPU, 8 Go de RAM minimum pour 32 slots ; 16 Go et plus pour 64+ slots.",
        "Stockage : SSD/NVMe, 30 Go ou plus selon vos ressources et vos MLO.",
        "Base de données : MariaDB/MySQL, indispensable pour les personnages, véhicules et inventaires.",
        "Licence : une clé serveur gratuite sur keymaster.fivem.net est obligatoire.",
        "Ports : TCP et UDP 30120 (jeu), et le port de txAdmin (40120) à protéger par un accès restreint.",
        "Hébergement : VPS ou serveur dédié Linux/Windows ; évitez l'hébergement local pour un serveur public.",
      ]),
      section("txAdmin simplifie l'installation et l'administration.", [
        "Téléchargez les artefacts serveur FiveM (Windows ou Linux) depuis le site officiel et extrayez-les dans /fxserver.",
        "Lancez FXServer : txAdmin s'ouvre et affiche un PIN à saisir dans l'interface web.",
        "Choisissez une recette : Popular Recipes puis ESX ou QBCore pour installer la base automatiquement.",
        "Renseignez la clé de licence, la base de données et le nom du serveur dans l'assistant.",
        "Structure : server-data/resources contient les ressources, et server.cfg liste celles à charger avec ensure.",
      ], `endpoint_add_tcp "0.0.0.0:30120"
endpoint_add_udp "0.0.0.0:30120"
sv_hostname "Mon Serveur RP"
sv_maxclients 48
set mysql_connection_string "mysql://user:mdp@localhost/fivem"
ensure mapmanager
ensure chat
ensure es_extended`),
      section("Une fois configuré, démarrez depuis txAdmin et vérifiez l'accès.", [
        "Cliquez sur Start Server dans txAdmin et surveillez la console : aucune ressource ne doit afficher d'erreur rouge.",
        "Connectez-vous avec la commande F8 puis connect IP:30120 depuis un autre PC.",
        "Vérifiez que le serveur apparaît dans la liste en ajoutant sv_listingIPOverride si nécessaire.",
        "Planifiez des redémarrages automatiques (toutes les 6 à 12 heures) dans les paramètres de txAdmin.",
        "Ajoutez un cfx.re/join pour obtenir un lien de connexion court à partager.",
      ]),
      section("Les ressources font la richesse d'un serveur RP.", [
        "Ressources essentielles : inventaire, emplois, téléphone, garage, concessionnaire, banque et système de permis.",
        "Sources fiables : dépôts GitHub officiels ESX/QBCore, boutiques reconnues (Tebex) ; évitez les scripts « leakés » souvent infectés par des portes dérobées.",
        "Ajoutez les ressources une par une : ensure nom_ressource, redémarrez et testez avant la suivante.",
        "MLO et véhicules : optimisez les modèles (poids, textures) pour limiter les crashs clients.",
        "Voix : pma-voice pour la voix de proximité et la radio, avec le port UDP ouvert.",
      ]),
      section("Les serveurs FiveM sont des cibles fréquentes pour les cheaters.", [
        "Validez chaque événement côté serveur : ne faites jamais confiance au client pour donner de l'argent ou des objets.",
        "Utilisez une solution anti-cheat (Fiveguard, EasyAdmin avec bans, ou équivalent) et activez les reports.",
        "Protégez txAdmin : mot de passe fort, accès par ip restreinte ou via VPN, jamais exposé publiquement.",
        "Pare-feu : n'ouvrez que 30120 ; la base MySQL doit rester sur localhost.",
        "Anti-DDoS : hébergeur avec protection OVH/Game Shield ou proxy dédié ; ne publiez pas l'IP brute.",
        "Sauvegardes : dump de la base SQL quotidien et copie du dossier resources.",
        "Failles courantes : ressources piratées avec backdoor, events non protégés, comptes admin partagés.",
      ]),
      section("Un serveur fluide se joue d'abord sur les ressources.", [
        "Surveillez la commande resmon (F8) : chaque ressource devrait rester sous 0,05 ms au repos.",
        "Supprimez les ressources inutiles ou dupliquées et évitez les boucles Wait(0) dans vos scripts.",
        "Activez OneSync et ajustez les limites de population et d'entités.",
        "Compressez les textures de véhicules et MLO, limitez le streaming à ce qui est nécessaire.",
        "Planifiez le nettoyage de la base : suppression des anciens personnages et véhicules abandonnés.",
      ]),
      voteSection("serveur FiveM", "Côté FiveM, écrivez une ressource Lua qui expose une route HTTP (SetHttpHandler), vérifie le jeton, puis donne l'argent ou l'objet au joueur via le framework."),
      section("Les erreurs de débutant les plus fréquentes :", [
        "« Could not find server key » : ajoutez sv_licenseKey dans server.cfg avec votre clé keymaster.",
        "Les joueurs ne peuvent pas se connecter : vérifiez le port 30120 en TCP et UDP côté pare-feu et hébergeur.",
        "Une ressource ne démarre pas : consultez la console, la dépendance est souvent manquante ou mal ordonnée dans server.cfg.",
        "Erreur SQL : vérifiez la chaîne mysql_connection_string et que MariaDB est lancé.",
        "Crash client au chargement : une ressource de streaming trop lourde ; retirez les derniers ajouts et testez.",
      ]),
    ],
  },
  {
    slug: "creer-serveur-discord",
    title: "Créer et sécuriser un serveur Discord communautaire / RP",
    short: "Discord",
    summary: "Structurez salons, rôles et modération pour un serveur Discord accueillant, sécurisé et prêt à grandir.",
    difficulty: "Débutant",
    duration: "1 h",
    tags: ["discord", "communauté", "rp", "modération"],
    accent: "#6366f1",
    sections: [
      section("Un serveur Discord est le cœur de votre communauté : il centralise annonces, échanges et événements.", [
        "Définissez la promesse du serveur en une phrase : jeu ciblé, ambiance, public (compétitif, détente, RP).",
        "Choisissez entre serveur communautaire public (croissance) ou privé (cercle fermé) ; le RP demande souvent des salons d'immersion séparés.",
        "Fixez des objectifs mesurables : membres actifs par semaine, événements par mois, nombre de modérateurs.",
      ]),
      section("Discord ne demande pas d'hébergement, mais une bonne préparation.", [
        "Compte : activez l'authentification à deux facteurs sur tous les comptes administrateurs.",
        "Équipe : au moins deux modérateurs de confiance dès le départ pour couvrir les fuseaux horaires.",
        "Bots : si vous hébergez vos propres bots, prévoyez un petit VPS (1 Go de RAM suffit) avec Node.js ou Python.",
        "Visuels : logo carré 512x512, bannière paysage et icônes de rôles cohérentes avec votre identité.",
        "Activez le mode Communauté dans Paramètres pour débloquer règles, annonces et découverte.",
      ]),
      section("Une structure claire évite la dispersion.", [
        "Catégories de base : Accueil (règles, annonces, présentation), Discussion, Jeux, Vocaux, Staff.",
        "Créez les rôles : Fondateur, Admin, Modérateur, Membre vérifié, rôles de jeux ou de métiers pour un RP.",
        "Salons de règles et d'annonces en lecture seule : retirez la permission « Envoyer des messages » pour @everyone.",
        "Ajoutez un message de bienvenue court avec les trois actions à faire (lire les règles, se présenter, choisir ses rôles).",
        "Pour un RP : créez des salons de candidature, de fiches personnage et de lore, avec un processus de validation par le staff.",
      ]),
      section("Avant l'ouverture publique, testez le parcours d'un nouveau membre.", [
        "Rejoignez avec un compte de test et vérifiez qu'un nouveau voit uniquement l'accueil jusqu'à la vérification.",
        "Générez un lien d'invitation permanent (sans expiration ni limite) pour votre fiche Best Serveur.",
        "Annoncez l'ouverture à vos amis et communautés proches, puis publiez sur Best Serveur pour attirer de nouveaux membres.",
        "Planifiez un premier événement dans la semaine : soirée, tournoi ou session découverte.",
      ]),
      section("Les bots automatisent l'accueil, la modération et l'animation.", [
        "Modération : Carl-bot, Dyno ou MEE6 pour auto-modération, logs et rôles par réaction.",
        "Tickets : Ticket Tool ou équivalent pour candidatures, support et signalements.",
        "Musique et jeux : choisissez un bot fiable et limitez ses salons.",
        "Ne donnez jamais la permission Administrateur à un bot que vous ne connaissez pas ; accordez uniquement les droits nécessaires.",
        "Intégrations : webhooks de salon pour relier votre serveur de jeu aux annonces Discord.",
      ]),
      section("Un Discord sécurisé protège vos membres et votre réputation.", [
        "Niveau de vérification : au moins « E-mail vérifié », idéalement « Téléphone vérifié » si vous subissez des raids.",
        "Filtre de contenu explicite activé pour tous les membres ; auto-modération pour liens suspects et spams.",
        "Permissions : retirez Mentionner @everyone, Gérer les webhooks et Gérer le serveur aux rôles non staff.",
        "Hiérarchie des rôles : placez les rôles de bots sous ceux des modérateurs pour éviter les détournements.",
        "Anti-raid : activez les alertes de raid, bloquez temporairement les invitations en cas d'attaque.",
        "Whitelist RP : validez les candidatures avant d'ouvrir l'accès aux salons vocaux.",
        "Sauvegardes : exportez régulièrement la structure avec un bot de backup (rôles, salons, permissions).",
        "Failles courantes : liens de phishing (faux Nitro), webhooks fuités, bot compromis.",
      ]),
      section("La performance d'un Discord, c'est la clarté et la vie des salons.", [
        "Limitez le nombre de salons : un salon vide décourage, mieux vaut en fermer certains.",
        "Utilisez des fils (threads) et salons forum pour organiser les discussions longues.",
        "Archivez les anciens salons d'événements et nettoyez les rôles inutilisés.",
        "Mesurez avec les statistiques d'insights : rétention, messages par jour, heures de pointe.",
        "Épinglez l'essentiel et limitez les notifications pour éviter la fatigue des membres.",
      ]),
      voteSection("serveur Discord", "Pour Discord, un bot qui reçoit le webhook peut attribuer un rôle « Votant » temporaire, donner de la monnaie d'économie ou poster un remerciement dans un salon dédié."),
      section("Les erreurs de débutant les plus fréquentes :", [
        "Trop de salons dès le départ : commencez avec 8 à 10 salons et ajoutez selon l'usage.",
        "Le bot ne peut pas donner un rôle : son rôle doit être placé au-dessus du rôle qu'il attribue.",
        "Raid de comptes : montez le niveau de vérification et activez les alertes de raid.",
        "Personne ne répond aux nouveaux : créez un rôle « Accueil » et notifiez-le sur les présentations.",
        "Lien d'invitation expiré : recréez un lien permanent et mettez à jour votre fiche Best Serveur.",
      ]),
    ],
  },
  {
    slug: "creer-serveur-farming-simulator-25",
    title: "Créer un serveur dédié Farming Simulator 25",
    short: "Farming Simulator 25",
    summary: "Installez le serveur dédié officiel, gérez les mods et ouvrez une ferme partagée à votre communauté.",
    difficulty: "Intermédiaire",
    duration: "1 h 30",
    tags: ["farming simulator", "fs25", "agriculture", "mods"],
    accent: "#84cc16",
    sections: [
      section("Un serveur dédié permet de jouer en permanence, même quand l'hôte est hors ligne.", [
        "Idéal pour une ferme commune de 4 à 16 joueurs avec des cultures et des saisons qui avancent sans interruption.",
        "Choisissez le style : coopératif détendu, réaliste (difficultés élevées) ou serveur à mods RP agricole.",
        "Décidez tôt de la liste de mods : tous les joueurs devront la télécharger.",
      ]),
      section("Le serveur dédié est gourmand en CPU et en mémoire, surtout avec des mods.", [
        "RAM : 8 Go minimum pour 6 joueurs, 16 Go pour 10 joueurs ou plus.",
        "CPU : 4 cœurs rapides ; le jeu est sensible à la fréquence.",
        "Stockage : SSD, 20 Go pour le jeu et les mods, plus de la place pour les sauvegardes.",
        "Système : Windows est le plus simple ; Linux est possible avec Wine mais plus technique.",
        "Ports : TCP/UDP 10823 (jeu) et le port du panneau web (souvent 7999) à protéger.",
        "Licence : le serveur dédié nécessite votre clé de jeu FS25 officielle.",
      ]),
      section("Le serveur dédié est fourni avec le jeu.", [
        "Installez FS25 via Steam ou le site GIANTS, puis repérez le fichier dedicatedServer.exe dans le dossier du jeu.",
        "Lancez dedicatedServer.exe, saisissez votre clé de produit et ouvrez l'interface web d'administration.",
        "Renseignez le nom du serveur, le mot de passe, le nombre de joueurs et la carte souhaitée.",
        "Dossier des mods : placez les .zip dans Documents\\My Games\\FarmingSimulator2025\\mods.",
        "Créez une nouvelle sauvegarde depuis l'interface web ou chargez une partie existante sur un emplacement de sauvegarde.",
      ], `ServerPort: 10823
WebPort: 7999
MaxPlayers: 8
Password: ********`),
      section("Une fois la partie configurée, démarrez et vérifiez la connexion.", [
        "Cliquez sur Démarrer dans l'interface web et attendez que le statut passe à « En ligne ».",
        "Depuis un autre PC : Multijoueur > Rechercher des parties, ou saisissez directement IP:10823.",
        "Si le serveur n'apparaît pas : redirigez les ports sur la box et autorisez-les dans le pare-feu Windows.",
        "Créez un raccourci de démarrage automatique avec le serveur lancé au démarrage de la machine.",
        "Communiquez l'adresse, le mot de passe et la liste de mods sur votre Discord.",
      ]),
      section("Les mods ajoutent véhicules, cartes et mécaniques, mais demandent de la rigueur.", [
        "Téléchargez uniquement depuis le ModHub officiel pour éviter les fichiers corrompus ou malveillants.",
        "Tous les clients doivent posséder les mêmes mods et versions : fournissez un pack ou une liste claire.",
        "Testez les mods en solo avant de les ajouter ; un mod défectueux bloque tous les joueurs.",
        "Cartes populaires : ajoutez-les dès la création de la sauvegarde, car on ne peut pas changer de carte ensuite.",
        "Crossplay : FS25 est cross-plateforme entre PC et Mac pour les mods du ModHub ; les consoles n'acceptent pas tous les mods.",
      ]),
      section("Un serveur agricole sans protection est vulnérable aux griefers.", [
        "Mot de passe obligatoire pour un serveur privé ; changez-le si un joueur indésirable le partage.",
        "Pare-feu : ouvrez uniquement le port de jeu ; limitez l'interface web à votre IP ou à un VPN.",
        "Administration : utilisez un mot de passe admin différent du mot de passe joueur.",
        "Sauvegardes : copiez le dossier savegame chaque jour (et avant chaque ajout de mod).",
        "Anti-DDoS : hébergeur avec protection ou masquage de l'IP derrière un VPN/tunnel.",
        "Failles courantes : mods non vérifiés, interface web exposée, absence de sauvegarde avant mise à jour.",
      ]),
      section("Une ferme partagée peut vite ralentir.", [
        "Limitez le nombre de joueurs à ce que le CPU supporte réellement.",
        "Réduisez le nombre de mods lourds (cartes, gros pack de véhicules).",
        "Videz régulièrement les troupeaux, balles et objets au sol qui accumulent des entités.",
        "Redémarrez le serveur quotidiennement pendant les heures creuses.",
        "Surveillez la mémoire et le temps de sauvegarde automatique, et espacez ces dernières si besoin.",
      ]),
      voteSection("serveur Farming Simulator 25", "Sur FS25, il n'y a pas d'API native de récompense : passez par un bot Discord qui reçoit le webhook et attribue un rôle, ou récompensez manuellement via un classement de votants hebdomadaire."),
      section("Les erreurs de débutant les plus fréquentes :", [
        "Les joueurs ne trouvent pas le serveur : ouvrez le port 10823 et partagez l'IP directe.",
        "Mod manquant ou incompatible : vérifiez que tous ont la même version du mod.",
        "La partie se fige au chargement : retirez le dernier mod ajouté et vérifiez les logs.",
        "Mot de passe incorrect : il est sensible à la casse, copiez-le depuis l'interface.",
        "Perte de sauvegarde : activez des sauvegardes automatiques externes avant chaque mise à jour.",
      ]),
    ],
  },
  {
    slug: "creer-serveur-rust-ark-survie",
    title: "Créer un serveur Rust / ARK / Survie",
    short: "Rust · ARK · Survie",
    summary: "Déployez un serveur de survie (Rust, ARK) avec SteamCMD, ouvrez les bons ports et protégez-le contre les cheaters.",
    difficulty: "Avancé",
    duration: "2 h 30",
    tags: ["rust", "ark", "survie", "steamcmd"],
    accent: "#ef4444",
    sections: [
      section("Les jeux de survie reposent sur une communauté engagée, des règles claires et des wipes réguliers.", [
        "Choisissez le format : vanilla, modded, PvE détendu ou PvP hardcore ; chaque format attire un public différent.",
        "Définissez le rythme des wipes (Rust : hebdomadaire ou mensuel) et annoncez-le à l'avance.",
        "Pour ARK : décidez des taux (XP, apprivoisement, récolte) et si vous utilisez des clusters.",
      ]),
      section("Ces jeux sont parmi les plus gourmands.", [
        "Rust : 8 Go de RAM minimum, 16 Go et plus pour 100+ joueurs ; CPU rapide, 4 cœurs ou plus.",
        "ARK : 8 à 16 Go de RAM par carte, stockage de 60 Go ou plus, CPU performant.",
        "Stockage : NVMe recommandé pour les temps de chargement et les sauvegardes.",
        "Hébergement : VPS costaud ou serveur dédié, avec une bonne protection anti-DDoS.",
        "Ports Rust : UDP 28015 (jeu), TCP 28016 (RCON), UDP 28017 (requêtes) ; ARK : UDP 7777, 7778 et 27015.",
        "Système : Linux (Debian/Ubuntu) ou Windows ; SteamCMD fonctionne sur les deux.",
      ]),
      section("SteamCMD télécharge et met à jour le serveur.", [
        "Installez SteamCMD dans un dossier dédié (par exemple /home/steam/steamcmd).",
        "Connectez-vous en anonymous et installez le serveur : Rust app_id 258550, ARK Survival Evolved app_id 376030.",
        "Créez un dossier de configuration et de données (cfg, saves) séparé de l'installation pour faciliter les mises à jour.",
        "Configurez le nom, la description, la taille de carte et le seed (Rust) ou le fichier GameUserSettings.ini (ARK).",
        "Créez un utilisateur système non-root pour lancer le serveur.",
      ], `./steamcmd.sh +force_install_dir /home/steam/rust +login anonymous +app_update 258550 validate +quit`),
      section("Lancez le serveur avec un script et vérifiez-le depuis l'extérieur.", [
        "Rust : lancez RustDedicated avec ses paramètres, puis vérifiez la liste des serveurs dans le jeu.",
        "ARK : lancez ShooterGameServer avec la carte voulue et ses ports.",
        "Utilisez systemd ou screen pour garder le serveur actif, avec redémarrage automatique après un crash.",
        "Testez la connexion depuis un autre réseau avec client.connect IP:28015 (Rust) ou via l'adresse Steam (ARK).",
        "Planifiez les mises à jour et le wipe avec un script (cron) pour automatiser SteamCMD.",
      ], `./RustDedicated -batchmode +server.port 28015 +server.hostname "Mon Rust" +server.maxplayers 100 +server.worldsize 3500 +server.seed 12345 +rcon.port 28016 +rcon.password "CHANGER_MOI"`),
      section("Les mods font la différence sur un serveur de survie.", [
        "Rust : installez Oxide/uMod ou Carbon pour charger des plugins (kits, téléportation, clans, boutique).",
        "ARK : utilisez les mods Steam Workshop via la ligne ActiveMods et ajoutez des cartes personnalisées si besoin.",
        "Gardez la liste de mods courte et mettez-les à jour avec le serveur pour éviter les décalages de version.",
        "Plugins utiles : gestion des permissions, anti-grief, informations en jeu et statistiques de joueurs.",
        "Pas de crossplay entre PC et consoles sur la version moddée ; précisez la plateforme dans votre fiche Best Serveur.",
      ]),
      section("Les serveurs de survie sont une cible privilégiée des cheaters et des attaques DDoS.", [
        "Activez l'anti-cheat natif (EasyAntiCheat, BattlEye) et gardez-le à jour.",
        "RCON : mot de passe long et unique, port ouvert uniquement à vos IP ou à localhost.",
        "Pare-feu : n'ouvrez que les ports de jeu en UDP et fermez tout le reste, SSH inclus (clé uniquement).",
        "Permissions : limitez les commandes admin à un petit groupe et enregistrez toutes les actions dans les logs.",
        "Anti-DDoS : hébergeur protégé, ou protection réseau dédiée ; ne divulguez pas l'IP réelle.",
        "Sauvegardes : copie automatique quotidienne de save/ et des configurations, avec rétention de 7 jours.",
        "Failles courantes : RCON exposé, plugins non vérifiés, serveurs jamais mis à jour.",
      ]),
      section("Un serveur de survie doit rester fluide malgré la carte et les bases.", [
        "Rust : réduisez la taille de carte (3000-3500) et activez les wipes réguliers pour limiter les entités.",
        "ARK : limitez le nombre de dinos sauvages et nettoyez régulièrement les structures abandonnées.",
        "Planifiez un redémarrage quotidien pour libérer la mémoire.",
        "Surveillez le CPU et la RAM, et ajustez les tickrates ou les limites d'entités en cas de lag.",
        "Utilisez un SSD NVMe et évitez les sauvegardes trop fréquentes qui provoquent des à-coups.",
      ]),
      voteSection("serveur de survie", "Rust : un plugin Oxide/Carbon peut recevoir le webhook et donner un kit ou des points de boutique. ARK : utilisez un script RCON pour envoyer des items ou des points à l'ID Steam du votant."),
      section("Les erreurs de débutant les plus fréquentes :", [
        "Le serveur n'apparaît pas dans la liste : ouvrez les ports UDP et patientez quelques minutes après le démarrage.",
        "Mise à jour du jeu : les joueurs ne peuvent plus rejoindre ; relancez SteamCMD avec validate et redémarrez.",
        "Crash au démarrage : manque de RAM ou plugin incompatible ; testez sans mods.",
        "RCON refusé : mauvais mot de passe ou port fermé dans le pare-feu.",
        "Lag après quelques jours : planifiez des wipes et des redémarrages réguliers.",
      ]),
    ],
  },
];

export const findGuide = (slug) => SERVER_GUIDES.find((guide) => guide.slug === slug) || null;
