import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Trash2, Edit3 } from 'lucide-react';
import { DescartaveisItem } from '@/hooks/useDescartaveisData';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminGuard } from '@/components/AdminGuard';

interface DescartaveisItemCardProps {
  item: DescartaveisItem;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDelete: (id: string) => void;
}

function getUnidadeLabel(unidade: string | undefined) {
  if (!unidade || unidade === 'juazeiro_norte') return '';
  switch (unidade) {
    case 'fortaleza':
      return 'Fortaleza';
    default:
      return unidade;
  }
}

function getUnidadeFisicaLabel(unidade: string | undefined) {
  if (!unidade) return '';
  if (unidade === 'fortaleza') return 'Fortaleza';
  if (unidade === 'juazeiro_norte') return 'Juazeiro do Norte';
  return unidade;
}

export function DescartaveisItemCard({ item, onUpdateQuantity, onDelete }: DescartaveisItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.quantidade);
  const isMobile = useIsMobile();

  const handleStartEdit = () => {
    setEditValue(item.quantidade);
    setIsEditing(true);
  };

  const handleUpdateEdit = (delta: number) => {
    setEditValue(prev => Math.max(0, prev + delta));
  };

  const handleConfirmChange = () => {
    onUpdateQuantity(item.id, editValue);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditValue(item.quantidade);
    setIsEditing(false);
  };

  const isLowStock = item.minimo && item.quantidade <= item.minimo;

  const getCategoryColor = (categoria: string) => {
    const colors = {
      'Pratos': 'bg-blue-100 text-blue-800',
      'Copos': 'bg-green-100 text-green-800',
      'Talheres': 'bg-purple-100 text-purple-800',
      'Guardanapos': 'bg-pink-100 text-pink-800',
      'Embalagens': 'bg-orange-100 text-orange-800'
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
              {isEditing ? editValue : item.quantidade} {getUnidadeFisicaLabel(item.unidade)}
            </span>
          </div>

          {/* Estoque mínimo */}
          {item.minimo && (
            <div className="flex items-center justify-between">
              <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Mínimo: {item.minimo} {getUnidadeFisicaLabel(item.unidade)}
              </span>
            </div>
          )}

          {/* Observações */}
          {item.observacoes && (
            <div className="flex items-start justify-between">
              <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Obs: {item.observacoes}
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
                    onClick={() => handleUpdateEdit(-1)}
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
                    onClick={() => handleUpdateEdit(1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmChange}
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
                  onClick={handleStartEdit}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(item.id)}
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
