
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface DescartaveisHistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  data_operacao: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useDescartaveisHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<DescartaveisHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistorico = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('descartaveis_historico')
        .select('*')
        .order('data_operacao', { ascending: false });

      // Aplicar filtro por unidade se não for "todas"
      if (selectedUnidade && selectedUnidade !== 'todas') {
        query = query.eq('unidade', selectedUnidade);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const mappedHistorico: DescartaveisHistoricoItem[] = (data || []).map(item => ({
        id: item.id,
        item_nome: item.item_nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        tipo: item.tipo as 'entrada' | 'saida',
        data_operacao: item.data_operacao,
        observacoes: item.observacoes,
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza',
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

  const addHistoricoItem = async (item: Omit<DescartaveisHistoricoItem, 'id' | 'data_operacao'>) => {
    if (!user) return;

    try {
      console.log('Adding history item:', { ...item, user_id: user.id });
      
      const { data, error } = await supabase
        .from('descartaveis_historico')
        .insert([{ 
          item_nome: item.item_nome,
          quantidade: item.quantidade,
          categoria: item.categoria,
          tipo: item.tipo,
          observacoes: item.observacoes,
          user_id: user.id,
          unidade: item.unidade_item || 'juazeiro_norte'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting history:', error);
        throw error;
      }
      
      console.log('History item added successfully:', data);
      
      const mappedItem: DescartaveisHistoricoItem = {
        id: data.id,
        item_nome: data.item_nome,
        quantidade: data.quantidade,
        unidade: data.unidade,
        categoria: data.categoria,
        tipo: data.tipo as 'entrada' | 'saida',
        data_operacao: data.data_operacao,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
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
  }, [user, selectedUnidade]);

  return {
    historico,
    loading,
    addHistoricoItem,
    fetchHistorico
  };
}
