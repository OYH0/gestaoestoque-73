import React from 'react';
import { Package } from 'lucide-react';

export function EstoqueSecoSimpleHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="bg-amber-100 p-2 rounded-lg">
          <Package className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Estoque Seco</h1>
          <p className="text-sm text-gray-500">Produtos secos e não perecíveis</p>
        </div>
      </div>
    </div>
  );
}