import type { Design } from './types';

export interface LayoutPreset {
  id: string;
  name: string;
  design: Omit<Design, 'bgImage'>;
  createdAt: number;
}

const PRESETS_STORAGE_KEY = 'lyricards:presets:v1';

export function loadPresets(): LayoutPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is LayoutPreset =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.design === 'object' &&
        item.design !== null,
    );
  } catch {
    return [];
  }
}

export function savePresets(presets: LayoutPreset[]): void {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // Caso de quota cheia ou modo anônimo restrito
  }
}

export function createPreset(name: string, design: Design): LayoutPreset {
  const { bgImage: _removed, ...designWithoutImage } = design;
  return {
    id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || 'Meu Layout',
    design: designWithoutImage,
    createdAt: Date.now(),
  };
}

export function formatPresetDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
