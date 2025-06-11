
import React, { useState } from 'react';
import { Plus, History, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useEstoqueSecoData } from '@/hooks/useEstoqueSecoData';
import { useEstoqueSecoHistorico } from '@/hooks/useEstoqueSecoHistorico';
import { EstoqueSecoFilters } from '@/components/estoque-seco/EstoqueSecoFilters';
import { EstoqueSecoAlerts } from '@/components/estoque-seco/EstoqueSecoAlerts';
import { EstoqueSecoHistoryDialog } from '@/components/estoque-seco/EstoqueSecoHistoryDialog';

export default function EstoqueSeco() {
  const { items, loading } = useEstoqueSecoData();
  const { historico } = useEstoqueSecoHistorico();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

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

  const categories = ['Todos', ...Array.from(new Set(items.map(item => item.categoria)))];
  const lowStockItems = items.filter(item => item.minimo && item.quantidade <= item.minimo);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Plus className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Estoque Seco</h1>
          <p className="text-gray-600">Ingredientes e mantimentos</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-sm font-medium">
            {items.length} tipos
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-gray-600">
            <div className="w-4 h-4 mr-2 bg-gray-400 rounded" />
            PDF
          </Button>

          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-gray-600">
                <History className="w-4 h-4 mr-2" />
                Histórico
              </Button>
            </DialogTrigger>
            <EstoqueSecoHistoryDialog historico={historico} />
          </Dialog>

          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Novo Item
          </Button>
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

      <EstoqueSecoFilters
        categorias={categories}
        categoriaFiltro={filterCategory}
        setCategoriaFiltro={setFilterCategory}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />

      <EstoqueSecoAlerts itemsBaixoEstoque={lowStockItems} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">{item.nome}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Quantidade: <span className="font-medium">{item.quantidade} {item.unidade}</span></p>
              <p>Categoria: <span className="font-medium">{item.categoria}</span></p>
              <p>Mínimo: <span className="font-medium">{item.minimo || 5} {item.unidade}</span></p>
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
