import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Design, LyricLine, TemplateId } from './lib/types';
import { DEFAULT_DESIGN, RATIOS, applyTemplate } from './lib/templates';
import { SAMPLE_LRC, buildSnippet, parseLyrics } from './lib/lrc';
import { slugify, splitSlides, wrapBlock } from './lib/text';
import { cardToBlob, copyImage, downloadBlob, nextFrame, zipBlobs } from './lib/export';
import { Card } from './components/Card';
import { DesignPanel } from './components/DesignPanel';
import { LyricsPanel } from './components/LyricsPanel';
import { Preview } from './components/Preview';
import { SnippetEditor } from './components/SnippetEditor';

const STORAGE_KEY = 'lyricards:v1';

interface Persisted {
  text: string;
  design: Design;
  lyrics: LyricLine[];
  fileName: string;
}

function load(): Persisted {
  const fallback: Persisted = { text: 'Another\nLevel', design: DEFAULT_DESIGN, lyrics: [], fileName: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<Persisted>;
    return {
      text: typeof data.text === 'string' ? data.text : fallback.text,
      design: { ...DEFAULT_DESIGN, ...(data.design ?? {}) },
      lyrics: Array.isArray(data.lyrics) ? data.lyrics : [],
      fileName: data.fileName ?? '',
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const initial = useMemo(load, []);
  const [text, setText] = useState(initial.text);
  const [design, setDesign] = useState<Design>(initial.design);
  const [lyrics, setLyrics] = useState<LyricLine[]>(initial.lyrics);
  const [fileName, setFileName] = useState(initial.fileName);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [index, setIndex] = useState(0);
  const [fontsTick, setFontsTick] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Fontes: força o recálculo do ajuste automático quando carregarem.
  useEffect(() => {
    const loads = [
      document.fonts.load("100px 'Anton'", 'Aa'),
      document.fonts.load("100px 'Yellowtail'", 'Aa'),
      document.fonts.load("500 100px 'Playfair Display'", 'Aa'),
      document.fonts.load("italic 500 100px 'Playfair Display'", 'Aa'),
      document.fonts.load("500 24px 'Inter'", 'Aa'),
    ];
    Promise.allSettled(loads)
      .then(() => document.fonts.ready)
      .then(() => setFontsTick((t) => t + 1));
  }, []);

  // Persistência local.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const data: Persisted = { text, design, lyrics, fileName };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* armazenamento cheio ou bloqueado: ignora */
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [text, design, lyrics, fileName]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
  }, []);

  const slides = useMemo(
    () => splitSlides(text).map((block) => wrapBlock(block, design.maxChars)).filter((s) => s.length),
    [text, design.maxChars],
  );
  const safeIndex = Math.min(index, Math.max(0, slides.length - 1));

  const patchDesign = useCallback((patch: Partial<Design>) => setDesign((d) => ({ ...d, ...patch })), []);
  const pickTemplate = useCallback(
    (id: TemplateId) => setDesign((d) => applyTemplate(d, id)),
    [],
  );

  function handleSelect(next: Set<number>) {
    setSelected(next);
    setText(buildSnippet(lyrics, next));
    setIndex(0);
  }

  function handleImport(raw: string, name: string) {
    const parsed = parseLyrics(raw);
    if (!parsed.lines.length) {
      showToast('Não encontrei texto nesse arquivo.');
      return;
    }
    setLyrics(parsed.lines);
    setFileName(name);
    setSelected(new Set());
    const { title, artist } = parsed.meta;
    const credit = [title, artist].filter(Boolean).join(' — ');
    if (credit) patchDesign({ credit });
    showToast(`${parsed.lines.filter((l) => l.text).length} linhas importadas`);
  }

  function handleSample() {
    handleImport(SAMPLE_LRC, 'exemplo.lrc');
  }

  function clearLyrics() {
    setLyrics([]);
    setSelected(new Set());
    setFileName('');
  }

  // Exportação: monta os cards em tamanho real fora da tela e converte em PNG.
  async function renderBlobs(only?: number) {
    setExporting(true);
    await nextFrame();
    await nextFrame();
    await document.fonts.ready;
    await nextFrame();
    try {
      const { w, h } = RATIOS[design.ratio];
      const nodes = Array.from(stageRef.current?.querySelectorAll<HTMLElement>('[data-card]') ?? []);
      const base = slugify(design.credit || 'lyric-card');
      const targets = only === undefined ? nodes.map((n, i) => ({ n, i })) : [{ n: nodes[only], i: only }];
      const out: { name: string; blob: Blob }[] = [];
      for (const { n, i } of targets) {
        if (!n) continue;
        out.push({ name: `${base}-${String(i + 1).padStart(2, '0')}.png`, blob: await cardToBlob(n, w, h) });
      }
      return out;
    } finally {
      setExporting(false);
    }
  }

  async function onDownload() {
    try {
      const [file] = await renderBlobs(safeIndex);
      if (file) {
        downloadBlob(file.blob, file.name);
        showToast('PNG baixado');
      }
    } catch {
      showToast('Não foi possível gerar a imagem.');
    }
  }

  async function onDownloadAll() {
    try {
      const files = await renderBlobs();
      const zip = await zipBlobs(files);
      downloadBlob(zip, `${slugify(design.credit || 'lyric-card')}.zip`);
      showToast(`${files.length} imagens no ZIP`);
    } catch {
      showToast('Não foi possível gerar o ZIP.');
    }
  }

  async function onCopy() {
    try {
      const [file] = await renderBlobs(safeIndex);
      if (!file) return;
      const ok = await copyImage(file.blob);
      if (ok) showToast('Imagem copiada');
      else {
        downloadBlob(file.blob, file.name);
        showToast('Seu navegador não permite copiar — baixei o PNG');
      }
    } catch {
      showToast('Não foi possível copiar a imagem.');
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-900 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-red-500 text-[13px] font-bold text-white">L</span>
          <span className="text-[15px] font-semibold tracking-tight">Lyricards</span>
        </div>
        <p className="hidden text-xs text-zinc-500 sm:block">Transforme trechos de música em posts</p>
      </header>

      <main className="grid min-h-0 flex-1 gap-5 p-4 lg:grid-cols-[340px_minmax(0,1fr)_300px] lg:p-5">
        <aside className="min-h-0 space-y-7 lg:overflow-y-auto lg:pr-1">
          <SnippetEditor text={text} onChange={(v) => { setText(v); setSelected(new Set()); }} slideCount={slides.length} />
          <LyricsPanel
            lyrics={lyrics}
            selected={selected}
            onSelect={handleSelect}
            onImport={handleImport}
            onLoadSample={handleSample}
            onClear={clearLyrics}
            fileName={fileName}
          />
        </aside>

        <section className="order-first min-h-0 lg:order-none">
          <Preview
            slides={slides}
            index={safeIndex}
            onIndex={setIndex}
            design={design}
            fontsTick={fontsTick}
            busy={exporting}
            onDownload={onDownload}
            onDownloadAll={onDownloadAll}
            onCopy={onCopy}
          />
        </section>

        <aside className="min-h-0 lg:overflow-y-auto lg:pl-1">
          <DesignPanel design={design} onChange={patchDesign} onTemplate={pickTemplate} />
        </aside>
      </main>

      {exporting && (
        <div
          ref={stageRef}
          aria-hidden
          style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}
        >
          {slides.map((lines, i) => (
            <Card key={i} lines={lines} design={design} fontsTick={fontsTick} dataCard />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
