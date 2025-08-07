
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface CamaraRefrigeradaItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tempo_descongelamento?: string;
  status: 'descongelando' | 'pronto';
  data_entrada?: string;
  temperatura_ideal?: number;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useCamaraRefrigeradaData(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [items, setItems] = useState<CamaraRefrigeradaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const mountedRef = useRef(true);
  const loggedRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<{ data: CamaraRefrigeradaItem[], timestamp: number, unidade: string } | null>(null);

  // Cache duration: 2 minutes for better mobile performance
  const CACHE_DURATION = 2 * 60 * 1000;

  const fetchItems = useCallback(async (unidadeFiltro?: 'juazeiro_norte' | 'fortaleza' | 'todas') => {
    if (!user || !mountedRef.current) return;
    
    const now = Date.now();
    const cacheKey = unidadeFiltro || 'todas';
    
    // Check cache first
    if (cacheRef.current && 
        (now - cacheRef.current.timestamp) < CACHE_DURATION && 
        cacheRef.current.unidade === cacheKey) {
      console.log('Using cached data for camera refrigerada');
      setItems(cacheRef.current.data);
      setLoading(false);
      return;
    }

    // Throttle requests - minimum 10 seconds between fetches for mobile
    if (now - lastFetchRef.current < 10000) {
      console.log('Throttling camera refrigerada fetch request');
      return;
    }

    lastFetchRef.current = now;
    
    // Log apenas uma vez por sessão
    if (!loggedRef.current) {
      console.log('=== FETCH INICIAL DA CÂMARA REFRIGERADA ===');
      loggedRef.current = true;
    }
    
    try {
      let query = supabase
        .from('camara_refrigerada_items')
        .select('id,nome,quantidade,categoria,status,data_entrada,temperatura_ideal,observacoes,unidade')
        .order('nome');

      // Aplicar filtro no banco se não for "todas"
      if (unidadeFiltro && unidadeFiltro !== 'todas') {
        query = query.eq('unidade', unidadeFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (!mountedRef.current) return;
      
      // Map the database data to our interface and extract measurement unit from observacoes
      const mappedItems: CamaraRefrigeradaItem[] = (data || []).map(item => {
        // Extract measurement unit from observacoes if it contains unit info
        let unidadeMedida = 'pç';
        if (item.observacoes && item.observacoes.includes('MEDIDA:')) {
          const medidaMatch = item.observacoes.match(/MEDIDA:([^;\s]+)/);
          if (medidaMatch) {
            unidadeMedida = medidaMatch[1];
          }
        }
        
        return {
          id: item.id,
          nome: item.nome,
          quantidade: item.quantidade,
          unidade: unidadeMedida,
          categoria: item.categoria,
          status: item.status as 'descongelando' | 'pronto',
          data_entrada: item.data_entrada,
          temperatura_ideal: item.temperatura_ideal,
          observacoes: item.observacoes,
          unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza',
        };
      });
      
      // Update cache
      cacheRef.current = {
        data: mappedItems,
        timestamp: now,
        unidade: cacheKey
      };
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os itens da câmara refrigerada.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  // Effect for initial load and user changes
  useEffect(() => {
    if (user) {
      fetchItems(selectedUnidade);
    } else {
      setLoading(false);
    }
  }, [user, fetchItems]);

  // Effect for unit changes - with longer debounce for mobile
  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchItems(selectedUnidade);
      }, 1000); // 1000ms debounce for better mobile performance

      return () => clearTimeout(timeoutId);
    }
  }, [selectedUnidade, user, fetchItems]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addItem = async (newItem: Omit<CamaraRefrigeradaItem, 'id'>) => {
    if (!user) return;

    try {
      // Include measurement unit info in observacoes
      const observacoesComMedida = `${newItem.observacoes || ''} MEDIDA:${newItem.unidade || 'pç'}`.trim();
      
      const itemToInsert = {
        nome: newItem.nome,
        quantidade: newItem.quantidade,
        unidade: newItem.unidade_item || 'juazeiro_norte',
        categoria: newItem.categoria,
        status: newItem.status || 'descongelando',
        data_entrada: newItem.data_entrada,
        temperatura_ideal: newItem.temperatura_ideal,
        observacoes: observacoesComMedida,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('camara_refrigerada_items')
        .insert([itemToInsert])
        .select('id,nome,quantidade,categoria,status,data_entrada,temperatura_ideal,observacoes,unidade')
        .single();

      if (error) throw error;
      
      // Clear cache on data change
      cacheRef.current = null;
      
      // Add to local state immediately
      const mappedItem = {
        id: data.id,
        nome: data.nome,
        quantidade: data.quantidade,
        unidade: newItem.unidade || 'pç',
        categoria: data.categoria,
        status: data.status as 'descongelando' | 'pronto',
        data_entrada: data.data_entrada,
        temperatura_ideal: data.temperatura_ideal,
        observacoes: data.observacoes,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza',
      };
      
      setItems(prev => [...prev, mappedItem]);
      
      toast({
        title: "Item adicionado à câmara refrigerada",
        description: `${newItem.nome} foi movido para descongelamento na unidade ${newItem.unidade_item === 'fortaleza' ? 'Fortaleza' : 'Juazeiro do Norte'}!`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Não foi possível mover o item para a câmara refrigerada.",
        variant: "destructive",
      });
    }
  };

  const updateItemStatus = async (id: string, status: 'descongelando' | 'pronto') => {
    try {
      const { error } = await supabase
        .from('camara_refrigerada_items')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Clear cache on data change
      cacheRef.current = null;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do item.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('camara_refrigerada_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Clear cache on data change
      cacheRef.current = null;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Item removido",
        description: "Item foi removido da câmara refrigerada.",
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

  return {
    items,
    loading,
    addItem,
    updateItemStatus,
    deleteItem,
    fetchItems: () => fetchItems(selectedUnidade)
  };
}
