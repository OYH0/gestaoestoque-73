
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';

interface CamaraFriaAlertsProps {
  itemsBaixoEstoque: CamaraFriaItem[];
}

export function CamaraFriaAlerts({ itemsBaixoEstoque }: CamaraFriaAlertsProps) {
  if (itemsBaixoEstoque.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-red-800 flex items-center gap-2 text-base md:text-lg">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
          Alertas de Baixo Estoque
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-red-700 mb-3 font-medium">
          Câmara Fria - Carnes
        </div>
        <div className="grid grid-cols-1 gap-2">
          {itemsBaixoEstoque.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
              <span className="font-medium text-sm">{item.nome}</span>
              <span className="text-red-600 font-medium text-sm">
                Estoque: {item.quantidade}pç
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
