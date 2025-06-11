
import React, { useState } from 'react';
import { Plus, History, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const categories = ['todas', ...Array.from(new Set(items.map(item => item.categoria)))];
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

      <Tabs defaultValue="estoque" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <DescartaveisFilters
              categorias={categories}
              categoriaFiltro={filterCategory}
              setCategoriaFiltro={setFilterCategory}
            />
            
            <div className="flex flex-wrap gap-2">
              <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
          </div>

          <DescartaveisAlerts itemsBaixoEstoque={lowStockItems} />

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

      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
