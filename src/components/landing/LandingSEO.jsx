import React from "react";
import { motion } from "framer-motion";
import {
  Youtube, Radio, MessageCircle, Dices, Search, GraduationCap,
  Wrench, ShoppingBag, Clapperboard, TrendingUp, Users, Palette,
  Server, Gamepad2, BookOpen, Award, Zap } from "lucide-react";

const FEATURES = [
{
  icon: Youtube,
  title: "Espace multimédia streaming",
  desc: "Visionnez vos vidéos YouTube préférées et suivez les streams Twitch en direct, le tout réunis dans un seul espace multimédia intégré. Créez votre chaîne, partagez vos shorts, montez vos vidéos avec l'éditeur intégré et interagissez avec votre audience en temps réel.",
  points: [
  "Streaming YouTube et Twitch intégrés sans quitter la plateforme",
  "Création de chaînes, shorts et vidéos personnalisées",
  "Montage vidéo intégré avec studio de création complet",
  "Chat en direct, réactions et interactions streamer-viewer"]

},
{
  icon: Palette,
  title: "Profils ultra-personnalisés",
  desc: "Exprimez votre identité gaming grâce à des profils ultra-personnalisés. Personnalisez votre avatar, votre bannière, vos thèmes visuels, vos badges et vos animations de profil exclusives pour vous démarquer dans la communauté Matrix.",
  points: [
  "Avatars, bannières et thèmes visuels personnalisables",
  "Cosmétiques exclusifs, badges et animations de profil",
  "Couvertures de profil animées et titres personnalisés",
  "Boutique Matrix de cosmétiques pour personnaliser votre identité"]

},
{
  icon: Server,
  title: "Création de serveurs Nexus et Discord",
  desc: "Créez et promouvez vos propres serveurs communautaires Nexus ou connectez vos serveurs Discord existants. Gérez vos salons textuels et vocaux, vos rôles personnalisés, vos emojis et vos thèmes de serveur pour bâtir une communauté active et engagée.",
  points: [
  "Création de serveurs Nexus avec salons textuels, vocaux et forums",
  "Intégration et promotion de serveurs Discord existants",
  "Rôles personnalisés, emojis, thèmes visuels et boosts de serveur",
  "Invitations, permissions granulaires et modération communautaire"]

},
{
  icon: Search,
  title: "Recherche de coéquipiers (teammates)",
  desc: "Trouvez facilement des coéquipiers et teammates pour vos jeux préférés grâce à l'outil de recherche de joueurs intégré. Explorez les profils, ajoutez des amis, lancez des conversations privées et formez votre équipe de jeu en quelques clics.",
  points: [
  "Recherche de joueurs par jeu, pseudo ou profil public",
  "Système d'amis, messagerie privée et appels vocaux",
  "Petites annonces et recrutement pour serveurs de jeu",
  "Découverte de créateurs et profils de joueurs publics"]

},
{
  icon: Award,
  title: "Espace affiliation et partenaires",
  desc: "Rejoignez le programme d'affiliation et de partenariat Matrix pour monétiser votre communauté. Les créateurs affiliés et partenaires bénéficient d'avantages exclusifs, d'un dashboard dédié, d'un kit média et de récompenses en TRIX.",
  points: [
  "Programme d'affiliation et de partenariat pour créateurs",
  "Dashboard affilié avec statistiques et suivi des performances",
  "Kit média, badges de créateur et profils publics",
  "Récompenses mensuelles en TRIX pour les partenaires vérifiés"]

},
{
  icon: BookOpen,
  title: "Tutoriels, bases de données et wikis de jeux",
  desc: "Accédez à des tutoriels, bases de données et wikis complets pour vos jeux préférés comme Farming Simulator et Fortnite. Trouvez des guides, des astuces, des mods et des maps partagés par la communauté Matrix.",
  points: [
  "Tutoriels et guides pour Farming Simulator et Fortnite",
  "Base de données de mods, maps et contenu de jeu communautaire",
  "Wiki collaboratif avec quêtes, articles et entraide entre joueurs",
  "Téléchargement de mods et maps avec système de votes et commentaires"]

},
{
  icon: Dices,
  title: "Mini-jeux et casino type arcade",
  desc: "Profitez d'un module de mini-jeux et de casino type arcade avec le Nexus Game. Tentez votre chance à la roulette, aux machines à sous, au blackjack et aux tickets à gratter dans un univers de jeu ludique et gratuit.",
  points: [
  "Casino virtuel avec roulette, machines à sous et blackjack",
  "Tickets à gratter, roue de la fortune et récompenses quotidiennes",
  "Système de progression, niveaux, trophées et classements",
  "Monnaie virtuelle TRIX exclusive, sans argent réel"]

}];


export default function LandingSEO() {
  return (
    <section className="mt-8 lg:mt-12 space-y-8" aria-label="Présentation des fonctionnalités Matrix">
      {/* H1 SEO + intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4 px-2">
        
        <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight hidden">
          Matrix — Le hub gaming, streaming et communautaire{" "}
          <span style={{ color: "#a855f7" }}>100% gratuit</span> et évolutif
        </h1>
        <p className="text-sm md:text-base text-white/60 leading-relaxed max-w-3xl mx-auto hidden">
          Matrix est une plateforme tout-en-un qui réunit le streaming de vidéos YouTube et Twitch,
          des profils ultra-personnalisés, la création de serveurs Nexus et Discord, un outil de
          recherche de coéquipiers, un programme d'affiliation pour créateurs, des tutoriels et wikis
          de jeux, ainsi qu'un espace de mini-jeux type casino arcade. Rejoignez gratuitement la
          communauté Matrix et bâtissez votre univers gaming dès aujourd'hui.
        </p>
      </motion.div>

      {/* Feature sections */}
      {FEATURES.map((f, i) =>
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: i * 0.05 }}
        className="rounded-2xl p-5 md:p-6 hidden"
        style={{ background: "rgba(15,10,25,0.6)", border: "1px solid rgba(168,85,247,0.12)" }}>
        
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.12)" }}>
              <f.icon className="w-5 h-5" style={{ color: "#a855f7" }} />
            </div>
            <h2 className="text-base md:text-lg font-black text-white">{f.title}</h2>
          </div>
          <p className="text-xs md:text-sm text-white/55 leading-relaxed mb-4">{f.desc}</p>
          <ul className="space-y-2">
            {f.points.map((p, j) =>
          <li key={j} className="flex items-start gap-2 text-xs md:text-sm text-white/50">
                <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#a855f7" }} />
                <span>{p}</span>
              </li>
          )}
          </ul>
        </motion.div>
      )}

      {/* Closing CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl p-6 md:p-8 text-center hidden"
        style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(109,40,217,0.05))", border: "1px solid rgba(168,85,247,0.2)" }}>
        
        <h2 className="text-lg md:text-xl font-black text-white mb-2">Rejoignez la communauté Matrix gratuitement</h2>
        <p className="text-xs md:text-sm text-white/55 leading-relaxed max-w-2xl mx-auto">
          Matrix est une plateforme gaming, streaming et communautaire gratuite et évolutive, accessible
          sur navigateur web et application de bureau. Créez votre compte, personnalisez votre profil,
          lancez votre chaîne, rejoignez des serveurs et découvrez un univers gaming complet en un seul endroit.
        </p>
      </motion.div>
    </section>);

}