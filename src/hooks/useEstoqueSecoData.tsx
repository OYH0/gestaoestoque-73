
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/useQRCodeGenerator';

export interface EstoqueSecoItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo?: number;
  data_entrada?: string;
  data_validade?: string;
  preco_unitario?: number;
  fornecedor?: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useEstoqueSecoData() {
  const [items, setItems] = useState<EstoqueSecoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<EstoqueSecoItem | null>(null);
  const { user } = useAuth();
  const { generateQRCodeData } = useQRCodeGenerator();
  const loggedRef = useRef(false);

  const fetchItems = async () => {
    if (!user) return;
    
    // Log apenas uma vez por sessão
    if (!loggedRef.current) {
      console.log('=== FETCH INICIAL DO ESTOQUE SECO ===');
      loggedRef.current = true;
    }
    
    try {
      const { data, error } = await supabase
        .from('estoque_seco_items')
        .select('*')
        .order('nome');

      if (error) throw error;
      
      const mappedItems = (data || []).map(item => ({
        ...item,
        quantidade: Number(item.quantidade),
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza'
      }));
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os itens do estoque seco.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItem: Omit<EstoqueSecoItem, 'id'> & { unidade_item?: 'juazeiro_norte' | 'fortaleza' }) => {
    if (!user) return;

    try {
      console.log('=== ADICIONANDO ITEM ESTOQUE SECO ===');
      console.log('Item recebido:', newItem);

      const itemToInsert = {
        nome: newItem.nome,
        quantidade: Number(newItem.quantidade),
        categoria: newItem.categoria,
        minimo: newItem.minimo,
        data_entrada: new Date().toISOString().split('T')[0], // Adicionar data de entrada automaticamente
        data_validade: newItem.data_validade,
        preco_unitario: newItem.preco_unitario,
        fornecedor: newItem.fornecedor,
        observacoes: newItem.observacoes,
        user_id: user.id,
        unidade: newItem.unidade_item || 'juazeiro_norte'
      };
      
      console.log('Item para inserir no banco:', itemToInsert);

      const { data, error } = await supabase
        .from('estoque_seco_items')
        .insert([itemToInsert])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Item inserido no banco:', data);

      const mappedData = {
        ...data,
        quantidade: Number(data.quantidade),
        unidade_item: data.unidade as 'juazeiro_norte' | 'fortaleza'
      };
      
      setItems(prev => [...prev, mappedData]);
      setLastAddedItem(mappedData);
      
      // Gerar QR codes para o item apenas se quantidade > 0
      if (Number(newItem.quantidade) > 0) {
        const qrCodesData = generateQRCodeData(mappedData, 'ES', Number(newItem.quantidade));
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }
      
      toast({
        title: "Item adicionado",
        description: Number(newItem.quantidade) > 0 
          ? `${newItem.nome} foi adicionado ao estoque! QR codes serão gerados.`
          : `${newItem.nome} foi adicionado ao estoque!`,
      });

      return mappedData;
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Não foi possível adicionar o item.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateItemQuantity = async (id: string, newQuantity: number) => {
    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) return;

      console.log('=== ATUALIZANDO QUANTIDADE ESTOQUE SECO ===');
      console.log('Quantidade atual:', currentItem.quantidade);
      console.log('Nova quantidade:', newQuantity);

      const { error } = await supabase
        .from('estoque_seco_items')
        .update({ quantidade: Number(newQuantity) })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantidade: Number(newQuantity) } : item
      ));

      const quantityDifference = Number(newQuantity) - currentItem.quantidade;

      if (quantityDifference > 0) {
        const updatedItem = { ...currentItem, quantidade: Number(newQuantity) };
        setLastAddedItem(updatedItem);
        
        const qrCodesData = generateQRCodeData(updatedItem, 'ES', quantityDifference);
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }

      return {
        item: currentItem,
        quantityDifference,
        newQuantity: Number(newQuantity)
      };
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) return;

      const { error } = await supabase
        .from('estoque_seco_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Item removido",
        description: "Item foi removido do estoque.",
      });

      return currentItem;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Erro ao remover item",
        description: "Não foi possível remover o item.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  return {
    items,
    loading,
    addItem,
    updateItemQuantity,
    deleteItem,
    fetchItems,
    qrCodes,
    showQRGenerator,
    setShowQRGenerator,
    lastAddedItem
  };
}
