import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Design, LyricLine, Slide, TemplateId } from './lib/types';
import { DEFAULT_DESIGN, RATIOS, applyTemplate, randomCombo } from './lib/templates';
import { SAMPLE_LRC, buildSnippet, parseLyrics } from './lib/lrc';
import { slugify, splitSlides, wrapGroups } from './lib/text';
import { cardToBlob, copyImage, downloadBlob, nextFrame, zipBlobs, type ExportOptions } from './lib/export';
import { ensureFonts } from './lib/fonts';
import { fileToDataUrl } from './lib/image';
import { Card } from './components/Card';
import { DesignPanel } from './components/DesignPanel';
import { LyricsPanel } from './components/LyricsPanel';
import { Preview } from './components/Preview';
import { SnippetEditor } from './components/SnippetEditor';

const STORAGE_KEY = 'lyricards:v2';

interface Persisted {
  text: string;
  design: Design;
  lyrics: LyricLine[];
  fileName: string;
  exportOptions: ExportOptions;
}

const DEFAULT_EXPORT: ExportOptions = { format: 'png', scale: 1 };

function load(): Persisted {
  const fallback: Persisted = {
    text: 'Another\nLevel',
    design: DEFAULT_DESIGN,
    lyrics: [],
    fileName: '',
    exportOptions: DEFAULT_EXPORT,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw) as Partial<Persisted>;
    return {
      text: typeof data.text === 'string' ? data.text : fallback.text,
      design: { ...DEFAULT_DESIGN, ...(data.design ?? {}), bgImage: null },
      lyrics: Array.isArray(data.lyrics) ? data.lyrics : [],
      fileName: data.fileName ?? '',
      exportOptions: { ...DEFAULT_EXPORT, ...(data.exportOptions ?? {}) },
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
  const [exportOptions, setExportOptions] = useState<ExportOptions>(initial.exportOptions);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [focusMap, setFocusMap] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [fontsTick, setFontsTick] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // Carrega as fontes escolhidas e força o recálculo do ajuste automático.
  useEffect(() => {
    let alive = true;
    void ensureFonts(design.fontMain, design.fontAccent).then(() => {
      if (alive) setFontsTick((t) => t + 1);
    });
    return () => {
      alive = false;
    };
  }, [design.fontMain, design.fontAccent]);

  // Persistência local (a imagem de fundo fica de fora: é pesada demais para o localStorage).
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const data: Persisted = { text, design: { ...design, bgImage: null }, lyrics, fileName, exportOptions };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* armazenamento cheio ou bloqueado: ignora */
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [text, design, lyrics, fileName, exportOptions]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  const slides = useMemo<Slide[]>(
    () => splitSlides(text).map((block) => wrapGroups(block, design.maxChars)).filter((s) => s.length),
    [text, design.maxChars],
  );
  const safeIndex = Math.min(index, Math.max(0, slides.length - 1));

  const patchDesign = useCallback((patch: Partial<Design>) => setDesign((d) => ({ ...d, ...patch })), []);
  const pickTemplate = useCallback((id: TemplateId) => setDesign((d) => applyTemplate(d, id)), []);
  const randomize = useCallback(() => setDesign((d) => ({ ...d, ...randomCombo() })), []);

  const handleImage = useCallback(
    async (file: File) => {
      try {
        const bgImage = await fileToDataUrl(file);
        setDesign((d) => ({ ...d, bgImage, overlay: d.bgImage ? d.overlay : Math.max(d.overlay, 0.45) }));
      } catch {
        showToast('Não consegui abrir essa imagem.');
      }
    },
    [showToast],
  );

  function handleSelect(next: Set<number>) {
    setSelected(next);
    setText(buildSnippet(lyrics, next));
    setFocusMap({});
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

  function clearLyrics() {
    setLyrics([]);
    setSelected(new Set());
    setFileName('');
  }

  // Exportação: monta os cards em tamanho real fora da tela e converte em imagem.
  async function renderBlobs(options: ExportOptions, only?: number) {
    setExporting(true);
    await nextFrame();
    await nextFrame();
    await ensureFonts(design.fontMain, design.fontAccent);
    await nextFrame();
    try {
      const { w, h } = RATIOS[design.ratio];
      const nodes = Array.from(stageRef.current?.querySelectorAll<HTMLElement>('[data-card]') ?? []);
      const base = slugify(design.credit || 'lyric-card');
      const targets = only === undefined ? nodes.map((n, i) => ({ n, i })) : [{ n: nodes[only], i: only }];
      const out: { name: string; blob: Blob }[] = [];
      for (const { n, i } of targets) {
        if (!n) continue;
        const name = `${base}-${String(i + 1).padStart(2, '0')}.${options.format}`;
        out.push({ name, blob: await cardToBlob(n, w, h, options) });
      }
      return out;
    } finally {
      setExporting(false);
    }
  }

  async function onDownload() {
    try {
      const [file] = await renderBlobs(exportOptions, safeIndex);
      if (file) {
        downloadBlob(file.blob, file.name);
        showToast(`${exportOptions.format.toUpperCase()} baixado`);
      }
    } catch {
      showToast('Não foi possível gerar a imagem.');
    }
  }

  async function onDownloadAll() {
    try {
      const files = await renderBlobs(exportOptions);
      const zip = await zipBlobs(files);
      downloadBlob(zip, `${slugify(design.credit || 'lyric-card')}.zip`);
      showToast(`${files.length} imagens no ZIP`);
    } catch {
      showToast('Não foi possível gerar o ZIP.');
    }
  }

  async function onCopy() {
    try {
      const [file] = await renderBlobs({ ...exportOptions, format: 'png' }, safeIndex);
      if (!file) return;
      if (await copyImage(file.blob)) showToast('Imagem copiada');
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

      <main className="grid min-h-0 flex-1 gap-5 p-4 lg:grid-cols-[340px_minmax(0,1fr)_320px] lg:p-5">
        <aside className="min-h-0 space-y-7 lg:overflow-y-auto lg:pr-1">
          <SnippetEditor
            text={text}
            onChange={(v) => {
              setText(v);
              setSelected(new Set());
            }}
            slideCount={slides.length}
          />
          <LyricsPanel
            lyrics={lyrics}
            selected={selected}
            onSelect={handleSelect}
            onImport={handleImport}
            onLoadSample={() => handleImport(SAMPLE_LRC, 'exemplo.lrc')}
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
            focusIndex={focusMap[safeIndex]}
            onFocus={(g) => setFocusMap((m) => ({ ...m, [safeIndex]: g }))}
            busy={exporting}
            exportOptions={exportOptions}
            onExportOptions={setExportOptions}
            onDownload={onDownload}
            onDownloadAll={onDownloadAll}
            onCopy={onCopy}
            onImage={handleImage}
          />
        </section>

        <aside className="min-h-0 lg:overflow-y-auto lg:pl-1">
          <DesignPanel
            design={design}
            onChange={patchDesign}
            onTemplate={pickTemplate}
            onImage={handleImage}
            onRandom={randomize}
          />
        </aside>
      </main>

      {exporting && (
        <div ref={stageRef} aria-hidden style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
          {slides.map((slide, i) => (
            <Card key={i} slide={slide} design={design} fontsTick={fontsTick} focusIndex={focusMap[i]} dataCard />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
