
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface HistoricoItem {
  id: number;
  itemName: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  unidade: string;
  data: string;
  hora: string;
}

interface CamaraFriaHistoryDialogProps {
  historico: HistoricoItem[];
}

export function CamaraFriaHistoryDialog({ historico }: CamaraFriaHistoryDialogProps) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Histórico de Movimentações</DialogTitle>
        <DialogDescription>
          Registro de entradas e saídas de carnes
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {historico.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma movimentação registrada</p>
        ) : (
          historico.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium">{item.itemName}</p>
                  <p className="text-sm text-gray-600">
                    {item.tipo === 'entrada' ? 'Entrada' : 'Saída'} de {item.quantidade} {item.unidade}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{item.data}</p>
                <p className="text-sm text-gray-600">{item.hora}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </DialogContent>
  );
}
