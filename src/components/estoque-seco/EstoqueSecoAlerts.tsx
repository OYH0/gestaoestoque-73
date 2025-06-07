
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo: number;
}

interface EstoqueSecoAlertsProps {
  itemsBaixoEstoque: Item[];
}

export function EstoqueSecoAlerts({ itemsBaixoEstoque }: EstoqueSecoAlertsProps) {
  if (itemsBaixoEstoque.length === 0) return null;

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-red-800 flex items-center gap-2 text-base md:text-lg">
          <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
          Itens com Baixo Estoque
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {itemsBaixoEstoque.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
              <span className="font-medium text-sm">{item.name}</span>
              <span className="text-red-600 font-medium text-sm">{item.quantidade} {item.unidade}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
