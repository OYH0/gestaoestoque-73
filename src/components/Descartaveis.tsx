
import React, { useState } from 'react';
import { QrCode, Plus, History, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';
import { useDescartaveisHistorico } from '@/hooks/useDescartaveisHistorico';
import { DescartaveisFilters } from '@/components/descartaveis/DescartaveisFilters';
import { DescartaveisAlerts } from '@/components/descartaveis/DescartaveisAlerts';
import { DescartaveisHistoryDialog } from '@/components/descartaveis/DescartaveisHistoryDialog';
import { DescartaveisAddDialog } from '@/components/descartaveis/DescartaveisAddDialog';
import { DescartaveisItemCard } from '@/components/descartaveis/DescartaveisItemCard';
import { QRCodeGenerator } from '@/components/qr-scanner/QRCodeGenerator';
import { QRScanner } from '@/components/qr-scanner/QRScanner';
import { useIsMobile } from '@/hooks/use-mobile';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { UnidadeSelector } from '@/components/UnidadeSelector';

import { AdminGuard } from '@/components/AdminGuard';
import { useUserPermissions } from '@/hooks/useUserPermissions';

export default function Descartaveis() {
  const { items, loading, addItem, updateItemQuantity, deleteItem, qrCodes, showQRGenerator, setShowQRGenerator, lastAddedItem, fetchItems } = useDescartaveisData();
  const { historico } = useDescartaveisHistorico();
  const { isAdmin } = useUserPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [selectedUnidade, setSelectedUnidade] = useState<'juazeiro_norte' | 'fortaleza' | 'todas'>('todas');
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [newItem, setNewItem] = useState({
    nome: '',
    quantidade: 0,
    unidade: '',
    categoria: '',
    minimo: 0
  });
  const isMobile = useIsMobile();

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || item.categoria === filterCategory;
    const matchesUnidade = selectedUnidade === 'todas' || 
                          (item as any).unidade === selectedUnidade;
    return matchesSearch && matchesCategory && matchesUnidade;
  });

  const handleAddNewItem = async () => {
    if (!isAdmin) {
      console.error('Acesso negado: apenas administradores podem adicionar itens');
      return;
    }
    
    if (!newItem.nome || !newItem.categoria || !newItem.unidade) return;
    
    const itemWithUnidade = {
      ...newItem,
      unidade_item: selectedUnidade === 'todas' ? 'juazeiro_norte' : selectedUnidade
    };
    
    await addItem(itemWithUnidade);
    setNewItem({ nome: '', quantidade: 0, unidade: '', categoria: '', minimo: 0 });
    setIsAddDialogOpen(false);
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (!isAdmin) {
      console.error('Acesso negado: apenas administradores podem atualizar quantidades');
      return;
    }
    await updateItemQuantity(id, newQuantity);
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin) {
      console.error('Acesso negado: apenas administradores podem deletar itens');
      return;
    }
    await deleteItem(id);
  };

  const handleQRScanSuccess = () => {
    fetchItems(); // Recarregar os dados após scan bem-sucedido
  };

  const handlePrintPDF = () => {
    try {
      const unidadeText = selectedUnidade === 'todas' 
        ? 'Todas as Unidades' 
        : selectedUnidade === 'juazeiro_norte' 
        ? 'Juazeiro do Norte' 
        : 'Fortaleza';
        
      generateInventoryPDF(
        filteredItems,
        `Relatório - Descartáveis - ${unidadeText}`,
        'Inventário de produtos descartáveis'
      );
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Categorias predefinidas para descartáveis
  const categories = ['Todos', 'Pratos e Talheres', 'Copos e Bebidas', 'Embalagens', 'Guardanapos e Toalhas', 'Sacolas e Sacos', 'Recipientes', 'Descartáveis Diversos'];
  const lowStockItems = filteredItems.filter(item => item.minimo && item.quantidade <= item.minimo);

  return (
    <div className="space-y-6 animate-enter">
      <div className={`flex flex-wrap gap-2 items-center ${isMobile ? 'justify-center' : ''}`}>
        <UnidadeSelector 
          selectedUnidade={selectedUnidade}
          onUnidadeChange={setSelectedUnidade}
        />
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

        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
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
          <DescartaveisHistoryDialog historico={historico} />
        </Dialog>
        
        <AdminGuard>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size={isMobile ? "sm" : "default"}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-1 md:mr-2" />
                <span className={isMobile ? "text-xs" : "text-sm"}>Novo Item</span>
              </Button>
            </DialogTrigger>
            <DescartaveisAddDialog 
              newItem={newItem}
              setNewItem={setNewItem}
              onAddNewItem={handleAddNewItem}
              setDialogOpen={setIsAddDialogOpen}
              categorias={categories}
              selectedUnidade={selectedUnidade}
            />
          </Dialog>
        </AdminGuard>
      </div>

      <AdminGuard fallback={null}>
        <div className={`flex ${isMobile ? 'justify-center' : ''}`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Escanear QR Code
          </Button>
        </div>
      </AdminGuard>

      <div className={`flex flex-wrap gap-2 items-center ${isMobile ? 'justify-center' : ''}`}>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          {filteredItems.length} itens
        </Badge>
        {lowStockItems.length > 0 && (
          <Badge 
            variant="destructive" 
            className="text-xs cursor-pointer hover:bg-red-600"
            onClick={() => setShowAlerts(!showAlerts)}
          >
            {lowStockItems.length} baixo estoque
          </Badge>
        )}
      </div>

      <section className="animate-fade-in">
        <DescartaveisFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          categories={categories}
        />
      </section>

      {showAlerts && (
        <DescartaveisAlerts itemsBaixoEstoque={lowStockItems} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
        {filteredItems.map((item) => (
          <DescartaveisItemCard
            key={item.id}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum item encontrado</p>
        </div>
      )}

      {showQRGenerator && qrCodes.length > 0 && lastAddedItem && (
        <QRCodeGenerator
          qrCodes={qrCodes}
          onClose={() => setShowQRGenerator(false)}
          itemName={lastAddedItem.nome}
          stockType="Descartáveis"
        />
      )}

      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
          onSuccess={handleQRScanSuccess}
        />
      )}
    </div>
  );
}
