import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Radio, Server, GraduationCap, Dices } from "lucide-react";

const HIGHLIGHTS = [
{
  icon: Radio,
  title: "Streaming et création de contenu",
  text: "Regardez YouTube et Twitch sans quitter la plateforme, créez votre chaîne, publiez des shorts et montez vos vidéos avec le studio intégré."
},
{
  icon: Server,
  title: "Serveurs de jeu et communauté",
  text: "Rejoignez des serveurs Nexus avec salons vocaux et textuels, ou découvrez les meilleurs serveurs Discord francophones de l'annuaire Best Serveur."
},
{
  icon: GraduationCap,
  title: "Guides, wikis et entraide",
  text: "Tutoriels, bases de données, mods et wikis collaboratifs pour Farming Simulator, Fortnite, Minecraft, Dofus et bien d'autres jeux."
},
{
  icon: Dices,
  title: "Mini-jeux et progression",
  text: "Jouez à la roulette, aux machines à sous et aux jeux HTML5 du Nexus Game, gagnez des TRIX et faites évoluer votre profil."
}];


const INTERNAL_LINKS = [
{ href: "/best-serveurs", label: "Annuaire des serveurs de jeu" },
{ href: "/best-creator", label: "Classement des créateurs" },
{ href: "/tuto-gaming", label: "Guides et tutoriels gaming" },
{ href: "/fortnite-maps", label: "Maps Fortnite" },
{ href: "/nexus-game", label: "Jeux et casino virtuel" }];


export default function LandingSEO() {
  return (
    <section className="mt-8 lg:mt-12 space-y-6" aria-labelledby="matrix-presentation">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl p-5 md:p-6"
        style={{ background: "hsl(var(--card) / 0.9)", border: "1px solid hsl(var(--border))" }}>
        
        <h1 id="matrix-presentation" className="text-xl md:text-2xl font-black text-foreground mb-3">
          Matrix Hub, la plateforme tout-en-un du streaming et du gaming francophone
        </h1>
        <p className="text-xs md:text-sm leading-relaxed text-foreground/60 max-w-4xl">
          Matrix Hub rassemble dans un seul espace le streaming vidéo YouTube et Twitch, les serveurs de jeu Nexus et
          Discord, la création de contenu, les guides et wikis gaming, les mini-jeux et la communauté. Créez votre
          profil, personnalisez votre identité, échangez avec d'autres joueurs et créateurs, puis suivez votre
          progression et vos récompenses TRIX au fil de vos activités.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-5">
          {HIGHLIGHTS.map((item) =>
          <div
            key={item.title}
            className="rounded-xl p-3.5"
            style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
            
              <div className="flex items-center gap-2 mb-1.5">
                <item.icon className="w-4 h-4 shrink-0" style={{ color: "#a855f7" }} />
                <h2 className="text-xs font-black text-foreground leading-tight">{item.title}</h2>
              </div>
              <p className="text-[11px] leading-relaxed text-foreground/55">{item.text}</p>
            </div>
          )}
        </div>

        <nav aria-label="Pages principales de Matrix Hub" className="mt-5">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {INTERNAL_LINKS.map((link) =>
            <li key={link.href}>
                





              
              </li>
            )}
          </ul>
        </nav>
      </motion.div>
    </section>);

}