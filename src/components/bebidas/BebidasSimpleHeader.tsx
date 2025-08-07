import React from 'react';
import { Wine } from 'lucide-react';

export function BebidasSimpleHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Wine className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Bebidas</h1>
          <p className="text-sm text-gray-500">Refrigerantes, sucos e bebidas em geral</p>
        </div>
      </div>
    </div>
  );
}