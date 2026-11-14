import type { Design, FontAccentId, FontMainId, TemplateId } from '../lib/types';
import { ACCENT_FONTS, MAIN_FONTS } from '../constants/fonts';
import { COMBOS, TEMPLATES, type TemplateDef } from '../constants/templates';

export function getTemplate(id: TemplateId): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function applyTemplate(design: Design, id: TemplateId): Design {
  return { ...design, ...getTemplate(id).defaults, template: id, scale: 1 };
}

export function backgroundOf(d: Pick<Design, 'bg' | 'bg2'>): string {
  return d.bg2 ? `linear-gradient(160deg, ${d.bg} 0%, ${d.bg2} 100%)` : d.bg;
}

const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];

/** Sorteia uma combinação: paleta de um combo + fontes e estilo de destaque aleatórios. */
export function randomCombo(): Partial<Design> {
  const base = pick(COMBOS).patch;
  const fontMain: FontMainId = pick(MAIN_FONTS).id;
  const fontAccent: FontAccentId = pick(ACCENT_FONTS).id;
  return {
    ...base,
    fontMain,
    fontAccent,
    emphasis: true,
    emphasisStyle: pick(['color', 'script', 'italic'] as const),
  };
}
