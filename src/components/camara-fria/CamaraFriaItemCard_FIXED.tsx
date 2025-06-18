import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Snowflake, Trash2, ArrowRight } from 'lucide-react';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';
import { useIsMobile } from '@/hooks/use-mobile';

interface CamaraFriaItemCardProps {
  item: CamaraFriaItem;
  isEditing: boolean;
  editValue: number;
  isThawing: boolean;
  thawValue: number;
  onStartEdit: (id: string, currentQuantity: number) => void;
  onUpdateEdit: (id: string, delta: number) => void;
  onConfirmChange: (id: string) => void;
  onCancelEdit: (id: string) => void;
  onStartThaw: (id: string, quantity: number) => void;
  onUpdateThaw: (id: string, delta: number) => void;
  onConfirmThaw: (id: string) => void;
  onCancelThaw: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CamaraFriaItemCard({
  item,
  isEditing,
  editValue,
  isThawing,
  thawValue,
  onStartEdit,
  onUpdateEdit,
  onConfirmChange,
  onCancelEdit,
  onStartThaw,
  onUpdateThaw,
  onConfirmThaw,
  onCancelThaw,
  onDelete
}: CamaraFriaItemCardProps) {
  const isLowStock = item.quantidade <= (item.minimo || 5);
  const isMobile = useIsMobile();

  const getUnidadeLabel = (unidade: string) => {
    switch (unidade) {
      case 'juazeiro_norte':
        return 'Juazeiro do Norte';
      case 'fortaleza':
        return 'Fortaleza';
      default:
        return unidade;
    }
  };
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLowStock ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row items-center'} gap-4`}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-lg">{item.nome}</h3>
              </div>
              <Badge variant={isLowStock ? "destructive" : "secondary"}>
                {item.categoria}
              </Badge>
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Baixo Estoque
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p>Quantidade: <span className="font-medium">{item.quantidade}</span></p>
              <p>Mínimo: <span className="font-medium">{item.minimo || 5}</span></p>
              {item.unidade_item && (
                <p>Unidade: <span className="font-medium">{getUnidadeLabel(item.unidade_item)}</span></p>
              )}
            </div>
          </div>

          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 ${isMobile ? '' : 'min-w-fit'}`}>
            {isEditing ? (
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg flex-wrap justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateEdit(item.id, -1)}
                  disabled={editValue <= 0}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-12 text-center">{editValue}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateEdit(item.id, 1)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onConfirmChange(item.id)}
                  className="bg-green-500 hover:bg-green-600 h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancelEdit(item.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : isThawing ? (
              <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg flex-wrap justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateThaw(item.id, -1)}
                  disabled={thawValue <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-12 text-center">{thawValue}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateThaw(item.id, 1)}
                  disabled={thawValue >= item.quantidade}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onConfirmThaw(item.id)}
                  className="bg-orange-500 hover:bg-orange-600 h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancelThaw(item.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => onStartEdit(item.id, item.quantidade)}
                  className={isMobile ? "w-full" : "min-w-20"}
                >
                  Ajustar
                </Button>
                
                {item.quantidade > 0 && (
                  <Button
                    onClick={() => onStartThaw(item.id, 1)}
                    className={`bg-orange-500 hover:bg-orange-600 ${isMobile ? 'w-full' : 'min-w-28'}`}
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Descongelar
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className={isMobile ? "w-full" : "min-w-24"}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

