import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface HistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  data_operacao: string;
  observacoes?: string;
  user_id: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useBebidasHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const addHistoricoItem = useCallback(async (item: Omit<HistoricoItem, 'id' | 'data_operacao' | 'user_id'>) => {
    if (!user) return;
    
    try {
      const itemData = {
        user_id: user.id,
        item_nome: item.item_nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: item.tipo,
        observacoes: item.observacoes || null
      };

      const { data, error } = await supabase
        .from('bebidas_historico')
        .insert([itemData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const newHistoricoItem: HistoricoItem = {
        ...data,
        tipo: data.tipo as 'entrada' | 'saida',
        data_operacao: data.data_operacao
      };

      setHistorico(prev => [newHistoricoItem, ...prev]);

      return newHistoricoItem;
    } catch (error) {
      console.error('Error adding historico item:', error);
      toast({
        title: "Erro ao adicionar ao histórico",
        description: "Não foi possível adicionar o item ao histórico.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user]);

  const fetchHistorico = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('bebidas_historico')
        .select('*')
        .order('data_operacao', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const mappedData = (data || []).map(item => ({
        ...item,
        tipo: item.tipo as 'entrada' | 'saida'
      }));

      setHistorico(mappedData);
    } catch (error) {
      console.error('Error fetching historico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    historico,
    loading,
    addHistoricoItem,
    fetchHistorico
  };
}