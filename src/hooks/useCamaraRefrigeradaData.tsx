
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface CamaraRefrigeradaItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tempo_descongelamento?: string;
  status: 'descongelando' | 'pronto';
  data_entrada?: string;
  temperatura_ideal?: number;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useCamaraRefrigeradaData(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [items, setItems] = useState<CamaraRefrigeradaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const mountedRef = useRef(true);
  const loggedRef = useRef(false);
  
  // Create a stable reference for the selected unit
  const stableSelectedUnidade = useRef(selectedUnidade);
  stableSelectedUnidade.current = selectedUnidade;

  const fetchItems = useCallback(async () => {
    if (!user || !mountedRef.current) return;
    
    // Log apenas uma vez por sessão
    if (!loggedRef.current) {
      console.log('=== FETCH INICIAL DA CÂMARA REFRIGERADA ===');
      loggedRef.current = true;
    }
    
    try {
      let query = supabase
        .from('camara_refrigerada_items')
        .select('*')
        .order('nome');

      console.log('=== FILTRO APLICADO ===');
      console.log('Filtro selecionado:', stableSelectedUnidade.current);

      // Aplicar filtro no banco se não for "todas"
      if (stableSelectedUnidade.current && stableSelectedUnidade.current !== 'todas') {
        console.log('Aplicando filtro no banco para unidade:', stableSelectedUnidade.current);
        query = query.eq('unidade', stableSelectedUnidade.current);
      } else {
        console.log('Sem filtro aplicado - buscando todas as unidades');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (!mountedRef.current) return;
      
      console.log('=== DADOS BRUTOS DO BANCO ===');
      console.log('Total de registros retornados pelo banco:', data?.length || 0);
      console.log('Filtro aplicado no banco:', stableSelectedUnidade.current !== 'todas' ? stableSelectedUnidade.current : 'nenhum');
      data?.forEach(item => {
        console.log(`Item do banco: ${item.nome} - Unidade DB: ${item.unidade} - Observações: ${item.observacoes}`);
      });
      
      // Map the database data to our interface and extract measurement unit from observacoes
      const mappedItems: CamaraRefrigeradaItem[] = (data || []).map(item => {
        // Extract measurement unit from observacoes if it contains unit info
        let unidadeMedida = 'pç';
        if (item.observacoes && item.observacoes.includes('MEDIDA:')) {
          const medidaMatch = item.observacoes.match(/MEDIDA:([^;\s]+)/);
          if (medidaMatch) {
            unidadeMedida = medidaMatch[1];
          }
        }
        
        console.log(`Mapeando item ${item.nome}: unidade empresa (do banco) = ${item.unidade}, unidade medida extraída = ${unidadeMedida}`);
        
        return {
          id: item.id,
          nome: item.nome,
          quantidade: item.quantidade,
          unidade: unidadeMedida, // Esta é a unidade de medida (kg, pç, etc.) extraída das observações
          categoria: item.categoria,
          status: item.status as 'descongelando' | 'pronto',
          data_entrada: item.data_entrada,
          temperatura_ideal: item.temperatura_ideal,
          observacoes: item.observacoes,
          unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza', // Esta é a unidade da empresa do banco
        };
      });
      
      console.log('=== ITENS MAPEADOS ===');
      mappedItems.forEach(item => {
        console.log(`Item mapeado: ${item.nome} - Unidade Empresa: ${item.unidade_item} - Unidade Medida: ${item.unidade}`);
      });
      
      console.log('=== RESULTADO FINAL ===');
      console.log('Total de itens após mapeamento:', mappedItems.length);
      console.log('Filtro selecionado para verificação:', stableSelectedUnidade.current);
      mappedItems.forEach(item => {
        console.log(`Item final: ${item.nome} - Unidade Empresa: ${item.unidade_item} - Deve aparecer: ${stableSelectedUnidade.current === 'todas' || item.unidade_item === stableSelectedUnidade.current}`);
      });
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os itens da câmara refrigerada.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  // Effect for initial load and user changes
  useEffect(() => {
    if (user) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [user, fetchItems]);

  // Effect for unit changes
  useEffect(() => {
    if (user && stableSelectedUnidade.current !== selectedUnidade) {
      stableSelectedUnidade.current = selectedUnidade;
      fetchItems();
    }
  }, [selectedUnidade, user, fetchItems]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addItem = async (newItem: Omit<CamaraRefrigeradaItem, 'id'>) => {
    if (!user) return;

    try {
      console.log('=== ADICIONANDO ITEM NA CÂMARA REFRIGERADA ===');
      console.log('Item recebido:', newItem);
      console.log('Unidade da empresa recebida:', newItem.unidade_item);
      console.log('Unidade de medida recebida:', newItem.unidade);
      
      // Include measurement unit info in observacoes
      const observacoesComMedida = `${newItem.observacoes || ''} MEDIDA:${newItem.unidade || 'pç'}`.trim();
      
      console.log('Observações com unidade de medida:', observacoesComMedida);
      
      const itemToInsert = {
        nome: newItem.nome,
        quantidade: newItem.quantidade,
        unidade: newItem.unidade_item || 'juazeiro_norte', // Esta é a unidade da empresa no banco
        categoria: newItem.categoria,
        status: newItem.status || 'descongelando',
        data_entrada: newItem.data_entrada,
        temperatura_ideal: newItem.temperatura_ideal,
        observacoes: observacoesComMedida, // Aqui salvamos a unidade de medida
        user_id: user.id,
      };

      console.log('Dados para inserção no banco:', itemToInsert);

      const { data, error } = await supabase
        .from('camara_refrigerada_items')
        .insert([itemToInsert])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir no banco:', error);
        throw error;
      }
      
      console.log('Item inserido no banco:', data);
      
      // Refetch items to ensure the list is updated with proper filtering
      await fetchItems();
      
      toast({
        title: "Item adicionado à câmara refrigerada",
        description: `${newItem.nome} foi movido para descongelamento na unidade ${newItem.unidade_item === 'fortaleza' ? 'Fortaleza' : 'Juazeiro do Norte'}!`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Não foi possível mover o item para a câmara refrigerada.",
        variant: "destructive",
      });
    }
  };

  const updateItemStatus = async (id: string, status: 'descongelando' | 'pronto') => {
    try {
      const { error } = await supabase
        .from('camara_refrigerada_items')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do item.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('camara_refrigerada_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Item removido",
        description: "Item foi removido da câmara refrigerada.",
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

  return {
    items,
    loading,
    addItem,
    updateItemStatus,
    deleteItem,
    fetchItems
  };
}
