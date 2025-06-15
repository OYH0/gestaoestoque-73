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

      // Aplicar filtro por unidade se não for "todas" - usar o campo 'unidade' do banco
      if (stableSelectedUnidade.current && stableSelectedUnidade.current !== 'todas') {
        query = query.eq('unidade', stableSelectedUnidade.current);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (!mountedRef.current) return;
      
      // Map the database data to our interface
      const mappedItems: CamaraRefrigeradaItem[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade_medida || 'pç', // Use unidade_medida from database for unit of measure
        categoria: item.categoria,
        status: item.status as 'descongelando' | 'pronto',
        data_entrada: item.data_entrada,
        temperatura_ideal: item.temperatura_ideal,
        observacoes: item.observacoes,
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza', // Use unidade from database for company unit
      }));
      
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
      // Usar unidade_item se fornecido, senão usar padrão
      const unidadeParaSalvar = newItem.unidade_item || 'juazeiro_norte';
      
      console.log('=== ADICIONANDO ITEM NA CÂMARA REFRIGERADA ===');
      console.log('Item recebido:', newItem);
      console.log('Unidade para salvar:', unidadeParaSalvar);
      
      // Preparar dados para inserção no banco - usar os campos corretos do banco
      const itemToInsert = {
        nome: newItem.nome,
        quantidade: newItem.quantidade,
        unidade_medida: newItem.unidade, // Campo correto para unidade de medida
        categoria: newItem.categoria,
        status: newItem.status || 'descongelando',
        data_entrada: newItem.data_entrada,
        temperatura_ideal: newItem.temperatura_ideal,
        observacoes: newItem.observacoes,
        user_id: user.id,
        unidade: unidadeParaSalvar // Campo correto para unidade da empresa
      };

      console.log('Dados para inserção:', itemToInsert);

      const { data, error } = await supabase
        .from('camara_refrigerada_items')
        .insert([itemToInsert])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir no banco:', error);
        throw error;
      }
      
      console.log('Item inserido com sucesso:', data);
      
      // Map the returned data to our interface
      const mappedItem: CamaraRefrigeradaItem = {
        id: data.id,
        nome: data.nome,
        quantidade: data.quantidade,
        unidade: data.unidade_medida || newItem.unidade, // Mapear corretamente a unidade de medida
        categoria: data.categoria,
        status: data.status as 'descongelando' | 'pronto',
        data_entrada: data.data_entrada,
        temperatura_ideal: data.temperatura_ideal,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza', // Mapear corretamente a unidade da empresa
      };
      
      setItems(prev => [...prev, mappedItem]);
      toast({
        title: "Item adicionado à câmara refrigerada",
        description: `${newItem.nome} foi movido para descongelamento!`,
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
