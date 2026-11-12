import { useRef, useState, type DragEvent } from 'react';
import { Section } from './ui';
import { UploadIcon } from './Icons';

interface Props {
  text: string;
  onChange: (v: string) => void;
  slideCount: number;
  onUploadFile?: (file: File) => void;
}

export function SnippetEditor({ text, onChange, slideCount, onUploadFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const lineCount = text.split('\n').filter((l) => l.trim()).length;

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && onUploadFile) {
      onUploadFile(file);
    }
  }

  return (
    <Section
      title="Seu trecho"
      aside={
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {onUploadFile && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.lrc,.text,.md,text/plain"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadFile(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition shrink-0"
                title="Carregar arquivo .txt ou .lrc do seu dispositivo"
              >
                <UploadIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upload .txt/.lrc</span>
                <span className="sm:hidden">Upload</span>
              </button>
            </>
          )}
          {text ? (
            <button
              onClick={() => onChange('')}
              className="rounded-md px-2 py-1 text-xs text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition shrink-0"
            >
              Limpar
            </button>
          ) : null}
        </div>
      }
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative min-w-0 max-w-full rounded-xl transition ${dragging ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-zinc-950' : ''}`}
      >
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          spellCheck={false}
          placeholder={'Digite, cole ou arraste um arquivo .txt / .lrc aqui…\n\nDeixe uma linha em branco para criar outro slide.'}
          className="w-full min-w-0 max-w-full resize-y rounded-xl bg-zinc-900 px-3.5 py-3 text-[14px] sm:text-[15px] leading-relaxed outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-zinc-600 [overflow-wrap:anywhere]"
        />
        {dragging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-red-950/80 text-xs font-semibold text-red-200 backdrop-blur-xs">
            Solte o arquivo .txt ou .lrc para carregar o trecho
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        {lineCount} {lineCount === 1 ? 'linha' : 'linhas'} · {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
        <span className="text-zinc-600"> — linha em branco separa os slides</span>
      </p>
    </Section>
  );
}
