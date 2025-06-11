
import React, { useState } from 'react';
import { Plus, History, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';
import { CamaraFriaAddDialog } from '@/components/camara-fria/CamaraFriaAddDialog';
import { CamaraFriaHistoryDialog } from '@/components/camara-fria/CamaraFriaHistoryDialog';
import { CamaraFriaItemCard } from '@/components/camara-fria/CamaraFriaItemCard';
import { QRCodeGenerator } from '@/components/qr-scanner/QRCodeGenerator';
import { QRScanner } from '@/components/qr-scanner/QRScanner';

export default function CamaraFria() {
  const { items, loading, addItem, updateItemQuantity, deleteItem, qrCodes, showQRGenerator, setShowQRGenerator, lastAddedItem } = useCamaraFriaData();
  const { historico, addHistoricoItem } = useCamaraFriaHistorico();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingItems, setEditingItems] = useState<{[key: string]: number}>({});
  const [thawingItems, setThawingItems] = useState<{[key: string]: number}>({});
  const [newItem, setNewItem] = useState({
    nome: '',
    quantidade: 0,
    unidade: 'kg',
    categoria: '',
    minimo: 5
  });

  const categorias = ['todas', 'Bovina', 'Suína', 'Aves', 'Peixes', 'Embutidos'];

  const handleAddNewItem = async () => {
    if (!newItem.nome || !newItem.categoria) return;
    
    await addItem({
      nome: newItem.nome,
      quantidade: newItem.quantidade,
      unidade: newItem.unidade,
      categoria: newItem.categoria,
      minimo: newItem.minimo,
      data_entrada: new Date().toISOString().split('T')[0],
      data_validade: null,
      fornecedor: null,
      observacoes: null,
      preco_unitario: null,
      temperatura_ideal: null
    });
    
    setNewItem({
      nome: '',
      quantidade: 0,
      unidade: 'kg',
      categoria: '',
      minimo: 5
    });
    
    setIsAddDialogOpen(false);
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number, tipo: 'entrada' | 'saida') => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const quantityDifference = tipo === 'entrada' ? newQuantity - item.quantidade : item.quantidade - newQuantity;
    
    await updateItemQuantity(id, newQuantity);
    
    await addHistoricoItem({
      item_nome: item.nome,
      quantidade: Math.abs(quantityDifference),
      unidade: item.unidade,
      categoria: item.categoria,
      tipo,
      observacoes: `${tipo === 'entrada' ? 'Entrada' : 'Saída'} de estoque`
    });
  };

  const handleStartEdit = (id: string, currentQuantity: number) => {
    setEditingItems(prev => ({...prev, [id]: currentQuantity}));
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
      const item = items.find(i => i.id === id);
      if (item) {
        const tipo = newQuantity > item.quantidade ? 'entrada' : 'saida';
        await handleUpdateQuantity(id, newQuantity, tipo);
      }
    }
    setEditingItems(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
  };

  const handleCancelEdit = (id: string) => {
    setEditingItems(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
  };

  const handleStartThaw = (id: string, quantity: number) => {
    setThawingItems(prev => ({...prev, [id]: quantity}));
  };

  const handleUpdateThaw = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    setThawingItems(prev => ({
      ...prev,
      [id]: Math.min(item.quantidade, Math.max(1, (prev[id] || 1) + delta))
    }));
  };

  const handleConfirmThaw = async (id: string) => {
    const thawQuantity = thawingItems[id];
    if (thawQuantity !== undefined) {
      const item = items.find(i => i.id === id);
      if (item) {
        const newQuantity = item.quantidade - thawQuantity;
        await updateItemQuantity(id, newQuantity);
        
        await addHistoricoItem({
          item_nome: item.nome,
          quantidade: thawQuantity,
          unidade: item.unidade,
          categoria: item.categoria,
          tipo: 'saida',
          observacoes: 'Descongelamento para câmara refrigerada'
        });
      }
    }
    setThawingItems(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
  };

  const handleCancelThaw = (id: string) => {
    setThawingItems(prev => {
      const newState = {...prev};
      delete newState[id];
      return newState;
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'todas' || item.categoria === filterCategory;
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

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Plus className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Câmara Fria</h1>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="Buscar carnes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm border rounded-lg"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm border rounded-lg"
          >
            <option value="todas">Todas as categorias</option>
            {Array.from(new Set(items.map(item => item.categoria))).map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-churrasco-red hover:bg-churrasco-red/90 text-white shadow-lg text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Adicionar Item
              </Button>
            </DialogTrigger>
            <CamaraFriaAddDialog 
              newItem={newItem}
              setNewItem={setNewItem}
              onAddNewItem={handleAddNewItem}
              setDialogOpen={setIsAddDialogOpen}
              categorias={categorias}
            />
          </Dialog>

          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="shadow-lg text-xs sm:text-sm">
                <History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Histórico
              </Button>
            </DialogTrigger>
            <CamaraFriaHistoryDialog historico={historico} />
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => setShowScanner(true)}
            className="shadow-lg text-xs sm:text-sm"
          >
            <QrCode className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Scanner QR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {filteredItems.map((item) => (
          <CamaraFriaItemCard
            key={item.id}
            item={item}
            isEditing={item.id in editingItems}
            editValue={editingItems[item.id] || item.quantidade}
            isThawing={item.id in thawingItems}
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
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">Nenhum item encontrado</p>
        </div>
      )}

      {showQRGenerator && qrCodes.length > 0 && (
        <QRCodeGenerator
          isOpen={showQRGenerator}
          qrCodes={qrCodes}
          onClose={() => setShowQRGenerator(false)}
          itemName={lastAddedItem?.nome || ''}
        />
      )}

      {showScanner && (
        <QRScanner 
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onSuccess={() => {
            console.log('QR Code scanned successfully');
            setShowScanner(false);
          }}
        />
      )}
    </div>
  );
}
