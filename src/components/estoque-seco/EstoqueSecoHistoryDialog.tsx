
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { EstoqueSecoHistoricoItem } from '@/hooks/useEstoqueSecoHistorico';

interface EstoqueSecoHistoryDialogProps {
  historico: EstoqueSecoHistoricoItem[];
  loading?: boolean;
}

export function EstoqueSecoHistoryDialog({ historico, loading = false }: EstoqueSecoHistoryDialogProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getUnidadeLabel = (unidade?: string) => {
    if (!unidade) return '';
    return unidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : unidade === 'fortaleza' ? 'Fortaleza' : unidade;
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-4 h-4" />
          Histórico de Movimentações
        </DialogTitle>
        <DialogDescription>
          Registro de entradas e saídas do estoque seco
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-96 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">Carregando histórico...</p>
          </div>
        ) : historico.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">Nenhuma movimentação registrada</p>
          </div>
        ) : (
          historico.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded p-3 text-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{item.item_nome}</span>
                  <Badge 
                    variant={item.tipo === 'entrada' ? 'default' : 'destructive'}
                    className="text-xs px-2 py-0"
                  >
                    {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">{formatDate(item.data_operacao)}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Quantidade: {item.quantidade} {item.unidade}</span>
                <span>Categoria: {item.categoria}</span>
                {item.unidade_item && (
                  <span>Unidade: {getUnidadeLabel(item.unidade_item)}</span>
                )}
              </div>
              {item.observacoes && (
                <div className="mt-1 text-xs text-gray-500">
                  {item.observacoes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </DialogContent>
  );
}
