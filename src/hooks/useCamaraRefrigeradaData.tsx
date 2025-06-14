
import { useState, useEffect } from 'react';
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

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('camara_refrigerada_items')
        .select('*')
        .order('nome');

      // Aplicar filtro por unidade se não for "todas"
      if (selectedUnidade && selectedUnidade !== 'todas') {
        query = query.eq('unidade', selectedUnidade);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map the database data to our interface
      const mappedItems: CamaraRefrigeradaItem[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza' ? 'pç' : item.unidade,
        categoria: item.categoria,
        status: item.status as 'descongelando' | 'pronto',
        data_entrada: item.data_entrada,
        temperatura_ideal: item.temperatura_ideal,
        observacoes: item.observacoes,
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza',
      }));
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os itens da câmara refrigerada.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItem: Omit<CamaraRefrigeradaItem, 'id'>) => {
    if (!user) return;

    try {
      const unidadeParaSalvar = newItem.unidade_item || 'juazeiro_norte';
      
      const { data, error } = await supabase
        .from('camara_refrigerada_items')
        .insert([{ 
          ...newItem, 
          user_id: user.id,
          status: newItem.status || 'descongelando',
          unidade: unidadeParaSalvar
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Map the returned data to our interface
      const mappedItem: CamaraRefrigeradaItem = {
        id: data.id,
        nome: data.nome,
        quantidade: data.quantidade,
        unidade: data.unidade === 'juazeiro_norte' || data.unidade === 'fortaleza' ? 'pç' : data.unidade,
        categoria: data.categoria,
        status: data.status as 'descongelando' | 'pronto',
        data_entrada: data.data_entrada,
        temperatura_ideal: data.temperatura_ideal,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
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

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, selectedUnidade]);

  return {
    items,
    loading,
    addItem,
    updateItemStatus,
    deleteItem,
    fetchItems
  };
}
