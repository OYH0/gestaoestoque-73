import React from 'react';
import { Thermometer } from 'lucide-react';

export function CamaraRefrigeradaSimpleHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="bg-red-100 p-2 rounded-lg">
          <Thermometer className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Câmara Refrigerada</h1>
          <p className="text-sm text-gray-500">Produtos refrigerados</p>
        </div>
      </div>
    </div>
  );
}