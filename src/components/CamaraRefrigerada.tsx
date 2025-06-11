
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Thermometer, Clock, ArrowRight, ArrowLeft, Loader2, History } from 'lucide-react';
import { useCamaraRefrigeradaData } from '@/hooks/useCamaraRefrigeradaData';
import { useCamaraRefrigeradaHistorico } from '@/hooks/useCamaraRefrigeradaHistorico';
import { CamaraRefrigeradaHistoryDialog } from '@/components/camara-refrigerada/CamaraRefrigeradaHistoryDialog';
import { useIsMobile } from '@/hooks/use-mobile';

export function CamaraRefrigerada() {
  const { items, loading, updateItemStatus, deleteItem } = useCamaraRefrigeradaData();
  const { historico, loading: historicoLoading, addHistoricoItem } = useCamaraRefrigeradaHistorico();
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const isMobile = useIsMobile();

  const moveToReady = (id: string) => {
    updateItemStatus(id, 'pronto');
  };

  const moveToFreezer = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      // Registrar no histórico antes de remover
      await addHistoricoItem({
        item_nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: 'volta_freezer'
      });
    }
    deleteItem(id);
  };

  const removeFromChamber = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      // Registrar no histórico antes de remover
      await addHistoricoItem({
        item_nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: 'retirada'
      });
    }
    deleteItem(id);
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

  // Ordenar itens alfabeticamente
  const sortedItems = [...items].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  return (
    <div className="space-y-6">
      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
          {items.length} itens descongelando
        </Badge>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
          {items.filter(item => item.status === 'descongelando').length} em processo
        </Badge>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          {items.filter(item => item.status === 'pronto').length} prontos
        </Badge>
      </div>

      <div className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : ''}`}>
        <Dialog open={historicoOpen} onOpenChange={setHistoricoOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="border-gray-300"
            >
              <History className="w-4 h-4 mr-1 md:mr-2" />
              <span className={isMobile ? "text-xs" : "text-sm"}>Histórico</span>
            </Button>
          </DialogTrigger>
          <CamaraRefrigeradaHistoryDialog 
            historico={historico} 
            loading={historicoLoading}
          />
        </Dialog>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Descongelando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {items.filter(item => item.status === 'descongelando').length}
            </div>
            <p className="text-sm text-orange-700">Itens em processo</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Prontos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {items.filter(item => item.status === 'pronto').length}
            </div>
            <p className="text-sm text-green-700">Prontos para uso</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de itens */}
      <div className="grid gap-4">
        {sortedItems.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <div className="text-gray-500">
                <Thermometer className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Nenhum item na câmara refrigerada</h3>
                <p className="text-sm">Os itens aparecerão aqui quando forem movidos da câmara fria para descongelamento.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedItems.map((item) => (
            <Card 
              key={item.id} 
              className={`${
                item.status === 'pronto' 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-orange-200 bg-orange-50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{item.nome}</h3>
                      <Badge 
                        variant={item.status === 'pronto' ? 'default' : 'secondary'}
                        className={
                          item.status === 'pronto' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-orange-500 text-white'
                        }
                      >
                        {item.status === 'pronto' ? 'Pronto' : 'Descongelando'}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                      <span>{item.quantidade} {item.unidade}</span>
                      {item.tempo_descongelamento && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.tempo_descongelamento}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.status === 'descongelando' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => moveToReady(item.id)}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Marcar como Pronto
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromChamber(item.id)}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        Retirar da Câmara
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveToFreezer(item.id)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Voltar ao Freezer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Instruções */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Instruções de Descongelamento</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Carnes pequenas (até 2kg): 30-45 minutos</li>
            <li>• Carnes médias (2-5kg): 1-2 horas</li>
            <li>• Carnes grandes (acima de 5kg): 3-4 horas</li>
            <li>• Sempre manter na temperatura de 2-4°C</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
