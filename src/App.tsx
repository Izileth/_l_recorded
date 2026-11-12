import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Design, LyricLine, Slide, TemplateId } from './lib/types';
import { DEFAULT_DESIGN, RATIOS, applyTemplate, randomCombo } from './lib/templates';
import { SAMPLE_LRC, buildSnippet, parseLyrics, readTextFile } from './lib/lrc';
import { slugify, splitSlides, wrapGroups } from './lib/text';
import { cardToBlob, copyImage, downloadBlob, nextFrame, zipBlobs, type ExportOptions } from './lib/export';
import { ensureFonts } from './lib/fonts';
import { fileToDataUrl } from './lib/image';
import { Card } from './components/Card';
import { DesignPanel } from './components/DesignPanel';
import { LyricsPanel } from './components/LyricsPanel';
import { Preview } from './components/Preview';
import { SnippetEditor } from './components/SnippetEditor';
import { Logo } from './components/Logo';
import { ChevronDownIcon, FileTextIcon, ImageIcon, UploadCloudIcon, UploadIcon } from './components/Icons';

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
  const [globalDragging, setGlobalDragging] = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const dragCounter = useRef(0);
  const headerLyricsInputRef = useRef<HTMLInputElement>(null);
  const headerImageInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu de upload ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUploadMenuOpen(false);
      }
    }
    if (uploadMenuOpen) {
      window.addEventListener('pointerdown', handleClickOutside);
    }
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [uploadMenuOpen]);

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

  const handleImport = useCallback(
    (raw: string, name: string, options?: { loadIntoSnippet?: boolean }) => {
      const parsed = parseLyrics(raw, name);
      if (!parsed.lines.length) {
        showToast('Não encontrei texto nesse arquivo.');
        return;
      }
      setLyrics(parsed.lines);
      setFileName(name);

      const { title, artist } = parsed.meta;
      const credit = [title, artist].filter(Boolean).join(' — ');
      if (credit) patchDesign({ credit });

      const shouldLoadSnippet =
        options?.loadIntoSnippet ?? (text.trim() === 'Another\nLevel' || text.trim() === '');

      const validLines = parsed.lines.filter((l) => l.text);

      if (shouldLoadSnippet) {
        const fullSnippet = parsed.lines.map((l) => l.text).join('\n');
        setText(fullSnippet);
        setSelected(new Set(validLines.map((l) => l.id)));
        setFocusMap({});
        setIndex(0);
        showToast(`"${name}" carregado com sucesso (${validLines.length} linhas)!`);
      } else {
        setSelected(new Set());
        showToast(`${validLines.length} linhas importadas da letra`);
      }
    },
    [patchDesign, showToast, text],
  );

  const handleFile = useCallback(
    async (file: File, options?: { loadIntoSnippet?: boolean }) => {
      const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(file.name);
      if (isImg) {
        await handleImage(file);
        showToast(`Imagem "${file.name}" definida como fundo!`);
        return;
      }

      try {
        const raw = await readTextFile(file);
        handleImport(raw, file.name, options);
      } catch {
        showToast('Não consegui ler esse arquivo do seu dispositivo.');
      }
    },
    [handleImage, handleImport, showToast],
  );

  // Arraste e solte global para arquivos (.txt, .lrc, imagens)
  useEffect(() => {
    function onDragEnter(e: globalThis.DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        dragCounter.current++;
        setGlobalDragging(true);
      }
    }
    function onDragLeave(e: globalThis.DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current <= 0) {
          dragCounter.current = 0;
          setGlobalDragging(false);
        }
      }
    }
    function onDragOver(e: globalThis.DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
      }
    }
    function onDrop(e: globalThis.DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        dragCounter.current = 0;
        setGlobalDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
          void handleFile(file, { loadIntoSnippet: true });
        }
      }
    }

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [handleFile]);

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
      {/* ── Header ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-900 px-3 py-2.5 sm:px-5 sm:py-3.5">
        <div className="flex min-w-0 overflow-hidden items-center gap-2">
          <div className="flex shrink-0 items-center">
            <Logo size="md" showLabel={false} />
            <span className="text-[14px] font-semibold tracking-tight sm:text-[15px]">ON | Player</span>
          </div>
          <span className="hidden text-xs text-zinc-600 sm:inline">|</span>
          <p className="hidden text-xs text-zinc-500 sm:block">Transforme trechos de música em posts</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Inputs invisíveis para o upload via header */}
          <input
            ref={headerLyricsInputRef}
            type="file"
            accept=".txt,.lrc,.text,.md,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f, { loadIntoSnippet: true });
              e.target.value = '';
            }}
          />
          <input
            ref={headerImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImage(f);
              e.target.value = '';
            }}
          />

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setUploadMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-200 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-white transition sm:gap-2 sm:px-3"
              title="Fazer upload de itens do seu dispositivo"
            >
              <UploadIcon className="h-4 w-4 shrink-0 text-red-500" />
              {/* Texto completo em sm+, apenas ícone em xs */}
              <span className="hidden sm:inline">Upload do dispositivo</span>
              <span className="sm:hidden">Upload</span>
              <ChevronDownIcon className={`h-3 w-3 shrink-0 text-zinc-400 transition-transform ${uploadMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {uploadMenuOpen && (
              /* max-w + left-auto garante que não saia da viewport em mobile */
              <div className="absolute right-0 top-full mt-2 z-50 w-[min(256px,calc(100vw-24px))] rounded-xl bg-zinc-900 p-1.5 shadow-2xl ring-1 ring-zinc-800 backdrop-blur">
                <button
                  type="button"
                  onClick={() => {
                    setUploadMenuOpen(false);
                    headerLyricsInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-red-500/15 text-red-400">
                    <FileTextIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-medium text-zinc-100">Documento de letra (.txt / .lrc)</div>
                    <div className="text-[11px] text-zinc-500">Carrega a letra e o trecho</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUploadMenuOpen(false);
                    headerImageInputRef.current?.click();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-blue-500/15 text-blue-400">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="font-medium text-zinc-100">Imagem de fundo</div>
                    <div className="text-[11px] text-zinc-500">PNG, JPG ou WEBP</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="grid min-h-0 flex-1 gap-4 p-3 sm:gap-5 sm:p-4 lg:grid-cols-[340px_minmax(0,1fr)_320px] lg:p-5">
        {/* Preview primeiro em mobile (order-first), último no layout lg */}
        <section className="order-first min-h-0 min-w-0 lg:order-none">
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
            onDocument={(file) => void handleFile(file, { loadIntoSnippet: true })}
          />
        </section>

        <aside className="min-h-0 min-w-0 space-y-6 lg:space-y-7 lg:overflow-y-auto lg:pr-1">
          <SnippetEditor
            text={text}
            onChange={(v) => {
              setText(v);
              setSelected(new Set());
            }}
            slideCount={slides.length}
            onUploadFile={(file) => void handleFile(file, { loadIntoSnippet: true })}
          />
          <LyricsPanel
            lyrics={lyrics}
            selected={selected}
            onSelect={handleSelect}
            onImport={(raw, name) => handleImport(raw, name)}
            onLoadSample={() => handleImport(SAMPLE_LRC, 'exemplo.lrc', { loadIntoSnippet: true })}
            onClear={clearLyrics}
            fileName={fileName}
          />
        </aside>

        <aside className="min-h-0 min-w-0 lg:overflow-y-auto lg:pl-1">
          <DesignPanel
            design={design}
            onChange={patchDesign}
            onTemplate={pickTemplate}
            onImage={handleImage}
            onRandom={randomize}
          />
        </aside>
      </main>

      {/* ── Footer — oculto em mobile para economizar espaço ── */}
      <footer className="hidden shrink-0 items-center justify-between border-t border-zinc-900 bg-zinc-950/60 px-5 py-2.5 text-xs text-zinc-500 sm:flex">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Logo size="md" showLabel={false} />
            <span className="text-[15px] font-semibold tracking-tight">ON | Player</span>
          </div>
          <span className="hidden text-zinc-600 sm:inline">|</span>
          <span className="hidden text-zinc-500 sm:inline">Transforme trechos de música em posts</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <span>Criador de cards para redes sociais</span>
        </div>
      </footer>

      {exporting && (
        <div ref={stageRef} aria-hidden style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
          {slides.map((slide, i) => (
            <Card key={i} slide={slide} design={design} fontsTick={fontsTick} focusIndex={focusMap[i]} dataCard />
          ))}
        </div>
      )}

      {globalDragging && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm border-2 border-dashed border-red-500 p-6 text-center pointer-events-none">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-red-500/20 text-red-400 mb-4 animate-bounce">
            <UploadCloudIcon className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Solte seus arquivos aqui</h3>
          <p className="max-w-md text-sm text-zinc-300">
            Documentos <b>.txt</b> e <b>.lrc</b> serão importados como letra e carregados no trecho. Imagens serão aplicadas ao fundo do card.
          </p>
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
