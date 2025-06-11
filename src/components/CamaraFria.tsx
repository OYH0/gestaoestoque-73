
import React, { useState } from 'react';
import { Plus, History, QrCode, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';
import { useCamaraRefrigeradaData } from '@/hooks/useCamaraRefrigeradaData';
import { CamaraFriaFilters } from '@/components/camara-fria/CamaraFriaFilters';
import { CamaraFriaItemCard } from '@/components/camara-fria/CamaraFriaItemCard';
import { CamaraFriaAddDialog } from '@/components/camara-fria/CamaraFriaAddDialog';
import { CamaraFriaHistoryDialog } from '@/components/camara-fria/CamaraFriaHistoryDialog';
import { CamaraFriaAlerts } from '@/components/camara-fria/CamaraFriaAlerts';
import { QRCodeGenerator } from '@/components/qr-scanner/QRCodeGenerator';
import { QRScanner } from '@/components/qr-scanner/QRScanner';

export default function CamaraFria() {
  const { items, loading, addItem, updateItemQuantity, deleteItem, qrCodes, showQRGenerator, setShowQRGenerator, lastAddedItem } = useCamaraFriaData();
  const { historico, addHistoricoItem } = useCamaraFriaHistorico();
  const { addItem: addCamaraRefrigeradaItem } = useCamaraRefrigeradaData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // States for managing editing and thawing
  const [editingItems, setEditingItems] = useState<Record<string, number>>({});
  const [thawingItems, setThawingItems] = useState<Record<string, number>>({});

  const handleUpdateQuantity = async (id: string, newQuantity: number, tipo: 'entrada' | 'saida') => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const quantityDifference = tipo === 'entrada' ? newQuantity - item.quantidade : item.quantidade - newQuantity;
    
    await updateItemQuantity(id, newQuantity);
    
    // Registrar no histórico
    await addHistoricoItem({
      item_nome: item.nome,
      quantidade: Math.abs(quantityDifference),
      unidade: item.unidade,
      categoria: item.categoria,
      tipo,
      observacoes: `${tipo === 'entrada' ? 'Entrada' : 'Saída'} de estoque`
    });
  };

  // Editing handlers
  const handleStartEdit = (id: string, currentQuantity: number) => {
    setEditingItems(prev => ({ ...prev, [id]: currentQuantity }));
  };

  const handleUpdateEdit = (id: string, delta: number) => {
    setEditingItems(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const handleConfirmChange = async (id: string) => {
    const newQuantity = editingItems[id];
    if (newQuantity !== undefined) {
      await updateItemQuantity(id, newQuantity);
      setEditingItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleCancelEdit = (id: string) => {
    setEditingItems(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  // Thawing handlers
  const handleStartThaw = (id: string, quantity: number) => {
    setThawingItems(prev => ({ ...prev, [id]: quantity }));
  };

  const handleUpdateThaw = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    setThawingItems(prev => ({
      ...prev,
      [id]: Math.max(1, Math.min(item.quantidade, (prev[id] || 1) + delta))
    }));
  };

  const handleConfirmThaw = async (id: string) => {
    const thawQuantity = thawingItems[id];
    const item = items.find(i => i.id === id);
    if (thawQuantity !== undefined && item) {
      const newQuantity = item.quantidade - thawQuantity;
      await updateItemQuantity(id, newQuantity);
      
      // Adicionar item à câmara refrigerada
      await addCamaraRefrigeradaItem({
        nome: item.nome,
        quantidade: thawQuantity,
        unidade: item.unidade,
        categoria: item.categoria,
        status: 'descongelando',
        data_entrada: new Date().toISOString().split('T')[0],
        temperatura_ideal: item.temperatura_ideal,
        observacoes: `Movido da câmara fria para descongelamento`
      });
      
      // Registrar no histórico da câmara fria
      await addHistoricoItem({
        item_nome: item.nome,
        quantidade: thawQuantity,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: 'saida',
        observacoes: 'Movido para câmara refrigerada'
      });
      
      setThawingItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleCancelThaw = (id: string) => {
    setThawingItems(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || item.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  // Get unique categories from items, but ensure the main categories are always available
  const categories = ['Todos', 'Bovina', 'Suína', 'Aves', 'Embutidos'];
  const lowStockItems = items.filter(item => item.minimo && item.quantidade <= item.minimo);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Plus className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Câmara Fria</h1>
          <p className="text-gray-600">Carnes e produtos congelados</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
            {items.length} tipos
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-gray-600">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>

          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-gray-600">
                <History className="w-4 h-4 mr-2" />
                Histórico
              </Button>
            </DialogTrigger>
            <CamaraFriaHistoryDialog historico={historico} />
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nova Carne
              </Button>
            </DialogTrigger>
            <CamaraFriaAddDialog
              newItem={{
                nome: '',
                quantidade: 0,
                unidade: 'kg',
                categoria: '',
                minimo: 5
              }}
              setNewItem={() => {}}
              onAddNewItem={() => {}}
              setDialogOpen={setIsAddDialogOpen}
              categorias={categories}
            />
          </Dialog>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-fit text-green-600 border-green-200 hover:bg-green-50"
          onClick={() => setShowScanner(true)}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Escanear QR Code
        </Button>
      </div>

      <CamaraFriaFilters
        categorias={categories}
        categoriaFiltro={filterCategory}
        setCategoriaFiltro={setFilterCategory}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />

      <CamaraFriaAlerts itemsBaixoEstoque={lowStockItems} />

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <CamaraFriaItemCard
            key={item.id}
            item={item}
            isEditing={editingItems.hasOwnProperty(item.id)}
            editValue={editingItems[item.id] || item.quantidade}
            isThawing={thawingItems.hasOwnProperty(item.id)}
            thawValue={thawingItems[item.id] || 1}
            onStartEdit={handleStartEdit}
            onUpdateEdit={handleUpdateEdit}
            onConfirmChange={handleConfirmChange}
            onCancelEdit={handleCancelEdit}
            onStartThaw={handleStartThaw}
            onUpdateThaw={handleUpdateThaw}
            onConfirmThaw={handleConfirmThaw}
            onCancelThaw={handleCancelThaw}
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
          itemName={lastAddedItem?.nome || ''}
        />
      )}

      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
