

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface CamaraFriaHistoricoItem {
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

export function useCamaraFriaHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<CamaraFriaHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<{ data: CamaraFriaHistoricoItem[], timestamp: number, unidade: string } | null>(null);
  const pendingRequestRef = useRef<boolean>(false);
  const lastInsertRef = useRef<{ item: string, quantidade: number, tipo: string, timestamp: number } | null>(null);

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
      console.log('Using cached data for camara fria history');
      setHistorico(cacheRef.current.data);
      setLoading(false);
      return;
    }

    // Throttle requests
    if (now - lastFetchRef.current < 10000) {
      console.log('Throttling camara fria history fetch request');
      return;
    }

    lastFetchRef.current = now;
    pendingRequestRef.current = true;
    
    try {
      let query = supabase
        .from('camara_fria_historico')
        .select('id,item_nome,quantidade,categoria,tipo,data_operacao,observacoes,unidade')
        .order('data_operacao', { ascending: false });

      if (selectedUnidade && selectedUnidade !== 'todas') {
        query = query.eq('unidade', selectedUnidade);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const mappedHistorico: CamaraFriaHistoricoItem[] = (data || []).map(item => ({
        id: item.id,
        item_nome: item.item_nome,
        quantidade: Number(item.quantidade), // Garantir que é número
        unidade: item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza' ? 'pç' : item.unidade,
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
      pendingRequestRef.current = false;
    }
  };

  const addHistoricoItem = async (item: Omit<CamaraFriaHistoricoItem, 'id' | 'data_operacao'>) => {
    if (!user || pendingRequestRef.current) return;

    const now = Date.now();
    
    // Verificação de duplicação recente (baseada em dados do banco)
    const recentDuplicate = historico.find(h => 
      h.item_nome === item.item_nome &&
      h.quantidade === item.quantidade &&
      h.tipo === item.tipo &&
      new Date(h.data_operacao).getTime() > (now - 5000) // 5 segundos
    );

    if (recentDuplicate) {
      console.log('Duplicação detectada na câmara fria (histórico), ignorando inserção:', item);
      return;
    }

    // Verificação de duplicação baseada na última inserção local
    if (lastInsertRef.current &&
        lastInsertRef.current.item === item.item_nome &&
        lastInsertRef.current.quantidade === item.quantidade &&
        lastInsertRef.current.tipo === item.tipo &&
        (now - lastInsertRef.current.timestamp) < 3000) { // 3 segundos
      console.log('Duplicação detectada na câmara fria (local), ignorando inserção:', item);
      return;
    }

    // Marcar que uma inserção está sendo processada
    pendingRequestRef.current = true;
    lastInsertRef.current = {
      item: item.item_nome,
      quantidade: item.quantidade,
      tipo: item.tipo,
      timestamp: now
    };

    try {
      console.log('=== ADICIONANDO AO HISTÓRICO DA CÂMARA FRIA ===');
      console.log('Item para histórico:', item);

      const unidadeParaSalvar = item.unidade_item || 'juazeiro_norte';
      
      const itemParaInserir = {
        item_nome: item.item_nome,
        quantidade: Number(item.quantidade), // Garantir que é número
        categoria: item.categoria,
        tipo: item.tipo,
        observacoes: item.observacoes || null,
        user_id: user.id,
        unidade: unidadeParaSalvar
      };

      console.log('Item para inserir no histórico:', itemParaInserir);

      const { data, error } = await supabase
        .from('camara_fria_historico')
        .insert([itemParaInserir])
        .select('id,item_nome,quantidade,categoria,tipo,data_operacao,observacoes,unidade')
        .single();

      if (error) throw error;
      
      console.log('Item inserido no histórico:', data);

      // Clear cache on data change
      cacheRef.current = null;
      
      const mappedItem: CamaraFriaHistoricoItem = {
        id: data.id,
        item_nome: data.item_nome,
        quantidade: Number(data.quantidade),
        unidade: data.unidade === 'juazeiro_norte' || data.unidade === 'fortaleza' ? 'pç' : data.unidade,
        categoria: data.categoria,
        tipo: data.tipo as 'entrada' | 'saida',
        data_operacao: data.data_operacao,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
      };
      
      setHistorico(prev => [mappedItem, ...prev]);
      
      console.log('Histórico da câmara fria inserido com sucesso:', mappedItem);
    } catch (error) {
      console.error('Error adding history item:', error);
      toast({
        title: "Erro ao registrar histórico",
        description: "Não foi possível registrar a operação no histórico.",
        variant: "destructive",
      });
    } finally {
      pendingRequestRef.current = false;
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

