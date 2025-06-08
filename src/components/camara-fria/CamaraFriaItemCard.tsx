
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Check, X, Snowflake, Trash2 } from 'lucide-react';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';

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
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isLowStock ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
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
              {item.temperatura_ideal && (
                <p>Temperatura ideal: <span className="font-medium">{item.temperatura_ideal}°C</span></p>
              )}
              {item.data_validade && (
                <p>Validade: <span className="font-medium">{new Date(item.data_validade).toLocaleDateString('pt-BR')}</span></p>
              )}
              <p>Mínimo: <span className="font-medium">{item.minimo || 5} {item.unidade}</span></p>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {isEditing ? (
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateEdit(item.id, -1)}
                  disabled={editValue <= 0}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-12 text-center">{editValue}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateEdit(item.id, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onConfirmChange(item.id)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancelEdit(item.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : isThawing ? (
              <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateThaw(item.id, -1)}
                  disabled={thawValue <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-medium min-w-12 text-center">{thawValue}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateThaw(item.id, 1)}
                  disabled={thawValue >= item.quantidade}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onConfirmThaw(item.id)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancelThaw(item.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStartEdit(item.id, item.quantidade)}
                    className="text-xs"
                  >
                    Ajustar Estoque
                  </Button>
                  {item.quantidade > 0 && (
                    <Button
                      size="sm"
                      onClick={() => onStartThaw(item.id, 1)}
                      className="bg-orange-500 hover:bg-orange-600 text-xs"
                    >
                      Descongelar
                    </Button>
                  )}
                </div>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(item.id)}
                    className="text-xs"
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
