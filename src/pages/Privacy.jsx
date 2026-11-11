import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Users, FileText, Mail, Database, Cookie, Share2, CreditCard, Server, Copyright } from "lucide-react";

// Official YouTube icon
const YT_ICON_RED = "/media/tuto-gaming/7b7c491be_yt_icon_red_digital.png";

const SECTIONS = [
  {
    id: "introduction",
    icon: Shield,
    title: "1. Introduction",
    content: [
      "MATRIX est une plateforme communautaire de streaming, de divertissement et de services interactifs. La présente Politique de Confidentialité décrit la manière dont nous collectons, utilisons et protégeons vos données personnelles lorsque vous utilisez l'application.",
      "Nous nous engageons à protéger votre vie privée et à traiter vos données conformément aux lois en vigueur, notamment le Règlement Général sur la Protection des Données (RGPD).",
      "Les fonctionnalités de base de MATRIX — navigation, communauté, Nexus Game, outils, progression — sont accessibles sans traitement de données personnelles sensibles.",
    ],
  },
  {
    id: "youtube-api",
    icon: null, // custom YT icon
    ytIcon: true,
    title: "2. Services API YouTube — Données collectées et utilisées",
    content: [
      "L'intégration YouTube de MATRIX repose sur les YouTube API Services (YouTube Data API v3 et YouTube Live Streaming API) fournies par Google LLC. Elle permet d'afficher des vidéos, chaînes et contenus YouTube et, lorsque vous connectez volontairement votre chaîne, d'animer et de modérer votre tchat en direct.",
      "1. Collecte des données — Lorsque vous activez la connexion YouTube via l'authentification OAuth de Google, MATRIX accède uniquement aux informations de profil de base de votre chaîne (identifiant, nom de la chaîne, photo de profil) et aux interactions de tchat en direct (lecture des messages, envoi de messages et commandes de modération). Les scopes OAuth demandés sont : https://www.googleapis.com/auth/youtube.readonly (lecture du profil et des données publiques) et https://www.googleapis.com/auth/youtube.force-ssl (lecture et modération du tchat en direct). Aucun autre accès n'est demandé.",
      "2. Utilisation des données — Les jetons d'accès OAuth et les flux de tchat en direct sont exploités exclusivement par le bot MATRIX et les outils de diffusion en direct de la plateforme, pour assurer l'automatisation (messages programmés, minuteurs, annonces de live) et le traitement des commandes. Ils ne sont utilisés pour aucune autre finalité.",
      "3. Sécurité et non-partage — Les données utilisateur et les jetons d'authentification sont stockés de manière hautement sécurisée : les jetons OAuth sont conservés côté serveur dans un espace privé, jamais transmis au navigateur ni exposés publiquement, et supprimés dès la déconnexion de la chaîne. Les données issues des API Google ne sont en aucun cas vendues, partagées avec des tiers, ni utilisées à des fins publicitaires ou marketing.",
      "Données publiques lues via l'API : titres, descriptions, miniatures, statistiques (vues, likes, nombre d'abonnés, nombre de vidéos) et métadonnées des chaînes et vidéos publiques, en lecture seule.",
      "Stockage et durée de conservation : les données d'affichage récupérées via l'API YouTube ne sont pas conservées plus de 30 jours en cache, avec un nettoyage automatique au-delà de cette période. Les jetons OAuth sont conservés tant que la connexion de la chaîne est active et sont définitivement supprimés dès que vous déconnectez la chaîne.",
      "Vous pouvez révoquer à tout moment l'accès accordé à MATRIX depuis votre compte Google (myaccount.google.com/permissions). La révocation désactive immédiatement le bot sur la chaîne concernée.",
      "Aucune donnée privée issue de votre compte YouTube (messages privés, historique de navigation, informations de paiement) n'est accessible, collectée ni stockée par MATRIX.",
    ],
  },
  {
    id: "device-storage",
    icon: Cookie,
    title: "3. Données d'appareil, Cookies et Stockage local",
    content: [
      "MATRIX utilise le stockage local du navigateur (localStorage) et des cookies de session pour maintenir votre connexion, mémoriser vos préférences (thème, langue, dernière vidéo vue) et assurer le bon fonctionnement de l'application.",
      "Les jetons d'authentification OAuth YouTube ne sont jamais stockés dans votre navigateur : ils sont conservés exclusivement côté serveur, dans un espace privé accessible uniquement aux fonctions du bot, et limités aux scopes demandés. Seuls les jetons de session MATRIX (connexion à l'application) sont conservés dans le localStorage.",
      "Des cookies techniques strictement nécessaires sont utilisés pour la gestion de session. Aucun cookie de tracking publicitaire tiers n'est déposé par MATRIX.",
      "Vous pouvez effacer ces données à tout moment via les paramètres de votre navigateur ou en vous déconnectant de MATRIX.",
    ],
  },
  {
    id: "minors",
    icon: Users,
    title: "4. Protection des mineurs & Âge",
    content: [
      "MATRIX est accessible à tous les utilisateurs pour les fonctionnalités de base de la plateforme, sans restriction d'âge.",
      "Cependant, l'accès aux fonctions nécessitant une connexion Google / YouTube ou un traitement de données personnelles est réservé aux utilisateurs ayant l'âge légal requis dans leur pays de résidence, ou disposant de l'accord parental d'un titulaire de l'autorité parentale.",
      "Si un utilisateur n'accepte pas les conditions ou n'a pas l'âge requis, il conserve un accès complet au reste de l'application (communauté, Nexus Game, outils, progression, tuto-gaming, etc.), à l'exclusion des fonctionnalités YouTube connectées.",
    ],
  },
  {
    id: "youtube-terms",
    icon: FileText,
    title: "5. Conditions YouTube & Google — Liens obligatoires",
    content: [
      "L'utilisation des fonctionnalités YouTube intégrées dans MATRIX est soumise aux conditions d'utilisation et aux règles de confidentialité de YouTube et de Google. Nous vous invitons à consulter ces documents :",
      "MATRIX adhère à la Google API Services User Data Policy, y compris aux exigences d'utilisation limitée (Limited Use). L'utilisation et le transfert, par MATRIX, des informations reçues des API Google respectent cette politique.",
    ],
    links: [
      { label: "Conditions d'utilisation des Services API YouTube", url: "https://developers.google.com/youtube/terms/api-services-terms-of-service" },
      { label: "Google API Services User Data Policy", url: "https://developers.google.com/terms/api-services-user-data-policy" },
      { label: "Politique de confidentialité de Google", url: "https://www.google.com/policies/privacy" },
      { label: "Conditions d'utilisation de YouTube", url: "https://www.youtube.com/t/terms" },
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "6. Paiements et Transactions",
    content: [
      "Pour la gestion des transactions au sein de MATRIX — notamment l'achat de jetons « TRIX » et les abonnements VIP — l'application fait appel à un prestataire de paiement tiers sécurisé (Stripe).",
      "Vos données bancaires (numéro de carte, code de sécurité) ne transitent à aucun moment par nos serveurs. Elles sont collectées et traitées directement par Stripe, qui assure la conformité aux normes de sécurité PCI-DSS.",
      "MATRIX conserve uniquement les historiques d'achats et les données de transaction nécessaires (montant, date, référence de commande) pour assurer le suivi de vos achats, la gestion des abonnements et le support client.",
    ],
  },
  {
    id: "hosting",
    icon: Server,
    title: "7. Hébergement et Données techniques",
    content: [
      "L'application MATRIX est hébergée sur le domaine matrix-hub.app et ses sous-domaines associés.",
      "À des fins de sécurité, de stabilité et de bon fonctionnement technique, nous collectons des journaux de connexion techniques (notamment l'adresse IP de manière sécurisée et les horodatages de connexion).",
      "Ces données techniques sont utilisées exclusivement pour la détection des fraudes, la prévention des abus, le débogage et l'optimisation des performances de la plateforme. Elles ne sont jamais utilisées à des fins commerciales ni revendues à des tiers.",
    ],
  },
  {
    id: "creators",
    icon: Copyright,
    title: "8. Créateurs de Mods & Maps — Conditions de publication",
    content: [
      "Cette section s'applique à tout utilisateur publiant des mods (Farming Simulator) ou des maps (Fortnite) sur la plateforme MATRIX.",
      "En tant que créateur, vous certifiez être l'auteur légitime du contenu que vous publiez, ou disposer des droits, autorisations ou licences nécessaires pour le partager publiquement sur MATRIX.",
      "Sont strictement interdits : le vol de mods ou de maps, le re-upload de contenus créés par des tiers sans autorisation explicite, et toute fausse déclaration sur le statut de licence d'un contenu (notamment l'usage abusif du statut « libre de droit » pour un contenu soumis à des droits réservés).",
      "Vous êtes seul responsable des contenus que vous publiez. En cas de litige, de réclamation d'un tiers ou de signalement pour violation de droits d'auteur, MATRIX applique une politique de suppression immédiate (« Notice and Takedown ») : le contenu incriminé est retiré sans préavis, et des sanctions peuvent être appliquées à votre compte, allant jusqu'au bannissement définitif et au retrait du badge créateur.",
      "MATRIX se réserve le droit de modérer, retirer ou refuser tout contenu ne respectant pas ces conditions, et de collaborer avec les ayants droit en cas de signalement avéré.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "9. Contact — Droits sur vos données",
    content: [
      "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant vos données personnelles.",
      "Pour toute demande, question ou préoccupation relative à vos données personnelles ou à la présente politique, vous pouvez nous contacter via l'adresse e-mail ci-dessous. Nous traiterons votre demande dans un délai de 30 jours.",
    ],
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ background: "hsl(0 0% 4%)" }}>
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 14% / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 14% / 0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-white/50 hover:text-white transition mb-8 tap-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-bold">Retour au Hub</span>
        </Link>

        {/* Title card */}
        <div
          className="rounded-3xl p-6 sm:p-8 mb-8"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(0,0,0,0.4) 100%)",
            border: "1px solid rgba(168,85,247,0.25)",
            boxShadow: "0 0 40px rgba(168,85,247,0.1)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(135 100% 50%), hsl(155 100% 45%))" }}
            >
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Politique de Confidentialité
              </h1>
              <p className="text-sm font-mono text-white/40">MATRIX — Incluant les mentions légales YouTube API Services</p>
            </div>
          </div>
          <p className="text-xs text-white/40 font-mono">
            Dernière mise à jour : 11 novembre 2026
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                id={section.id}
                className="rounded-2xl p-5 sm:p-6 scroll-mt-6"
                style={{
                  background: "rgba(15,10,25,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: section.ytIcon ? "rgba(255,0,0,0.12)" : "rgba(168,85,247,0.15)" }}
                  >
                    {section.ytIcon
                      ? <img src={YT_ICON_RED} alt="YouTube" style={{ height: 20, width: "auto" }} />
                      : Icon && <Icon className="w-4 h-4" style={{ color: "#a855f7" }} />
                    }
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white">{section.title}</h2>
                </div>

                <div className="space-y-3 pl-1">
                  {section.content.map((para, idx) => (
                    <p key={idx} className="text-sm text-white/70 leading-relaxed">
                      {para}
                    </p>
                  ))}

                  {section.links && (
                    <div className="space-y-2 mt-4">
                      {section.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition hover:scale-[1.02] tap-sm"
                          style={{
                            background: "rgba(255,0,0,0.08)",
                            border: "1px solid rgba(255,0,0,0.2)",
                            color: "#f87171",
                          }}
                        >
                          <img src={YT_ICON_RED} alt="YouTube" style={{ height: 20, width: "auto" }} />
                          <span>{link.label}</span>
                          <span className="ml-auto text-white/30 text-xs">↗</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact block */}
        <div
          className="rounded-2xl p-6 mt-8"
          style={{
            background: "linear-gradient(135deg, rgba(135,100%,50%,0.1) 0%, rgba(0,0,0,0.3) 100%)",
            border: "1px solid rgba(135,100%,50%,0.2)",
          }}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <Mail className="w-5 h-5" style={{ color: "hsl(135 100% 50%)" }} />
            <h3 className="text-base font-bold text-white">Nous contacter</h3>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-4">
            Pour toute question relative à la protection de vos données ou à la conformité YouTube API Services, vous pouvez nous écrire à l'adresse suivante. Nous traiterons votre demande dans un délai maximum de 30 jours.
          </p>
          <a
            href="mailto:privacy@matrix.app"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-black transition hover:scale-105 tap-sm"
            style={{ background: "linear-gradient(135deg, hsl(135 100% 50%), hsl(155 100% 45%))" }}
          >
            <Mail className="w-4 h-4" />
            privacy@matrix.app
          </a>
        </div>

        {/* YouTube compliance footer note */}
        <div
          className="rounded-2xl p-4 mt-4 flex items-start gap-3"
          style={{ background: "rgba(255,0,0,0.05)", border: "1px solid rgba(255,0,0,0.15)" }}
        >
          <img src={YT_ICON_RED} alt="YouTube" style={{ height: 24, width: "auto", marginTop: 2 }} />
          <p className="text-xs text-white/50 leading-relaxed">
            MATRIX utilise les YouTube API Services conformément aux{" "}
            <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">Conditions d'utilisation des Services API YouTube</a>.
            En utilisant les fonctionnalités YouTube de MATRIX, vous acceptez également la{" "}
            <a href="https://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">Politique de confidentialité de Google</a> et les{" "}
            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">Conditions d'utilisation de YouTube</a>.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/30 mt-10 font-mono">
          MATRIX © 2026 — Tous droits réservés
        </p>
      </div>
    </div>
  );
}