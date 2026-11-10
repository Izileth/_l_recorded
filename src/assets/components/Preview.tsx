import { useEffect, useRef, useState, type DragEvent } from 'react';
import type { Design, Slide } from '../../lib/types';
import type { ExportOptions } from '../../lib/export';
import { RATIOS } from '../../lib/templates';
import { Card } from './Card';
import { Button, Segmented } from './ui';

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
    if (file?.type.startsWith('image/')) onImage(file);
  }

  const scale = box.w && box.h ? Math.min((box.w - 8) / w, (box.h - 8) / h, 1) : 0.3;
  const hasContent = slides.length > 0;
  const slide = hasContent ? slides[Math.min(index, slides.length - 1)] : PLACEHOLDER;
  const canFocus = design.focus && slide.length > 1;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div
        ref={stageRef}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex h-[68vh] min-h-[360px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,#18181b,#09090b)] ring-1 transition lg:h-auto lg:flex-1 ${dragging ? 'ring-2 ring-red-500' : 'ring-zinc-800'
          }`}
      >
        <div style={{ width: w * scale, height: h * scale }} className="shrink-0 overflow-hidden rounded-[6px] shadow-2xl shadow-black/60">
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
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/60 text-sm font-medium">
            Solte a imagem para usar como fundo
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

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="primary" onClick={onDownload} disabled={!hasContent || busy}>
          {busy ? 'Gerando…' : `Baixar ${exportOptions.format.toUpperCase()}`}
        </Button>
        <Button onClick={onCopy} disabled={!hasContent || busy}>
          Copiar imagem
        </Button>
        {slides.length > 1 && (
          <Button onClick={onDownloadAll} disabled={busy}>
            Baixar todos (ZIP)
          </Button>
        )}
        <div className="flex gap-2">
          <Segmented
            value={exportOptions.format}
            onChange={(format) => onExportOptions({ ...exportOptions, format })}
            options={[
              { value: 'png', label: 'PNG' },
              { value: 'jpg', label: 'JPG' },
            ]}
            className="w-24"
          />
          <Segmented
            value={String(exportOptions.scale) as '1' | '2'}
            onChange={(v) => onExportOptions({ ...exportOptions, scale: v === '2' ? 2 : 1 })}
            options={[
              { value: '1', label: '1×', title: '1080 px de largura' },
              { value: '2', label: '2×', title: '2160 px de largura' },
            ]}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}
