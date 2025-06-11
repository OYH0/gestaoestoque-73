import React, { useState } from 'react';
import { Plus, History, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
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
      
      // Registrar no histórico
      await addHistoricoItem({
        item_nome: item.nome,
        quantidade: thawQuantity,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: 'saida',
        observacoes: 'Descongelamento'
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

  // Get unique categories from items
  const categories = ['todas', ...Array.from(new Set(items.map(item => item.categoria)))];
  const lowStockItems = items.filter(item => item.minimo && item.quantidade <= item.minimo);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Plus className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Câmara Fria</h1>
      </div>

      <Tabs defaultValue="estoque" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CamaraFriaFilters
              categorias={categories}
              categoriaFiltro={filterCategory}
              setCategoriaFiltro={setFilterCategory}
              searchQuery={searchTerm}
              setSearchQuery={setSearchTerm}
            />
            
            <div className="flex flex-wrap gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-churrasco-red hover:bg-churrasco-red/90 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
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
          </div>

          <CamaraFriaAlerts itemsBaixoEstoque={lowStockItems} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        </TabsContent>

        <TabsContent value="historico" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Movimentações</h3>
            <div className="space-y-3">
              {historico.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{item.item_nome}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {item.tipo === 'entrada' ? '+' : '-'}{item.quantidade} {item.unidade}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.data_movimentacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ferramentas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Scanner QR</h3>
              <p className="text-gray-600 mb-4">Escaneie códigos QR para localizar itens rapidamente</p>
              <Button 
                variant="outline" 
                onClick={() => setShowScanner(true)}
                className="w-full"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Abrir Scanner QR
              </Button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Relatórios</h3>
              <p className="text-gray-600 mb-4">Gere relatórios do estoque atual</p>
              <Button variant="outline" className="w-full">
                Gerar Relatório PDF
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

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
