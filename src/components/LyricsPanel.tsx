import { useMemo, useRef, useState, type DragEvent, type MouseEvent } from 'react';
import type { LyricLine } from '../lib/types';
import { formatTime, readTextFile } from '../lib/lrc';
import { Button, Section } from './ui';
import { UploadCloudIcon } from './Icons';

interface Props {
  lyrics: LyricLine[];
  selected: Set<number>;
  onSelect: (next: Set<number>) => void;
  onImport: (raw: string, filename: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
  fileName: string;
}

export function LyricsPanel({ lyrics, selected, onSelect, onImport, onLoadSample, onClear, fileName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const anchor = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = useMemo(
    () => (q ? lyrics.filter((l) => l.text && l.text.toLowerCase().includes(q)) : lyrics),
    [lyrics, q],
  );

  async function readFile(file: File | undefined) {
    if (!file) return;
    const text = await readTextFile(file);
    onImport(text, file.name);
    anchor.current = null;
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    void readFile(e.dataTransfer.files[0]);
  }

  function clickLine(e: MouseEvent, line: LyricLine) {
    if (!line.text) return;
    const next = new Set(selected);
    if (e.shiftKey && anchor.current !== null) {
      const [a, b] = [anchor.current, line.id].sort((x, y) => x - y);
      for (let i = a; i <= b; i++) if (lyrics[i]?.text) next.add(i);
    } else if (next.has(line.id)) {
      next.delete(line.id);
    } else {
      next.add(line.id);
    }
    anchor.current = line.id;
    onSelect(next);
  }

  function selectAll() {
    const all = new Set(lyrics.filter((l) => l.text).map((l) => l.id));
    onSelect(all);
  }

  const hasLyrics = lyrics.length > 0;

  return (
    <Section
      title="Letra completa"
      aside={
        hasLyrics ? (
          <button onClick={onClear} className="text-xs text-zinc-500 hover:text-zinc-200">
            Remover
          </button>
        ) : null
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept=".lrc,.txt,.text,.md,text/plain"
        className="hidden"
        onChange={(e) => {
          void readFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {hasLyrics ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-zinc-900/80 px-3 py-2 text-xs ring-1 ring-zinc-800 min-w-0 max-w-full">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-red-500/15 text-red-400">
              📄
            </span>
            <span className="truncate font-medium text-zinc-200 min-w-0">{fileName || 'Arquivo de letra'}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition"
              title="Escolher outro arquivo do dispositivo"
            >
              Trocar
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-xl border border-dashed p-4 text-center transition ${
            dragging ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-zinc-900/40'
          }`}
        >
          <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg bg-zinc-800/80 text-zinc-400">
            <UploadCloudIcon className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-sm font-medium text-zinc-300">Upload de arquivo do seu dispositivo</p>
          <p className="text-xs text-zinc-500 mt-0.5">Arraste um documento <b>.lrc</b> ou <b>.txt</b></p>
          <div className="mt-3 flex justify-center gap-2">
            <Button onClick={() => inputRef.current?.click()}>Escolher arquivo</Button>
            <Button onClick={onLoadSample} title="Carrega uma letra fictícia para testar">
              Exemplo
            </Button>
          </div>
        </div>
      )}

      {hasLyrics && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar na letra…"
              className="min-w-0 flex-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-zinc-600"
            />
            <button
              type="button"
              onClick={selectAll}
              className="shrink-0 text-xs text-zinc-400 hover:text-zinc-200 transition"
              title="Selecionar todas as linhas para o trecho"
            >
              Todas
            </button>
            {selected.size > 0 && (
              <button
                onClick={() => onSelect(new Set())}
                className="shrink-0 text-xs text-zinc-500 hover:text-zinc-200 transition"
              >
                Limpar ({selected.size})
              </button>
            )}
          </div>
          <p className="truncate text-xs text-zinc-500 max-w-full">
            {fileName ? `${fileName} · ` : ''}Clique nas linhas para montar o card · Shift para intervalo
          </p>
          <ul className="max-h-[240px] overflow-y-auto overflow-x-hidden rounded-xl bg-zinc-900/60 p-1.5 ring-1 ring-zinc-800 sm:max-h-[300px]">
            {visible.map((line) =>
              line.text ? (
                <li key={line.id} className="min-w-0">
                  <button
                    onClick={(e) => clickLine(e, line)}
                    className={`flex w-full min-w-0 max-w-full items-start gap-2 rounded-md px-2.5 py-1.5 text-left text-sm leading-snug transition ${
                      selected.has(line.id)
                        ? 'bg-red-500/15 text-red-100 ring-1 ring-red-500/40'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {line.time !== null && (
                      <span className="mt-0.5 w-8 shrink-0 font-mono text-[10px] tabular-nums text-zinc-500">
                        {formatTime(line.time)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">{line.text}</span>
                  </button>
                </li>
              ) : q ? null : (
                <li key={line.id} aria-hidden className="h-2" />
              ),
            )}
            {visible.length === 0 && <li className="px-3 py-4 text-center text-sm text-zinc-500">Nada encontrado</li>}
          </ul>
        </div>
      )}
    </Section>
  );
}
