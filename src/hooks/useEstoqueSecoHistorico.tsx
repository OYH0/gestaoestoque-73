
import { useState, useEffect, useRef } from 'react';
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
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useEstoqueSecoHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<EstoqueSecoHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<{ data: EstoqueSecoHistoricoItem[], timestamp: number, unidade: string } | null>(null);

  // Cache duration: 60 seconds for history (less frequently changing data)
  const CACHE_DURATION = 60 * 1000;

  const fetchHistorico = async () => {
    if (!user) return;
    
    const now = Date.now();
    const cacheKey = selectedUnidade || 'todas';
    
    // Check cache first
    if (cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION && 
        cacheRef.current.unidade === cacheKey) {
      console.log('Using cached data for estoque seco history');
      setHistorico(cacheRef.current.data);
      setLoading(false);
      return;
    }

    // Throttle requests - minimum 10 seconds between fetches
    if (now - lastFetchRef.current < 10000) {
      console.log('Throttling estoque seco history fetch request');
      return;
    }

    lastFetchRef.current = now;
    
    try {
      let query = supabase
        .from('estoque_seco_historico')
        .select('id,item_nome,quantidade,categoria,tipo,data_operacao,observacoes,unidade')
        .order('data_operacao', { ascending: false })
        .limit(100); // Limit to 100 most recent records

      // Aplicar filtro por unidade se não for "todas"
      if (selectedUnidade && selectedUnidade !== 'todas') {
        query = query.eq('unidade', selectedUnidade);
      }

      const { data, error } = await query;

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
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza',
      }));
      
      // Update cache
      cacheRef.current = {
        data: mappedHistorico,
        timestamp: now,
        unidade: cacheKey
      };
      
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
          item_nome: item.item_nome,
          quantidade: item.quantidade,
          categoria: item.categoria,
          tipo: item.tipo,
          observacoes: item.observacoes,
          user_id: user.id,
          unidade: item.unidade_item || 'juazeiro_norte'
        }])
        .select('id,item_nome,quantidade,categoria,tipo,data_operacao,observacoes,unidade')
        .single();

      if (error) throw error;
      
      // Clear cache on data change
      cacheRef.current = null;
      
      const mappedItem: EstoqueSecoHistoricoItem = {
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
      
      setHistorico(prev => [mappedItem, ...prev].slice(0, 100)); // Keep only 100 most recent
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
    const timeoutId = setTimeout(() => {
      fetchHistorico();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [user, selectedUnidade]);

  return {
    historico,
    loading,
    addHistoricoItem,
    fetchHistorico
  };
}
