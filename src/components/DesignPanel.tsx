import { useRef, useState, type DragEvent } from 'react';
import type { Design, EmphasisStyle, TemplateId } from '../lib/types';
import { ACCENT_FONTS, MAIN_FONTS } from '../constants/fonts';
import { COMBOS, TEMPLATES } from '../constants/templates';
import { RATIOS } from '../constants/ratios';
import { mainFont } from '../scripts/fonts';
import { backgroundOf } from '../scripts/templates';
import { Button, ColorField, Section, Segmented, Slider, Toggle } from './ui';
import { SurpriseIcon } from './Icons';
import { PresetPanel } from './PresetPanel';

interface Props {
  design: Design;
  onChange: (patch: Partial<Design>) => void;
  onTemplate: (id: TemplateId) => void;
  onImage: (file: File) => void;
  onRandom: () => void;
  onApplyPreset?: (savedDesign: Omit<Design, 'bgImage'>) => void;
  onNotify?: (msg: string) => void;
}

type Tab = 'style' | 'text' | 'background' | 'presets';

function Thumb({ id, active }: { id: TemplateId; active: boolean }) {
  const t = TEMPLATES.find((x) => x.id === id)!;
  const d = t.defaults;
  const font = mainFont(d.fontMain);
  return (
    <div
      className={`flex h-[64px] items-center justify-center overflow-hidden rounded-lg ring-2 transition ${active ? 'ring-red-500' : 'ring-transparent group-hover:ring-zinc-600'
        }`}
      style={{ background: backgroundOf(d), color: d.fg }}
    >
      {id === 'spotify' ? (
        <div className="space-y-0.5 text-left leading-none" style={{ fontFamily: font.family, fontWeight: font.weight }}>
          <div className="text-[10px] opacity-40">Linha antes</div>
          <div className="text-[13px]">Em foco</div>
          <div className="text-[10px] opacity-40">Linha depois</div>
        </div>
      ) : (
        <div className="text-center text-xl leading-none" style={{ fontFamily: font.family, fontWeight: font.weight }}>
          {d.uppercase ? 'AA' : 'Aa'}
          <div className="text-sm" style={{ color: d.accent, fontStyle: d.emphasisStyle === 'italic' ? 'italic' : 'normal' }}>
            {d.uppercase ? 'BB' : 'bb'}
          </div>
        </div>
      )}
    </div>
  );
}

function FontGrid<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; name: string; family: string; weight: number }[];
  onChange: (id: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`rounded-lg bg-zinc-900 px-2.5 py-2 text-left transition ${value === f.id ? 'ring-2 ring-red-500' : 'ring-1 ring-zinc-800 hover:ring-zinc-600'
            }`}
        >
          <span
            className="block truncate text-[19px] leading-tight text-zinc-100"
            style={{ fontFamily: f.family, fontWeight: f.weight }}
          >
            Aa Ritmo
          </span>
          <span className="block truncate text-[10px] text-zinc-500">{f.name}</span>
        </button>
      ))}
    </div>
  );
}

const EMPHASIS_OPTIONS: { value: EmphasisStyle; label: string }[] = [
  { value: 'color', label: 'Cor' },
  { value: 'script', label: 'Manuscrita' },
  { value: 'italic', label: 'Itálico' },
];

