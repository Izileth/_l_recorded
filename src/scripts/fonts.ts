import type { FontAccentId, FontMainId } from '../lib/types';
import { ACCENT_FONTS, FONT_SANS, MAIN_FONTS, type AccentFont, type MainFont } from '../constants/fonts';

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
