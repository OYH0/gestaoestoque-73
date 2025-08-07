import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, History, FileText, TrendingUp, AlertTriangle, Package, BarChart3, Recycle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent } from '@/components/ui/card';

interface DescartaveisHeaderProps {
  itemsCount: number;
  lowStockCount: number;
  items: any[];
  totalQuantity: number;
}

export function DescartaveisHeader({
  itemsCount,
  lowStockCount,
  items,
  totalQuantity
}: DescartaveisHeaderProps) {
  const isMobile = useIsMobile();

  // Calcular estatísticas
  const totalValue = items.reduce((acc, item) => acc + (item.quantidade * (item.preco_unitario || 0)), 0);
  const averageQuantity = items.length > 0 ? Math.round(totalQuantity / items.length * 100) / 100 : 0;

  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 shadow-sm">
      <div className="px-4 py-4 space-y-4">
        {/* Informações estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Tipos de Item</p>
                  <p className="text-lg font-bold text-green-900">{itemsCount}</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Quantidade Total</p>
                  <p className="text-lg font-bold text-green-900">{totalQuantity}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Valor Total</p>
                  <p className="text-lg font-bold text-green-900">R$ {totalValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border-200 bg-white/70 backdrop-blur-sm ${lowStockCount > 0 ? 'border-red-200' : 'border-green-200'}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Estoque Baixo
                  </p>
                  <p className={`text-lg font-bold ${lowStockCount > 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {lowStockCount}
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nota ambiental */}
        <div className="flex items-center justify-center gap-2 bg-green-100/50 border border-green-200 rounded-lg p-3">
          <Recycle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Descartáveis recicláveis e biodegradáveis
          </span>
        </div>
      </div>
    </div>
  );
}