
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
    <div className={`flex ${isMobile ? 'justify-center' : 'justify-start'}`}>
      <Select value={selectedUnidade} onValueChange={onUnidadeChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecione a unidade">
            {getUnidadeLabel(selectedUnidade)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
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
