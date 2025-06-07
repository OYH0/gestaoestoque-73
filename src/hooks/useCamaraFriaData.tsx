
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
}

export function useCamaraFriaData() {
  const [items, setItems] = useState<CamaraFriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('camara_fria_items')
        .select('*')
        .order('nome');

      if (error) throw error;
      setItems(data || []);
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

    try {
      const { data, error } = await supabase
        .from('camara_fria_items')
        .insert([{ ...newItem, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      setItems(prev => [...prev, data]);
      toast({
        title: "Item adicionado",
        description: `${newItem.nome} foi adicionado ao estoque!`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Não foi possível adicionar o item.",
        variant: "destructive",
      });
    }
  };

  const updateItemQuantity = async (id: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('camara_fria_items')
        .update({ quantidade: newQuantity })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantidade: newQuantity } : item
      ));
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

  useEffect(() => {
    fetchItems();
  }, [user]);

  return {
    items,
    loading,
    addItem,
    updateItemQuantity,
    deleteItem,
    fetchItems
  };
}
