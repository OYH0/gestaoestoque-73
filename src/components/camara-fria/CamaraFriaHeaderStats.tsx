import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, History, FileText, TrendingUp, AlertTriangle, Package, BarChart3, Snowflake } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent } from '@/components/ui/card';

interface CamaraFriaHeaderProps {
  itemsCount: number;
  lowStockCount: number;
  items: any[];
  totalWeight: number;
}

export function CamaraFriaHeader({
  itemsCount,
  lowStockCount,
  items,
  totalWeight
}: CamaraFriaHeaderProps) {
  const isMobile = useIsMobile();

  // Calcular estatísticas
  const totalValue = items.reduce((acc, item) => acc + (item.quantidade * (item.preco_unitario || 0)), 0);
  const averageWeight = items.length > 0 ? Math.round(totalWeight / items.length * 100) / 100 : 0;

  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200 shadow-sm">
      <div className="px-4 py-4 space-y-4">
        {/* Informações estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-cyan-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-600 font-medium">Tipos de Carne</p>
                  <p className="text-lg font-bold text-cyan-900">{itemsCount}</p>
                </div>
                <Package className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-600 font-medium">Peso Total</p>
                  <p className="text-lg font-bold text-cyan-900">{totalWeight.toFixed(1)} kg</p>
                </div>
                <BarChart3 className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-600 font-medium">Valor Total</p>
                  <p className="text-lg font-bold text-cyan-900">R$ {totalValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border-200 bg-white/70 backdrop-blur-sm ${lowStockCount > 0 ? 'border-orange-200' : 'border-cyan-200'}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${lowStockCount > 0 ? 'text-orange-600' : 'text-cyan-600'}`}>
                    Estoque Baixo
                  </p>
                  <p className={`text-lg font-bold ${lowStockCount > 0 ? 'text-orange-900' : 'text-cyan-900'}`}>
                    {lowStockCount}
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${lowStockCount > 0 ? 'text-orange-500' : 'text-cyan-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Temperatura ideal */}
        <div className="flex items-center justify-center gap-2 bg-cyan-100/50 border border-cyan-200 rounded-lg p-3">
          <Snowflake className="h-5 w-5 text-cyan-600" />
          <span className="text-sm font-medium text-cyan-800">
            Temperatura Ideal: -18°C a -25°C
          </span>
        </div>
      </div>
    </div>
  );
}