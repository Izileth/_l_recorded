export type ExportFormat = 'png' | 'jpg';

export interface ExportOptions {
  format: ExportFormat;
  /** Multiplicador de resolução (1 = 1080 px de largura). */
  scale: 1 | 2;
}

export const DEFAULT_EXPORT: ExportOptions = { format: 'png', scale: 1 };
