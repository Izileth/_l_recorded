import type { SVGProps } from 'react';

/**
 * Ícone oficial extraído de src/icon.svg.
 * Usa currentColor para flexibilidade total de cores com Tailwind.
 */
export function LogoIcon({ className = 'h-5 w-5', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M 500,240 C 535,240 560,270 600,355 L 685,535 C 735,640 710,695 625,675 C 555,635 445,635 375,675 C 290,695 265,640 315,535 L 400,355 C 440,270 465,240 500,240 Z" />
    </svg>
  );
}

export interface LogoBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'subtle' | 'outline' | 'ghost';
  className?: string;
  iconClassName?: string;
}

/**
 * Badge estilizado contendo o logotipo oficial.
 * Substitui marcadores provisórios criados apenas com CSS Tailwind.
 */
export function LogoBadge({
  size = 'sm',
  variant = 'solid',
  className = '',
  iconClassName = '',
}: LogoBadgeProps) {
  const sizeClasses = {
    xs: 'h-5 w-5 rounded-md p-1',
    sm: 'h-7 w-7 rounded-lg p-1.5',
    md: 'h-9 w-9 rounded-xl p-2',
    lg: 'h-12 w-12 rounded-2xl p-2.5',
  }[size];

  const variantClasses = {
    solid: 'bg-red-500 text-white shadow-sm shadow-red-500/25',
    subtle: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
    outline: 'border border-zinc-700 bg-zinc-900 text-white',
    ghost: 'text-red-500',
  }[variant];

  return (
    <span
      className={`grid shrink-0 place-items-center transition ${sizeClasses} ${variantClasses} ${className}`}
      aria-hidden="true"
    >
      <LogoIcon className={`h-full w-full ${iconClassName}`} />
    </span>
  );
}

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'subtle' | 'outline' | 'ghost';
  showLabel?: boolean;
  labelText?: string;
  labelClassName?: string;
  className?: string;
}

/**
 * Componente completo de marca (ícone oficial + texto).
 */
export function Logo({
  size = 'sm',
  variant = 'solid',
  showLabel = true,
  labelText = 'Lyricards',
  labelClassName = 'text-[15px] font-semibold tracking-tight text-white',
  className = 'flex items-center gap-2.5',
}: LogoProps) {
  return (
    <div className={className}>
      <LogoBadge size={size} variant={variant} />
      {showLabel && <span className={labelClassName}>{labelText}</span>}
    </div>
  );
}
