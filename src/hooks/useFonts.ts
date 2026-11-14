import { useEffect, useState } from 'react';
import type { FontAccentId, FontMainId } from '../lib/types';
import { ensureFonts } from '../scripts/fonts';

/** Carrega as fontes escolhidas e força recálculo do ajuste automático. */
export function useFonts(fontMain: FontMainId, fontAccent: FontAccentId) {
  const [fontsTick, setFontsTick] = useState(0);

  useEffect(() => {
    let alive = true;
    void ensureFonts(fontMain, fontAccent).then(() => {
      if (alive) setFontsTick((t) => t + 1);
    });
    return () => {
      alive = false;
    };
  }, [fontMain, fontAccent]);

  return fontsTick;
}
