import { useEffect, useRef, useState } from 'react';
import type { Design } from '../lib/types';
import { RATIOS } from '../lib/templates';
import { Card } from './Card';
import { Button } from './ui';

interface Props {
  slides: string[][];
  index: number;
  onIndex: (i: number) => void;
  design: Design;
  fontsTick: number;
  busy: boolean;
  onDownload: () => void;
  onDownloadAll: () => void;
  onCopy: () => void;
}

export function Preview({ slides, index, onIndex, design, fontsTick, busy, onDownload, onDownloadAll, onCopy }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const { w, h } = RATIOS[design.ratio];

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const scale = box.w && box.h ? Math.min((box.w - 8) / w, (box.h - 8) / h, 1) : 0.3;
  const hasContent = slides.length > 0;
  const lines = hasContent ? slides[Math.min(index, slides.length - 1)] : ['Seu', 'trecho', 'aqui'];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div
        ref={stageRef}
        className="relative flex h-[68vh] min-h-[360px] items-center justify-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_center,#18181b,#09090b)] ring-1 ring-zinc-800 lg:h-auto lg:flex-1"
      >
        <div style={{ width: w * scale, height: h * scale }} className="shrink-0 overflow-hidden rounded-[6px] shadow-2xl shadow-black/60">
          <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: 'top left', opacity: hasContent ? 1 : 0.35 }}>
            <Card lines={lines} design={design} fontsTick={fontsTick} />
          </div>
        </div>
      </div>

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
          {busy ? 'Gerando…' : 'Baixar PNG'}
        </Button>
        <Button onClick={onCopy} disabled={!hasContent || busy}>
          Copiar imagem
        </Button>
        {slides.length > 1 && (
          <Button onClick={onDownloadAll} disabled={busy}>
            Baixar todos (ZIP)
          </Button>
        )}
      </div>
    </div>
  );
}
