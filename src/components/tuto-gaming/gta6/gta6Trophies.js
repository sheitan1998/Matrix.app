// Succès / Trophées GTA VI.
// ATTENTION : Rockstar Games n'a pas publié la liste officielle des trophées.
// Les fiches ci-dessous reprennent uniquement des éléments communautaires non confirmés,
// clairement signalés comme prévisionnels, et les informations de structure déjà connues.
const trophy = (id, name, tier, condition, desc) => ({
  id,
  type: 'trophy',
  name,
  tag: tier,
  category: 'Succès',
  status: 'Prévisionnel — non annoncé par Rockstar',
  color: tier === 'Platine' ? '#E5E7EB' : tier === 'Or' ? '#FBBF24' : tier === 'Argent' ? '#CBD5E1' : '#D97706',
  desc,
  specs: { Trophée: tier, Condition: condition, Statut: 'Rumeur communautaire, non confirmée' },
});

export const GTA6_TROPHIES = Object.freeze([
  trophy('platinum-leonida', 'Le rêve de Leonida', 'Platine', 'Obtenir tous les autres trophées', "Trophée de platine attendu pour la complétion totale du jeu. Son intitulé exact n'a pas été communiqué par Rockstar Games."),
  trophy('gator-tongue', 'Gator Got Your Tongue', 'Bronze', 'Survivre à une attaque d’alligator', 'Récompense citée dans une liste communautaire non officielle : survivre à une attaque d’alligator dans les Everglades.'),
  trophy('boat-life', 'Boat Life', 'Bronze', 'Parcourir 50 miles en bateau', 'Défi de distance en bateau repris d’une liste communautaire. Aucun chiffre officiel n’a été publié.'),
  trophy('car-collector', 'Car Collector', 'Argent', 'Posséder 50 véhicules uniques', 'Succès de collection de véhicules issu d’une liste communautaire non officielle.'),
  trophy('air-superiority', 'Air Superiority', 'Bronze', 'Passer sous 10 ponts en aéronef', 'Défi aérien cité par la communauté, à vérifier à la sortie du jeu.'),
  trophy('explosive-personality', 'Explosive Personality', 'Bronze', 'Éliminer 20 ennemis avec des explosifs', 'Condition provisoire issue d’une fuite communautaire, non confirmée par Rockstar.'),
  trophy('delivery-boy', 'Delivery Boy', 'Bronze', 'Terminer 15 missions de livraison', 'Activité de livraison évoquée dans une liste non officielle de trophées.'),
  trophy('completionist-100', '100% Completionist', 'Or', 'Atteindre 100 % de complétion', 'Trophée de complétion totale attendu, comme dans les épisodes précédents. La liste officielle reste à publier.'),
]);