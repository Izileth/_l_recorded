import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Design } from '../lib/types';
import { FONTS, RATIOS, backgroundOf } from '../lib/templates';

interface CardProps {
  /** Linhas já quebradas do slide. */
  lines: string[];
  design: Design;
  /** Muda quando as fontes terminam de carregar, para recalcular o ajuste. */
  fontsTick: number;
  /** Marca o nó raiz (usado na exportação). */
  dataCard?: boolean;
}

const PAD_X = 96;

function lineStyle(design: Design, emphasized: boolean): CSSProperties {
  const accent = emphasized ? design.accent : undefined;
  switch (design.template) {
    case 'duo':
      return emphasized
        ? {
            fontFamily: FONTS.script,
            textTransform: 'none',
            color: design.accent,
            fontSize: '1.3em',
            lineHeight: 1,
            marginTop: '-0.32em',
            marginLeft: design.align === 'left' ? '0.35em' : 0,
            marginRight: design.align === 'right' ? '0.35em' : 0,
            transform: 'rotate(-4deg)',
            position: 'relative',
            letterSpacing: 0,
          }
        : { fontFamily: FONTS.display, lineHeight: 0.98, letterSpacing: '0.005em' };
    case 'minimal':
      return {
        fontFamily: FONTS.serif,
        fontWeight: 500,
        lineHeight: 1.12,
        fontStyle: emphasized ? 'italic' : 'normal',
        color: accent,
      };
    case 'sunset':
      return { fontFamily: FONTS.display, lineHeight: 1.02, letterSpacing: '0.02em', color: accent };
    case 'impact':
    default:
      return { fontFamily: FONTS.display, lineHeight: 0.98, letterSpacing: '0.005em', color: accent };
  }
}

export function Card({ lines, design, fontsTick, dataCard }: CardProps) {
  const { w, h } = RATIOS[design.ratio];
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(96);

  const padY = design.ratio === '9:16' ? 230 : 96;
  const creditSpace = design.showCredit && design.credit.trim() ? 64 : 0;
  const linesKey = lines.join('\n');

  // Busca binária pelo maior tamanho de fonte que cabe na área do texto.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const el = contentRef.current;
    if (!box || !el) return;
    const maxW = box.clientWidth;
    const maxH = box.clientHeight;
    let lo = 14;
    let hi = 520;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      el.style.fontSize = `${mid}px`;
      if (el.offsetWidth <= maxW && el.offsetHeight <= maxH) lo = mid;
      else hi = mid;
    }
    const final = Math.max(12, lo * design.scale);
    el.style.fontSize = `${final}px`;
    setSize(final);
  }, [
    linesKey,
    design.template,
    design.ratio,
    design.scale,
    design.emphasis,
    design.uppercase,
    design.showCredit,
    design.credit,
    design.align,
    fontsTick,
  ]);

  const alignItems =
    design.align === 'left' ? 'flex-start' : design.align === 'right' ? 'flex-end' : 'center';
  const emphasisOn = design.emphasis && lines.length > 1;

  return (
    <div
      data-card={dataCard ? '' : undefined}
      style={{
        width: w,
        height: h,
        background: backgroundOf(design),
        color: design.fg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={boxRef}
        style={{
          position: 'absolute',
          left: PAD_X,
          right: PAD_X,
          top: padY,
          bottom: padY + creditSpace,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems,
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: 'max-content',
            fontSize: size,
            textAlign: design.align,
            textTransform: design.uppercase ? 'uppercase' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={lineStyle(design, emphasisOn && i === lines.length - 1)}>
              {line}
            </div>
          ))}
        </div>
      </div>

      {creditSpace > 0 && (
        <div
          style={{
            position: 'absolute',
            left: PAD_X,
            right: PAD_X,
            bottom: padY - 8,
            textAlign: design.align,
            fontFamily: FONTS.sans,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            opacity: 0.65,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {design.credit}
        </div>
      )}
    </div>
  );
}
