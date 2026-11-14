import { useEffect, useRef, useState, type DragEvent } from 'react';
import type { Design, Slide } from '../lib/types';
import type { ExportOptions } from '../constants/export';
import { RATIOS } from '../constants/ratios';
import { Card } from './Card';
import { Button, Segmented } from './ui';
import { CopyIcon, DownloadIcon } from './Icons';

interface Props {
  slides: Slide[];
  index: number;
  onIndex: (i: number) => void;
  design: Design;
  fontsTick: number;
  focusIndex?: number;
  onFocus: (groupIndex: number) => void;
  busy: boolean;
  exportOptions: ExportOptions;
  onExportOptions: (o: ExportOptions) => void;
  onDownload: () => void;
  onDownloadAll: () => void;
  onCopy: () => void;
  onImage: (file: File) => void;
  onDocument?: (file: File) => void;
}

const PLACEHOLDER: Slide = [['Seu'], ['trecho'], ['aqui']];

export function Preview({
  slides,
  index,
  onIndex,
  design,
  fontsTick,
  focusIndex,
  onFocus,
  busy,
  exportOptions,
  onExportOptions,
  onDownload,
  onDownloadAll,
  onCopy,
  onImage,
  onDocument,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const { w, h } = RATIOS[design.ratio];

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      onImage(file);
    } else if (onDocument) {
      onDocument(file);
    }
  }

  const availableW = Math.max(0, box.w - 24);
  const availableH = Math.max(0, box.h - 24);
  const scale = box.w && box.h
    ? Math.min(availableW / w, availableH / h, 1)
    : typeof window !== 'undefined'
      ? Math.min((window.innerWidth - 48) / w, 0.28)
      : 0.25;
  const hasContent = slides.length > 0;
  const slide = hasContent ? slides[Math.min(index, slides.length - 1)] : PLACEHOLDER;
  const canFocus = design.focus && slide.length > 1;

  return (
    <div className="flex h-full min-h-0 w-full max-w-full flex-col gap-3 overflow-hidden">
      <div
        ref={stageRef}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex h-[55vw] min-h-[260px] max-h-[70vh] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,#18181b,#09090b)] p-3 ring-1 transition sm:h-[60vh] sm:min-h-[320px] lg:h-auto lg:max-h-none lg:flex-1 ${
          dragging ? 'ring-2 ring-red-500' : 'ring-zinc-800'
        }`}
      >
        <div
          style={{ width: Math.round(w * scale), height: Math.round(h * scale) }}
          className="shrink-0 overflow-hidden rounded-[6px] shadow-2xl shadow-black/60 max-w-full"
        >
          <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', opacity: hasContent ? 1 : 0.35 }}>
            <Card
              slide={slide}
              design={design}
              fontsTick={fontsTick}
              focusIndex={focusIndex}
              onGroupClick={canFocus ? onFocus : undefined}
            />
          </div>
        </div>
        {dragging && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/70 p-4 text-center text-sm font-medium text-zinc-100 backdrop-blur-xs">
            Solte uma imagem para o fundo ou documento (.txt/.lrc) para a letra
          </div>
        )}
      </div>

      {canFocus && <p className="text-center text-xs text-zinc-500">Clique numa linha do preview para colocá-la em foco</p>}

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onIndex((index - 1 + slides.length) % slides.length)}
            className="rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            aria-label="Slide anterior"
          >
            ‹
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => onIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-red-500' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'}`}
              />
            ))}
          </div>
          <button
            onClick={() => onIndex((index + 1) % slides.length)}
            className="rounded-md px-2 py-1 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            aria-label="Próximo slide"
          >
            ›
          </button>
          <span className="text-xs tabular-nums text-zinc-500">
            {index + 1}/{slides.length}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
        <Button variant="primary" onClick={onDownload} disabled={!hasContent || busy} className="shrink-0">
          <DownloadIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{busy ? 'Gerando…' : `Baixar ${exportOptions.format.toUpperCase()}`}</span>
        </Button>
        <Button onClick={onCopy} disabled={!hasContent || busy} className="shrink-0">
          <CopyIcon className="h-4 w-4 text-zinc-400 shrink-0" />
          <span>Copiar</span>
        </Button>
        {slides.length > 1 && (
          <Button onClick={onDownloadAll} disabled={busy} className="shrink-0">
            <DownloadIcon className="h-4 w-4 text-zinc-400 shrink-0" />
            <span className="truncate">Todos (ZIP)</span>
          </Button>
        )}
      </div>
      <div className="flex justify-center gap-2 w-full max-w-full overflow-hidden">
        <Segmented
          value={exportOptions.format}
          onChange={(format) => onExportOptions({ ...exportOptions, format })}
          options={[
            { value: 'png', label: 'PNG' },
            { value: 'jpg', label: 'JPG' },
          ]}
          className="w-24 shrink-0"
        />
        <Segmented
          value={String(exportOptions.scale) as '1' | '2'}
          onChange={(v) => onExportOptions({ ...exportOptions, scale: v === '2' ? 2 : 1 })}
          options={[
            { value: '1', label: '1×', title: '1080 px de largura' },
            { value: '2', label: '2×', title: '2160 px de largura' },
          ]}
          className="w-20 shrink-0"
        />
      </div>
    </div>
  );
}