export function DesignPanel({
  design,
  onChange,
  onTemplate,
  onImage,
  onRandom,
  onApplyPreset,
  onNotify,
}: Props) {
  const [tab, setTab] = useState<Tab>('style');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const gradient = design.bg2 !== null;

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) onImage(file);
  }

  return (
    <div className="space-y-6 min-w-0 max-w-full">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'style', label: 'Estilo' },
          { value: 'text', label: 'Texto' },
          { value: 'background', label: 'Fundo' },
          { value: 'presets', label: 'Salvos' },
        ]}
      />

      {tab === 'presets' && (
        <PresetPanel
          design={design}
          onApplyPreset={(saved) => {
            if (onApplyPreset) {
              onApplyPreset(saved);
            } else {
              onChange(saved);
            }
          }}
          onNotify={onNotify}
        />
      )}

      {tab === 'style' && (
        <>
          <Section title="Template">
            <div className="grid grid-cols-2 gap-2.5">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => onTemplate(t.id)} title={t.description} className="group space-y-1.5 text-left">
                  <Thumb id={t.id} active={design.template === t.id} />
                  <span className={`block text-xs ${design.template === t.id ? 'text-zinc-100' : 'text-zinc-500'}`}>{t.name}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section
            title="Combinações"
            aside={
              <button
                type="button"
                onClick={onRandom}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition"
                title="Gerar uma combinação visual aleatória"
              >
                <SurpriseIcon className="h-3.5 w-3.5" />
                <span>Surpreender</span>
              </button>
            }
          >
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-4">
              {COMBOS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onChange(c.patch)}
                  title={c.name}
                  className="group space-y-1 text-left"
                >
                  <span
                    className="flex h-10 items-center justify-center rounded-md text-sm ring-1 ring-white/10 transition group-hover:ring-zinc-500"
                    style={{
                      background: backgroundOf({ bg: c.patch.bg!, bg2: c.patch.bg2 ?? null }),
                      color: c.patch.fg,
                      fontFamily: mainFont(c.patch.fontMain!).family,
                      fontWeight: mainFont(c.patch.fontMain!).weight,
                    }}
                  >
                    Aa
                    <b className="ml-0.5 h-1.5 w-1.5 rounded-full" style={{ background: c.patch.accent }} />
                  </span>
                  <span className="block truncate text-[10px] text-zinc-500">{c.name}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Formato">
            <Segmented
              value={design.ratio}
              onChange={(ratio) => onChange({ ratio })}
              options={(Object.keys(RATIOS) as (keyof typeof RATIOS)[]).map((k) => ({
                value: k,
                label: RATIOS[k].label,
                title: RATIOS[k].hint,
              }))}
            />
            <p className="text-xs text-zinc-500">
              {RATIOS[design.ratio].hint} · 1080 × {RATIOS[design.ratio].h}px
            </p>
          </Section>

          <Section title="Crédito">
            <Toggle label="Mostrar música / artista" checked={design.showCredit} onChange={(showCredit) => onChange({ showCredit })} />
            <input
              value={design.credit}
              onChange={(e) => onChange({ credit: e.target.value })}
              placeholder="Ex.: Música — Artista"
              className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-zinc-600"
            />
          </Section>
        </>
      )}

      {tab === 'text' && (
        <>
          <Section title="Fonte principal">
            <FontGrid value={design.fontMain} options={MAIN_FONTS} onChange={(fontMain) => onChange({ fontMain })} />
          </Section>

          <Section title="Destaque da última linha" aside={null}>
            <Toggle label="Ativar destaque" checked={design.emphasis} onChange={(emphasis) => onChange({ emphasis })} />
            {design.emphasis && (
              <>
                <Segmented
                  value={design.emphasisStyle}
                  onChange={(emphasisStyle) => onChange({ emphasisStyle })}
                  options={EMPHASIS_OPTIONS}
                />
                {design.emphasisStyle === 'script' && (
                  <FontGrid value={design.fontAccent} options={ACCENT_FONTS} onChange={(fontAccent) => onChange({ fontAccent })} />
                )}
              </>
            )}
          </Section>

          <Section title="Foco (estilo Spotify)">
            <Toggle label="Esmaecer as outras linhas" checked={design.focus} onChange={(focus) => onChange({ focus })} />
            {design.focus ? (
              <>
                <Slider
                  label="Intensidade"
                  value={design.focusDim}
                  min={0.1}
                  max={0.8}
                  step={0.05}
                  onChange={(focusDim) => onChange({ focusDim })}
                  format={(v) => `${Math.round(v * 100)}% visível`}
                />
                <p className="text-xs text-zinc-500">Clique numa linha do preview para colocá-la em foco.</p>
              </>
            ) : (
              <p className="text-xs text-zinc-500">Funciona com 2 ou mais linhas no slide.</p>
            )}
          </Section>

          <Section title="Layout">
            <Segmented
              value={design.align}
              onChange={(align) => onChange({ align })}
              options={[
                { value: 'left', label: 'Esquerda' },
                { value: 'center', label: 'Centro' },
                { value: 'right', label: 'Direita' },
              ]}
            />
            <Segmented
              value={design.valign}
              onChange={(valign) => onChange({ valign })}
              options={[
                { value: 'top', label: 'Topo' },
                { value: 'center', label: 'Meio' },
                { value: 'bottom', label: 'Base' },
              ]}
            />
            <Toggle label="Caixa alta" checked={design.uppercase} onChange={(uppercase) => onChange({ uppercase })} />
            <Toggle label="Aspas decorativas" checked={design.quote} onChange={(quote) => onChange({ quote })} />
          </Section>

          <Section title="Ajustes finos">
            <Slider
              label="Largura da linha"
              value={design.maxChars}
              min={6}
              max={40}
              onChange={(maxChars) => onChange({ maxChars })}
              format={(v) => `${v} caract.`}
            />
            <Slider
              label="Tamanho da fonte"
              value={design.scale}
              min={0.4}
              max={1}
              step={0.05}
              onChange={(scale) => onChange({ scale })}
              format={(v) => (v >= 1 ? 'Auto' : `${Math.round(v * 100)}%`)}
            />
            <Slider
              label="Entrelinha"
              value={design.lineHeight}
              min={0.8}
              max={1.4}
              step={0.02}
              onChange={(lineHeight) => onChange({ lineHeight })}
              format={(v) => `${v.toFixed(2)}×`}
            />
            <Slider
              label="Espaço entre letras"
              value={design.tracking}
              min={-0.04}
              max={0.2}
              step={0.005}
              onChange={(tracking) => onChange({ tracking })}
              format={(v) => `${v > 0 ? '+' : ''}${(v * 100).toFixed(1)}%`}
            />
          </Section>
        </>
      )}

      {tab === 'background' && (
        <>
          <Section title="Cores">
            <div className="grid grid-cols-2 gap-2">
              <ColorField label="Texto" value={design.fg} onChange={(fg) => onChange({ fg })} />
              <ColorField label="Destaque" value={design.accent} onChange={(accent) => onChange({ accent })} />
              <ColorField label="Fundo" value={design.bg} onChange={(bg) => onChange({ bg })} />
              {gradient && <ColorField label="Fundo 2" value={design.bg2!} onChange={(bg2) => onChange({ bg2 })} />}
            </div>
            <Toggle label="Fundo em gradiente" checked={gradient} onChange={(on) => onChange({ bg2: on ? '#5b1a8f' : null })} />
          </Section>

          <Section
            title="Imagem de fundo"
            aside={
              design.bgImage ? (
                <button onClick={() => onChange({ bgImage: null })} className="text-xs text-zinc-500 hover:text-zinc-200">
                  Remover
                </button>
              ) : null
            }
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImage(f);
                e.target.value = '';
              }}
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`overflow-hidden rounded-xl border border-dashed transition ${dragging ? 'border-red-500 bg-red-500/10' : 'border-zinc-800 bg-zinc-900/40'
                }`}
            >
              {design.bgImage ? (
                <button onClick={() => fileRef.current?.click()} className="block w-full" title="Trocar imagem">
                  <img src={design.bgImage} alt="" className="h-28 w-full object-cover" />
                </button>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-zinc-300">Arraste uma imagem aqui</p>
                  <div className="mt-3 flex justify-center">
                    <Button onClick={() => fileRef.current?.click()}>Escolher imagem</Button>
                  </div>
                </div>
              )}
            </div>

            {design.bgImage ? (
              <div className="space-y-3">
                <Slider
                  label="Escurecer"
                  value={design.overlay}
                  min={0}
                  max={0.9}
                  step={0.05}
                  onChange={(overlay) => onChange({ overlay })}
                  format={(v) => `${Math.round(v * 100)}%`}
                />
                <Slider label="Desfoque" value={design.blur} min={0} max={24} onChange={(blur) => onChange({ blur })} format={(v) => `${v}px`} />
                <Slider
                  label="Zoom"
                  value={design.bgZoom}
                  min={1}
                  max={2.5}
                  step={0.05}
                  onChange={(bgZoom) => onChange({ bgZoom })}
                  format={(v) => `${v.toFixed(2)}×`}
                />
                <Slider label="Posição horizontal" value={design.bgX} min={0} max={100} onChange={(bgX) => onChange({ bgX })} format={(v) => `${v}%`} />
                <Slider label="Posição vertical" value={design.bgY} min={0} max={100} onChange={(bgY) => onChange({ bgY })} format={(v) => `${v}%`} />
                <p className="text-xs text-zinc-500">A imagem não fica salva ao fechar a página.</p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">Dica: você também pode soltar a imagem direto sobre o preview.</p>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
