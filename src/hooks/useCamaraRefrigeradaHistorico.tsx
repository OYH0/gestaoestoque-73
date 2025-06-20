import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface CamaraRefrigeradaHistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'retirada' | 'volta_freezer' | 'entrada';
  data_operacao: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useCamaraRefrigeradaHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<CamaraRefrigeradaHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<{ data: CamaraRefrigeradaHistoricoItem[], timestamp: number, unidade: string } | null>(null);
  const pendingRequestRef = useRef<boolean>(false);

  // Cache duration: 60 seconds for history
  const CACHE_DURATION = 60 * 1000;

  const fetchHistorico = async () => {
    if (!user || pendingRequestRef.current) return;
    
    const now = Date.now();
    const cacheKey = selectedUnidade || 'todas';
    
    // Check cache first
    if (cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION && 
        cacheRef.current.unidade === cacheKey) {
      console.log('Using cached data for camara refrigerada history');
      setHistorico(cacheRef.current.data);
      setLoading(false);
      return;
    }

    // Throttle requests
    if (now - lastFetchRef.current < 10000) {
      console.log('Throttling camara refrigerada history fetch request');
      return;
    }

    lastFetchRef.current = now;
    pendingRequestRef.current = true;
    
    try {
      let query = supabase
        .from('camara_refrigerada_historico')
        .select('id,item_nome,quantidade,categoria,tipo,data_operacao,observacoes,unidade')
        .order('data_operacao', { ascending: false });

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
        tipo: item.tipo as 'retirada' | 'volta_freezer' | 'entrada',
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
      pendingRequestRef.current = false;
    }
  };

  const addHistoricoItem = async (item: Omit<CamaraRefrigeradaHistoricoItem, 'id' | 'data_operacao'>) => {
    if (!user || pendingRequestRef.current) return;

    // Verificar se não é uma duplicação recente
    const recentDuplicate = historico.find(h => 
      h.item_nome === item.item_nome &&
      h.quantidade === item.quantidade &&
      h.tipo === item.tipo &&
      new Date(h.data_operacao).getTime() > (Date.now() - 5000) // 5 segundos
    );

    if (recentDuplicate) {
      console.log('Duplicação detectada, ignorando inserção:', item);
      return;
    }

    try {
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

      console.log('Inserindo no histórico da câmara refrigerada:', itemParaInserir);

      const { data, error } = await supabase
        .from('camara_refrigerada_historico')
        .insert([itemParaInserir])
        .select('id,item_nome,quantidade,categoria,tipo,data_operacao,observacoes,unidade')
        .single();

      if (error) throw error;
      
      // Clear cache on data change
      cacheRef.current = null;
      
      const mappedItem: CamaraRefrigeradaHistoricoItem = {
        id: data.id,
        item_nome: data.item_nome,
        quantidade: data.quantidade,
        unidade: data.unidade === 'juazeiro_norte' || data.unidade === 'fortaleza' ? 'pç' : data.unidade,
        categoria: data.categoria,
        tipo: data.tipo as 'retirada' | 'volta_freezer' | 'entrada',
        data_operacao: data.data_operacao,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
      };
      
      setHistorico(prev => [mappedItem, ...prev]);
      
      console.log('Histórico inserido com sucesso:', mappedItem);
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
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [user, selectedUnidade]);

  return {
    historico,
    loading,
    addHistoricoItem,
    fetchHistorico
  };
}
