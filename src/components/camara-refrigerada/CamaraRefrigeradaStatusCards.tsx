
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Thermometer } from 'lucide-react';
import { CamaraRefrigeradaItem } from '@/hooks/useCamaraRefrigeradaData';

interface CamaraRefrigeradaStatusCardsProps {
  items: CamaraRefrigeradaItem[];
}

export function CamaraRefrigeradaStatusCards({ items }: CamaraRefrigeradaStatusCardsProps) {
  const descongelando = items.filter(item => item.status === 'descongelando').length;
  const prontos = items.filter(item => item.status === 'pronto').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-orange-800 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Descongelando
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{descongelando}</div>
          <p className="text-sm text-orange-700">Itens em processo</p>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            Prontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{prontos}</div>
          <p className="text-sm text-green-700">Prontos para uso</p>
        </CardContent>
      </Card>
    </div>
  );
}
