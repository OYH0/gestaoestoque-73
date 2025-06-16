
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { CamaraRefrigeradaItem } from '@/hooks/useCamaraRefrigeradaData';

interface CamaraRefrigeradaItemCardProps {
  item: CamaraRefrigeradaItem;
  onMoveToReady: (id: string) => void;
  onMoveToFreezer: (id: string) => void;
  onRemoveFromChamber: (id: string) => void;
}

export function CamaraRefrigeradaItemCard({ 
  item, 
  onMoveToReady, 
  onMoveToFreezer, 
  onRemoveFromChamber 
}: CamaraRefrigeradaItemCardProps) {
  // A unidade aqui é a unidade de medida (kg, pç, etc.), não a unidade da empresa
  const getUnidadeDisplay = (unidade: string) => {
    return unidade || 'pç';
  };

  return (
    <Card 
      className={`${
        item.status === 'pronto' 
          ? 'border-green-200 bg-green-50' 
          : 'border-orange-200 bg-orange-50'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">{item.nome}</h3>
              <Badge 
                variant={item.status === 'pronto' ? 'default' : 'secondary'}
                className={
                  item.status === 'pronto' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-orange-500 text-white'
                }
              >
                {item.status === 'pronto' ? 'Pronto' : 'Descongelando'}
              </Badge>
              {/* Mostrar a unidade da empresa como uma badge */}
              <Badge variant="outline" className="text-xs">
                {item.unidade_item === 'fortaleza' ? 'Fortaleza' : 'Juazeiro do Norte'}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
              <span>{item.quantidade} {getUnidadeDisplay(item.unidade)}</span>
              {item.tempo_descongelamento && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.tempo_descongelamento}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {item.status === 'descongelando' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMoveToReady(item.id)}
                className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 hover:border-green-400"
              >
                <ArrowRight className="w-3 h-3 mr-1" />
                Marcar como Pronto
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveFromChamber(item.id)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
              >
                Retirar da Câmara
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveToFreezer(item.id)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Voltar ao Freezer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
