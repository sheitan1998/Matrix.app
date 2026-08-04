import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Youtube, Users, FileText, Mail } from "lucide-react";

const SECTIONS = [
  {
    id: "introduction",
    icon: Shield,
    title: "1. Introduction",
    content: [
      "MATRIX est une plateforme communautaire de streaming, de divertissement et de services interactifs. La présente Politique de Confidentialité décrit la manière dont nous collectons, utilisons et protégeons vos données personnelles lorsque vous utilisez l'application.",
      "Nous nous engageons à protéger votre vie privée et à traiter vos données conformément aux lois en vigueur, notamment le Règlement Général sur la Protection des Données (RGPD).",
      "Les fonctionnalités de base de MATRIX — navigation, communauté, casino virtuel, outils, progression — sont accessibles sans traitement de données personnelles sensibles.",
    ],
  },
  {
    id: "youtube-api",
    icon: Youtube,
    title: "2. Services API YouTube",
    content: [
      "L'intégration YouTube de MATRIX utilise la YouTube Data API v3 fournie par Google LLC. Cette intégration nous permet d'afficher des vidéos, chaînes et contenus YouTube au sein de l'application.",
      "Aucune donnée privée issue de votre compte YouTube n'est revendue ni stockée sans votre accord explicite. Les données récupérées via l'API YouTube sont utilisées uniquement pour l'affichage et la navigation au sein de MATRIX.",
      "L'accès aux fonctionnalités YouTube connectées (abonnements, historique, recommandations personnalisées) nécessite l'acceptation expresse des conditions d'utilisation de YouTube et de Google, ainsi que votre consentement pour le traitement des données associées.",
    ],
  },
  {
    id: "minors",
    icon: Users,
    title: "3. Protection des mineurs & Âge",
    content: [
      "MATRIX est accessible à tous les utilisateurs pour les fonctionnalités de base de la plateforme, sans restriction d'âge.",
      "Cependant, l'accès aux fonctions nécessitant une connexion Google / YouTube ou un traitement de données personnelles est réservé aux utilisateurs ayant l'âge légal requis dans leur pays de résidence, ou disposant de l'accord parental d'un titulaire de l'autorité parentale.",
      "Si un utilisateur n'accepte pas les conditions ou n'a pas l'âge requis, il conserve un accès complet au reste de l'application (communauté, casino, outils, progression, tuto-gaming, etc.), à l'exclusion des fonctionnalités YouTube connectées.",
    ],
  },
  {
    id: "youtube-terms",
    icon: FileText,
    title: "4. Conditions YouTube & Google",
    content: [
      "L'utilisation des fonctionnalités YouTube intégrées dans MATRIX est soumise aux conditions d'utilisation et aux règles de confidentialité de YouTube et de Google. Nous vous invitons à consulter ces documents :",
    ],
    links: [
      { label: "Conditions d'utilisation de YouTube", url: "https://www.youtube.com/t/terms" },
      { label: "Règles de confidentialité de Google", url: "https://policies.google.com/privacy" },
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "5. Contact",
    content: [
      "Pour toute demande, question ou préoccupation relative à vos données personnelles ou à la présente politique, vous pouvez nous contacter via le bloc de contact ci-dessous.",
      "Nous nous engageons à répondre à vos demandes dans les meilleurs délais et à respecter vos droits d'accès, de rectification et de suppression de vos données.",
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
              <p className="text-sm font-mono text-white/40">MATRIX</p>
            </div>
          </div>
          <p className="text-xs text-white/40 font-mono">
            Dernière mise à jour : 4 août 2026
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
                    style={{ background: "rgba(168,85,247,0.15)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#a855f7" }} />
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
                          <Youtube className="w-4 h-4 shrink-0" />
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
            Pour toute question relative à la protection de vos données, vous pouvez nous écrire à l'adresse suivante. Nous traiterons votre demande dans les meilleurs délais.
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

        {/* Footer note */}
        <p className="text-center text-xs text-white/30 mt-10 font-mono">
          MATRIX © 2026 — Tous droits réservés
        </p>
      </div>
    </div>
  );
}