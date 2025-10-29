import { useState, useEffect, useRef, useCallback } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  className?: string;
}

export function ResizeHandle({ direction, onResize, className = '' }: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);
  const onResizeRef = useRef(onResize);

  useEffect(() => {
    onResizeRef.current = onResize;
  }, [onResize]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    const currentPos = direction === 'horizontal' ? clientX : clientY;
    const delta = currentPos - startPosRef.current;
    startPosRef.current = currentPos;
    onResizeRef.current(delta);
  }, [direction]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, direction, handleMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    if (touch) {
      setIsDragging(true);
      startPosRef.current = direction === 'horizontal' ? touch.clientX : touch.clientY;
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-center select-none ${
        direction === 'horizontal'
          ? 'w-2 min-w-[8px] cursor-col-resize'
          : 'h-2 min-h-[8px] cursor-row-resize'
      } ${isDragging ? 'bg-blue-500' : 'bg-gray-700 hover:bg-blue-400'} transition-colors ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className={`absolute ${
        direction === 'horizontal'
          ? 'top-1/2 -translate-y-1/2'
          : 'left-1/2 -translate-x-1/2'
      } opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
        <GripVertical
          className={`w-4 h-4 text-white ${
            direction === 'vertical' ? 'rotate-90' : ''
          }`}
        />
      </div>
    </div>
  );
}
