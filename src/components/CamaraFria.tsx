
import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { CamaraFriaHeader } from './camara-fria/CamaraFriaHeader';
import { CamaraFriaAlerts } from './camara-fria/CamaraFriaAlerts';
import { CamaraFriaFilters } from './camara-fria/CamaraFriaFilters';
import { CamaraFriaItemCard } from './camara-fria/CamaraFriaItemCard';

const initialItems = [
  { id: 1, name: 'Picanha', quantidade: 15, unidade: 'kg', categoria: 'Bovina', minimo: 5 },
  { id: 2, name: 'Alcatra', quantidade: 20, unidade: 'kg', categoria: 'Bovina', minimo: 8 },
  { id: 3, name: 'Costela Bovina', quantidade: 25, unidade: 'kg', categoria: 'Bovina', minimo: 10 },
  { id: 4, name: 'Fraldinha', quantidade: 12, unidade: 'kg', categoria: 'Bovina', minimo: 6 },
  { id: 5, name: 'Maminha', quantidade: 18, unidade: 'kg', categoria: 'Bovina', minimo: 8 },
  { id: 6, name: 'Costela Suína', quantidade: 22, unidade: 'kg', categoria: 'Suína', minimo: 10 },
  { id: 7, name: 'Lombo Suíno', quantidade: 14, unidade: 'kg', categoria: 'Suína', minimo: 6 },
  { id: 8, name: 'Pernil Suíno', quantidade: 16, unidade: 'kg', categoria: 'Suína', minimo: 8 },
  { id: 9, name: 'Coxa de Frango', quantidade: 30, unidade: 'kg', categoria: 'Aves', minimo: 15 },
  { id: 10, name: 'Sobrecoxa de Frango', quantidade: 25, unidade: 'kg', categoria: 'Aves', minimo: 12 },
  { id: 11, name: 'Peito de Frango', quantidade: 20, unidade: 'kg', categoria: 'Aves', minimo: 10 },
  { id: 12, name: 'Linguiça Calabresa', quantidade: 8, unidade: 'kg', categoria: 'Embutidos', minimo: 4 },
  { id: 13, name: 'Linguiça Toscana', quantidade: 6, unidade: 'kg', categoria: 'Embutidos', minimo: 3 },
];

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
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ 
    name: '', 
    quantidade: 0, 
    unidade: 'kg', 
    categoria: 'Bovina', 
    minimo: 5 
  });
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<{ [key: number]: number }>({});
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const startEditingQuantity = (id: number, currentQuantity: number) => {
    setEditingQuantities({ ...editingQuantities, [id]: currentQuantity });
  };

  const updateEditingQuantity = (id: number, delta: number) => {
    const currentEditValue = editingQuantities[id] || 0;
    const newValue = Math.max(0, currentEditValue + delta);
    setEditingQuantities({ ...editingQuantities, [id]: newValue });
  };

  const confirmQuantityChange = (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQuantity = editingQuantities[id];
    const oldQuantity = item.quantidade;
    const difference = newQuantity - oldQuantity;

    setItems(items.map(i => 
      i.id === id ? { ...i, quantidade: newQuantity } : i
    ));

    const now = new Date();
    const novoHistorico: HistoricoItem = {
      id: Date.now(),
      itemName: item.name,
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
      description: `${Math.abs(difference)} ${item.unidade} de ${item.name}`,
    });
  };

  const cancelQuantityEdit = (id: number) => {
    const newEditingQuantities = { ...editingQuantities };
    delete newEditingQuantities[id];
    setEditingQuantities(newEditingQuantities);
  };

  const addNewItem = () => {
    if (newItem.name && newItem.quantidade >= 0) {
      const id = Math.max(...items.map(i => i.id)) + 1;
      setItems([...items, { id, ...newItem }]);
      setNewItem({ 
        name: '', 
        quantidade: 0, 
        unidade: 'kg', 
        categoria: 'Bovina', 
        minimo: 5 
      });
      setDialogOpen(false);
      toast({
        title: "Item adicionado",
        description: `${newItem.name} foi adicionado ao estoque!`,
      });
    }
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

  const filteredItems = categoriaFiltro === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === categoriaFiltro);

  const sortedFilteredItems = [...filteredItems].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const itemsBaixoEstoque = items.filter(item => item.quantidade <= item.minimo);

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
            />
          );
        })}
      </div>
    </div>
  );
}
