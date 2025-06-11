
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, History, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { CamaraFriaHistoryDialog } from './CamaraFriaHistoryDialog';
import { CamaraFriaAddDialog } from './CamaraFriaAddDialog';
import { generateInventoryPDF } from '@/utils/pdfGenerator';

interface CamaraFriaHeaderProps {
  itemsCount: number;
  lowStockCount: number;
  historicoOpen: boolean;
  setHistoricoOpen: (open: boolean) => void;
  historico: any[];
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  newItem: any;
  setNewItem: (item: any) => void;
  onAddNewItem: () => void;
  categorias: string[];
  items: any[];
}

export function CamaraFriaHeader({
  itemsCount,
  lowStockCount,
  historicoOpen,
  setHistoricoOpen,
  historico,
  dialogOpen,
  setDialogOpen,
  newItem,
  setNewItem,
  onAddNewItem,
  categorias,
  items
}: CamaraFriaHeaderProps) {
  const isMobile = useIsMobile();

  const handlePrintPDF = () => {
    try {
      generateInventoryPDF(
        items,
        'Relatório - Câmara Fria',
        'Inventário de carnes e produtos congelados'
      );
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Câmara Fria</h2>
          <p className="text-sm md:text-base text-gray-600">Carnes e produtos congelados</p>
        </div>
      </div>
      
      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          {itemsCount} tipos
        </Badge>
        {lowStockCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {lowStockCount} baixo estoque
          </Badge>
        )}
      </div>

      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          className="border-gray-300"
          onClick={handlePrintPDF}
        >
          <FileText className="w-4 h-4 mr-1 md:mr-2" />
          <span className={isMobile ? "text-xs" : "text-sm"}>PDF</span>
        </Button>

        <Dialog open={historicoOpen} onOpenChange={setHistoricoOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="border-gray-300"
            >
              <History className="w-4 h-4 mr-1 md:mr-2" />
              <span className={isMobile ? "text-xs" : "text-sm"}>Histórico</span>
            </Button>
          </DialogTrigger>
          <CamaraFriaHistoryDialog historico={historico} />
        </Dialog>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size={isMobile ? "sm" : "default"}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-1 md:mr-2" />
              <span className={isMobile ? "text-xs" : "text-sm"}>Nova Carne</span>
            </Button>
          </DialogTrigger>
          <CamaraFriaAddDialog 
            newItem={newItem}
            setNewItem={setNewItem}
            onAddNewItem={onAddNewItem}
            setDialogOpen={setDialogOpen}
            categorias={categorias}
          />
        </Dialog>
      </div>
    </div>
  );
}
