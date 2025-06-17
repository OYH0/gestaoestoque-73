import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeHintProps {
  show: boolean;
  onDismiss: () => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
}

export const SwipeHint: React.FC<SwipeHintProps> = ({
  show,
  onDismiss,
  canSwipeLeft,
  canSwipeRight,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-dismiss após 5 segundos
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50',
      'bg-black/80 text-white px-4 py-3 rounded-lg shadow-lg',
      'flex items-center gap-3 max-w-sm mx-4',
      'transition-all duration-300',
      show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    )}>
      <div className="flex items-center gap-2 text-sm">
        {canSwipeLeft && (
          <div className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            <span>Deslize</span>
          </div>
        )}
        {canSwipeLeft && canSwipeRight && (
          <span className="text-gray-300">|</span>
        )}
        {canSwipeRight && (
          <div className="flex items-center gap-1">
            <span>Deslize</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
        <span>para navegar</span>
      </div>
      
      <button
        onClick={onDismiss}
        className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Fechar dica"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

