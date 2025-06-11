
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Snowflake, Trash2 } from 'lucide-react';
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
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLowStock ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              <p>Quantidade: <span className="font-medium">{item.quantidade} {item.unidade}</span></p>
              <p>Mínimo: <span className="font-medium">{item.minimo || 5} {item.unidade}</span></p>
            </div>
          </div>

          <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
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
              <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-2 ${isMobile ? 'w-full items-center' : 'w-full sm:w-auto'}`}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartEdit(item.id, item.quantidade)}
                  className="text-xs h-8 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Ajustar Estoque</span>
                  <span className="sm:hidden">Ajustar</span>
                </Button>
                {item.quantidade > 0 && (
                  <Button
                    size="sm"
                    onClick={() => onStartThaw(item.id, 1)}
                    className="bg-orange-500 hover:bg-orange-600 text-xs h-8 px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Descongelar</span>
                    <span className="sm:hidden">Desc.</span>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="text-xs h-8 px-2 sm:px-3"
                  >
                    <Trash2 className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Remover</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
