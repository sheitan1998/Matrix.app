export const DEFAULT_ROULETTE_CONFIG = {
  wheel_scale: 100,
  accoudoir_scale: 100,
  dealer_scale: 100,
  bet_panel_pos_x: 82,
  bet_panel_pos_y: 30,
  bet_panel_scale: 100,
  controls_pos_x: 82,
  controls_pos_y: 82,
  controls_scale: 100,
  dealer_message_greeting: 'Bienvenue à la table Nexus ! Placez vos jetons et lancez la bille.',
  dealer_message_win: 'Le {n}, {details} ! Gain : +{gain} jetons.',
  dealer_message_lose: 'Le {n}, {details}. Pas de gain cette fois.',
  dealer_message_zero: 'Le 0, Vert ! La maison gagne.',
};

export const ROULETTE_CONFIG_FIELDS = [
  'wheel_scale',
  'accoudoir_scale',
  'dealer_scale',
  'bet_panel_pos_x',
  'bet_panel_pos_y',
  'bet_panel_scale',
  'controls_pos_x',
  'controls_pos_y',
  'controls_scale',
  'dealer_message_greeting',
  'dealer_message_win',
  'dealer_message_lose',
  'dealer_message_zero',
];

export function mergeRouletteConfig(record) {
  if (!record) return { ...DEFAULT_ROULETTE_CONFIG };
  return ROULETTE_CONFIG_FIELDS.reduce(
    (config, field) => ({
      ...config,
      [field]: record[field] ?? DEFAULT_ROULETTE_CONFIG[field],
    }),
    { ...DEFAULT_ROULETTE_CONFIG },
  );
}