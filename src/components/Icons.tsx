import type { SVGProps } from 'react';

/**
 * Propriedades padrão para todos os ícones SVG do sistema
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Ícone estilizado para o botão "Surpreender" (combinação de dado e faísca de sorte/criatividade)
 */
export function SurpriseIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.5l7 4v7.5l-7 4-7-4V6.5l7-4z" />
      <path d="M12 2.5v15" />
      <path d="M12 10.5l7-4" />
      <path d="M12 10.5l-7-4" />
      <circle cx="8.5" cy="5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="13.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13.5" r="0.75" fill="currentColor" stroke="none" />
      <path d="M19.5 2.5v3M18 4h3" strokeWidth={1.75} />
      <path d="M4.5 17.5v2.5M3.25 18.75h2.5" strokeWidth={1.5} />
    </svg>
  );
}

/**
 * Ícone clássico de dado para aleatoriedade
 */
export function DiceIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16" cy="8" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="8" cy="16" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Ícone moderno para upload de arquivos
 */
export function UploadIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 16.5v2.25A2.25 2.25 0 0 0 6.25 21h11.5A2.25 2.25 0 0 0 20 18.75V16.5" />
      <polyline points="7.5 8 12 3.5 16.5 8" />
      <line x1="12" y1="3.5" x2="12" y2="15.5" />
    </svg>
  );
}

/**
 * Ícone de nuvem com upload
 */
export function UploadCloudIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 16.2A4.5 4.5 0 0 1 7.1 8.5 7 7 0 0 1 19.3 11a4.5 4.5 0 0 1 .7 9H5a4.5 4.5 0 0 1-1-3.8z" />
      <polyline points="9 13 12 10 15 13" />
      <line x1="12" y1="10" x2="12" y2="17" />
    </svg>
  );
}

/**
 * Ícone para documento de letra (.txt / .lrc)
 */
export function FileTextIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
      <line x1="8" y1="9" x2="10" y2="9" />
    </svg>
  );
}

/**
 * Ícone para imagens de fundo
 */
export function ImageIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

/**
 * Ícone de faíscas / magia
 */
export function SparklesIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3c0 4.5 3.5 8 8 8-4.5 0-8 3.5-8 8 0-4.5-3.5-8-8-8 4.5 0 8-3.5 8-8z" />
      <path d="M19 17v4M17 19h4" strokeWidth={1.75} />
      <path d="M5 5v3M3.5 6.5h3" strokeWidth={1.5} />
    </svg>
  );
}

/**
 * Ícone de download
 */
export function DownloadIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/**
 * Ícone de copiar
 */
export function CopyIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

/**
 * Ícone de chevron para dropdowns
 */
export function ChevronDownIcon({ className = 'h-3 w-3', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Ícone de marcador / salvar preset
 */
export function BookmarkIcon({ className = 'h-4 w-4', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/**
 * Ícone de lixeira / limpar
 */
export function TrashIcon({ className = 'h-3.5 w-3.5', size, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
