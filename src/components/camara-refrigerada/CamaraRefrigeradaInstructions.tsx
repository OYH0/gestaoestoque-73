
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function CamaraRefrigeradaInstructions() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Instruções de Descongelamento</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Carnes pequenas (até 2kg): 30-45 minutos</li>
          <li>• Carnes médias (2-5kg): 1-2 horas</li>
          <li>• Carnes grandes (acima de 5kg): 3-4 horas</li>
          <li>• Sempre manter na temperatura de 2-4°C</li>
        </ul>
      </CardContent>
    </Card>
  );
}
