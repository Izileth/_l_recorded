import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { Design, Slide } from '../lib/types';
import { FONT_SANS, FONT_SERIF, accentFont, mainFont } from '../lib/fonts';
import { RATIOS, backgroundOf } from '../lib/templates';

interface CardProps {
  slide: Slide;
  design: Design;
  /** Muda quando as fontes terminam de carregar, para recalcular o ajuste. */
  fontsTick: number;
  /** Grupo em foco (efeito Spotify). Padrão: o do meio. */
  focusIndex?: number;
  /** Quando definido, os grupos ficam clicáveis (usado no preview). */
  onGroupClick?: (groupIndex: number) => void;
  /** Marca o nó raiz (usado na exportação). */
  dataCard?: boolean;
}

const PAD_X = 96;

function lineStyle(design: Design, emphasized: boolean): CSSProperties {
  const main = mainFont(design.fontMain);
  const base: CSSProperties = {
    fontFamily: main.family,
    fontWeight: main.weight,
    lineHeight: main.lh * design.lineHeight,
    letterSpacing: `${main.ls + design.tracking}em`,
  };
  if (!emphasized) return base;

  if (design.emphasisStyle === 'script') {
    const acc = accentFont(design.fontAccent);
    return {
      ...base,
      fontFamily: acc.family,
      fontWeight: acc.weight,
      textTransform: 'none',
      color: design.accent,
      fontSize: `${acc.scale}em`,
      lineHeight: 1,
      letterSpacing: 0,
      marginTop: '-0.3em',
      marginLeft: design.align === 'left' ? '0.35em' : 0,
      marginRight: design.align === 'right' ? '0.35em' : 0,
      transform: 'rotate(-4deg)',
      position: 'relative',
    };
  }
  if (design.emphasisStyle === 'italic') {
    return { ...base, fontStyle: 'italic', color: design.accent };
  }
  return { ...base, color: design.accent };
}

export function Card({ slide, design, fontsTick, focusIndex, onGroupClick, dataCard }: CardProps) {
  const { w, h } = RATIOS[design.ratio];
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(96);

  const padY = design.ratio === '9:16' ? 230 : 96;
  const creditSpace = design.showCredit && design.credit.trim() ? 64 : 0;
  const slideKey = JSON.stringify(slide);

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
    slideKey,
    design.template,
    design.ratio,
    design.scale,
    design.emphasis,
    design.emphasisStyle,
    design.uppercase,
    design.fontMain,
    design.fontAccent,
    design.lineHeight,
    design.tracking,
    design.quote,
    design.showCredit,
    design.credit,
    design.align,
    fontsTick,
  ]);

  const alignItems =
    design.align === 'left' ? 'flex-start' : design.align === 'right' ? 'flex-end' : 'center';
  const justifyContent =
    design.valign === 'top' ? 'flex-start' : design.valign === 'bottom' ? 'flex-end' : 'center';

  const flatCount = slide.reduce((n, g) => n + g.length, 0);
  const emphasisOn = design.emphasis && flatCount > 1;
  const focusOn = design.focus && slide.length > 1;
  const activeFocus = focusIndex !== undefined ? Math.min(focusIndex, slide.length - 1) : Math.floor((slide.length - 1) / 2);

  let flatIndex = 0;
  const hasImage = !!design.bgImage;
  const imgScale = Math.max(design.bgZoom, design.blur > 0 ? 1.08 : 1);

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
      {hasImage && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${design.bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: `${design.bgX}% ${design.bgY}%`,
              transform: `scale(${imgScale})`,
              transformOrigin: `${design.bgX}% ${design.bgY}%`,
              filter: design.blur > 0 ? `blur(${design.blur}px)` : undefined,
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${design.overlay})` }} />
        </>
      )}

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
          justifyContent,
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
          {design.quote && (
            <div
              style={{
                fontFamily: FONT_SERIF,
                fontWeight: 500,
                fontSize: '2.2em',
                lineHeight: 0.62,
                height: '0.5em',
                color: design.accent,
                textTransform: 'none',
              }}
            >
              {'“'}
            </div>
          )}
          {slide.map((group, gi) => (
            <div
              key={gi}
              onClick={onGroupClick ? () => onGroupClick(gi) : undefined}
              style={{
                opacity: focusOn && gi !== activeFocus ? design.focusDim : 1,
                transition: 'opacity 0.2s',
                cursor: onGroupClick && design.focus ? 'pointer' : undefined,
              }}
            >
              {group.map((line, li) => {
                flatIndex += 1;
                const emphasized = emphasisOn && flatIndex === flatCount;
                return (
                  <div key={li} style={lineStyle(design, emphasized)}>
                    {line}
                  </div>
                );
              })}
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
            fontFamily: FONT_SANS,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            opacity: 0.7,
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
