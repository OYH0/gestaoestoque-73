import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UnidadeSelector } from '@/components/UnidadeSelector';
import { useCamaraRefrigeradaData } from '@/hooks/useCamaraRefrigeradaData';
import { useCamaraRefrigeradaHistorico } from '@/hooks/useCamaraRefrigeradaHistorico';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { AdminGuard } from '@/components/AdminGuard';
import { CamaraRefrigeradaHeader } from '@/components/camara-refrigerada/CamaraRefrigeradaHeader';
import { CamaraRefrigeradaStatusCards } from '@/components/camara-refrigerada/CamaraRefrigeradaStatusCards';
import { CamaraRefrigeradaItemCard } from '@/components/camara-refrigerada/CamaraRefrigeradaItemCard';
import { CamaraRefrigeradaEmptyState } from '@/components/camara-refrigerada/CamaraRefrigeradaEmptyState';
import { CamaraRefrigeradaInstructions } from '@/components/camara-refrigerada/CamaraRefrigeradaInstructions';
import { toast } from '@/hooks/use-toast';

export function CamaraRefrigerada() {
  const [selectedUnidade, setSelectedUnidade] = useState<'juazeiro_norte' | 'fortaleza' | 'todas'>('todas');
  const { items, loading, updateItemStatus, deleteItem } = useCamaraRefrigeradaData(selectedUnidade);
  const { historico, loading: historicoLoading, addHistoricoItem } = useCamaraRefrigeradaHistorico(selectedUnidade);
  const { items: camaraFriaItems, addItem: addCamaraFriaItem, updateItemQuantity } = useCamaraFriaData();
  const { addHistoricoItem: addCamaraFriaHistorico } = useCamaraFriaHistorico();
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const { canModify } = useUserPermissions();

  const moveToReady = (id: string) => {
    if (!canModify) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores e gerentes podem alterar status",
        variant: "destructive",
      });
      return;
    }
    updateItemStatus(id, 'pronto');
  };

  const moveToFreezer = async (id: string) => {
    if (!canModify) {
      toast({
        title: "Acesso negado", 
        description: "Apenas administradores e gerentes podem mover itens",
        variant: "destructive",
      });
      return;
    }
    
    const item = items.find(i => i.id === id);
    if (!item) {
      toast({
        title: "Erro",
        description: "Item não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('=== MOVENDO ITEM DE VOLTA PARA CÂMARA FRIA ===');
      console.log('Item encontrado:', item);

      // Usar transação para garantir consistência
      const unidadeItem = selectedUnidade === 'todas' ? 'juazeiro_norte' : selectedUnidade;

      // 1. Verificar se já existe um item com o mesmo nome na câmara fria
      const existingItem = camaraFriaItems.find(friaItem => 
        friaItem.nome.toLowerCase().trim() === item.nome.toLowerCase().trim() &&
        friaItem.categoria === item.categoria &&
        friaItem.unidade_item === unidadeItem
      );

      let operationResult;

      if (existingItem) {
        console.log('✅ Item já existe na câmara fria, atualizando quantidade');
        console.log('Item existente:', existingItem);
        
        // Atualizar a quantidade do item existente
        const newQuantity = existingItem.quantidade + item.quantidade;
        operationResult = await updateItemQuantity(existingItem.id, newQuantity);
        
        console.log(`✅ Quantidade atualizada de ${existingItem.quantidade} para ${newQuantity}`);
      } else {
        console.log('➕ Item não existe na câmara fria, criando novo');
        
        // Criar um novo item na câmara fria
        operationResult = await addCamaraFriaItem({
          nome: item.nome,
          quantidade: item.quantidade,
          unidade: item.unidade,
          categoria: item.categoria,
          observacoes: 'Retornado da câmara refrigerada',
          data_entrada: new Date().toISOString().split('T')[0],
          unidade_item: unidadeItem,
          minimo: 5
        });
        
        console.log('✅ Novo item criado na câmara fria');
      }

      // 2. Registrar no histórico da câmara fria (entrada)
      await addCamaraFriaHistorico({
        item_nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: 'entrada',
        observacoes: 'Retornado da câmara refrigerada',
        unidade_item: unidadeItem
      });

      console.log('✅ Histórico da câmara fria registrado');

      // 3. Registrar no histórico da câmara refrigerada (volta_freezer)
      await addHistoricoItem({
        item_nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: 'volta_freezer',
        observacoes: 'Item retornado para câmara fria',
        unidade_item: unidadeItem
      });

      console.log('✅ Histórico da câmara refrigerada registrado');

      // 4. Por último, remover da câmara refrigerada
      await deleteItem(id);
      
      console.log('✅ Item removido da câmara refrigerada');

      toast({
        title: "Item movido com sucesso",
        description: `${item.nome} foi retornado para a câmara fria`,
      });

    } catch (error) {
      console.error('❌ ERRO ao mover item para câmara fria:', error);
      toast({
        title: "Erro ao mover item",
        description: "Não foi possível mover o item para a câmara fria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const removeFromChamber = async (id: string) => {
    if (!canModify) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores e gerentes podem remover itens",
        variant: "destructive",
      });
      return;
    }
    
    const item = items.find(i => i.id === id);
    if (!item) {
      toast({
        title: "Erro",
        description: "Item não encontrado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Registrar no histórico antes de remover
      await addHistoricoItem({
        item_nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: 'retirada',
        observacoes: 'Item retirado da câmara refrigerada',
        unidade_item: selectedUnidade === 'todas' ? 'juazeiro_norte' : selectedUnidade
      });

      // Remover o item
      await deleteItem(id);

      toast({
        title: "Item removido",
        description: `${item.nome} foi removido da câmara refrigerada`,
      });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro ao remover item",
        description: "Não foi possível remover o item. Tente novamente.",
        variant: "destructive",
      });
    }
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
      <UnidadeSelector 
        selectedUnidade={selectedUnidade}
        onUnidadeChange={setSelectedUnidade}
      />

      <CamaraRefrigeradaHeader 
        items={items}
        historico={historico}
        historicoLoading={historicoLoading}
        historicoOpen={historicoOpen}
        setHistoricoOpen={setHistoricoOpen}
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
        <CamaraRefrigeradaStatusCards items={items} />

        <div className="grid gap-4">
          {sortedItems.length === 0 ? (
            <CamaraRefrigeradaEmptyState />
          ) : (
            sortedItems.map((item) => (
              <CamaraRefrigeradaItemCard
                key={item.id}
                item={item}
                onMoveToReady={moveToReady}
                onMoveToFreezer={moveToFreezer}
                onRemoveFromChamber={removeFromChamber}
              />
            ))
          )}
        </div>

        <CamaraRefrigeradaInstructions />
      </AdminGuard>
    </div>
  );
}

