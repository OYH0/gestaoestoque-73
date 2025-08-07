import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BebidasItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  minimo?: number;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

interface BebidasAlertsProps {
  lowStockItems: BebidasItem[];
  selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas';
}

export function BebidasAlerts({ lowStockItems, selectedUnidade }: BebidasAlertsProps) {
  const isMobile = useIsMobile();

  if (lowStockItems.length === 0) return null;

  const getUnidadeName = (unidade: string) => {
    return unidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza';
  };

  const groupedByUnidade = lowStockItems.reduce((acc, item) => {
    const unidade = item.unidade_item || 'juazeiro_norte';
    if (!acc[unidade]) acc[unidade] = [];
    acc[unidade].push(item);
    return acc;
  }, {} as Record<string, BebidasItem[]>);

  return (
    <div className="space-y-3">
      {Object.entries(groupedByUnidade).map(([unidade, items]) => (
        <Alert key={unidade} className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className={isMobile ? "text-sm" : ""}>
            <span className="font-medium text-red-800">
              Bebidas com baixo estoque em {getUnidadeName(unidade)}:
            </span>
            <div className="mt-2 text-red-700">
              {items.map((item, index) => (
                <span key={item.id}>
                  {item.nome} ({item.quantidade} {item.unidade})
                  {index < items.length - 1 && ', '}
                </span>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}