import { useCallback, useRef, useState } from 'react';
import type { Design } from '../lib/types';
import type { ExportOptions } from '../constants/export';
import { RATIOS } from '../constants/ratios';
import { cardToBlob, copyImage, downloadBlob, nextFrame, zipBlobs } from '../scripts/export';
import { ensureFonts } from '../scripts/fonts';
import { slugify } from '../scripts/text';

interface UseExportParams {
  design: Design;
  exportOptions: ExportOptions;
  safeIndex: number;
  showToast: (msg: string) => void;
}

export function useExport({ design, exportOptions, safeIndex, showToast }: UseExportParams) {
  const [exporting, setExporting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const renderBlobs = useCallback(
    async (options: ExportOptions, only?: number) => {
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
    },
    [design.fontMain, design.fontAccent, design.ratio, design.credit],
  );

  const onDownload = useCallback(async () => {
    try {
      const [file] = await renderBlobs(exportOptions, safeIndex);
      if (file) {
        downloadBlob(file.blob, file.name);
        showToast(`${exportOptions.format.toUpperCase()} baixado`);
      }
    } catch {
      showToast('Não foi possível gerar a imagem.');
    }
  }, [renderBlobs, exportOptions, safeIndex, showToast]);

  const onDownloadAll = useCallback(async () => {
    try {
      const files = await renderBlobs(exportOptions);
      const zip = await zipBlobs(files);
      downloadBlob(zip, `${slugify(design.credit || 'lyric-card')}.zip`);
      showToast(`${files.length} imagens no ZIP`);
    } catch {
      showToast('Não foi possível gerar o ZIP.');
    }
  }, [renderBlobs, exportOptions, design.credit, showToast]);

  const onCopy = useCallback(async () => {
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
  }, [renderBlobs, exportOptions, safeIndex, showToast]);

  return {
    exporting,
    stageRef,
    onDownload,
    onDownloadAll,
    onCopy,
  };
}
