
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Check, X, ArrowRight } from 'lucide-react';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';

interface CamaraFriaItemCardProps {
  item: CamaraFriaItem;
  isEditing: boolean;
  editValue: number;
  onStartEdit: (id: string, currentQuantity: number) => void;
  onUpdateEdit: (id: string, delta: number) => void;
  onConfirmChange: (id: string) => void;
  onCancelEdit: (id: string) => void;
  onMoveToRefrigerada?: (item: CamaraFriaItem, quantidade: number) => void;
}

export function CamaraFriaItemCard({
  item,
  isEditing,
  editValue,
  onStartEdit,
  onUpdateEdit,
  onConfirmChange,
  onCancelEdit,
  onMoveToRefrigerada
}: CamaraFriaItemCardProps) {
  const handleMoveToRefrigerada = () => {
    if (onMoveToRefrigerada && item.quantidade > 0) {
      onMoveToRefrigerada(item, 1);
    }
  };

  return (
    <Card 
      className={`${
        item.quantidade <= (item.minimo || 5)
          ? 'border-red-200 bg-red-50' 
          : 'border-gray-200'
      }`}
    >
      <CardContent className="p-3 md:p-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.nome}</h3>
              <Badge variant="outline" className="text-xs">
                {item.categoria}
              </Badge>
              {item.quantidade <= (item.minimo || 5) && (
                <Badge variant="destructive" className="text-xs">
                  Baixo Estoque
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              {isEditing ? editValue : item.quantidade} {item.unidade} • Mínimo: {item.minimo || 5} {item.unidade}
            </p>
          </div>
          
          <div className="flex items-center gap-2 justify-end flex-wrap">
            {isEditing ? (
              <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 h-8 w-8 md:h-9 md:w-9 p-0"
                  onClick={() => onUpdateEdit(item.id, -1)}
                  disabled={editValue === 0}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <span className="w-12 md:w-16 text-center font-medium border rounded px-1 md:px-2 py-1 text-sm">
                  {editValue}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 h-8 w-8 md:h-9 md:w-9 p-0"
                  onClick={() => onUpdateEdit(item.id, 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 h-8 w-8 md:h-9 md:w-9 p-0"
                  onClick={() => onConfirmChange(item.id)}
                >
                  <Check className="w-3 h-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 h-8 w-8 md:h-9 md:w-9 p-0"
                  onClick={() => onCancelEdit(item.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStartEdit(item.id, item.quantidade)}
                  className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 text-xs md:text-sm"
                >
                  Editar Quantidade
                </Button>
                
                {onMoveToRefrigerada && item.quantidade > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMoveToRefrigerada}
                    className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 text-xs md:text-sm"
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Descongelar
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
