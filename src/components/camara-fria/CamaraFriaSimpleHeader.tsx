import React from 'react';
import { Snowflake } from 'lucide-react';

export function CamaraFriaSimpleHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="bg-cyan-100 p-2 rounded-lg">
          <Snowflake className="h-5 w-5 text-cyan-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Câmara Fria</h1>
          <p className="text-sm text-gray-500">Carnes e produtos congelados</p>
        </div>
      </div>
    </div>
  );
}