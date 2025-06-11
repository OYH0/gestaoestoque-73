
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Trash2 } from 'lucide-react';
import { EstoqueSecoItem } from '@/hooks/useEstoqueSecoData';

interface EstoqueSecoItemCardProps {
  item: EstoqueSecoItem;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDelete: (id: string) => void;
}

export function EstoqueSecoItemCard({ item, onUpdateQuantity, onDelete }: EstoqueSecoItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.quantidade);

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

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLowStock ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{item.nome}</h3>
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
              {item.data_validade && (
                <p>Validade: <span className="font-medium">
                  {new Date(item.data_validade).toLocaleDateString('pt-BR')}
                </span></p>
              )}
            </div>

            {item.observacoes && (
              <p className="text-sm text-gray-500 mt-2">{item.observacoes}</p>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            {isEditing ? (
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateEdit(-1)}
                  disabled={editValue <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-12 text-center">{editValue}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUpdateEdit(1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmChange}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartEdit}
                  className="text-xs whitespace-nowrap"
                >
                  Ajustar Estoque
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(item.id)}
                  className="text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Remover
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
