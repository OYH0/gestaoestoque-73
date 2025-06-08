import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { CamaraFriaHeader } from './camara-fria/CamaraFriaHeader';
import { CamaraFriaAlerts } from './camara-fria/CamaraFriaAlerts';
import { CamaraFriaFilters } from './camara-fria/CamaraFriaFilters';
import { CamaraFriaItemCard } from './camara-fria/CamaraFriaItemCard';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useCamaraRefrigeradaData } from '@/hooks/useCamaraRefrigeradaData';

const categorias = ['Todos', 'Bovina', 'Suína', 'Aves', 'Embutidos'];

interface HistoricoItem {
  id: number;
  itemName: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  unidade: string;
  data: string;
  hora: string;
}

export function CamaraFria() {
  const { items, loading, addItem, updateItemQuantity, deleteItem } = useCamaraFriaData();
  const { addItem: addToRefrigerada } = useCamaraRefrigeradaData();
  
  const [newItem, setNewItem] = useState({ 
    nome: '', 
    quantidade: 0, 
    unidade: 'kg', 
    categoria: 'Bovina', 
    minimo: 5 
  });
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<{ [key: string]: number }>({});
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const startEditingQuantity = (id: string, currentQuantity: number) => {
    setEditingQuantities({ ...editingQuantities, [id]: currentQuantity });
  };

  const updateEditingQuantity = (id: string, delta: number) => {
    const currentEditValue = editingQuantities[id] || 0;
    const newValue = Math.max(0, currentEditValue + delta);
    setEditingQuantities({ ...editingQuantities, [id]: newValue });
  };

  const confirmQuantityChange = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQuantity = editingQuantities[id];
    const oldQuantity = item.quantidade;
    const difference = newQuantity - oldQuantity;

    await updateItemQuantity(id, newQuantity);

    const now = new Date();
    const novoHistorico: HistoricoItem = {
      id: Date.now(),
      itemName: item.nome,
      tipo: difference > 0 ? 'entrada' : 'saida',
      quantidade: Math.abs(difference),
      unidade: item.unidade,
      data: now.toLocaleDateString('pt-BR'),
      hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setHistorico([novoHistorico, ...historico]);

    const newEditingQuantities = { ...editingQuantities };
    delete newEditingQuantities[id];
    setEditingQuantities(newEditingQuantities);

    toast({
      title: difference > 0 ? "Item adicionado" : "Item retirado",
      description: `${Math.abs(difference)} ${item.unidade} de ${item.nome}`,
    });
  };

  const cancelQuantityEdit = (id: string) => {
    const newEditingQuantities = { ...editingQuantities };
    delete newEditingQuantities[id];
    setEditingQuantities(newEditingQuantities);
  };

  const addNewItem = async () => {
    if (newItem.nome && newItem.quantidade >= 0) {
      await addItem({
        ...newItem,
        minimo: newItem.minimo
      });
      setNewItem({ 
        nome: '', 
        quantidade: 0, 
        unidade: 'kg', 
        categoria: 'Bovina', 
        minimo: 5 
      });
      setDialogOpen(false);
    }
  };

  const moveToRefrigerada = async (item: any, quantidade: number) => {
    if (item.quantidade < quantidade) {
      toast({
        title: "Quantidade insuficiente",
        description: "Não há quantidade suficiente disponível.",
        variant: "destructive",
      });
      return;
    }

    // Calcular tempo de descongelamento baseado na quantidade
    let tempoDescongelamento = "30m";
    if (quantidade <= 2) {
      tempoDescongelamento = "30-45m";
    } else if (quantidade <= 5) {
      tempoDescongelamento = "1h 30m";
    } else {
      tempoDescongelamento = "2-3h";
    }

    // Adicionar à câmara refrigerada
    await addToRefrigerada({
      nome: item.nome,
      quantidade: quantidade,
      unidade: item.unidade,
      categoria: item.categoria,
      tempo_descongelamento: tempoDescongelamento,
      status: 'descongelando' as const,
      temperatura_ideal: item.temperatura_ideal,
      observacoes: `Movido da câmara fria em ${new Date().toLocaleDateString('pt-BR')}`
    });

    // Reduzir a quantidade na câmara fria
    const newQuantity = item.quantidade - quantidade;
    await updateItemQuantity(item.id, newQuantity);

    // Adicionar ao histórico
    const now = new Date();
    const novoHistorico: HistoricoItem = {
      id: Date.now(),
      itemName: item.nome,
      tipo: 'saida',
      quantidade: quantidade,
      unidade: item.unidade,
      data: now.toLocaleDateString('pt-BR'),
      hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setHistorico([novoHistorico, ...historico]);

    toast({
      title: "Item movido para descongelamento",
      description: `${quantidade} ${item.unidade} de ${item.nome} foi movido para a câmara refrigerada!`,
    });
  };

  const handlePrintPDF = () => {
    generateInventoryPDF(
      items,
      'Inventário de Câmara Fria',
      'Carnes e produtos congelados'
    );
    toast({
      title: "PDF gerado",
      description: "O relatório foi baixado com sucesso!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando dados...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredItems = categoriaFiltro === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === categoriaFiltro);

  const sortedFilteredItems = [...filteredItems].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const itemsBaixoEstoque = items.filter(item => item.quantidade <= (item.minimo || 5));

  return (
    <div className="space-y-4 md:space-y-6">
      <CamaraFriaHeader
        itemsCount={items.length}
        lowStockCount={itemsBaixoEstoque.length}
        onPrintPDF={handlePrintPDF}
        historicoOpen={historicoOpen}
        setHistoricoOpen={setHistoricoOpen}
        historico={historico}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        newItem={newItem}
        setNewItem={setNewItem}
        onAddNewItem={addNewItem}
        categorias={categorias}
      />

      <CamaraFriaAlerts itemsBaixoEstoque={itemsBaixoEstoque} />

      <CamaraFriaFilters 
        categorias={categorias}
        categoriaFiltro={categoriaFiltro}
        setCategoriaFiltro={setCategoriaFiltro}
      />

      <div className="grid gap-3 md:gap-4">
        {sortedFilteredItems.map((item) => {
          const isEditing = editingQuantities.hasOwnProperty(item.id);
          const editValue = editingQuantities[item.id] || item.quantidade;

          return (
            <CamaraFriaItemCard
              key={item.id}
              item={item}
              isEditing={isEditing}
              editValue={editValue}
              onStartEdit={startEditingQuantity}
              onUpdateEdit={updateEditingQuantity}
              onConfirmChange={confirmQuantityChange}
              onCancelEdit={cancelQuantityEdit}
              onMoveToRefrigerada={moveToRefrigerada}
            />
          );
        })}
      </div>
    </div>
  );
}
