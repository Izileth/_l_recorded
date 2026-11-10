import { toPng } from 'html-to-image';
import JSZip from 'jszip';

export const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

export async function cardToBlob(node: HTMLElement, width: number, height: number): Promise<Blob> {
  const options = { width, height, pixelRatio: 1, cacheBust: true } as const;
  // A primeira chamada aquece o cache de fontes/imagens (evita texto sem fonte no Safari).
  await toPng(node, options).catch(() => undefined);
  const dataUrl = await toPng(node, options);
  const res = await fetch(dataUrl);
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
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch {
    return false;
  }
}
