
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface CamaraRefrigeradaHistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'retirada' | 'volta_freezer';
  data_operacao: string;
  observacoes?: string;
  estoque_tipo?: 'CF' | 'ES' | 'DESC';
}

export function useCamaraRefrigeradaHistorico() {
  const [historico, setHistorico] = useState<CamaraRefrigeradaHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistorico = async (estoqueTipo?: 'CF' | 'ES' | 'DESC') => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('camara_refrigerada_historico')
        .select('*')
        .order('data_operacao', { ascending: false });

      // Filtrar por tipo de estoque se especificado
      if (estoqueTipo) {
        query = query.eq('estoque_tipo', estoqueTipo);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const mappedHistorico: CamaraRefrigeradaHistoricoItem[] = (data || []).map(item => ({
        id: item.id,
        item_nome: item.item_nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: item.tipo as 'retirada' | 'volta_freezer',
        data_operacao: item.data_operacao,
        observacoes: item.observacoes,
        estoque_tipo: item.estoque_tipo || 'CF',
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

  const addHistoricoItem = async (item: Omit<CamaraRefrigeradaHistoricoItem, 'id' | 'data_operacao'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('camara_refrigerada_historico')
        .insert([{ 
          ...item, 
          user_id: user.id,
          estoque_tipo: item.estoque_tipo || 'CF'
        }])
        .select()
        .single();

      if (error) throw error;
      
      const mappedItem: CamaraRefrigeradaHistoricoItem = {
        id: data.id,
        item_nome: data.item_nome,
        quantidade: data.quantidade,
        unidade: data.unidade,
        categoria: data.categoria,
        tipo: data.tipo as 'retirada' | 'volta_freezer',
        data_operacao: data.data_operacao,
        observacoes: data.observacoes,
        estoque_tipo: data.estoque_tipo || 'CF',
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
