import { useCallback, useMemo, useRef, useState } from 'react';
import type { Design, LyricLine, Slide, TemplateId } from './lib/types';
import type { ExportOptions } from './constants/export';
import { applyTemplate, randomCombo } from './scripts/templates';
import { SAMPLE_LRC, buildSnippet, parseLyrics, readTextFile } from './scripts/lrc';
import { splitSlides, wrapGroups } from './scripts/text';
import { fileToDataUrl } from './scripts/image';
import {
  useClickOutside,
  useExport,
  useFonts,
  useGlobalDragDrop,
  useInitialState,
  usePersistence,
  useToast,
} from './hooks';
import { Card } from './components/Card';
import { DesignPanel } from './components/DesignPanel';
import { LyricsPanel } from './components/LyricsPanel';
import { Preview } from './components/Preview';
import { SnippetEditor } from './components/SnippetEditor';
import { Logo } from './components/Logo';
import { ChevronDownIcon, FileTextIcon, ImageIcon, UploadCloudIcon, UploadIcon } from './components/Icons';

export default function App() {
  const initial = useInitialState();
  const [text, setText] = useState(initial.text);
  const [design, setDesign] = useState<Design>(initial.design);
  const [lyrics, setLyrics] = useState<LyricLine[]>(initial.lyrics);
  const [fileName, setFileName] = useState(initial.fileName);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(initial.exportOptions);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [focusMap, setFocusMap] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);

  const headerLyricsInputRef = useRef<HTMLInputElement>(null);
  const headerImageInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Hooks Customizados ──
  const { toast, showToast } = useToast();
  const fontsTick = useFonts(design.fontMain, design.fontAccent);
  usePersistence({ text, design, lyrics, fileName, exportOptions });
  useClickOutside(menuRef, uploadMenuOpen, () => setUploadMenuOpen(false));

  const slides = useMemo<Slide[]>(
    () => splitSlides(text).map((block) => wrapGroups(block, design.maxChars)).filter((s) => s.length),
    [text, design.maxChars],
  );
  const safeIndex = Math.min(index, Math.max(0, slides.length - 1));

  // Hook de exportação encapsulado
  const { exporting, stageRef, onDownload, onDownloadAll, onCopy } = useExport({
    design,
    exportOptions,
    safeIndex,
    showToast,
  });

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

  // Arraste e solte global
  const globalDragging = useGlobalDragDrop(
    useCallback((file: File) => void handleFile(file, { loadIntoSnippet: true }), [handleFile]),
  );

  function clearLyrics() {
    setLyrics([]);
    setSelected(new Set());
    setFileName('');
  }

  return (
    <div className="flex min-h-screen flex-col lg:h-screen w-full max-w-full overflow-x-hidden">
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
      <main className="grid min-h-0 w-full max-w-full flex-1 gap-4 p-3 sm:gap-5 sm:p-4 lg:grid-cols-[340px_minmax(0,1fr)_320px] lg:p-5 overflow-x-hidden">
        {/* Preview primeiro em mobile (order-first), último no layout lg */}
        <section className="order-first min-h-0 min-w-0 max-w-full lg:order-none">
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

        <aside className="min-h-0 min-w-0 max-w-full space-y-6 lg:space-y-7 lg:overflow-y-auto lg:pr-1">
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

        <aside className="min-h-0 min-w-0 max-w-full lg:overflow-y-auto lg:pl-1">
          <DesignPanel
            design={design}
            onChange={patchDesign}
            onTemplate={pickTemplate}
            onImage={handleImage}
            onRandom={randomize}
            onApplyPreset={(saved) => {
              setDesign((curr) => ({
                ...curr,
                ...saved,
                bgImage: curr.bgImage,
              }));
            }}
            onNotify={showToast}
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
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 max-w-[calc(100vw-32px)] rounded-2xl bg-zinc-100 px-4 py-2 text-center text-xs sm:text-sm font-medium text-zinc-900 shadow-xl transition-all break-words [overflow-wrap:anywhere]">
          {toast}
        </div>
      )}
    </div>
  );
}
