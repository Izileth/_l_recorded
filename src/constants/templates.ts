import type { Design, TemplateId } from '../lib/types';

/** Parte do design controlada pelo template (o resto — formato, imagem, crédito — é do usuário). */
export type TemplateStyle = Omit<
  Design,
  'template' | 'ratio' | 'scale' | 'showCredit' | 'credit' | 'bgImage' | 'overlay' | 'blur' | 'bgZoom' | 'bgX' | 'bgY'
>;

const BASE: TemplateStyle = {
  bg: '#000000',
  bg2: null,
  fg: '#ffffff',
  accent: '#ef4444',
  fontMain: 'anton',
  fontAccent: 'yellowtail',
  uppercase: true,
  lineHeight: 1,
  tracking: 0,
  maxChars: 12,
  align: 'left',
  valign: 'center',
  quote: false,
  emphasis: false,
  emphasisStyle: 'color',
  focus: false,
  focusDim: 0.35,
};

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
    defaults: { ...BASE },
  },
  {
    id: 'duo',
    name: 'Duo',
    description: 'Bloco em caixa-alta com manuscrita sobreposta',
    defaults: {
      ...BASE,
      fg: '#ffd1d8',
      accent: '#ff1a1a',
      maxChars: 14,
      emphasis: true,
      emphasisStyle: 'script',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Serifada elegante em fundo claro',
    defaults: {
      ...BASE,
      bg: '#f4efe6',
      fg: '#18181b',
      accent: '#b91c1c',
      fontMain: 'playfair',
      uppercase: false,
      maxChars: 22,
      emphasis: true,
      emphasisStyle: 'italic',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Gradiente vibrante, texto centralizado',
    defaults: {
      ...BASE,
      bg: '#ff7a59',
      bg2: '#5b1a8f',
      accent: '#ffe27a',
      align: 'center',
      maxChars: 16,
    },
  },
  {
    id: 'spotify',
    name: 'Foco',
    description: 'Uma linha em destaque, as outras esmaecidas (estilo Spotify)',
    defaults: {
      ...BASE,
      bg: '#5038a0',
      accent: '#ffffff',
      fontMain: 'montserrat',
      uppercase: false,
      maxChars: 18,
      valign: 'center',
      focus: true,
      focusDim: 0.4,
    },
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Serifada marcante com aspas grandes',
    defaults: {
      ...BASE,
      bg: '#1c1917',
      fg: '#fafaf9',
      accent: '#fbbf24',
      fontMain: 'dmserif',
      uppercase: false,
      maxChars: 20,
      quote: true,
      emphasis: true,
      emphasisStyle: 'italic',
    },
  },
];

export interface Combo {
  name: string;
  patch: Partial<Design>;
}

export const COMBOS: Combo[] = [
  {
    name: 'Noir Rosé',
    patch: { fontMain: 'anton', fontAccent: 'yellowtail', emphasis: true, emphasisStyle: 'script', uppercase: true, bg: '#000000', bg2: null, fg: '#ffd1d8', accent: '#ff1a1a' },
  },
  {
    name: 'Concreto',
    patch: { fontMain: 'bebas', fontAccent: 'marker', emphasis: true, emphasisStyle: 'script', uppercase: true, bg: '#0a0a0a', bg2: null, fg: '#f5f5f5', accent: '#facc15' },
  },
  {
    name: 'Vogue',
    patch: { fontMain: 'playfair', fontAccent: 'dancing', emphasis: true, emphasisStyle: 'italic', uppercase: false, bg: '#f4efe6', bg2: null, fg: '#18181b', accent: '#b91c1c' },
  },
  {
    name: 'Neon',
    patch: { fontMain: 'archivo', fontAccent: 'pacifico', emphasis: true, emphasisStyle: 'script', uppercase: true, bg: '#0f0a1f', bg2: '#2a0f4a', fg: '#f0abfc', accent: '#22d3ee' },
  },
  {
    name: 'Praia',
    patch: { fontMain: 'poppins', fontAccent: 'caveat', emphasis: true, emphasisStyle: 'script', uppercase: false, bg: '#fde68a', bg2: '#fb923c', fg: '#1f2937', accent: '#be123c' },
  },
  {
    name: 'Violeta',
    patch: { fontMain: 'montserrat', fontAccent: 'yellowtail', emphasis: false, emphasisStyle: 'color', uppercase: false, bg: '#5038a0', bg2: null, fg: '#ffffff', accent: '#ffffff' },
  },
  {
    name: 'Âmbar',
    patch: { fontMain: 'dmserif', fontAccent: 'dancing', emphasis: true, emphasisStyle: 'italic', uppercase: false, bg: '#1c1917', bg2: null, fg: '#fafaf9', accent: '#fbbf24' },
  },
  {
    name: 'Tech',
    patch: { fontMain: 'grotesk', fontAccent: 'kaushan', emphasis: true, emphasisStyle: 'color', uppercase: true, bg: '#022c22', bg2: '#064e3b', fg: '#d1fae5', accent: '#34d399' },
  },
];

export const DEFAULT_DESIGN: Design = {
  ...TEMPLATES[1].defaults,
  template: 'duo',
  ratio: '4:5',
  scale: 1,
  bgImage: null,
  overlay: 0.45,
  blur: 0,
  bgZoom: 1,
  bgX: 50,
  bgY: 50,
  showCredit: true,
  credit: '',
};
