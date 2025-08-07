import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Trash2, ArrowRight, Edit3 } from 'lucide-react';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminGuard } from '@/components/AdminGuard';

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
  
  const getCategoryColor = (categoria: string) => {
    const colors = {
      'Carnes': 'bg-red-100 text-red-800',
      'Peixes': 'bg-blue-100 text-blue-800',
      'Aves': 'bg-yellow-100 text-yellow-800',
      'Embutidos': 'bg-purple-100 text-purple-800',
      'Congelados': 'bg-cyan-100 text-cyan-800'
    };
    return colors[categoria as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md shadow-sm border-2 ${isLowStock ? 'ring-2 ring-red-300' : ''}`}>
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
              {isEditing ? editValue : isThawing ? `${item.quantidade} (${thawValue} descongelando)` : item.quantidade} {item.unidade}
            </span>
          </div>

          {/* Estoque mínimo */}
          <div className="flex items-center justify-between">
            <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Mínimo: {item.minimo || 5} {item.unidade}
            </span>
          </div>

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
                    disabled={editValue === 0}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-3 font-bold text-lg min-w-[3rem] text-center">
                    {editValue}
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
            ) : isThawing ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateThaw(item.id, -1)}
                    disabled={thawValue <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-3 font-bold text-lg min-w-[3rem] text-center text-orange-600">
                    {thawValue}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUpdateThaw(item.id, 1)}
                    disabled={thawValue >= item.quantidade}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancelThaw(item.id)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onConfirmThaw(item.id)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Descongelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartEdit(item.id, item.quantidade)}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                {item.quantidade > 0 && (
                  <Button
                    size="sm"
                    onClick={() => onStartThaw(item.id, 1)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Descongelar
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </AdminGuard>
        </div>
      </CardContent>
    </Card>
  );
}

