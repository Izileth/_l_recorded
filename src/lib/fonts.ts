// Fontes empacotadas (somente o subconjunto latino) — funcionam offline e entram na exportação.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-800.css';
import '@fontsource/anton/latin-400.css';
import '@fontsource/bebas-neue/latin-400.css';
import '@fontsource/oswald/latin-700.css';
import '@fontsource/archivo-black/latin-400.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/playfair-display/latin-500.css';
import '@fontsource/playfair-display/latin-500-italic.css';
import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/dm-serif-display/latin-400-italic.css';
import '@fontsource/abril-fatface/latin-400.css';
import '@fontsource/yellowtail/latin-400.css';
import '@fontsource/pacifico/latin-400.css';
import '@fontsource/dancing-script/latin-700.css';
import '@fontsource/permanent-marker/latin-400.css';
import '@fontsource/kaushan-script/latin-400.css';
import '@fontsource/caveat/latin-700.css';

import type { FontAccentId, FontMainId } from './types';

export interface MainFont {
  id: FontMainId;
  name: string;
  family: string;
  weight: number;
  /** Entrelinha ideal da fonte. */
  lh: number;
  /** Espaçamento entre letras ideal, em em. */
  ls: number;
  hasItalic: boolean;
}

export interface AccentFont {
  id: FontAccentId;
  name: string;
  family: string;
  weight: number;
  /** Escala em relação ao texto principal (cada manuscrita tem um tamanho visual diferente). */
  scale: number;
}

export const MAIN_FONTS: MainFont[] = [
  { id: 'anton', name: 'Anton', family: "'Anton', Impact, sans-serif", weight: 400, lh: 0.98, ls: 0.005, hasItalic: false },
  { id: 'bebas', name: 'Bebas Neue', family: "'Bebas Neue', Impact, sans-serif", weight: 400, lh: 1, ls: 0.02, hasItalic: false },
  { id: 'oswald', name: 'Oswald', family: "'Oswald', Impact, sans-serif", weight: 700, lh: 1.04, ls: 0.01, hasItalic: false },
  { id: 'archivo', name: 'Archivo Black', family: "'Archivo Black', Arial Black, sans-serif", weight: 400, lh: 1, ls: -0.01, hasItalic: false },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", weight: 800, lh: 1.1, ls: -0.015, hasItalic: false },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", weight: 700, lh: 1.14, ls: -0.01, hasItalic: false },
  { id: 'grotesk', name: 'Space Grotesk', family: "'Space Grotesk', sans-serif", weight: 700, lh: 1.08, ls: -0.02, hasItalic: false },
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", weight: 800, lh: 1.1, ls: -0.025, hasItalic: false },
  { id: 'playfair', name: 'Playfair', family: "'Playfair Display', Georgia, serif", weight: 500, lh: 1.12, ls: 0, hasItalic: true },
  { id: 'dmserif', name: 'DM Serif', family: "'DM Serif Display', Georgia, serif", weight: 400, lh: 1.1, ls: 0, hasItalic: true },
  { id: 'abril', name: 'Abril Fatface', family: "'Abril Fatface', Georgia, serif", weight: 400, lh: 1.08, ls: 0, hasItalic: false },
];

export const ACCENT_FONTS: AccentFont[] = [
  { id: 'yellowtail', name: 'Yellowtail', family: "'Yellowtail', cursive", weight: 400, scale: 1.3 },
  { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive", weight: 400, scale: 1.05 },
  { id: 'dancing', name: 'Dancing Script', family: "'Dancing Script', cursive", weight: 700, scale: 1.3 },
  { id: 'marker', name: 'Permanent Marker', family: "'Permanent Marker', cursive", weight: 400, scale: 0.95 },
  { id: 'kaushan', name: 'Kaushan', family: "'Kaushan Script', cursive", weight: 400, scale: 1.15 },
  { id: 'caveat', name: 'Caveat', family: "'Caveat', cursive", weight: 700, scale: 1.5 },
];

export const FONT_SANS = "'Inter', system-ui, sans-serif";
export const FONT_SERIF = "'Playfair Display', Georgia, serif";

export const mainFont = (id: FontMainId): MainFont => MAIN_FONTS.find((f) => f.id === id) ?? MAIN_FONTS[0];
export const accentFont = (id: FontAccentId): AccentFont => ACCENT_FONTS.find((f) => f.id === id) ?? ACCENT_FONTS[0];

/** Garante que as fontes escolhidas estejam carregadas antes de medir/exportar. */
export async function ensureFonts(main: FontMainId, accent: FontAccentId): Promise<void> {
  const m = mainFont(main);
  const a = accentFont(accent);
  const loads = [
    document.fonts.load(`${m.weight} 100px ${m.family}`, 'Aa'),
    document.fonts.load(`${a.weight} 100px ${a.family}`, 'Aa'),
    document.fonts.load(`500 24px ${FONT_SANS}`, 'Aa'),
  ];
  if (m.hasItalic) loads.push(document.fonts.load(`italic ${m.weight} 100px ${m.family}`, 'Aa'));
  await Promise.allSettled(loads);
  await document.fonts.ready;
}
