import React from 'react';
import { FileText } from 'lucide-react';

export function DescartaveisSimpleHeader() {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <FileText className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Descartáveis</h1>
          <p className="text-sm text-gray-500">Pratos, copos e utensílios descartáveis</p>
        </div>
      </div>
    </div>
  );
}