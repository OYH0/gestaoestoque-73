
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnidadeSelectorProps {
  selectedUnidade: 'juazeiro_norte' | 'fortaleza' | 'todas';
  onUnidadeChange: (unidade: 'juazeiro_norte' | 'fortaleza' | 'todas') => void;
}

export function UnidadeSelector({ selectedUnidade, onUnidadeChange }: UnidadeSelectorProps) {
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
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Unidade:</span>
      <Select value={selectedUnidade} onValueChange={onUnidadeChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
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
