import { useCallback, useState } from 'react';

interface UseDropzoneProps {
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
}

export function useDropzone({ onDrop, accept = {}, multiple = false }: UseDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const filteredFiles = multiple ? files : files.slice(0, 1);
    
    onDrop(filteredFiles);
  }, [onDrop, multiple]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const filteredFiles = multiple ? files : files.slice(0, 1);
    
    onDrop(filteredFiles);
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [onDrop, multiple]);

  const getRootProps = useCallback(() => ({
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onClick: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = multiple;
      input.accept = Object.keys(accept).join(',');
      input.onchange = handleInputChange as any;
      input.click();
    }
  }), [handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleInputChange, multiple, accept]);

  const getInputProps = useCallback(() => ({
    type: 'file',
    multiple,
    accept: Object.keys(accept).join(','),
    onChange: handleInputChange,
    style: { display: 'none' }
  }), [multiple, accept, handleInputChange]);

  return {
    getRootProps,
    getInputProps,
    isDragActive
  };
}