
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface UnidadeSelectorProps {
  selectedUnidade: 'juazeiro_norte' | 'fortaleza' | 'todas';
  onUnidadeChange: (unidade: 'juazeiro_norte' | 'fortaleza' | 'todas') => void;
}

export function UnidadeSelector({ selectedUnidade, onUnidadeChange }: UnidadeSelectorProps) {
  const isMobile = useIsMobile();

  const getUnidadeLabel = (unidade: string) => {
    switch (unidade) {
      case 'juazeiro_norte':
        return 'Juazeiro do Norte';
      case 'fortaleza':
        return 'Fortaleza';
      case 'todas':
        return 'Todas as Unidades';
      default:
        return unidade;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${isMobile ? 'justify-center' : ''}`}>
      <span className="text-sm font-medium text-gray-700">Unidade:</span>
      <Select value={selectedUnidade} onValueChange={onUnidadeChange}>
        <SelectTrigger className={`${isMobile ? 'w-full max-w-xs' : 'w-48'} bg-white border-gray-300`}>
          <SelectValue>
            {getUnidadeLabel(selectedUnidade)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="todas">
            Todas as Unidades
          </SelectItem>
          <SelectItem value="juazeiro_norte">
            Juazeiro do Norte
          </SelectItem>
          <SelectItem value="fortaleza">
            Fortaleza
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
