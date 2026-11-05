import { formatCoins } from '@/lib/rouletteTable';

const FR = {
  title: 'Roulette',
  subtitle: 'Faites tourner la roue et tentez votre chance !',
  balance: 'Solde actuel',
  lastWin: 'Dernier gain',
  bet: 'Mise',
  spin: 'Lancer la roulette',
  spinning: 'La bille tourne…',
  history: 'Historique des derniers tirs',
  clear: 'Effacer les mises',
  total: 'Total misé',
  insufficient: 'Solde insuffisant',
  noBets: 'Placez au moins une mise.',
  even: 'Pair',
  odd: 'Impair',
  low: 'Manque',
  high: 'Passe',
  red: 'Rouge',
  black: 'Noir',
  green: 'Vert',
  dozen1: '1ère 12',
  dozen2: '2ème 12',
  dozen3: '3ème 12',
  zero: 'Zéro',
  and: 'et',
  win: 'Gagné',
  lose: 'Perdu',
  winMsg: 'Le {n}, {details} ! Gain : +{gain} jetons',
  loseMsg: 'Le {n}, {details} ! Pas de gain cette fois.',
  zeroMsg: 'Le 0, Vert ! La maison gagne.',
};

const EN = {
  title: 'Roulette',
  subtitle: 'Spin the wheel and try your luck!',
  balance: 'Current balance',
  lastWin: 'Last win',
  bet: 'Bet',
  spin: 'Spin the wheel',
  spinning: 'The ball is spinning…',
  history: 'Recent spins',
  clear: 'Clear bets',
  total: 'Total staked',
  insufficient: 'Insufficient balance',
  noBets: 'Place at least one bet.',
  even: 'Even',
  odd: 'Odd',
  low: 'Low',
  high: 'High',
  red: 'Red',
  black: 'Black',
  green: 'Green',
  dozen1: '1st 12',
  dozen2: '2nd 12',
  dozen3: '3rd 12',
  zero: 'Zero',
  and: 'and',
  win: 'Win',
  lose: 'Lost',
  winMsg: 'The {n}, {details}! Win: +{gain} jetons',
  loseMsg: 'The {n}, {details}! No win this time.',
  zeroMsg: 'Zero, Green! The house wins.',
};

const ES = {
  title: 'Ruleta',
  subtitle: '¡Gira la ruleta y prueba suerte!',
  balance: 'Saldo actual',
  lastWin: 'Última ganancia',
  bet: 'Apuesta',
  spin: 'Girar la ruleta',
  spinning: 'La bola gira…',
  history: 'Últimos giros',
  clear: 'Borrar apuestas',
  total: 'Total apostado',
  insufficient: 'Saldo insuficiente',
  noBets: 'Coloca al menos una apuesta.',
  even: 'Par',
  odd: 'Impar',
  low: 'Falta',
  high: 'Pasa',
  red: 'Rojo',
  black: 'Negro',
  green: 'Verde',
  dozen1: '1ª 12',
  dozen2: '2ª 12',
  dozen3: '3ª 12',
  zero: 'Cero',
  and: 'y',
  win: 'Ganado',
  lose: 'Perdido',
  winMsg: 'El {n}, {details}! Ganancia: +{gain} jetons',
  loseMsg: 'El {n}, {details}! Sin ganancia esta vez.',
  zeroMsg: '¡El 0, Verde! Gana la casa.',
};

const DE = {
  title: 'Roulette',
  subtitle: 'Drehen Sie das Rad und versuchen Sie Ihr Glück!',
  balance: 'Aktuelles Guthaben',
  lastWin: 'Letzter Gewinn',
  bet: 'Einsatz',
  spin: 'Rad drehen',
  spinning: 'Die Kugel dreht sich…',
  history: 'Letzte Drehungen',
  clear: 'Einsätze löschen',
  total: 'Gesamteinsatz',
  insufficient: 'Guthaben reicht nicht',
  noBets: 'Setzen Sie mindestens einen Einsatz.',
  even: 'Gerade',
  odd: 'Ungerade',
  low: 'Niedrig',
  high: 'Hoch',
  red: 'Rot',
  black: 'Schwarz',
  green: 'Grün',
  dozen1: '1. 12',
  dozen2: '2. 12',
  dozen3: '3. 12',
  zero: 'Null',
  and: 'und',
  win: 'Gewinn',
  lose: 'Verloren',
  winMsg: 'Die {n}, {details}! Gewinn: +{gain} jetons',
  loseMsg: 'Die {n}, {details}! Diesmal kein Gewinn.',
  zeroMsg: 'Die 0, Grün! Die Bank gewinnt.',
};

const IT = {
  title: 'Roulette',
  subtitle: 'Fai girare la ruota e tenta la fortuna!',
  balance: 'Saldo attuale',
  lastWin: 'Ultima vincita',
  bet: 'Puntata',
  spin: 'Gira la roulette',
  spinning: 'La pallina gira…',
  history: 'Ultimi tiri',
  clear: 'Cancella puntate',
  total: 'Totale puntato',
  insufficient: 'Saldo insufficiente',
  noBets: 'Piazza almeno una puntata.',
  even: 'Pari',
  odd: 'Dispari',
  low: 'Bassa',
  high: 'Alta',
  red: 'Rosso',
  black: 'Nero',
  green: 'Verde',
  dozen1: '1ª 12',
  dozen2: '2ª 12',
  dozen3: '3ª 12',
  zero: 'Zero',
  and: 'e',
  win: 'Vinto',
  lose: 'Perso',
  winMsg: 'Il {n}, {details}! Vincita: +{gain} jetons',
  loseMsg: 'Il {n}, {details}! Nessuna vincita stavolta.',
  zeroMsg: 'Lo 0, Verde! Vince il banco.',
};

