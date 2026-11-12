
import type { SVGProps } from 'react';

/**
 * Ícone oficial da marca.
 * Renderizado livremente, sem badge ou container decorativo.
 * Utiliza currentColor para permitir personalização via Tailwind.
 */
export function LogoIcon({
    className = 'h-5 w-5',
    ...props
}: SVGProps<SVGSVGElement>) {
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

export interface LogoProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    labelText?: string;
    labelClassName?: string;
    className?: string;
    iconClassName?: string;
}

/**
 * Componente da marca.
 * Utiliza diretamente o SVG original, sem badge.
 */
export function Logo({
    size = 'sm',
    showLabel = true,
    labelText = 'Lyricards',
    labelClassName = 'text-[15px] font-semibold tracking-tight text-white',
    className = 'flex items-center gap-2.5',
    iconClassName = '',
}: LogoProps) {
    const sizeClasses = {
        xs: 'h-5 w-5',
        sm: 'h-7 w-7',
        md: 'h-9 w-9',
        lg: 'h-12 w-12',
    }[size];

    return (
        <div className={className}>
            <LogoIcon
                className={`${sizeClasses} shrink-0 ${iconClassName}`}
            />

            {showLabel && (
                <span className={labelClassName}>
                    {labelText}
                </span>
            )}
        </div>
    );
}
