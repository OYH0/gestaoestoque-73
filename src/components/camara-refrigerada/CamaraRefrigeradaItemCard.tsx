
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SwapButton } from '@/components/ui/swap-button';
import { Clock, ArrowLeft } from 'lucide-react';
import { CamaraRefrigeradaItem } from '@/hooks/useCamaraRefrigeradaData';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // A unidade aqui é a unidade de medida (kg, pç, etc.), não a unidade da empresa
  const getUnidadeDisplay = (unidade: string) => {
    return unidade || 'kg';
  };

  const getCategoryColor = (status: string) => {
    return status === 'pronto' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      item.status === 'pronto' ? 'ring-2 ring-green-300' : 'ring-2 ring-orange-300'
    }`}>
      <CardHeader className={`pb-3 ${isMobile ? 'p-4' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 truncate`}>
              {item.nome}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={`${getCategoryColor(item.status)} text-xs`}
              >
                {item.status === 'pronto' ? 'Pronto' : 'Descongelando'}
              </Badge>
              {item.unidade_item && (
                <Badge variant="outline" className="text-xs">
                  {item.unidade_item === 'juazeiro_norte' ? 'JN' : 'FOR'}
                </Badge>
              )}
              {item.tempo_descongelamento && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.tempo_descongelamento}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`pt-0 ${isMobile ? 'p-4 pt-0' : ''}`}>
        <div className="space-y-3">
          {/* Quantidade atual */}
          <div className="flex items-center justify-between">
            <span className={`font-medium text-gray-700 ${isMobile ? 'text-sm' : ''}`}>
              Quantidade:
            </span>
            <span className={`font-bold ${
              item.status === 'pronto' ? 'text-green-600' : 'text-orange-600'
            } ${isMobile ? 'text-sm' : ''}`}>
              {item.quantidade} {getUnidadeDisplay(item.unidade)}
            </span>
          </div>

          {/* Controles de ação */}
          <div className="flex gap-2">
            {item.status === 'descongelando' ? (
              <div className="flex-1">
                <SwapButton
                  onSwipe={() => onMoveToReady(item.id)}
                  className="w-full"
                >
                  Marcar como Pronto
                </SwapButton>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveFromChamber(item.id)}
                className="flex-1"
              >
                Retirar da Câmara
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMoveToFreezer(item.id)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
