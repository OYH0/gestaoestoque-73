import React, { useState } from 'react';
import { Plus, History, QrCode, FileText, ArrowRight } from 'lucide-react';
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
import { CamaraFriaHeader } from '@/components/camara-fria/CamaraFriaHeader';
import { QRCodeGenerator } from '@/components/qr-scanner/QRCodeGenerator';
import { QRScanner } from '@/components/qr-scanner/QRScanner';
import { UnidadeSelector } from '@/components/UnidadeSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { CamaraFriaTransferDialog } from '@/components/camara-fria/CamaraFriaTransferDialog';
import { AdminGuard } from '@/components/AdminGuard';
import { toast } from '@/hooks/use-toast';

export default function CamaraFria() {
  const { 
    items, 
    loading, 
    addItem, 
    updateItemQuantity, 
    deleteItem, 
    transferItemsToUnidade,
    qrCodes,
    showQRGenerator,
    setShowQRGenerator,
    lastAddedItem
  } = useCamaraFriaData();
  
  // Estado para unidade selecionada
  const [selectedUnidade, setSelectedUnidade] = useState<'juazeiro_norte' | 'fortaleza' | 'todas'>('todas');
  
  // Passar selectedUnidade para o hook de histórico
  const { historico, addHistoricoItem } = useCamaraFriaHistorico(selectedUnidade);
  
  const { addItem: addCamaraRefrigeradaItem } = useCamaraRefrigeradaData();
  const { canModify, canTransferItems } = useUserPermissions();
  
  // Estados para o formulário de adicionar item
  const [newItem, setNewItem] = useState({
    nome: '',
    quantidade: 0,
    unidade: 'kg',
    categoria: '',
    minimo: 0,
    unidade_item: selectedUnidade === 'todas' ? 'juazeiro_norte' : selectedUnidade as 'juazeiro_norte' | 'fortaleza'
  });
  
  // States for managing editing and thawing
  const [editingItems, setEditingItems] = useState<Record<string, number>>({});
  const [thawingItems, setThawingItems] = useState<Record<string, number>>({});

  // Filter items by selected unit - CORRIGIDO
  const itemsByUnidade = items.filter(item => {
    if (selectedUnidade === 'todas') return true;
    // Usar item.unidade_item que é mapeado do campo 'unidade' do banco
    return item.unidade_item === selectedUnidade;
  });

  console.log('=== FILTRO DE UNIDADE ===');
  console.log('Unidade selecionada:', selectedUnidade);
  console.log('Total de itens no estado:', items.length);
  console.log('Itens após filtro:', itemsByUnidade.length);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const isMobile = useIsMobile();
  
  const handleAddNewItem = async () => {
    console.log('=== INÍCIO DA FUNÇÃO handleAddNewItem ===');
    console.log('canModify:', canModify);
    console.log('newItem:', newItem);
    
    // Verificação de permissão com feedback
    if (!canModify) {
      console.error('Acesso negado: apenas administradores e gerentes podem adicionar itens');
      toast({
        title: "Acesso negado",
        description: "Apenas administradores e gerentes podem adicionar itens.",
        variant: "destructive",
      });
      return;
    }
    
    // Verificação de validação com feedback
    if (!newItem.nome.trim()) {
      console.error('Nome não preenchido');
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite o nome da carne.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newItem.categoria) {
      console.error('Categoria não selecionada');
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

    console.log('=== ADICIONANDO NOVO ITEM ===');
    console.log('Item com unidade:', itemWithUnidade);

    try {
      toast({
        title: "Adicionando item...",
        description: "Aguarde enquanto o item é adicionado ao estoque.",
      });
      
      const addedItem = await addItem(itemWithUnidade);
      console.log('Item adicionado com sucesso:', addedItem);
      
      // Registrar no histórico apenas se a quantidade for maior que 0 e o item foi adicionado com sucesso
      if (addedItem && Number(newItem.quantidade) > 0) {
        console.log('Registrando no histórico...');
        await addHistoricoItem({
          item_nome: newItem.nome,
          quantidade: Number(newItem.quantidade),
          unidade: newItem.unidade,
          categoria: newItem.categoria,
          tipo: 'entrada',
          observacoes: 'Adição de novo item ao estoque',
          unidade_item: unidadeParaItem
        });
        console.log('Histórico registrado com sucesso');
      }
      
      // Reset form
      setNewItem({
        nome: '',
        quantidade: 0,
        unidade: 'kg',
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
      
      console.log('=== ITEM ADICIONADO COM SUCESSO ===');
      
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // ... resto do código permanece igual
  const handleUpdateQuantity = async (id: string, newQuantity: number, tipo: 'entrada' | 'saida') => {
    if (!canModify) {
      console.error('Acesso negado: apenas administradores e gerentes podem atualizar quantidades');
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
    }
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
    if (!canModify) {
      console.error('Acesso negado: apenas administradores e gerentes podem editar itens');
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
    if (!canModify) {
      console.error('Acesso negado: apenas administradores e gerentes podem descongelar itens');
      return;
    }
    
    const thawQuantity = thawingItems[id];
    const item = items.find(i => i.id === id);
    if (thawQuantity !== undefined && item) {
      const newQuantity = item.quantidade - thawQuantity;
      await updateItemQuantity(id, newQuantity);
      
      console.log('=== MOVENDO PARA CÂMARA REFRIGERADA ===');
      console.log('Item original:', item);
      console.log('Unidade do item original:', item.unidade_item);
      
      // GARANTIR que a unidade seja preservada corretamente
      const unidadeCorreta = item.unidade_item || 'juazeiro_norte';
      
      console.log('Unidade que será enviada:', unidadeCorreta);
      
      await addCamaraRefrigeradaItem({
        nome: item.nome,
        quantidade: thawQuantity,
        unidade: item.unidade,
        categoria: item.categoria,
        status: 'descongelando',
        data_entrada: new Date().toISOString().split('T')[0],
        temperatura_ideal: item.temperatura_ideal,
        observacoes: `Movido da câmara fria para descongelamento`,
        unidade_item: unidadeCorreta // USAR A UNIDADE CORRETA DO ITEM ORIGINAL
      });
      
      await addHistoricoItem({
        item_nome: item.nome,
        quantidade: thawQuantity,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: 'saida',
        observacoes: 'Movido para câmara refrigerada',
        unidade_item: item.unidade_item
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

  const handleDeleteItem = async (id: string) => {
    if (!canModify) {
      console.error('Acesso negado: apenas administradores e gerentes podem deletar itens');
      return;
    }
    
    try {
      const deletedItem = await deleteItem(id);
      
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
    } catch (error) {
      console.error('Erro ao deletar item:', error);
    }
  };

  const filteredItems = itemsByUnidade.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || item.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTransferItems = async (itemIds: string[], targetUnidade: 'juazeiro_norte' | 'fortaleza') => {
    if (!canTransferItems()) {
      console.error('Acesso negado: apenas administradores podem transferir itens');
      return;
    }
    
    await transferItemsToUnidade(itemIds, targetUnidade);
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

  const categories = ['Todos', 'Bovina', 'Suína', 'Aves', 'Embutidos'];
  const lowStockItems = filteredItems.filter(item => item.minimo && item.quantidade <= item.minimo);

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
    <div className="space-y-6">
      <UnidadeSelector 
        selectedUnidade={selectedUnidade}
        onUnidadeChange={setSelectedUnidade}
      />

      {/* Debug info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">🔧 Debug Info</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>Permissão para modificar: {canModify ? '✅ Sim' : '❌ Não'}</p>
          <p>Formulário válido: {(newItem.nome.trim() !== '' && newItem.categoria !== '') ? '✅ Sim' : '❌ Não'}</p>
          <p>Nome preenchido: {newItem.nome.trim() !== '' ? '✅ Sim' : '❌ Não'}</p>
          <p>Categoria selecionada: {newItem.categoria !== '' ? '✅ Sim' : '❌ Não'}</p>
        </div>
      </div>

      <CamaraFriaHeader
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
          
          {canTransferItems() && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800"
              onClick={() => setShowTransferDialog(true)}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Transferir Itens
            </Button>
          )}
        </div>
      </AdminGuard>

      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          {filteredItems.length} tipos
        </Badge>
        {lowStockItems.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {lowStockItems.length} baixo estoque
          </Badge>
        )}
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
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {/* Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <CamaraFriaAddDialog
          newItem={newItem}
          setNewItem={setNewItem}
          onAddNewItem={handleAddNewItem}
          setDialogOpen={setIsAddDialogOpen}
          categorias={categories}
          selectedUnidade={selectedUnidade}
        />
      </Dialog>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <CamaraFriaHistoryDialog
          historico={historico}
          selectedUnidade={selectedUnidade}
        />
      </Dialog>

      {showScanner && (
        <QRScanner
          onSuccess={() => setShowScanner(false)}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showQRGenerator && lastAddedItem && qrCodes && (
        <QRCodeGenerator
          qrCodes={qrCodes}
          itemName={lastAddedItem.nome}
          stockType="Câmara Fria"
          onClose={() => setShowQRGenerator(false)}
        />
      )}

      {showTransferDialog && (
        <CamaraFriaTransferDialog
          open={showTransferDialog}
          onOpenChange={setShowTransferDialog}
          items={filteredItems}
          onTransfer={handleTransferItems}
          currentUnidade={selectedUnidade}
        />
      )}
    </div>
  );
}
