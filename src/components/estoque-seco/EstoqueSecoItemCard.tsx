
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Package2, Trash2 } from 'lucide-react';
import { EstoqueSecoItem } from '@/hooks/useEstoqueSecoData';

interface EstoqueSecoItemCardProps {
  item: EstoqueSecoItem;
  isEditing: boolean;
  editValue: number;
  onStartEdit: (id: string, currentQuantity: number) => void;
  onUpdateEdit: (id: string, delta: number) => void;
  onConfirmChange: (id: string) => void;
  onCancelEdit: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function EstoqueSecoItemCard({
  item,
  isEditing,
  editValue,
  onStartEdit,
  onUpdateEdit,
  onConfirmChange,
  onCancelEdit,
  onDelete
}: EstoqueSecoItemCardProps) {
  const isLowStock = item.quantidade <= (item.minimo || 5);
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLowStock ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Package2 className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                <h3 className="font-semibold text-sm sm:text-lg">{item.nome}</h3>
              </div>
              <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs">
                {item.categoria}
              </Badge>
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Baixo Estoque
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-xs sm:text-sm text-gray-600">
              <p>Quantidade: <span className="font-medium">{item.quantidade} {item.unidade}</span></p>
              {item.data_validade && (
                <p>Validade: <span className="font-medium">{new Date(item.data_validade).toLocaleDateString('pt-BR')}</span></p>
              )}
              {item.fornecedor && (
                <p>Fornecedor: <span className="font-medium">{item.fornecedor}</span></p>
              )}
              <p>Mínimo: <span className="font-medium">{item.minimo || 5} {item.unidade}</span></p>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-2 sm:ml-4">
            {isEditing ? (
              <div className="flex items-center gap-1 sm:gap-2 bg-amber-50 p-2 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateEdit(item.id, -1)}
                  disabled={editValue <= 0}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <span className="font-medium min-w-8 sm:min-w-12 text-center text-xs sm:text-sm">{editValue}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateEdit(item.id, 1)}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onConfirmChange(item.id)}
                  className="bg-amber-500 hover:bg-amber-600 h-6 w-6 sm:h-8 sm:w-8 p-0"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancelEdit(item.id)}
                  className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-1 sm:gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartEdit(item.id, item.quantidade)}
                  className="text-xs px-2 py-1"
                >
                  Ajustar Estoque
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="text-xs px-2 py-1"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remover
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
