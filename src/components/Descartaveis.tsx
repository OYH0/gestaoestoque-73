
import React, { useState } from 'react';
import { Plus, History, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';
import { useDescartaveisHistorico } from '@/hooks/useDescartaveisHistorico';
import { DescartaveisFilters } from '@/components/descartaveis/DescartaveisFilters';
import { DescartaveisHistoryDialog } from '@/components/descartaveis/DescartaveisHistoryDialog';
import { DescartaveisAlerts } from '@/components/descartaveis/DescartaveisAlerts';
import { QRScanner } from '@/components/qr-scanner/QRScanner';

export default function Descartaveis() {
  const { items, loading } = useDescartaveisData();
  const { historico } = useDescartaveisHistorico();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

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

  // Get unique categories for filter
  const categories = Array.from(new Set(items.map(item => item.categoria)));
  // Get low stock items
  const lowStockItems = items.filter(item => item.minimo && item.quantidade <= item.minimo);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Plus className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Descartáveis</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <DescartaveisFilters
          categories={categories}
          selectedCategory={filterCategory}
          setSelectedCategory={setFilterCategory}
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
        />
        
        <div className="flex flex-wrap gap-2">
          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="shadow-lg">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>
            </DialogTrigger>
            <DescartaveisHistoryDialog historico={historico} />
          </Dialog>

          <Button 
            variant="outline" 
            onClick={() => setShowScanner(true)}
            className="shadow-lg"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scanner QR
          </Button>
        </div>
      </div>

      <DescartaveisAlerts lowStockItems={lowStockItems} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">{item.nome}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {item.categoria}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Quantidade:</span>
                <span className="font-medium">{item.quantidade} {item.unidade}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Entrada:</span>
                <span>{new Date(item.data_entrada).toLocaleDateString('pt-BR')}</span>
              </div>
              
              {item.fornecedor && (
                <div className="flex justify-between">
                  <span>Fornecedor:</span>
                  <span>{item.fornecedor}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum item encontrado</p>
        </div>
      )}

      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
