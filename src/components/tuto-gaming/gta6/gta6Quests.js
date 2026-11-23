import { isolateGta6Items } from '@/components/tuto-gaming/gta6/gta6Collection';

// Structured quest records. Add a new entry to GTA6_QUESTS_DATA to publish a quest card:
// no UI change is needed. Rockstar has not published a quest list, so every record is an
// editorial placeholder that must be replaced by verified data after release.
const STATUS_PENDING = 'À compléter après la sortie';

const quest = ({ id, name, category, color, desc, steps = [], rewards, tips, specs = {} }) => ({
  id,
  type: 'quest',
  name,
  tag: category,
  category,
  status: STATUS_PENDING,
  color,
  desc,
  steps,
  rewards,
  tips,
  specs: { Catégorie: category, Statut: STATUS_PENDING, ...specs },
  media: [],
});

const GTA6_QUESTS_DATA = [
  quest({
    id: 'quest-main-story',
    name: 'Histoire principale : Lucia et Jason',
    category: 'Histoire',
    color: '#BF5AF2',
    desc: "Fiche réservée à la progression de l'histoire du duo Lucia Caminos / Jason Duval. Aucun nom de quête, ordre ou récompense n'est publié par Rockstar à ce jour.",
    steps: [
      'Ajouter ici chaque chapitre dans l’ordre de déblocage vérifié en jeu.',
      'Renseigner les objectifs exacts affichés par le jeu pour chaque quête.',
      'Indiquer le personnage jouable concerné par la séquence.',
    ],
    tips: 'Remplacer cette fiche par un parcours vérifié dès la sortie du jeu.',
  }),
  quest({
    id: 'quest-side-contracts',
    name: 'Quêtes secondaires et contrats',
    category: 'Secondaire',
    color: '#22D3EE',
    desc: "Emplacement structuré pour les contrats, rencontres aléatoires et quêtes annexes de Leonida, à documenter une fois confirmés en jeu.",
    steps: [
      'Lister le donneur de quête et son lieu de rencontre.',
      'Noter les conditions de déblocage observées.',
      'Documenter les variantes de résolution et leurs conséquences.',
    ],
    tips: 'Relier chaque quête à une fiche de la section Carte & Lieux via son identifiant.',
  }),
  quest({
    id: 'quest-activities',
    name: 'Activités et défis du monde ouvert',
    category: 'Activité',
    color: '#FBBF24',
    desc: "Catégorie pour les activités récurrentes (loisirs, défis, collections) lorsqu’elles seront vérifiées. Aucune activité spécifique n’est affirmée ici.",
    steps: [
      'Décrire l’activité telle qu’elle apparaît dans le jeu.',
      'Indiquer ses prérequis et son emplacement confirmé.',
      'Ajouter les récompenses réellement observées.',
    ],
    tips: 'Croiser avec les succès / trophées lorsque la liste officielle sera disponible.',
  }),
];

export const GTA6_QUESTS = isolateGta6Items(GTA6_QUESTS_DATA, 'quest');
