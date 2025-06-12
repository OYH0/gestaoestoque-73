
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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

  const getUnidadeBadgeColor = (unidade: string) => {
    switch (unidade) {
      case 'juazeiro_norte':
        return 'bg-blue-100 text-blue-800';
      case 'fortaleza':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs">
        Unidade:
      </Badge>
      <Select value={selectedUnidade} onValueChange={onUnidadeChange}>
        <SelectTrigger className="w-48">
          <SelectValue>
            <Badge className={`text-xs ${getUnidadeBadgeColor(selectedUnidade)}`}>
              {getUnidadeLabel(selectedUnidade)}
            </Badge>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todas">
            <Badge className="text-xs bg-gray-100 text-gray-800">
              Todas as Unidades
            </Badge>
          </SelectItem>
          <SelectItem value="juazeiro_norte">
            <Badge className="text-xs bg-blue-100 text-blue-800">
              Juazeiro do Norte
            </Badge>
          </SelectItem>
          <SelectItem value="fortaleza">
            <Badge className="text-xs bg-green-100 text-green-800">
              Fortaleza
            </Badge>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
