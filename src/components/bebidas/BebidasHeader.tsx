import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, History, FileText, TrendingUp, AlertTriangle, Package, BarChart3 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BebidasHistoryDialog } from './BebidasHistoryDialog';
import { BebidasAddDialog } from './BebidasAddDialog';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent } from '@/components/ui/card';

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

  // Calcular estatísticas
  const totalQuantity = items.reduce((acc, item) => acc + item.quantidade, 0);
  const totalValue = items.reduce((acc, item) => acc + (item.quantidade * (item.preco_unitario || 0)), 0);
  const averageStock = items.length > 0 ? Math.round(totalQuantity / items.length) : 0;

  return (
    <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 shadow-sm">
      <div className="px-4 py-4 space-y-4">
        {/* Informações estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-blue-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total de Tipos</p>
                  <p className="text-lg font-bold text-blue-900">{itemsCount}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Quantidade Total</p>
                  <p className="text-lg font-bold text-blue-900">{totalQuantity}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Valor Total</p>
                  <p className="text-lg font-bold text-blue-900">R$ {totalValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`border-200 bg-white/70 backdrop-blur-sm ${lowStockCount > 0 ? 'border-orange-200' : 'border-blue-200'}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${lowStockCount > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                    Estoque Baixo
                  </p>
                  <p className={`text-lg font-bold ${lowStockCount > 0 ? 'text-orange-900' : 'text-blue-900'}`}>
                    {lowStockCount}
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${lowStockCount > 0 ? 'text-orange-500' : 'text-blue-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de ação */}
        <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "default"}
            className="border-blue-300 hover:bg-blue-50 text-blue-700"
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
                className="border-blue-300 hover:bg-blue-50 text-blue-700"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
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
      </div>
    </div>
  );
}