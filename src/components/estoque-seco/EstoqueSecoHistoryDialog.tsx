
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EstoqueSecoHistoricoItem } from '@/hooks/useEstoqueSecoHistorico';

interface EstoqueSecoHistoryDialogProps {
  historico: EstoqueSecoHistoricoItem[];
}

export function EstoqueSecoHistoryDialog({ historico }: EstoqueSecoHistoryDialogProps) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Histórico de Movimentações - Estoque Seco</DialogTitle>
        <DialogDescription>
          Registro de entradas e saídas do estoque seco
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
                  <p className="font-medium">{item.item_nome}</p>
                  <p className="text-sm text-gray-600">
                    {item.tipo === 'entrada' ? 'Entrada' : 'Saída'} de {item.quantidade} {item.unidade}
                  </p>
                  {item.observacoes && (
                    <p className="text-xs text-gray-500">{item.observacoes}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date(item.data_operacao).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(item.data_operacao).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </DialogContent>
  );
}
