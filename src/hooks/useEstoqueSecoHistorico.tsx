
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface EstoqueSecoHistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  data_operacao: string;
  observacoes?: string;
}

export function useEstoqueSecoHistorico() {
  const [historico, setHistorico] = useState<EstoqueSecoHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistorico = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('estoque_seco_historico')
        .select('*')
        .order('data_operacao', { ascending: false });

      if (error) throw error;
      
      const mappedHistorico: EstoqueSecoHistoricoItem[] = (data || []).map(item => ({
        id: item.id,
        item_nome: item.item_nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: item.tipo as 'entrada' | 'saida',
        data_operacao: item.data_operacao,
        observacoes: item.observacoes,
      }));
      
      setHistorico(mappedHistorico);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addHistoricoItem = async (item: Omit<EstoqueSecoHistoricoItem, 'id' | 'data_operacao'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('estoque_seco_historico')
        .insert([{ 
          ...item, 
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      const mappedItem: EstoqueSecoHistoricoItem = {
        id: data.id,
        item_nome: data.item_nome,
        quantidade: data.quantidade,
        unidade: data.unidade,
        categoria: data.categoria,
        tipo: data.tipo as 'entrada' | 'saida',
        data_operacao: data.data_operacao,
        observacoes: data.observacoes,
      };
      
      setHistorico(prev => [mappedItem, ...prev]);
    } catch (error) {
      console.error('Error adding history item:', error);
      toast({
        title: "Erro ao registrar histórico",
        description: "Não foi possível registrar a operação no histórico.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, [user]);

  return {
    historico,
    loading,
    addHistoricoItem,
    fetchHistorico
  };
}
