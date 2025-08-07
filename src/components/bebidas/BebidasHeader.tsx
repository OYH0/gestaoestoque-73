import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, History, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BebidasHistoryDialog } from './BebidasHistoryDialog';
import { BebidasAddDialog } from './BebidasAddDialog';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { AdminGuard } from '@/components/AdminGuard';

interface BebidasHeaderProps {
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
  selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas';
  loading?: boolean;
}

export function BebidasHeader({
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
  items,
  selectedUnidade = 'todas',
  loading = false
}: BebidasHeaderProps) {
  const isMobile = useIsMobile();

  const handlePrintPDF = () => {
    try {
      generateInventoryPDF(
        items,
        'Relatório - Bebidas',
        'Inventário de bebidas'
      );
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  return (
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
        <BebidasHistoryDialog 
          historico={historico} 
          loading={loading}
        />
      </Dialog>
      
      <AdminGuard>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size={isMobile ? "sm" : "default"}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-1 md:mr-2" />
              <span className={isMobile ? "text-xs" : "text-sm"}>Nova Bebida</span>
            </Button>
          </DialogTrigger>
          <BebidasAddDialog 
            newItem={newItem}
            setNewItem={setNewItem}
            onAddNewItem={onAddNewItem}
            setDialogOpen={setDialogOpen}
            categorias={categorias}
            selectedUnidade={selectedUnidade}
          />
        </Dialog>
      </AdminGuard>
    </div>
  );
}