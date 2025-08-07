import React from 'react';
import { cn } from '@/lib/utils';

interface NavigationIndicatorProps {
  currentIndex: number;
  totalRoutes: number;
  onNavigate: (index: number) => void;
  routeLabels?: string[];
  className?: string;
}

export const NavigationIndicator: React.FC<NavigationIndicatorProps> = ({
  currentIndex,
  totalRoutes,
  onNavigate,
  routeLabels = [],
  className,
}) => {
  const defaultLabels = [
    'Dashboard',
    'Câmara Fria',
    'Câmara Refrigerada',
    'Estoque Seco',
    'Descartáveis',
    'Configurações',
  ];

  const labels = routeLabels.length > 0 ? routeLabels : defaultLabels;

  return (
    <div className={cn('flex items-center justify-center gap-3 relative z-30', className)}>
      {Array.from({ length: totalRoutes }, (_, index) => (
        <button
          key={index}
          onClick={() => onNavigate(index)}
          className={cn(
            'w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 relative z-30',
            currentIndex === index
              ? 'bg-churrasco-red scale-125 shadow-lg ring-2 ring-churrasco-red/30'
              : 'bg-churrasco-brown/40 hover:bg-churrasco-brown/60'
          )}
          title={labels[index] || `Aba ${index + 1}`}
          aria-label={`Navegar para ${labels[index] || `aba ${index + 1}`}`}
        />
      ))}
    </div>
  );
};

