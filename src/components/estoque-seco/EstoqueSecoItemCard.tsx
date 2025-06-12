
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Trash2 } from 'lucide-react';
import { EstoqueSecoItem } from '@/hooks/useEstoqueSecoData';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminGuard } from '@/components/AdminGuard';

interface EstoqueSecoItemCardProps {
  item: EstoqueSecoItem;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDelete: (id: string) => void;
}

export function EstoqueSecoItemCard({ item, onUpdateQuantity, onDelete }: EstoqueSecoItemCardProps) {
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

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLowStock ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
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

          <AdminGuard fallback={
            <div className="text-center py-2">
              <p className="text-sm text-gray-500">Apenas administradores podem editar</p>
            </div>
          }>
            <div className="flex flex-col gap-2">
              {isEditing ? (
                <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg flex-wrap justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateEdit(-1)}
                    disabled={editValue <= 0}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-medium min-w-12 text-center">{editValue}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateEdit(1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmChange}
                    className="bg-green-500 hover:bg-green-600 h-8 w-8 p-0"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleStartEdit}
                    className="w-full"
                  >
                    Ajustar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </>
              )}
            </div>
          </AdminGuard>
        </div>
      </CardContent>
    </Card>
  );
}
