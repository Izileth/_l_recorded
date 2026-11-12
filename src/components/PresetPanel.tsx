import { useState } from 'react';
import type { Design } from '../lib/types';
import type { Preset } from '../lib/presets';
import { createPreset, formatPresetDate, loadPresets, savePresets } from '../lib/presets';
import { Section, Button } from './ui';
import { TrashIcon, BookmarkIcon } from './Icons';

interface Props {
  design: Design;
  onLoad: (design: Omit<Design, 'bgImage'>) => void;
}

export function PresetPanel({ design, onLoad }: Props) {
  const [presets, setPresets] = useState<Preset[]>(() => loadPresets());
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function handleSave() {
    if (!nameInput.trim()) {
      setSaving(true);
      return;
    }
    doSave(nameInput);
  }

  function doSave(name: string) {
    const preset = createPreset(name, design);
    const next = [preset, ...presets];
    setPresets(next);
    savePresets(next);
    setNameInput('');
    setSaving(false);
  }

  function handleLoad(p: Preset) {
    onLoad(p.design);
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      const next = presets.filter((p) => p.id !== id);
      setPresets(next);
      savePresets(next);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }

  return (
    <div className="space-y-5">
      {/* Salvar preset atual */}
      <Section title="Salvar layout atual">
        <div className="space-y-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            placeholder="Nome do preset (ex: Noite Preta)"
            className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-zinc-600"
          />
          {saving && !nameInput.trim() && (
            <p className="text-xs text-red-400">Digite um nome para o preset.</p>
          )}
          <Button onClick={handleSave} className="w-full justify-center">
            <BookmarkIcon className="h-4 w-4 text-zinc-400" />
            <span>Salvar como preset</span>
          </Button>
        </div>
        <p className="text-xs text-zinc-500">
          A imagem de fundo não é salva (ocupa muito espaço). Todas as outras configurações são preservadas.
        </p>
      </Section>

      {/* Lista de presets salvos */}
      <Section title={`Presets salvos${presets.length ? ` (${presets.length})` : ''}`}>
        {presets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-4 text-center">
            <p className="text-sm text-zinc-500">Nenhum preset salvo ainda.</p>
            <p className="mt-1 text-xs text-zinc-600">Salve o layout atual para começar.</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {presets.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 ring-1 ring-zinc-800"
              >
                {/* Mini preview das cores */}
                <span
                  className="h-7 w-7 shrink-0 rounded-md ring-1 ring-white/10"
                  style={{
                    background: p.design.bg2
                      ? `linear-gradient(135deg, ${p.design.bg}, ${p.design.bg2})`
                      : p.design.bg,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-100">{p.name}</div>
                  <div className="text-[10px] text-zinc-500">{formatPresetDate(p.createdAt)}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleLoad(p)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    title={confirmDelete === p.id ? 'Clique novamente para confirmar' : 'Remover preset'}
                    className={`rounded-md p-1.5 transition ${
                      confirmDelete === p.id
                        ? 'bg-red-500/20 text-red-400'
                        : 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
