
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Save, X } from 'lucide-react';
import { DescartaveisItem } from '@/hooks/useDescartaveisData';

interface DescartaveisItemCardProps {
  item: DescartaveisItem;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onDelete: (id: string) => void;
}

export function DescartaveisItemCard({ item, onUpdateQuantity, onDelete }: DescartaveisItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantidade);

  const handleSave = () => {
    onUpdateQuantity(item.id, editQuantity);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditQuantity(item.quantidade);
    setIsEditing(false);
  };

  const isLowStock = item.minimo && item.quantidade <= item.minimo;

  return (
    <Card className={`${isLowStock ? 'border-red-200 bg-red-50' : 'bg-white'} shadow border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{item.nome}</h3>
              <Badge variant="secondary" className="text-xs">
                {item.categoria}
              </Badge>
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Baixo Estoque
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>Quantidade:</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Number(e.target.value))}
                    className="w-20 h-8 text-sm"
                  />
                ) : (
                  <span className="font-medium">{item.quantidade} {item.unidade}</span>
                )}
              </div>
              
              <span>
                Mínimo: <span className="font-medium">{item.minimo || 10} {item.unidade}</span>
              </span>
            </div>

            {item.observacoes && (
              <p className="text-sm text-gray-500 mt-2">{item.observacoes}</p>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
