import { useEffect, useMemo } from 'react';
import type { Design, LyricLine } from '../lib/types';
import type { ExportOptions } from '../constants/export';
import { DEFAULT_EXPORT } from '../constants/export';
import { DEFAULT_DESIGN } from '../constants/templates';
import { STORAGE_KEY } from '../constants/storage';

export interface Persisted {
  text: string;
  design: Design;
  lyrics: LyricLine[];
  fileName: string;
  exportOptions: ExportOptions;
}

function load(): Persisted {
  const fallback: Persisted = {
    text: 'Another\nLevel',
    design: DEFAULT_DESIGN,
    lyrics: [],
    fileName: '',
    exportOptions: DEFAULT_EXPORT,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<Persisted>;
    return {
      text: typeof data.text === 'string' ? data.text : fallback.text,
      design: { ...DEFAULT_DESIGN, ...(data.design ?? {}), bgImage: null },
      lyrics: Array.isArray(data.lyrics) ? data.lyrics : [],
      fileName: data.fileName ?? '',
      exportOptions: { ...DEFAULT_EXPORT, ...(data.exportOptions ?? {}) },
    };
  } catch {
    return fallback;
  }
}

/** Hook que carrega e salva o estado no localStorage automaticamente. */
export function usePersistence(deps: {
  text: string;
  design: Design;
  lyrics: LyricLine[];
  fileName: string;
  exportOptions: ExportOptions;
}) {
  const { text, design, lyrics, fileName, exportOptions } = deps;

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const data: Persisted = { text, design: { ...design, bgImage: null }, lyrics, fileName, exportOptions };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* armazenamento cheio ou bloqueado: ignora */
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [text, design, lyrics, fileName, exportOptions]);
}

/** Hook que retorna o estado inicial persistido. */
export function useInitialState(): Persisted {
  return useMemo(load, []);
}
