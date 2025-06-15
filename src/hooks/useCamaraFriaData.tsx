import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/useQRCodeGenerator';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';

export interface CamaraFriaItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  peso_kg?: number;
  data_entrada?: string;
  data_validade?: string;
  temperatura?: number;
  fornecedor?: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useCamaraFriaData(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [items, setItems] = useState<CamaraFriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CamaraFriaItem | null>(null);
  const { user } = useAuth();
  const { generateQRCodeData } = useQRCodeGenerator();
  const { addHistoricoItem } = useCamaraFriaHistorico();
  const mountedRef = useRef(true);
  const loggedRef = useRef(false);

  // Create a stable reference for the selected unit
  const stableSelectedUnidade = useRef(selectedUnidade);
  stableSelectedUnidade.current = selectedUnidade;

  const fetchItems = useCallback(async () => {
    if (!user || !mountedRef.current) return;
    
    // Log apenas uma vez por sessão
    if (!loggedRef.current) {
      console.log('=== FETCH INICIAL DA CÂMARA FRIA ===');
      loggedRef.current = true;
    }
    
    try {
      let query = supabase
        .from('camara_fria_items')
        .select('*')
        .order('nome');

      // Aplicar filtro por unidade se não for "todas"
      if (stableSelectedUnidade.current && stableSelectedUnidade.current !== 'todas') {
        query = query.eq('unidade', stableSelectedUnidade.current);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (!mountedRef.current) return;
      
      // Map the database data to our interface
      const mappedItems: CamaraFriaItem[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade === 'juazeiro_norte' || item.unidade === 'fortaleza' ? 'pç' : item.unidade,
        categoria: item.categoria,
        peso_kg: item.peso_kg,
        data_entrada: item.data_entrada,
        data_validade: item.data_validade,
        temperatura: item.temperatura,
        fornecedor: item.fornecedor,
        observacoes: item.observacoes,
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza',
      }));
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os itens da câmara fria.",
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
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [user, fetchItems]);

  // Effect for unit changes
  useEffect(() => {
    if (user && stableSelectedUnidade.current !== selectedUnidade) {
      stableSelectedUnidade.current = selectedUnidade;
      fetchItems();
    }
  }, [selectedUnidade, user, fetchItems]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addItem = async (newItem: Omit<CamaraFriaItem, 'id'> & { unidade_item?: 'juazeiro_norte' | 'fortaleza' }) => {
    if (!user) return;

    try {
      const itemToInsert = {
        ...newItem,
        user_id: user.id,
        unidade: newItem.unidade_item || 'juazeiro_norte'
      };
      
      delete (itemToInsert as any).unidade_item;

      const { data, error } = await supabase
        .from('camara_fria_items')
        .insert([itemToInsert])
        .select()
        .single();

      if (error) throw error;
      
      const mappedData = {
        ...data,
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza'
      };
      
      setItems(prev => [...prev, mappedData]);
      setLastAddedItem(mappedData);
      
      // Registrar no histórico
      if (newItem.quantidade > 0) {
        await addHistoricoItem({
          item_nome: newItem.nome,
          quantidade: newItem.quantidade,
          unidade: newItem.unidade,
          categoria: newItem.categoria,
          tipo: 'entrada',
          observacoes: 'Item adicionado ao estoque',
          unidade_item: newItem.unidade_item || 'juazeiro_norte'
        });
      }
      
      // Gerar QR codes para o item apenas se quantidade > 0
      if (newItem.quantidade > 0) {
        const qrCodesData = generateQRCodeData(mappedData, 'CF', newItem.quantidade);
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }
      
      toast({
        title: "Item adicionado",
        description: newItem.quantidade > 0 
          ? `${newItem.nome} foi adicionado ao estoque! QR codes serão gerados.`
          : `${newItem.nome} foi adicionado ao estoque!`,
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Não foi possível adicionar o item.",
        variant: "destructive",
      });
    }
  };

  const updateItemQuantity = async (id: string, newQuantity: number) => {
    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) return;

      const quantityDifference = newQuantity - currentItem.quantidade;

      const { error } = await supabase
        .from('camara_fria_items')
        .update({ quantidade: newQuantity })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantidade: newQuantity } : item
      ));

      // Registrar no histórico
      if (quantityDifference !== 0) {
        await addHistoricoItem({
          item_nome: currentItem.nome,
          quantidade: Math.abs(quantityDifference),
          unidade: currentItem.unidade,
          categoria: currentItem.categoria,
          tipo: quantityDifference > 0 ? 'entrada' : 'saida',
          observacoes: quantityDifference > 0 ? 'Quantidade aumentada' : 'Quantidade reduzida',
          unidade_item: currentItem.unidade_item || 'juazeiro_norte'
        });
      }

      if (quantityDifference > 0) {
        const updatedItem = { ...currentItem, quantidade: newQuantity };
        setLastAddedItem(updatedItem);
        
        const qrCodesData = generateQRCodeData(updatedItem, 'CF', quantityDifference);
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) return;

      const { error } = await supabase
        .from('camara_fria_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      
      // Registrar no histórico
      await addHistoricoItem({
        item_nome: currentItem.nome,
        quantidade: currentItem.quantidade,
        unidade: currentItem.unidade,
        categoria: currentItem.categoria,
        tipo: 'saida',
        observacoes: 'Item removido do estoque',
        unidade_item: currentItem.unidade_item || 'juazeiro_norte'
      });

      toast({
        title: "Item removido",
        description: "Item foi removido do estoque.",
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

  const transferToRefrigerada = async (item: CamaraFriaItem) => {
    try {
      // Remover o item da câmara fria
      await deleteItem(item.id);

      // Preparar os dados para adicionar na câmara refrigerada
      const newItem = {
        nome: item.nome,
        quantidade: item.quantidade,
        unidade: item.unidade,
        categoria: item.categoria,
        unidade_item: item.unidade_item,
      };

      // Adicionar o item na câmara refrigerada
      const { data, error } = await supabase
        .from('camara_refrigerada_items')
        .insert([{ ...newItem, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Item transferido",
        description: `${item.nome} foi transferido para a câmara refrigerada.`,
      });
    } catch (error) {
      console.error('Error transferring item:', error);
      toast({
        title: "Erro ao transferir item",
        description: "Não foi possível transferir o item para a câmara refrigerada.",
        variant: "destructive",
      });
    }
  };

  return {
    items,
    loading,
    addItem,
    updateItemQuantity,
    deleteItem,
    transferToRefrigerada,
    fetchItems,
    qrCodes,
    showQRGenerator,
    setShowQRGenerator,
    lastAddedItem
  };
}
