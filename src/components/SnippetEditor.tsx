import { Section } from './ui';

interface Props {
  text: string;
  onChange: (v: string) => void;
  slideCount: number;
}

export function SnippetEditor({ text, onChange, slideCount }: Props) {
  const lineCount = text.split('\n').filter((l) => l.trim()).length;

  return (
    <Section
      title="Seu trecho"
      aside={
        text ? (
          <button onClick={() => onChange('')} className="text-xs text-zinc-500 hover:text-zinc-200">
            Limpar
          </button>
        ) : null
      }
    >
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        spellCheck={false}
        placeholder={'Digite ou cole o trecho aqui…\n\nDeixe uma linha em branco para criar outro slide.'}
        className="w-full resize-y rounded-xl bg-zinc-900 px-3.5 py-3 text-[15px] leading-relaxed outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-zinc-600"
      />
      <p className="text-xs text-zinc-500">
        {lineCount} {lineCount === 1 ? 'linha' : 'linhas'} · {slideCount} {slideCount === 1 ? 'slide' : 'slides'}
        <span className="text-zinc-600"> — linha em branco separa os slides</span>
      </p>
    </Section>
  );
}
