
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/useQRCodeGenerator';
import { useDescartaveisHistorico } from '@/hooks/useDescartaveisHistorico';

export interface DescartaveisItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo?: number;
  data_entrada?: string;
  preco_unitario?: number;
  fornecedor?: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useDescartaveisData() {
  const [items, setItems] = useState<DescartaveisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<DescartaveisItem | null>(null);
  const { user } = useAuth();
  const { generateQRCodeData } = useQRCodeGenerator();
  const { addHistoricoItem } = useDescartaveisHistorico();
  const loggedRef = useRef(false);

  const fetchItems = async () => {
    if (!user) return;
    
    // Log apenas uma vez por sessão
    if (!loggedRef.current) {
      console.log('=== FETCH INICIAL DOS DESCARTÁVEIS ===');
      loggedRef.current = true;
    }
    
    try {
      const { data, error } = await supabase
        .from('descartaveis_items')
        .select('*')
        .order('nome');

      if (error) throw error;
      
      const mappedItems = (data || []).map(item => ({
        ...item,
        unidade_item: item.unidade as 'juazeiro_norte' | 'fortaleza'
      }));
      
      setItems(mappedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os itens descartáveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItem: Omit<DescartaveisItem, 'id'> & { unidade_item?: 'juazeiro_norte' | 'fortaleza' }) => {
    if (!user) return;

    try {
      const itemToInsert = {
        ...newItem,
        user_id: user.id,
        unidade: newItem.unidade_item || 'juazeiro_norte'
      };
      
      delete (itemToInsert as any).unidade_item;

      const { data, error } = await supabase
        .from('descartaveis_items')
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
        const qrCodesData = generateQRCodeData(mappedData, 'DESC', newItem.quantidade);
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
        .from('descartaveis_items')
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
        
        const qrCodesData = generateQRCodeData(updatedItem, 'DESC', quantityDifference);
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
        .from('descartaveis_items')
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
