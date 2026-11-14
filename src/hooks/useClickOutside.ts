import { useEffect, type RefObject } from 'react';

/** Fecha um elemento quando o clique acontece fora dele. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [ref, active, onClose]);
}
