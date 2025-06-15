
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { generateHistoryPDF, generateHistoryTXT } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';

interface HistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: string;
  data_operacao: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

interface HistoricoReportDialogProps {
  historico: HistoricoItem[];
  tipoEstoque: 'camara_fria' | 'estoque_seco' | 'descartaveis' | 'camara_refrigerada';
  onClose: () => void;
}

export function HistoricoReportDialog({ historico, tipoEstoque, onClose }: HistoricoReportDialogProps) {
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [formatoArquivo, setFormatoArquivo] = useState<'pdf' | 'txt'>('pdf');

  const getTituloEstoque = () => {
    switch (tipoEstoque) {
      case 'camara_fria': return 'Câmara Fria';
      case 'estoque_seco': return 'Estoque Seco';
      case 'descartaveis': return 'Descartáveis';
      case 'camara_refrigerada': return 'Câmara Refrigerada';
      default: return 'Estoque';
    }
  };

  const filtrarHistoricoPorData = () => {
    if (!dataInicio && !dataFim) {
      return historico;
    }

    return historico.filter(item => {
      const dataItem = new Date(item.data_operacao);
      
      if (dataInicio && dataFim) {
        return dataItem >= dataInicio && dataItem <= dataFim;
      } else if (dataInicio) {
        return dataItem >= dataInicio;
      } else if (dataFim) {
        return dataItem <= dataFim;
      }
      
      return true;
    });
  };

  const handleGerarRelatorio = () => {
    const historicoFiltrado = filtrarHistoricoPorData();
    
    if (historicoFiltrado.length === 0) {
      toast({
        title: "Nenhum registro encontrado",
        description: "Não há movimentações no período selecionado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const titulo = `Relatório de Histórico - ${getTituloEstoque()}`;
      let subtitulo = 'Movimentações registradas';
      
      if (dataInicio && dataFim) {
        subtitulo += ` de ${format(dataInicio, 'dd/MM/yyyy')} até ${format(dataFim, 'dd/MM/yyyy')}`;
      } else if (dataInicio) {
        subtitulo += ` a partir de ${format(dataInicio, 'dd/MM/yyyy')}`;
      } else if (dataFim) {
        subtitulo += ` até ${format(dataFim, 'dd/MM/yyyy')}`;
      }

      if (formatoArquivo === 'pdf') {
        generateHistoryPDF(historicoFiltrado, titulo, subtitulo);
      } else {
        generateHistoryTXT(historicoFiltrado, titulo, subtitulo);
      }

      toast({
        title: "Relatório gerado com sucesso",
        description: `Arquivo ${formatoArquivo.toUpperCase()} baixado com ${historicoFiltrado.length} registros.`,
      });

      onClose();
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o arquivo.",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Gerar Relatório de Histórico
        </DialogTitle>
        <DialogDescription>
          Configure e baixe um relatório detalhado das movimentações do estoque de {getTituloEstoque()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Formato do Arquivo</Label>
          <Select value={formatoArquivo} onValueChange={(value: 'pdf' | 'txt') => setFormatoArquivo(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="txt">Texto (.txt)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataInicio ? format(dataInicio, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataInicio}
                  onSelect={setDataInicio}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dataFim && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataFim ? format(dataFim, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataFim}
                  onSelect={setDataFim}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <p><strong>Registros encontrados:</strong> {filtrarHistoricoPorData().length}</p>
          <p className="text-xs text-gray-500 mt-1">
            Deixe as datas em branco para incluir todo o histórico
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGerarRelatorio} className="bg-blue-500 hover:bg-blue-600">
            <Download className="w-4 h-4 mr-2" />
            Gerar {formatoArquivo.toUpperCase()}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
