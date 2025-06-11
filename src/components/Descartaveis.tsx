
import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';
import { useDescartaveisHistorico } from '@/hooks/useDescartaveisHistorico';
import { DescartaveisHeader } from '@/components/descartaveis/DescartaveisHeader';
import { DescartaveisFilters } from '@/components/descartaveis/DescartaveisFilters';
import { DescartaveisAlerts } from '@/components/descartaveis/DescartaveisAlerts';
import { DescartaveisHistoryDialog } from '@/components/descartaveis/DescartaveisHistoryDialog';
import { DescartaveisAddDialog } from '@/components/descartaveis/DescartaveisAddDialog';
import { DescartaveisItemCard } from '@/components/descartaveis/DescartaveisItemCard';
import { QRCodeGenerator } from '@/components/qr-scanner/QRCodeGenerator';
import { QRScanner } from '@/components/qr-scanner/QRScanner';

export default function Descartaveis() {
  const { items, loading, addItem, updateItemQuantity, deleteItem, qrCodes, showQRGenerator, setShowQRGenerator, lastAddedItem, fetchItems } = useDescartaveisData();
  const { historico } = useDescartaveisHistorico();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [newItem, setNewItem] = useState({
    nome: '',
    quantidade: 0,
    unidade: '',
    categoria: '',
    minimo: 0
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || item.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddNewItem = async () => {
    if (!newItem.nome || !newItem.categoria || !newItem.unidade) return;
    
    await addItem(newItem);
    setNewItem({ nome: '', quantidade: 0, unidade: '', categoria: '', minimo: 0 });
    setIsAddDialogOpen(false);
  };

  const handleQRScanSuccess = () => {
    fetchItems(); // Recarregar os dados após scan bem-sucedido
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
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
  const lowStockItems = items.filter(item => item.minimo && item.quantidade <= item.minimo);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <DescartaveisHeader
        itemsCount={items.length}
        lowStockCount={lowStockItems.length}
        historicoOpen={isHistoryDialogOpen}
        setHistoricoOpen={setIsHistoryDialogOpen}
        historico={historico}
        dialogOpen={isAddDialogOpen}
        setDialogOpen={setIsAddDialogOpen}
        newItem={newItem}
        setNewItem={setNewItem}
        onAddNewItem={handleAddNewItem}
        categorias={categories}
        items={items}
      />

      <Button 
        variant="outline" 
        size="sm" 
        className="w-fit text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => setShowQRScanner(true)}
      >
        <QrCode className="w-4 h-4 mr-2" />
        Escanear QR Code
      </Button>

      <DescartaveisFilters
        categorias={categories}
        categoriaFiltro={filterCategory}
        setCategoriaFiltro={setFilterCategory}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />

      <DescartaveisAlerts itemsBaixoEstoque={lowStockItems} />

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <DescartaveisItemCard
            key={item.id}
            item={item}
            onUpdateQuantity={updateItemQuantity}
            onDelete={deleteItem}
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
