import type { LyricLine, LyricsMeta } from './types';

export interface ParsedLyrics {
  lines: LyricLine[];
  meta: LyricsMeta;
  format: 'lrc' | 'txt';
}

const TIME_TAG = /\[(\d{1,3}):(\d{1,2}(?:[.:]\d{1,3})?)\]/g;
const META_TAG = /^\[([a-zA-Z#]+):(.*)\]$/;
const WORD_TAG = /<\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?>/g;

function toSeconds(min: string, sec: string): number {
  return parseInt(min, 10) * 60 + parseFloat(sec.replace(':', '.'));
}

/** Converte segundos em "m:ss". */
export function formatTime(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseLrc(raw: string): ParsedLyrics {
  const meta: LyricsMeta = {};
  const found: { time: number; text: string }[] = [];

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const metaMatch = line.match(META_TAG);
    if (metaMatch && !/^\d+$/.test(metaMatch[1])) {
      const key = metaMatch[1].toLowerCase();
      const value = metaMatch[2].trim();
      if (key === 'ti' && value) meta.title = value;
      if (key === 'ar' && value) meta.artist = value;
      continue;
    }

    const times: number[] = [];
    const text = line
      .replace(TIME_TAG, (_, m: string, s: string) => {
        times.push(toSeconds(m, s));
        return '';
      })
      .replace(WORD_TAG, '')
      .trim();

    if (!times.length || !text) continue;
    for (const time of times) found.push({ time, text });
  }

  found.sort((a, b) => a.time - b.time);
  const lines = found.map((l, i) => ({ id: i, time: l.time, text: l.text }));
  return { lines, meta, format: 'lrc' };
}

function parsePlain(raw: string): ParsedLyrics {
  const lines: LyricLine[] = [];
  let lastBlank = true; // evita linhas em branco no começo

  for (const rawLine of raw.split(/\r?\n/)) {
    const text = rawLine.trim();
    if (!text) {
      if (!lastBlank) lines.push({ id: lines.length, time: null, text: '' });
      lastBlank = true;
      continue;
    }
    lines.push({ id: lines.length, time: null, text });
    lastBlank = false;
  }
  while (lines.length && !lines[lines.length - 1].text) lines.pop();
  return { lines, meta: {}, format: 'txt' };
}

/** Detecta .lrc pelo conteúdo (não só pela extensão) e converte em linhas. */
export function parseLyrics(input: string): ParsedLyrics {
  const raw = input.replace(/^﻿/, '');
  const looksLikeLrc = /^\s*\[\d{1,3}:\d{1,2}(?:[.:]\d{1,3})?\]/m.test(raw);
  const parsed = looksLikeLrc ? parseLrc(raw) : parsePlain(raw);
  // Um .lrc sem nenhuma linha válida cai para texto simples.
  if (looksLikeLrc && parsed.lines.length === 0) return parsePlain(raw);
  return parsed;
}

/**
 * Monta o texto do trecho a partir das linhas selecionadas.
 * Se entre duas linhas selecionadas existir uma estrofe nova, insere uma linha
 * em branco (que vira um novo slide).
 */
export function buildSnippet(lines: LyricLine[], selected: Set<number>): string {
  const ids = [...selected].sort((a, b) => a - b);
  const out: string[] = [];
  let prev: number | null = null;

  for (const id of ids) {
    const line = lines[id];
    if (!line || !line.text) continue;
    if (prev !== null) {
      const hasGap = lines.slice(prev + 1, id).some((l) => !l.text);
      if (hasGap) out.push('');
    }
    out.push(line.text);
    prev = id;
  }
  return out.join('\n');
}

export const SAMPLE_LRC = `[ti:Noite Sem Fim]
[ar:Artista Exemplo]
[00:08.00]Eu caí na estrada sem olhar pra trás
[00:13.50]E cada passo meu foi mais um recomeço
[00:19.00]Se o chão faltou, o vento me ensinou
[00:24.80]Que dá pra levantar mesmo sem ter ninguém
[00:31.20]Hoje eu sou o fogo que ninguém apagou
[00:36.60]Mais um nível acima do que eu fui ontem
[00:42.00]Nada vai me parar
[00:46.50]Eu me levanto outra vez
`;
