
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
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useCamaraRefrigeradaHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<CamaraRefrigeradaHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistorico = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('camara_refrigerada_historico')
        .select('*')
        .order('data_operacao', { ascending: false });

      // Aplicar filtro por unidade se não for "todas"
      if (selectedUnidade && selectedUnidade !== 'todas') {
        query = query.eq('unidade', selectedUnidade);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const mappedHistorico: CamaraRefrigeradaHistoricoItem[] = (data || []).map(item => ({
        id: item.id,
        item_nome: item.item_nome,
        quantidade: item.quantidade,
        unidade: item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza' ? 'pç' : item.unidade,
        categoria: item.categoria,
        tipo: item.tipo as 'retirada' | 'volta_freezer',
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

  const addHistoricoItem = async (item: Omit<CamaraRefrigeradaHistoricoItem, 'id' | 'data_operacao'>) => {
    if (!user) return;

    console.log('=== REGISTRANDO NO HISTÓRICO DA CÂMARA REFRIGERADA ===');
    console.log('Item para histórico:', item);
    console.log('Unidade do item:', item.unidade_item);

    try {
      // Garantir que a unidade seja sempre passada
      const unidadeParaSalvar = item.unidade_item || 'juazeiro_norte';
      
      const itemParaInserir = {
        item_nome: item.item_nome,
        quantidade: item.quantidade,
        categoria: item.categoria,
        tipo: item.tipo,
        observacoes: item.observacoes || null,
        user_id: user.id,
        unidade: unidadeParaSalvar
      };

      console.log('Item final para inserir no histórico:', itemParaInserir);

      const { data, error } = await supabase
        .from('camara_refrigerada_historico')
        .insert([itemParaInserir])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir no histórico:', error);
        throw error;
      }
      
      console.log('✅ Histórico registrado com sucesso:', data);
      
      const mappedItem: CamaraRefrigeradaHistoricoItem = {
        id: data.id,
        item_nome: data.item_nome,
        quantidade: data.quantidade,
        unidade: data.unidade === 'juazeiro_norte' || data.unidade === 'fortaleza' ? 'pç' : data.unidade,
        categoria: data.categoria,
        tipo: data.tipo as 'retirada' | 'volta_freezer',
        data_operacao: data.data_operacao,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
      };
      
      setHistorico(prev => [mappedItem, ...prev]);
    } catch (error) {
      console.error('❌ ERRO ao registrar histórico:', error);
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
