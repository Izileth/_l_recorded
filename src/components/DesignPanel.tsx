import type { Design, TemplateId } from '../lib/types';
import {  RATIOS, TEMPLATES, backgroundOf } from '../lib/templates';
import { ColorField, Section, Segmented, Slider, Toggle } from './ui';


const FONTS = {
  script: 'cursive',
  display: 'sans-serif',
  serif: 'Georgia, serif',
  sans: 'sans-serif',
};


interface Props {
  design: Design;
  onChange: (patch: Partial<Design>) => void;
  onTemplate: (id: TemplateId) => void;
}

function Thumb({ id, active }: { id: TemplateId; active: boolean }) {
  const t = TEMPLATES.find((x) => x.id === id)!;
  const d = t.defaults;
  const isDuo = id === 'duo';
  return (
    <div
      className={`flex h-[74px] items-center justify-center overflow-hidden rounded-lg ring-2 transition ${active ? 'ring-red-500' : 'ring-transparent group-hover:ring-zinc-600'
        }`}
      style={{ background: backgroundOf(d), color: d.fg }}
    >
      <div className="text-center leading-none" style={{ fontFamily: id === 'minimal' ? FONTS.serif : FONTS.display }}>
        <div className={id === 'minimal' ? 'text-lg' : 'text-xl tracking-wide'}>{id === 'minimal' ? 'Aa' : 'AA'}</div>
        {isDuo && (
          <div className="-mt-1 text-lg" style={{ fontFamily: FONTS.script, color: d.accent }}>
            Aa
          </div>
        )}
        {id === 'minimal' && (
          <div className="text-sm italic" style={{ color: d.accent }}>
            aa
          </div>
        )}
      </div>
    </div>
  );
}

export function DesignPanel({ design, onChange, onTemplate }: Props) {
  const gradient = design.bg2 !== null;

  return (
    <div className="space-y-6">
      <Section title="Template">
        <div className="grid grid-cols-2 gap-2.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => onTemplate(t.id)}
              title={t.description}
              className="group space-y-1.5 text-left"
            >
              <Thumb id={t.id} active={design.template === t.id} />
              <span className={`block text-xs ${design.template === t.id ? 'text-zinc-100' : 'text-zinc-500'}`}>
                {t.name}
              </span>
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
        <p className="text-xs text-zinc-500">{RATIOS[design.ratio].hint} · 1080 × {RATIOS[design.ratio].h}px</p>
      </Section>

      <Section title="Texto">
        <Segmented
          value={design.align}
          onChange={(align) => onChange({ align })}
          options={[
            { value: 'left', label: 'Esquerda' },
            { value: 'center', label: 'Centro' },
            { value: 'right', label: 'Direita' },
          ]}
        />
        <Toggle label="Caixa alta" checked={design.uppercase} onChange={(uppercase) => onChange({ uppercase })} />
        <Toggle
          label="Destacar última linha"
          checked={design.emphasis}
          onChange={(emphasis) => onChange({ emphasis })}
        />
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
      </Section>

      <Section title="Cores">
        <div className="grid grid-cols-2 gap-2">
          <ColorField label="Texto" value={design.fg} onChange={(fg) => onChange({ fg })} />
          <ColorField label="Destaque" value={design.accent} onChange={(accent) => onChange({ accent })} />
          <ColorField label="Fundo" value={design.bg} onChange={(bg) => onChange({ bg })} />
          {gradient && <ColorField label="Fundo 2" value={design.bg2!} onChange={(bg2) => onChange({ bg2 })} />}
        </div>
        <Toggle
          label="Fundo em gradiente"
          checked={gradient}
          onChange={(on) => onChange({ bg2: on ? '#5b1a8f' : null })}
        />
      </Section>

      <Section title="Crédito">
        <Toggle
          label="Mostrar música / artista"
          checked={design.showCredit}
          onChange={(showCredit) => onChange({ showCredit })}
        />
        <input
          value={design.credit}
          onChange={(e) => onChange({ credit: e.target.value })}
          placeholder="Ex.: Música — Artista"
          className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm outline-none ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:ring-zinc-600"
        />
      </Section>
    </div>
  );
}
