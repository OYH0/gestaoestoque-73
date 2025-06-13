
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';

export function CamaraRefrigeradaEmptyState() {
  return (
    <Card className="border-gray-200">
      <CardContent className="p-6 text-center">
        <div className="text-gray-500">
          <Thermometer className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhum item na câmara refrigerada</h3>
          <p className="text-sm">Os itens aparecerão aqui quando forem movidos da câmara fria para descongelamento.</p>
        </div>
      </CardContent>
    </Card>
  );
}
