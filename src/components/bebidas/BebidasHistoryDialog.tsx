import React from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

interface BebidasHistoryDialogProps {
  historico: any[];
  loading?: boolean;
}

export function BebidasHistoryDialog({ historico, loading = false }: BebidasHistoryDialogProps) {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <DialogContent className={`${isMobile ? 'w-[95%] max-w-sm' : 'sm:max-w-2xl'}`}>
        <DialogHeader>
          <DialogTitle className={isMobile ? "text-lg" : "text-xl"}>
            Histórico de Bebidas
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Carregando histórico...</p>
          </div>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className={`${isMobile ? 'w-[95%] max-w-sm' : 'sm:max-w-2xl'}`}>
      <DialogHeader>
        <DialogTitle className={isMobile ? "text-lg" : "text-xl"}>
          Histórico de Bebidas
        </DialogTitle>
      </DialogHeader>
      
      <ScrollArea className="h-[400px] pr-4">
        {historico.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma movimentação registrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historico.map((item, index) => (
              <div
                key={item.id || index}
                className="border rounded-lg p-3 bg-white shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.tipo === 'entrada' ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                      <h4 className={`font-medium text-gray-900 truncate ${isMobile ? 'text-sm' : ''}`}>
                        {item.item_nome}
                      </h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge 
                        variant={item.tipo === 'entrada' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.categoria}
                      </Badge>
                      {item.unidade_item && (
                        <Badge variant="secondary" className="text-xs">
                          {item.unidade_item === 'juazeiro_norte' ? 'JN' : 'FOR'}
                        </Badge>
                      )}
                    </div>
                    
                    <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      <div>Quantidade: <span className="font-medium">{item.quantidade} {item.unidade}</span></div>
                      {item.observacoes && (
                        <div className="mt-1">Obs: <span className="italic">{item.observacoes}</span></div>
                      )}
                    </div>
                  </div>
                  
                  <div className={`text-right text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {format(new Date(item.created_at), 'dd/MM/yy', { locale: ptBR })}
                    <br />
                    {format(new Date(item.created_at), 'HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </DialogContent>
  );
}