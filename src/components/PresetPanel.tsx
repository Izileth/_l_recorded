import { useState } from 'react';
import type { Design } from '../lib/types';
import {
  type LayoutPreset,
  createPreset,
  formatPresetDate,
  loadPresets,
  savePresets,
} from '../scripts/presets';
import { Button, Section } from './ui';
import { BookmarkIcon, CheckIcon, TrashIcon } from './Icons';

interface Props {
  design: Design;
  onApplyPreset: (savedDesign: Omit<Design, 'bgImage'>) => void;
  onNotify?: (msg: string) => void;
}

export function PresetPanel({ design, onApplyPreset, onNotify }: Props) {
  const [presets, setPresets] = useState<LayoutPreset[]>(() => loadPresets());
  const [nameInput, setNameInput] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleSave() {
    const finalName = nameInput.trim() || `Layout ${presets.length + 1}`;
    const newPreset = createPreset(finalName, design);
    const updated = [newPreset, ...presets];
    setPresets(updated);
    savePresets(updated);
    setNameInput('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
    onNotify?.(`Layout "${finalName}" salvo!`);
  }

  function handleApply(preset: LayoutPreset) {
    onApplyPreset(preset.design);
    onNotify?.(`Layout "${preset.name}" aplicado!`);
  }

  function handleDelete(id: string, name: string) {
    if (confirmDeleteId === id) {
      const updated = presets.filter((p) => p.id !== id);
      setPresets(updated);
      savePresets(updated);
      setConfirmDeleteId(null);
      onNotify?.(`Layout "${name}" removido.`);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((current) => (current === id ? null : current));
      }, 3500);
    }
  }

  return (
    <div className="space-y-5 min-w-0 max-w-full">
      {/* ── Salvar novo layout ── */}
      <Section title="Salvar Layout Atual">
        <div className="space-y-2.5 min-w-0 max-w-full">
          <div className="flex gap-2 min-w-0">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder="Nome do layout (ex: Minimal Branco)"
              className="min-w-0 flex-1 rounded-lg bg-zinc-900 px-3 py-2 text-xs sm:text-sm outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-zinc-600"
            />
            <Button
              variant="primary"
              onClick={handleSave}
              className="shrink-0 px-3 py-2 text-xs"
              title="Salvar layout atual como preset"
            >
              {justSaved ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Salvo!</span>
                </>
              ) : (
                <>
                  <BookmarkIcon className="h-4 w-4" />
                  <span>Salvar</span>
                </>
              )}
            </Button>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Salva template, proporção, cores, fontes, alinhamentos e ajustes para você resgatar quando quiser.
          </p>
        </div>
      </Section>

      {/* ── Presets salvos ── */}
      <Section
        title={`Layouts Salvos (${presets.length})`}
        aside={
          presets.length > 0 ? (
            <span className="text-[10px] text-zinc-600">Salvos neste navegador</span>
          ) : null
        }
      >
        {presets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-5 text-center">
            <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-lg bg-zinc-800/80 text-zinc-400">
              <BookmarkIcon className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="text-xs font-medium text-zinc-300">Nenhum layout salvo ainda</p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Configure as cores, fontes e estilo desejados e clique em <b>Salvar</b> acima.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 min-w-0 max-w-full">
            {presets.map((preset) => {
              const d = preset.design;
              const isConfirming = confirmDeleteId === preset.id;
              const bgPreview = d.bg2
                ? `linear-gradient(135deg, ${d.bg}, ${d.bg2})`
                : d.bg;

              return (
                <li
                  key={preset.id}
                  className="flex min-w-0 max-w-full items-center justify-between gap-2 rounded-xl bg-zinc-900/90 p-2.5 ring-1 ring-zinc-800 hover:ring-zinc-700 transition"
                >
                  {/* Mini preview de cores */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/10 shadow-sm overflow-hidden"
                    style={{ background: bgPreview, color: d.fg }}
                    title={`Fundo: ${d.bg} | Texto: ${d.fg}`}
                  >
                    <span className="text-[11px] font-bold" style={{ color: d.accent }}>
                      Aa
                    </span>
                  </div>

                  {/* Informações */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-zinc-200">{preset.name}</p>
                    <p className="truncate text-[10px] text-zinc-500">
                      {d.template.toUpperCase()} · {d.ratio} · {formatPresetDate(preset.createdAt)}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleApply(preset)}
                      className="rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-medium text-red-300 ring-1 ring-red-500/30 hover:bg-red-500 hover:text-white transition"
                      title="Aplicar este layout agora"
                    >
                      Resgatar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(preset.id, preset.name)}
                      className={`rounded-lg p-1.5 transition ${
                        isConfirming
                          ? 'bg-red-600 text-white font-bold text-[10px] px-2'
                          : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'
                      }`}
                      title={isConfirming ? 'Clique para confirmar exclusão' : 'Excluir layout'}
                    >
                      {isConfirming ? 'Excluir?' : <TrashIcon className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}
