import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-10 py-8 max-w-3xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8 tap-sm">
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </Link>

      <h1 className="text-3xl md:text-4xl font-black mb-6">À propos de MATRIX</h1>

      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          MATRIX est une plateforme tout-en-un qui combine streaming vidéo, communauté, casino et outils créatifs.
          Notre mission est de réunir tous vos univers numériques en un seul espace, qu'il s'agisse de regarder des
          vidéos, de participer à des lives, de discuter avec des amis dans des serveurs communautaires, ou de
          vous divertir avec nos jeux interactifs.
        </p>
        <p>
          Conçue pour les créateurs de contenu, les joueurs, les passionnés de streaming et les communautés en
          ligne, MATRIX offre une expérience immersive et personnalisée. Vous y trouverez un module de streaming
          YouTube, des chaînes Twitch, un réseau social inspiré de Discord appelé Nexus, des jeux de casino dans
          Nexus Game, un studio de montage vidéo, des tutoriels gaming, des sondages, et bien plus encore.
        </p>
        <p>
          Notre plateforme est développée par une équipe passionnée qui croit en l'accessibilité, la créativité et
          le partage. Nous travaillons sans cesse pour améliorer l'expérience utilisateur, ajouter de nouvelles
          fonctionnalités et garantir un environnement sûr et inclusif pour tous nos membres.
        </p>
        <p>
          Que vous soyez un créateur cherchant à étendre votre audience, un joueur à la recherche d'une communauté,
          ou simplement curieux de découvrir de nouveaux contenus, MATRIX vous accueille. Rejoignez-nous dès
          aujourd'hui et faites partie de l'aventure.
        </p>
      </div>
    </div>
  );
}