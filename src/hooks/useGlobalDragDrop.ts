import { useEffect, useRef, useState } from 'react';

/** Gerencia o arraste global de arquivos (texto/imagens) para a página. */
export function useGlobalDragDrop(onFile: (file: File) => void) {
  const [globalDragging, setGlobalDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    function onDragEnter(e: globalThis.DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        dragCounter.current++;
        setGlobalDragging(true);
      }
    }
    function onDragLeave(e: globalThis.DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current <= 0) {
          dragCounter.current = 0;
          setGlobalDragging(false);
        }
      }
    }
    function onDragOver(e: globalThis.DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
      }
    }
    function onDrop(e: globalThis.DragEvent) {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        dragCounter.current = 0;
        setGlobalDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }
    }

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [onFile]);

  return globalDragging;
}
