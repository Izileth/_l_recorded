/** Linhas em branco separam os slides do carrossel. */
export function splitSlides(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n[ \t]*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Quebra um bloco em linhas de até `maxChars` caracteres, respeitando as
 * quebras manuais que o usuário já fez.
 */
export function wrapBlock(block: string, maxChars: number): string[] {
  const out: string[] = [];
  for (const raw of block.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
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
  }
  return out;
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
