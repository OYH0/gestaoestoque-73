import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface BebidasHistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  observacoes?: string;
  created_at: string;
  user_id: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useBebidasHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<BebidasHistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Refs para controle de duplicação e cache
  const recentItemsRef = useRef<Set<string>>(new Set());
  const localCacheRef = useRef<Set<string>>(new Set());
  const pendingRequestsRef = useRef<Set<string>>(new Set());
  
  // Função para gerar chave única do item
  const generateItemKey = (item: Omit<BebidasHistoricoItem, 'id' | 'created_at'>) => {
    return `${item.item_nome}-${item.quantidade}-${item.tipo}-${item.unidade_item}-${Date.now()}`;
  };

  const fetchHistorico = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('bebidas_historico')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedUnidade && selectedUnidade !== 'todas') {
        query = query.eq('unidade_item', selectedUnidade);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setHistorico(data || []);
    } catch (error) {
      console.error('Error fetching bebidas historico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico das bebidas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, [user, selectedUnidade]);

  const addHistoricoItem = async (newItem: Omit<BebidasHistoricoItem, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    // Proteção 1: Gerar chave única e verificar cache local
    const itemKey = generateItemKey(newItem);
    if (localCacheRef.current.has(itemKey)) {
      console.log('Item já adicionado localmente, ignorando duplicata');
      return;
    }

    // Proteção 2: Verificar requisições pendentes
    const pendingKey = `${newItem.item_nome}-${newItem.quantidade}-${newItem.tipo}`;
    if (pendingRequestsRef.current.has(pendingKey)) {
      console.log('Requisição já em andamento, ignorando duplicata');
      return;
    }

    // Proteção 3: Verificar itens recentes por conteúdo
    const recentKey = `${newItem.item_nome}-${newItem.quantidade}-${newItem.tipo}-${newItem.unidade_item}`;
    if (recentItemsRef.current.has(recentKey)) {
      console.log('Item idêntico adicionado recentemente, ignorando duplicata');
      return;
    }

    // Marcar como pendente
    pendingRequestsRef.current.add(pendingKey);
    recentItemsRef.current.add(recentKey);
    localCacheRef.current.add(itemKey);

    try {
      const itemToInsert = {
        ...newItem,
        user_id: user.id,
        created_at: new Date().toISOString()
      };

      console.log('Inserindo no histórico de bebidas:', itemToInsert);

      const { data, error } = await supabase
        .from('bebidas_historico')
        .insert([itemToInsert])
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local apenas se não temos item duplicado
      setHistorico(prev => {
        const exists = prev.some(item => 
          item.item_nome === data.item_nome &&
          item.quantidade === data.quantidade &&
          item.tipo === data.tipo &&
          Math.abs(new Date(item.created_at).getTime() - new Date(data.created_at).getTime()) < 5000
        );
        
        if (exists) {
          console.log('Item duplicado detectado no estado, não adicionando');
          return prev;
        }
        
        return [data, ...prev];
      });

      console.log('Item adicionado ao histórico com sucesso');
      
    } catch (error) {
      console.error('Error adding historico item:', error);
      // Remover do cache em caso de erro
      localCacheRef.current.delete(itemKey);
      recentItemsRef.current.delete(recentKey);
      
      toast({
        title: "Erro ao registrar histórico",
        description: "Não foi possível registrar a movimentação no histórico.",
        variant: "destructive",
      });
    } finally {
      // Remover da lista de pendentes
      pendingRequestsRef.current.delete(pendingKey);
      
      // Limpar cache local após um tempo
      setTimeout(() => {
        localCacheRef.current.delete(itemKey);
        recentItemsRef.current.delete(recentKey);
      }, 10000); // 10 segundos
    }
  };

  return {
    historico,
    loading,
    addHistoricoItem,
    fetchHistorico
  };
}