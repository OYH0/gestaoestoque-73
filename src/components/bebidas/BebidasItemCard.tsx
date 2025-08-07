import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Edit3, Check, X, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { AdminGuard } from '@/components/AdminGuard';

interface BebidasItemCardProps {
  item: any;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDeleteItem: (id: string) => void;
  onStartEdit: (id: string, currentQuantity: number) => void;
  onUpdateEdit: (id: string, delta: number) => void;
  onConfirmChange: (id: string) => void;
  onCancelEdit: (id: string) => void;
  editingQuantity?: number;
  isEditing: boolean;
}

export function BebidasItemCard({
  item,
  onUpdateQuantity,
  onDeleteItem,
  onStartEdit,
  onUpdateEdit,
  onConfirmChange,
  onCancelEdit,
  editingQuantity,
  isEditing
}: BebidasItemCardProps) {
  const isMobile = useIsMobile();
  const { canModify } = useUserPermissions();

  const isLowStock = item.minimo && item.quantidade <= item.minimo;

  const getCategoryColor = (categoria: string) => {
    const colors = {
      'Refrigerantes': 'bg-red-100 text-red-800',
      'Sucos': 'bg-orange-100 text-orange-800',
      'Águas': 'bg-blue-100 text-blue-800',
      'Cervejas': 'bg-yellow-100 text-yellow-800',
      'Energéticos': 'bg-purple-100 text-purple-800'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLowStock ? 'ring-2 ring-red-300' : ''}`}>
      <CardHeader className={`pb-3 ${isMobile ? 'p-4' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 truncate`}>
              {item.nome}
            </CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={`${getCategoryColor(item.categoria)} text-xs`}
              >
                {item.categoria}
              </Badge>
              {item.unidade_item && (
                <Badge variant="outline" className="text-xs">
                  {item.unidade_item === 'juazeiro_norte' ? 'JN' : 'FOR'}
                </Badge>
              )}
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Baixo Estoque
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
            <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'} ${isMobile ? 'text-sm' : ''}`}>
              {isEditing ? editingQuantity : item.quantidade} {item.unidade}
            </span>
          </div>

          {/* Estoque mínimo */}
          {item.minimo && (
            <div className="flex items-center justify-between">
              <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Mínimo: {item.minimo} {item.unidade}
              </span>
            </div>
          )}

          {/* Controles de edição */}
          <AdminGuard fallback={
            <div className="text-center py-2">
              <span className="text-xs text-gray-500">Apenas administradores podem editar</span>
            </div>
          }>
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateEdit(item.id, -1)}
                    disabled={editingQuantity === 0}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-3 font-bold text-lg min-w-[3rem] text-center">
                    {editingQuantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateEdit(item.id, 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancelEdit(item.id)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onConfirmChange(item.id)}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirmar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('=== CLICOU EDITAR BEBIDA ===');
                    console.log('Item ID:', item.id);
                    console.log('canModify:', canModify);
                    onStartEdit(item.id, item.quantidade);
                  }}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('=== CLICOU DELETAR BEBIDA ===');
                    console.log('Item ID:', item.id);
                    console.log('canModify:', canModify);
                    onDeleteItem(item.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </AdminGuard>
        </div>
      </CardContent>
    </Card>
  );
}