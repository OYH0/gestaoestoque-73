import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/useQRCodeGenerator';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';
import { useUserPermissions } from '@/hooks/useUserPermissions';

export interface CamaraFriaItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo?: number;
  data_entrada?: string;
  data_validade?: string;
  temperatura_ideal?: number;
  preco_unitario?: number;
  fornecedor?: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useCamaraFriaData() {
  const [items, setItems] = useState<CamaraFriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CamaraFriaItem | null>(null);
  const { user } = useAuth();
  const { generateQRCodeData } = useQRCodeGenerator();
  const { addHistoricoItem } = useCamaraFriaHistorico();
  const { getFilterForUserUnidade, canModifyUnidade } = useUserPermissions();

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('camara_fria_items')
        .select('*')
        .order('nome');

      // Aplicar filtro por unidade se necessário
      const unidadeFilter = getFilterForUserUnidade();
      if (unidadeFilter) {
        query = query.eq('unidade', unidadeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('=== DADOS CARREGADOS DO BANCO ===');
      console.log('Total de itens:', data?.length || 0);
      console.log('Filtro aplicado para unidade:', unidadeFilter || 'nenhum (admin)');
      
      // Mapear o campo 'unidade' do banco para 'unidade_item' no frontend
      const itemsMapeados: CamaraFriaItem[] = (data || []).map(item => ({
        ...item,
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza'
      }));
      
      setItems(itemsMapeados);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os itens da câmara fria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItem: Omit<CamaraFriaItem, 'id'>) => {
    if (!user) return;

    // Verificar se o usuário pode modificar essa unidade
    const targetUnidade = newItem.unidade_item || 'juazeiro_norte';
    if (!canModifyUnidade(targetUnidade)) {
      toast({
        title: "Acesso negado",
        description: "Você só pode adicionar itens na sua unidade responsável.",
        variant: "destructive",
      });
      return;
    }

    console.log('=== INÍCIO addItem NO HOOK ===');
    console.log('Item recebido no hook:', newItem);
    console.log('Unidade do item:', newItem.unidade_item);
    
    // GARANTIR que quantidade seja um número inteiro válido
    let quantidadeSegura: number;
    
    if (typeof newItem.quantidade === 'string') {
      quantidadeSegura = parseInt(newItem.quantidade, 10);
    } else if (typeof newItem.quantidade === 'number') {
      quantidadeSegura = Math.floor(newItem.quantidade);
    } else {
      quantidadeSegura = 0;
    }
    
    // Validar se é um número válido
    if (isNaN(quantidadeSegura) || quantidadeSegura < 0) {
      quantidadeSegura = 0;
    }
    
    console.log('Quantidade após conversão e validação:', quantidadeSegura);
    
    // Garantir que a unidade seja sempre definida
    const unidadeSegura = newItem.unidade_item || 'juazeiro_norte';
    
    // Garantir que data_entrada seja sempre definida
    const dataEntradaSegura = newItem.data_entrada || new Date().toISOString().split('T')[0];
    
    const itemParaSalvar = {
      nome: newItem.nome,
      quantidade: quantidadeSegura,
      unidade: unidadeSegura,  // Usar a coluna 'unidade' para guardar a unidade_item
      categoria: newItem.categoria,
      minimo: newItem.minimo || 0,
      data_entrada: dataEntradaSegura,  // GARANTIR que data_entrada seja sempre definida
      data_validade: newItem.data_validade,
      temperatura_ideal: newItem.temperatura_ideal,
      preco_unitario: newItem.preco_unitario,
      fornecedor: newItem.fornecedor,
      observacoes: newItem.observacoes,
      user_id: user.id
    };
    
    console.log('Item final para salvar no banco:', itemParaSalvar);

    try {
      const { data, error } = await supabase
        .from('camara_fria_items')
        .insert([itemParaSalvar])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ ITEM SALVO NO BANCO COM SUCESSO!');
      console.log('Dados retornados do banco:', data);
      
      // Mapear o campo 'unidade' do banco para 'unidade_item' no frontend
      const itemMapeado: CamaraFriaItem = {
        ...data,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza'
      };
      
      setItems(prev => [...prev, itemMapeado]);
      setLastAddedItem(itemMapeado);
      
      // Gerar QR codes APENAS se quantidade > 0
      if (data.quantidade > 0) {
        console.log('=== INICIANDO GERAÇÃO DE QR CODES ===');
        const qrCodesData = generateQRCodeData(itemMapeado, 'CF', data.quantidade);
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
        
        toast({
          title: "Item adicionado",
          description: `${data.nome} foi adicionado ao estoque! ${qrCodesData.length} QR codes serão gerados.`,
        });
      } else {
        console.log('Quantidade zero - não gerando QR codes');
        toast({
          title: "Item adicionado",
          description: `${data.nome} foi adicionado ao estoque com quantidade zero!`,
        });
      }
      
      console.log('=== FIM addItem NO HOOK ===');
    } catch (error) {
      console.error('❌ ERRO ao adicionar item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Não foi possível adicionar o item.",
        variant: "destructive",
      });
    }
  };

  const updateItemQuantity = async (id: string, newQuantity: number) => {
    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) return;

      // Verificar se o usuário pode modificar essa unidade
      if (!canModifyUnidade(currentItem.unidade_item || 'juazeiro_norte')) {
        toast({
          title: "Acesso negado",
          description: "Você só pode modificar itens da sua unidade responsável.",
          variant: "destructive",
        });
        return;
      }

      const quantityIncrease = newQuantity - currentItem.quantidade;

      console.log('=== updateItemQuantity ===');
      console.log('Quantidade atual:', currentItem.quantidade);
      console.log('Nova quantidade:', newQuantity);
      console.log('Aumento de quantidade:', quantityIncrease);

      const { error } = await supabase
        .from('camara_fria_items')
        .update({ quantidade: newQuantity })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantidade: newQuantity } : item
      ));

      // Gerar QR codes apenas se houve aumento de quantidade
      if (quantityIncrease > 0) {
        const updatedItem = { ...currentItem, quantidade: newQuantity };
        setLastAddedItem(updatedItem);
        
        console.log('Gerando QR codes para aumento de quantidade:', quantityIncrease);
        const qrCodesData = generateQRCodeData(updatedItem, 'CF', quantityIncrease);
        console.log('QR codes gerados para aumento:', qrCodesData.length);
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) return;

      // Verificar se o usuário pode modificar essa unidade
      if (!canModifyUnidade(currentItem.unidade_item || 'juazeiro_norte')) {
        toast({
          title: "Acesso negado",
          description: "Você só pode deletar itens da sua unidade responsável.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('camara_fria_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Item removido",
        description: "Item foi removido do estoque.",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erro ao remover item",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      });
    }
  };

  const transferItemsToUnidade = async (itemIds: string[], targetUnidade: 'juazeiro_norte' | 'fortaleza') => {
    if (!user) return;

    // Verificar se o usuário pode fazer transferências (apenas admins)
    if (!canModifyUnidade('juazeiro_norte') || !canModifyUnidade('fortaleza')) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem transferir itens entre unidades.",
        variant: "destructive",
      });
      return;
    }

    console.log('=== TRANSFERINDO ITENS PARA NOVA UNIDADE ===');
    console.log('Item IDs:', itemIds);
    console.log('Unidade de destino:', targetUnidade);

    try {
      const { error } = await supabase
        .from('camara_fria_items')
        .update({ unidade: targetUnidade })
        .in('id', itemIds);

      if (error) throw error;

      // Atualizar o estado local
      setItems(prev => prev.map(item => 
        itemIds.includes(item.id) 
          ? { ...item, unidade_item: targetUnidade }
          : item
      ));

      // Registrar no histórico para cada item transferido
      const transferredItems = items.filter(item => itemIds.includes(item.id));
      
      for (const item of transferredItems) {
        await addHistoricoItem({
          item_nome: item.nome,
          quantidade: item.quantidade,
          unidade: item.unidade,
          categoria: item.categoria,
          tipo: 'entrada',
          observacoes: `Transferido para ${targetUnidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza'}`,
          unidade_item: targetUnidade
        });
      }

      toast({
        title: "Transferência realizada",
        description: `${transferredItems.length} itens foram transferidos para ${targetUnidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza'}`,
      });

      console.log('✅ Transferência concluída com sucesso');
    } catch (error) {
      console.error('❌ ERRO na transferência:', error);
      toast({
        title: "Erro na transferência",
        description: "Não foi possível transferir os itens.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user, getFilterForUserUnidade]);

  return {
    items,
    loading,
    addItem,
    updateItemQuantity,
    deleteItem,
    fetchItems,
    qrCodes,
    showQRGenerator,
    setShowQRGenerator,
    lastAddedItem,
    transferItemsToUnidade
  };
}
