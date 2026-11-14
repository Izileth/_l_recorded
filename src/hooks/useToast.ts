import { useCallback, useRef, useState } from 'react';

/** Hook para exibir notificações temporárias. */
export function useToast() {
  const [toast, setToast] = useState('');
  const timer = useRef<number | undefined>(undefined);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  return { toast, showToast };
}
