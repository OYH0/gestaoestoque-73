import React, { useState } from 'react';
import { Plus, History, QrCode, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useBebidas } from '@/hooks/useBebidas';
import { useBebidasHistorico } from '@/hooks/useBebidasHistorico';
import { BebidasFilters } from '@/components/bebidas/BebidasFilters';
import { BebidasItemCard } from '@/components/bebidas/BebidasItemCard';
import { BebidasAddDialog } from '@/components/bebidas/BebidasAddDialog';
import { BebidasHistoryDialog } from '@/components/bebidas/BebidasHistoryDialog';
import { BebidasAlerts } from '@/components/bebidas/BebidasAlerts';
import { BebidasHeader } from '@/components/bebidas/BebidasHeader';

import { QRCodeGenerator } from '@/components/qr-scanner/QRCodeGenerator';
import { QRScanner } from '@/components/qr-scanner/QRScanner';
import { UnidadeSelector } from '@/components/UnidadeSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { AdminGuard } from '@/components/AdminGuard';
import { toast } from '@/hooks/use-toast';

export default function Bebidas() {
  const { 
    items, 
    loading, 
    addItem, 
    updateItemQuantity, 
    deleteItem,
    qrCodes,
    showQRGenerator,
    setShowQRGenerator,
    lastAddedItem
  } = useBebidas();
  
  const [selectedUnidade, setSelectedUnidade] = useState<'juazeiro_norte' | 'fortaleza' | 'todas'>('todas');
  const { historico, addHistoricoItem } = useBebidasHistorico(selectedUnidade);
  const { canModify } = useUserPermissions();
  
  const [newItem, setNewItem] = useState({
    nome: '',
    quantidade: 0,
    unidade: 'un',
    categoria: '',
    minimo: 0,
    unidade_item: selectedUnidade === 'todas' ? 'juazeiro_norte' : selectedUnidade as 'juazeiro_norte' | 'fortaleza'
  });
  
  const [editingItems, setEditingItems] = useState<Record<string, number>>({});
  
  const itemsByUnidade = items.filter(item => {
    if (selectedUnidade === 'todas') return true;
    return item.unidade_item === selectedUnidade;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const isMobile = useIsMobile();
  
  const handleAddNewItem = async () => {
    if (!canModify) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores e gerentes podem adicionar itens.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('=== TENTANDO ADICIONAR BEBIDA ===');
    console.log('Permissões:', { canModify });
    console.log('Item:', newItem);
    
    if (!newItem.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite o nome da bebida.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newItem.categoria) {
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }

    const unidadeParaItem = selectedUnidade === 'todas' ? 'juazeiro_norte' : selectedUnidade;
    
    const itemWithUnidade = {
      ...newItem,
      quantidade: Number(newItem.quantidade),
      unidade_item: unidadeParaItem
    };

    try {
      console.log('=== EXECUTANDO ADIÇÃO ===');
      console.log('Item a ser adicionado:', itemWithUnidade);
      
      toast({
        title: "Adicionando item...",
        description: "Aguarde enquanto o item é adicionado ao estoque.",
      });
      
      const addedItem = await addItem(itemWithUnidade);
      console.log('=== ITEM ADICIONADO ===', addedItem);
      
      if (addedItem && Number(newItem.quantidade) > 0) {
        await addHistoricoItem({
          item_nome: newItem.nome,
          quantidade: Number(newItem.quantidade),
          unidade: newItem.unidade,
          categoria: newItem.categoria,
          tipo: 'entrada',
          observacoes: 'Adição de novo item ao estoque',
          unidade_item: unidadeParaItem
        });
      }
      
      setNewItem({
        nome: '',
        quantidade: 0,
        unidade: 'un',
        categoria: '',
        minimo: 0,
        unidade_item: unidadeParaItem
      });
      
      setIsAddDialogOpen(false);
      
      toast({
        title: "Item adicionado com sucesso!",
        description: `${newItem.nome} foi adicionado ao estoque.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (!canModify) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores e gerentes podem atualizar quantidades.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const result = await updateItemQuantity(id, newQuantity);
      
      if (result && result.quantityDifference !== 0) {
        await addHistoricoItem({
          item_nome: result.item.nome,
          quantidade: Math.abs(result.quantityDifference),
          unidade: result.item.unidade,
          categoria: result.item.categoria,
          tipo: result.quantityDifference > 0 ? 'entrada' : 'saida',
          observacoes: `${result.quantityDifference > 0 ? 'Entrada' : 'Saída'} de estoque`,
          unidade_item: result.item.unidade_item
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      });
    }
  };

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
    if (!canModify) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores e gerentes podem editar itens.",
        variant: "destructive",
      });
      return;
    }
    
    const item = items.find(i => i.id === id);
    const newQuantity = editingItems[id];
    
    if (newQuantity !== undefined && item) {
      const oldQuantity = item.quantidade;
      await updateItemQuantity(id, newQuantity);
      
      if (newQuantity !== oldQuantity) {
        const quantityDifference = newQuantity - oldQuantity;
        await addHistoricoItem({
          item_nome: item.nome,
          quantidade: Math.abs(quantityDifference),
          unidade: item.unidade,
          categoria: item.categoria,
          tipo: quantityDifference > 0 ? 'entrada' : 'saida',
          observacoes: 'Ajuste manual de estoque',
          unidade_item: item.unidade_item
        });
      }
      
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

  const handleDeleteItem = async (id: string) => {
    if (!canModify) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores e gerentes podem deletar itens.",
        variant: "destructive",
      });
      return;
    }
    
    console.log('=== TENTANDO DELETAR BEBIDA ===');
    console.log('Permissões:', { canModify });
    console.log('ID:', id);
    
    try {
      console.log('=== EXECUTANDO DELEÇÃO ===');
      console.log('ID para deletar:', id);
      
      const deletedItem = await deleteItem(id);
      console.log('=== ITEM DELETADO ===', deletedItem);
      
      if (deletedItem && deletedItem.quantidade > 0) {
        await addHistoricoItem({
          item_nome: deletedItem.nome,
          quantidade: deletedItem.quantidade,
          unidade: deletedItem.unidade,
          categoria: deletedItem.categoria,
          tipo: 'saida',
          observacoes: 'Item removido do estoque',
          unidade_item: deletedItem.unidade_item
        });
      }

      toast({
        title: "Item removido",
        description: `${deletedItem?.nome} foi removido do estoque.`,
      });
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      toast({
        title: "Erro ao remover item",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = itemsByUnidade.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || item.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  const categories = ['Todos', 'Refrigerantes', 'Sucos', 'Águas', 'Cervejas', 'Energéticos'];
  const lowStockItems = filteredItems.filter(item => item.minimo && item.quantidade <= item.minimo);

  return (
    <div className="space-y-6 animate-enter">
      <UnidadeSelector 
        selectedUnidade={selectedUnidade}
        onUnidadeChange={setSelectedUnidade}
      />

      <BebidasHeader
        itemsCount={filteredItems.length}
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
        items={filteredItems}
        selectedUnidade={selectedUnidade}
      />

      <AdminGuard fallback={
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-800">
                Apenas administradores podem realizar esta ação.
              </p>
            </div>
          </div>
        </div>
      }>
        <div className={`flex ${isMobile ? 'justify-center' : ''} gap-2 flex-wrap`}>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={() => setShowScanner(true)}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Escanear QR Code
          </Button>
        </div>
      </AdminGuard>

      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          {filteredItems.length} tipos
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
        {showAlerts && (
          <BebidasAlerts 
            lowStockItems={lowStockItems}
            selectedUnidade={selectedUnidade}
          />
        )}
      </section>

      <section className="animate-fade-in">
        <BebidasFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          categories={categories}
        />
      </section>

      <section className="animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1">
          {filteredItems.map((item) => (
            <BebidasItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onDeleteItem={handleDeleteItem}
              onStartEdit={handleStartEdit}
              onUpdateEdit={handleUpdateEdit}
              onConfirmChange={handleConfirmChange}
              onCancelEdit={handleCancelEdit}
              editingQuantity={editingItems[item.id]}
              isEditing={item.id in editingItems}
            />
          ))}
        </div>
      </section>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma bebida encontrada.</p>
        </div>
      )}

      {/* QR Code Generator Dialog */}
      {showQRGenerator && (
        <QRCodeGenerator
          qrCodes={qrCodes}
          onClose={() => setShowQRGenerator(false)}
          itemName={lastAddedItem?.nome || ''}
          stockType="Bebidas"
        />
      )}

      {/* QR Scanner Dialog */}
      {showScanner && (
        <QRScanner
          onClose={() => setShowScanner(false)}
          onSuccess={() => {
            console.log('QR Code processado com sucesso');
            setShowScanner(false);
          }}
        />
      )}
    </div>
  );
}