export type TemplateId = 'impact' | 'duo' | 'minimal' | 'sunset' | 'spotify' | 'editorial';
export type RatioId = '1:1' | '4:5' | '9:16';
export type Align = 'left' | 'center' | 'right';
export type VAlign = 'top' | 'center' | 'bottom';

export type FontMainId =
  | 'anton'
  | 'bebas'
  | 'oswald'
  | 'archivo'
  | 'montserrat'
  | 'poppins'
  | 'grotesk'
  | 'inter'
  | 'playfair'
  | 'dmserif'
  | 'abril';

export type FontAccentId = 'yellowtail' | 'pacifico' | 'dancing' | 'marker' | 'kaushan' | 'caveat';

/** Como a última linha é destacada: só cor, fonte manuscrita sobreposta ou itálico. */
export type EmphasisStyle = 'color' | 'script' | 'italic';

export interface LyricLine {
  id: number;
  /** Tempo em segundos (apenas para arquivos .lrc). */
  time: number | null;
  /** Texto da linha. Vazio = separador de estrofe. */
  text: string;
}

export interface LyricsMeta {
  title?: string;
  artist?: string;
}

export interface Design {
  template: TemplateId;
  ratio: RatioId;

  // Cores
  bg: string;
  /** Segunda cor do fundo. Quando definida, vira gradiente. */
  bg2: string | null;
  fg: string;
  accent: string;

  // Tipografia
  fontMain: FontMainId;
  fontAccent: FontAccentId;
  uppercase: boolean;
  /** Multiplicador do espaçamento entre linhas (0.8 – 1.4). */
  lineHeight: number;
  /** Espaçamento entre letras, em em (-0.04 – 0.2). */
  tracking: number;
  /** Largura máxima (em caracteres) antes da quebra automática de linha. */
  maxChars: number;
  /** Multiplicador do tamanho automático da fonte (0.4 – 1). */
  scale: number;

  // Layout
  align: Align;
  valign: VAlign;
  quote: boolean;

  // Destaques
  emphasis: boolean;
  emphasisStyle: EmphasisStyle;
  /** Efeito "Spotify": uma linha em foco, as outras esmaecidas. */
  focus: boolean;
  /** Opacidade das linhas fora de foco (0.1 – 0.8). */
  focusDim: number;

  // Imagem de fundo
  bgImage: string | null;
  /** Escurecimento da imagem (0 – 0.9). */
  overlay: number;
  /** Desfoque da imagem em px (0 – 24). */
  blur: number;
  bgZoom: number;
  /** Posição da imagem em % (0 – 100). */
  bgX: number;
  bgY: number;

  // Crédito
  showCredit: boolean;
  credit: string;
}

/** Um slide é uma lista de grupos; cada grupo é uma linha da letra já quebrada. */
export type Slide = string[][];
