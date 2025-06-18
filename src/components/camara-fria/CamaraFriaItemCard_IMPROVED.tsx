import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, TrendingDown, TrendingUp, Thermometer, Calendar, DollarSign } from 'lucide-react';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface CamaraFriaItemCardProps {
  item: CamaraFriaItem;
  onTransferToRefrigerada: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

export function CamaraFriaItemCard({
  item,
  onTransferToRefrigerada,
  onDelete,
  onUpdateQuantity
}: CamaraFriaItemCardProps) {
  const { canModify } = useUserPermissions();
  
  const isLowStock = item.quantidade <= (item.minimo || 5);
  const isExpiringSoon = item.data_validade && 
    new Date(item.data_validade) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, item.quantidade + delta);
    onUpdateQuantity(item.id, newQuantity);
  };

  const formatCurrency = (value?: number) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStockStatus = () => {
    if (item.quantidade === 0) {
      return { label: 'Sem estoque', color: 'bg-red-500', icon: AlertTriangle };
    }
    if (isLowStock) {
      return { label: 'Estoque baixo', color: 'bg-yellow-500', icon: TrendingDown };
    }
    return { label: 'Estoque normal', color: 'bg-green-500', icon: TrendingUp };
  };

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      isLowStock ? 'border-yellow-300 bg-yellow-50' : ''
    } ${isExpiringSoon ? 'border-orange-300 bg-orange-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {item.nome}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {item.categoria}
              </Badge>
              {item.unidade_item && (
                <Badge variant="outline" className="text-xs">
                  {item.unidade_item === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza'}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white ${stockStatus.color}`}>
              <StatusIcon className="w-3 h-3" />
              <span>{stockStatus.label}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quantidade e controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Quantidade:</span>
            <span className="font-semibold text-lg">
              {item.quantidade} {item.unidade}
            </span>
          </div>
          
          {canModify && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuantityChange(-1)}
                disabled={item.quantidade <= 0}
                className="h-8 w-8 p-0"
              >
                -
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuantityChange(1)}
                className="h-8 w-8 p-0"
              >
                +
              </Button>
            </div>
          )}
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {item.minimo && (
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Mínimo:</span>
              <span>{item.minimo} {item.unidade}</span>
            </div>
          )}

          {item.data_validade && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Validade:</span>
              <span className={isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                {formatDate(item.data_validade)}
              </span>
            </div>
          )}

          {item.temperatura_ideal && (
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Temp. ideal:</span>
              <span>{item.temperatura_ideal}°C</span>
            </div>
          )}

          {item.preco_unitario && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Preço:</span>
              <span>{formatCurrency(item.preco_unitario)}</span>
            </div>
          )}
        </div>

        {/* Fornecedor */}
        {item.fornecedor && (
          <div className="text-sm">
            <span className="text-gray-600">Fornecedor:</span>
            <span className="ml-2 font-medium">{item.fornecedor}</span>
          </div>
        )}

        {/* Observações */}
        {item.observacoes && (
          <div className="text-sm">
            <span className="text-gray-600">Observações:</span>
            <p className="mt-1 text-gray-800 bg-gray-50 p-2 rounded text-xs">
              {item.observacoes}
            </p>
          </div>
        )}

        {/* Alertas */}
        {(isLowStock || isExpiringSoon) && (
          <div className="space-y-2">
            {isLowStock && (
              <div className="flex items-center gap-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-yellow-800">
                  Estoque baixo! Quantidade atual: {item.quantidade}, mínimo: {item.minimo || 5}
                </span>
              </div>
            )}
            
            {isExpiringSoon && (
              <div className="flex items-center gap-2 p-2 bg-orange-100 border border-orange-300 rounded text-sm">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="text-orange-800">
                  Vence em breve! Data de validade: {formatDate(item.data_validade)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        {canModify && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTransferToRefrigerada(item.id)}
              className="flex-1"
            >
              Transferir para Refrigerada
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(item.id)}
            >
              Remover
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

