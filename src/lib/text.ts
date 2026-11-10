import type { Slide } from './types';

/** Linhas em branco separam os slides do carrossel. */
export function splitSlides(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n[ \t]*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Quebra uma linha em partes de até `maxChars` caracteres. */
function wrapLine(line: string, maxChars: number): string[] {
  const out: string[] = [];
  let current = '';
  for (const word of line.split(/\s+/)) {
    if (!current) current = word;
    else if (current.length + 1 + word.length <= maxChars) current += ' ' + word;
    else {
      out.push(current);
      current = word;
    }
  }
  if (current) out.push(current);
  return out;
}

/**
 * Converte um bloco em grupos: cada linha digitada vira um grupo, que pode
 * ocupar várias linhas visuais. Os grupos são a unidade do efeito de foco.
 */
export function wrapGroups(block: string, maxChars: number): Slide {
  const groups: Slide = [];
  for (const raw of block.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    groups.push(wrapLine(line, maxChars));
  }
  return groups;
}

export function slugify(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'lyric-card'
  );
}