const PT = {
  title: 'Roleta',
  subtitle: 'Gire a roleta e tente a sorte!',
  balance: 'Saldo atual',
  lastWin: 'Último ganho',
  bet: 'Aposta',
  spin: 'Girar a roleta',
  spinning: 'A bola está girando…',
  history: 'Últimos giros',
  clear: 'Limpar apostas',
  total: 'Total apostado',
  insufficient: 'Saldo insuficiente',
  noBets: 'Faça pelo menos uma aposta.',
  even: 'Par',
  odd: 'Ímpar',
  low: 'Baixa',
  high: 'Alta',
  red: 'Vermelho',
  black: 'Preto',
  green: 'Verde',
  dozen1: '1ª 12',
  dozen2: '2ª 12',
  dozen3: '3ª 12',
  zero: 'Zero',
  and: 'e',
  win: 'Ganho',
  lose: 'Perdido',
  winMsg: 'O {n}, {details}! Ganho: +{gain} jetons',
  loseMsg: 'O {n}, {details}! Sem ganho desta vez.',
  zeroMsg: 'O 0, Verde! A casa ganha.',
};

const NL = {
  title: 'Roulette',
  subtitle: 'Draai het wiel en waag je kans!',
  balance: 'Huidig saldo',
  lastWin: 'Laatste winst',
  bet: 'Inzet',
  spin: 'Draai het wiel',
  spinning: 'De bal draait…',
  history: 'Recente draaien',
  clear: 'Inzetten wissen',
  total: 'Totaal ingezet',
  insufficient: 'Onvoldoende saldo',
  noBets: 'Plaats minstens één inzet.',
  even: 'Even',
  odd: 'Oneven',
  low: 'Laag',
  high: 'Hoog',
  red: 'Rood',
  black: 'Zwart',
  green: 'Groen',
  dozen1: '1e 12',
  dozen2: '2e 12',
  dozen3: '3e 12',
  zero: 'Nul',
  and: 'en',
  win: 'Winst',
  lose: 'Verloren',
  winMsg: 'De {n}, {details}! Winst: +{gain} jetons',
  loseMsg: 'De {n}, {details}! Deze keer geen winst.',
  zeroMsg: 'De 0, Groen! Het huis wint.',
};

const RU = {
  title: 'Рулетка',
  subtitle: 'Крутите колесо и испытайте удачу!',
  balance: 'Текущий баланс',
  lastWin: 'Последний выигрыш',
  bet: 'Ставка',
  spin: 'Крутить колесо',
  spinning: 'Шарик крутится…',
  history: 'Последние вращения',
  clear: 'Очистить ставки',
  total: 'Всего поставлено',
  insufficient: 'Недостаточно средств',
  noBets: 'Сделайте хотя бы одну ставку.',
  even: 'Чёт',
  odd: 'Нечет',
  low: 'Меньше',
  high: 'Больше',
  red: 'Красное',
  black: 'Чёрное',
  green: 'Зелёное',
  dozen1: '1-я 12',
  dozen2: '2-я 12',
  dozen3: '3-я 12',
  zero: 'Зеро',
  and: 'и',
  win: 'Выигрыш',
  lose: 'Проигрыш',
  winMsg: '{n}, {details}! Выигрыш: +{gain} jetons',
  loseMsg: '{n}, {details}! На этот раз без выигрыша.',
  zeroMsg: '0, Зелёное! Выигрывает казино.',
};

const TRANSLATIONS = { fr: FR, en: EN, es: ES, de: DE, it: IT, pt: PT, nl: NL, ru: RU };

export const SPEECH_LOCALES = {
  fr: 'fr-FR', en: 'en-US', es: 'es-ES', de: 'de-DE', it: 'it-IT',
  pt: 'pt-PT', nl: 'nl-NL', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN', ar: 'ar-SA',
};

export function resolveRouletteLang(user) {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('matrix_lang') : null;
  const candidate = (user?.interface_language || stored || 'fr').toLowerCase().split('-')[0];
  return TRANSLATIONS[candidate] ? candidate : 'en';
}

export const rouletteStrings = (lang) => TRANSLATIONS[lang] || TRANSLATIONS.en;

export function dealerDetails(lang, number) {
  const strings = rouletteStrings(lang);
  if (!number) return strings.green;
  const parts = [
    rouletteWord(lang, number),
    number % 2 === 0 ? strings.even : strings.odd,
    number <= 18 ? strings.low : strings.high,
  ];
  return `${parts[0]}, ${parts[1]} ${strings.and} ${parts[2]}`;
}

export function buildDealerMessage(lang, { number, gain, win }) {
  const strings = rouletteStrings(lang);
  if (number === 0) {
    if (!win) return strings.zeroMsg;
    return strings.winMsg
      .replace('{n}', '0')
      .replace('{details}', strings.green)
      .replace('{gain}', formatCoins(gain, lang));
  }
  const template = win ? strings.winMsg : strings.loseMsg;
  return template
    .replace('{n}', String(number))
    .replace('{details}', dealerDetails(lang, number))
    .replace('{gain}', formatCoins(gain, lang));
}

function rouletteWord(lang, number) {
  const strings = rouletteStrings(lang);
  const reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return reds.includes(number) ? strings.red : strings.black;
}