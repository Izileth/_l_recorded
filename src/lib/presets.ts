import type { Design } from './types';

export interface Preset {
  id: string;
  name: string;
  /** Design sem bgImage (pesada demais para localStorage). */
  design: Omit<Design, 'bgImage'>;
  createdAt: number;
}

const STORAGE_KEY = 'lyricards:presets';

export function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data as Preset[];
  } catch {
    return [];
  }
}

export function savePresets(presets: Preset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch { /* armazenamento cheio: ignora */ }
}

export function createPreset(name: string, design: Design): Preset {
  const { bgImage: _bg, ...rest } = design;
  return {
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || 'Sem nome',
    design: rest,
    createdAt: Date.now(),
  };
}

export function formatPresetDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
