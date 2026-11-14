import { toJpeg, toPng } from 'html-to-image';
import JSZip from 'jszip';
import type { ExportOptions } from '../constants/export';

export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export async function cardToBlob(
  node: HTMLElement,
  width: number,
  height: number,
  { format, scale }: ExportOptions,
): Promise<Blob> {
  const render = () =>
    format === 'jpg'
      ? toJpeg(node, { width, height, pixelRatio: scale, quality: 0.95, cacheBust: true })
      : toPng(node, { width, height, pixelRatio: scale, cacheBust: true });
  // A primeira chamada aquece o cache de fontes/imagens (evita texto sem fonte no Safari).
  await render().catch(() => undefined);
  const res = await fetch(await render());
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function zipBlobs(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.blob);
  return zip.generateAsync({ type: 'blob' });
}

export async function copyImage(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') return false;
    // A área de transferência só aceita PNG de forma confiável.
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
    return true;
  } catch {
    return false;
  }
}
