import { FARMING_LOCAL_IMAGES } from '@/components/tuto-gaming/farmingLocalImages';

// Small verified offline snapshot, never a substitute for the paginated live catalog.
// Official FS25 ModHub records read on 2026-11-01. No fabricated specs or ZIP URLs.
export const FARMING_FALLBACK = [
  ['376974', 'maps', 'Golden Opportunities', 'SpecTheTurtle'],
  ['374548', 'maps', 'Baltic Sea: Hohenwiek', 'Redkeinstus'],
  ['376873', 'tractors', 'Fendt Vario 500 Municipal', 'romaain'],
  ['323208', 'tractors', 'Fendt Farmer 300 C/Ci', 'Cayman'],
  ['342831', 'trailers', 'MAN TGS 18.500 Kipper', 'Kaymara, NLD Community, fa285634'],
  ['377564', 'trailers', 'Schwarzmüller Walking-Floor Semitrailer', 'Smety'],
  ['374142', 'harvesters', 'John Deere S7 Pack', 'Dirtdevil99'],
  ['366585', 'harvesters', 'CLAAS Lexion 8000 Series', 'roman.1707'],
  ['326873', 'buildings', 'Lizard Grain Storage And Animal Food Mixer', 'MrHector'],
  ['378696', 'buildings', 'RC World', 'fitfueralles'],
  ['376682', 'scripts', 'Highlight Selected Control Group', 'Razdyn'],
].map(([id, categoryId, title, author]) => ({ id, categoryId, title, author, img: FARMING_LOCAL_IMAGES[id], images: [], source: 'reference' }));