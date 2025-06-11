
import React, { useState } from 'react';
import { Plus, History, QrCode, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';
import { useDescartaveisHistorico } from '@/hooks/useDescartaveisHistorico';
import { DescartaveisFilters } from '@/components/descartaveis/DescartaveisFilters';
import { DescartaveisAlerts } from '@/components/descartaveis/DescartaveisAlerts';
import { DescartaveisHistoryDialog } from '@/components/descartaveis/DescartaveisHistoryDialog';
import { DescartaveisAddDialog } from '@/components/descartaveis/DescartaveisAddDialog';

export default function Descartaveis() {
  const { items, loading, addItem } = useDescartaveisData();
  const { historico } = useDescartaveisHistorico();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const categories = ['Todos', ...Array.from(new Set(items.map(item => item.categoria)))];
  const lowStockItems = items.filter(item => item.minimo && item.quantidade <= item.minimo);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Plus className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Descartáveis</h1>
          <p className="text-gray-600">Utensílios e materiais descartáveis</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
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
            <DescartaveisHistoryDialog historico={historico} />
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DescartaveisAddDialog
              newItem={newItem}
              setNewItem={setNewItem}
              onAddNewItem={handleAddNewItem}
              setDialogOpen={setIsAddDialogOpen}
              categorias={categories}
            />
          </Dialog>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-fit text-green-600 border-green-200 hover:bg-green-50"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Escanear QR Code
        </Button>
      </div>

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
          <div key={item.id} className="bg-white p-4 rounded-lg shadow border flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{item.nome}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Quantidade: <span className="font-medium">{item.quantidade} {item.unidade}</span></span>
                <span>Categoria: <span className="font-medium">{item.categoria}</span></span>
                <span>Mínimo: <span className="font-medium">{item.minimo || 10} {item.unidade}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum item encontrado</p>
        </div>
      )}
    </div>
  );
}
