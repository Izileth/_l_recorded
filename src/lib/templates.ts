import type { Design, RatioId, TemplateId } from './types';

export const FONTS = {
  display: "'Anton', Impact, 'Arial Narrow Bold', sans-serif",
  script: "'Yellowtail', 'Brush Script MT', cursive",
  serif: "'Playfair Display', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
} as const;

export const RATIOS: Record<RatioId, { w: number; h: number; label: string; hint: string }> = {
  '1:1': { w: 1080, h: 1080, label: '1:1', hint: 'Feed' },
  '4:5': { w: 1080, h: 1350, label: '4:5', hint: 'Instagram' },
  '9:16': { w: 1080, h: 1920, label: '9:16', hint: 'Stories / Reels' },
};

type TemplateStyle = Pick<
  Design,
  'bg' | 'bg2' | 'fg' | 'accent' | 'align' | 'uppercase' | 'maxChars' | 'emphasis'
>;

export interface TemplateDef {
  id: TemplateId;
  name: string;
  description: string;
  defaults: TemplateStyle;
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'impact',
    name: 'Impact',
    description: 'Tipografia condensada, branco sobre preto',
    defaults: {
      bg: '#000000',
      bg2: null,
      fg: '#ffffff',
      accent: '#ef4444',
      align: 'left',
      uppercase: true,
      maxChars: 12,
      emphasis: false,
    },
  },
  {
    id: 'duo',
    name: 'Duo',
    description: 'Bloco em caixa-alta com script sobreposto',
    defaults: {
      bg: '#000000',
      bg2: null,
      fg: '#ffd1d8',
      accent: '#ff1a1a',
      align: 'left',
      uppercase: true,
      maxChars: 14,
      emphasis: true,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Serifada elegante em fundo claro',
    defaults: {
      bg: '#f4efe6',
      bg2: null,
      fg: '#18181b',
      accent: '#b91c1c',
      align: 'left',
      uppercase: false,
      maxChars: 22,
      emphasis: true,
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Gradiente vibrante, texto centralizado',
    defaults: {
      bg: '#ff7a59',
      bg2: '#5b1a8f',
      fg: '#ffffff',
      accent: '#ffe27a',
      align: 'center',
      uppercase: true,
      maxChars: 16,
      emphasis: false,
    },
  },
];

export function getTemplate(id: TemplateId): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function applyTemplate(design: Design, id: TemplateId): Design {
  return { ...design, ...getTemplate(id).defaults, template: id, scale: 1 };
}

export const DEFAULT_DESIGN: Design = {
  ...TEMPLATES[1].defaults,
  template: 'duo',
  ratio: '4:5',
  scale: 1,
  showCredit: true,
  credit: '',
};

export function backgroundOf(d: Pick<Design, 'bg' | 'bg2'>): string {
  return d.bg2 ? `linear-gradient(160deg, ${d.bg} 0%, ${d.bg2} 100%)` : d.bg;
}
