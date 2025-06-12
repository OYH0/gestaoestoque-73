
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { DescartaveisHistoricoItem } from '@/hooks/useDescartaveisHistorico';

interface DescartaveisHistoryDialogProps {
  historico: DescartaveisHistoricoItem[];
  loading?: boolean;
}

export function DescartaveisHistoryDialog({ historico, loading = false }: DescartaveisHistoryDialogProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getUnidadeLabel = (unidade: string) => {
    return unidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza';
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Histórico de Movimentações - Descartáveis
        </DialogTitle>
        <DialogDescription>
          Registro de entradas e saídas de descartáveis
        </DialogDescription>
      </DialogHeader>
      
      <div className="max-h-96 overflow-y-auto space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Carregando histórico...</p>
          </div>
        ) : historico.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">Nenhuma movimentação registrada</p>
            <p className="text-sm text-gray-400">As operações aparecerão aqui quando forem realizadas</p>
          </div>
        ) : (
          historico.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-l-blue-400">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {item.tipo === 'entrada' ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      )}
                      <h3 className="font-semibold text-gray-900">{item.item_nome}</h3>
                    </div>
                    <Badge 
                      variant={item.tipo === 'entrada' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                    <div>
                      <span className="font-medium">Quantidade:</span> {item.quantidade} {item.unidade}
                    </div>
                    <div>
                      <span className="font-medium">Categoria:</span> {item.categoria}
                    </div>
                    <div>
                      <span className="font-medium">Unidade:</span> {getUnidadeLabel(item.unidade)}
                    </div>
                  </div>
                  
                  {item.observacoes && (
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Observações:</span> {item.observacoes}
                    </div>
                  )}
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-sm text-gray-500">{formatDate(item.data_operacao)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DialogContent>
  );
}
