import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CamaraRefrigeradaHistoricoItem } from '@/hooks/useCamaraRefrigeradaHistorico';
import { HistoricoReportDialog } from '@/components/historico/HistoricoReportDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface CamaraRefrigeradaHistoryDialogProps {
  historico: CamaraRefrigeradaHistoricoItem[];
  loading?: boolean;
}

export function CamaraRefrigeradaHistoryDialog({ 
  historico, 
  loading = false 
}: CamaraRefrigeradaHistoryDialogProps) {
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Memoize formatters to prevent re-creation on every render
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const getUnidadeLabel = useCallback((unidade: string) => {
    return unidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza';
  }, []);

  const getUnidadeDisplay = useCallback((item: CamaraRefrigeradaHistoricoItem) => {
    // Se a unidade for uma das unidades específicas, usar 'pç' como padrão
    if (item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza') {
      return 'pç';
    }
    return item.unidade;
  }, []);

  // Memoize the mapped historico items to prevent re-processing
  const processedHistorico = useMemo(() => {
    return historico.map((item) => ({
      ...item,
      formattedDate: formatDate(item.data_operacao),
      unidadeDisplay: getUnidadeDisplay(item),
      unidadeLabel: item.unidade_item ? getUnidadeLabel(item.unidade_item) : null
    }));
  }, [historico, formatDate, getUnidadeDisplay, getUnidadeLabel]);

  return (
    <>
      <DialogContent className="max-w-2xl bg-white mobile-optimized">
        <DialogHeader>
          <div className={`flex items-center ${isMobile ? 'flex-col gap-2' : 'justify-between'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <DialogTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Calendar className="w-4 h-4" />
                Histórico de Movimentações
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Registro de retiradas e retornos ao freezer
              </DialogDescription>
            </div>
            {!isMobile && (
              <Button
                variant="outline"
                size="default"
                onClick={() => setReportDialogOpen(true)}
                className="flex items-center gap-2 mobile-optimized"
              >
                <FileText className="w-4 h-4" />
                Gerar Relatório
              </Button>
            )}
          </div>
          {isMobile && (
            <div className="flex justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReportDialogOpen(true)}
                className="flex items-center gap-2 text-xs px-2 py-1 mobile-optimized"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
            </div>
          )}
        </DialogHeader>
        
        <div className="max-h-96 overflow-y-auto space-y-2 scroll-smooth">
          {loading ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">Carregando histórico...</p>
            </div>
          ) : processedHistorico.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">Nenhuma movimentação registrada</p>
            </div>
          ) : (
            processedHistorico.map((item) => (
              <div 
                key={item.id} 
                className="bg-gray-50 rounded p-3 text-sm border border-gray-100 mobile-optimized"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 truncate max-w-[150px]">
                      {item.item_nome}
                    </span>
                    <Badge 
                      variant={item.tipo === 'volta_freezer' ? 'default' : 'destructive'}
                      className="text-xs px-2 py-0 flex-shrink-0"
                    >
                      {item.tipo === 'volta_freezer' ? 'Retorno' : 'Retirada'}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {item.formattedDate}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                  <span className="flex-shrink-0">
                    Qtd: {item.quantidade} {item.unidadeDisplay}
                  </span>
                  <span className="truncate max-w-[100px]">
                    Cat: {item.categoria}
                  </span>
                  {item.unidadeLabel && (
                    <span className="flex-shrink-0">
                      {item.unidadeLabel}
                    </span>
                  )}
                </div>
                
                {item.observacoes && (
                  <div className="mt-1 text-xs text-gray-500 truncate">
                    {item.observacoes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="mobile-optimized">
          <HistoricoReportDialog
            historico={historico}
            tipoEstoque="camara_refrigerada"
            onClose={() => setReportDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}