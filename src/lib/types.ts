export type TemplateId = 'impact' | 'duo' | 'minimal' | 'sunset';
export type RatioId = '1:1' | '4:5' | '9:16';
export type Align = 'left' | 'center' | 'right';

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
  bg: string;
  /** Segunda cor do fundo. Quando definida, vira gradiente. */
  bg2: string | null;
  fg: string;
  accent: string;
  align: Align;
  uppercase: boolean;
  /** Largura máxima (em caracteres) antes da quebra automática de linha. */
  maxChars: number;
  /** Multiplicador do tamanho automático da fonte (0.4 – 1). */
  scale: number;
  /** Destaca a última linha do trecho (cor, script ou itálico, conforme o template). */
  emphasis: boolean;
  showCredit: boolean;
  credit: string;
}
