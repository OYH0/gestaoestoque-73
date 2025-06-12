import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/useQRCodeGenerator';

export interface CamaraFriaItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo?: number;
  data_entrada?: string;
  data_validade?: string;
  temperatura_ideal?: number;
  preco_unitario?: number;
  fornecedor?: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useCamaraFriaData() {
  const [items, setItems] = useState<CamaraFriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CamaraFriaItem | null>(null);
  const { user } = useAuth();
  const { generateQRCodeData } = useQRCodeGenerator();

  const fetchItems = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('camara_fria_items')
        .select('*')
        .order('nome');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os itens da câmara fria.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (newItem: Omit<CamaraFriaItem, 'id'>) => {
    if (!user) return;

    console.log('=== INÍCIO addItem NO HOOK ===');
    console.log('Item recebido no hook:', newItem);
    console.log('Quantidade recebida:', newItem.quantidade);
    console.log('Tipo da quantidade recebida:', typeof newItem.quantidade);
    
    // GARANTIR que quantidade seja um número inteiro válido
    let quantidadeSegura: number;
    
    if (typeof newItem.quantidade === 'string') {
      quantidadeSegura = parseInt(newItem.quantidade, 10);
    } else if (typeof newItem.quantidade === 'number') {
      quantidadeSegura = Math.floor(newItem.quantidade);
    } else {
      quantidadeSegura = 0;
    }
    
    // Validar se é um número válido
    if (isNaN(quantidadeSegura) || quantidadeSegura < 0) {
      quantidadeSegura = 0;
    }
    
    console.log('Quantidade após conversão e validação:', quantidadeSegura);
    console.log('Tipo após conversão:', typeof quantidadeSegura);
    
    const itemParaSalvar = {
      ...newItem,
      quantidade: quantidadeSegura
    };
    
    console.log('Item final para salvar no banco:', itemParaSalvar);
    console.log('Quantidade que será salva:', itemParaSalvar.quantidade);

    try {
      const { data, error } = await supabase
        .from('camara_fria_items')
        .insert([{ ...itemParaSalvar, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ ITEM SALVO NO BANCO COM SUCESSO!');
      console.log('Dados retornados do banco:', data);
      console.log('Quantidade salva no banco:', data.quantidade);
      console.log('Tipo da quantidade do banco:', typeof data.quantidade);
      
      setItems(prev => [...prev, data]);
      setLastAddedItem(data);
      
      // Gerar QR codes APENAS se quantidade > 0
      if (data.quantidade > 0) {
        console.log('=== INICIANDO GERAÇÃO DE QR CODES ===');
        console.log('Quantidade para gerar QR codes:', data.quantidade);
        console.log('DEVE GERAR EXATAMENTE:', data.quantidade, 'QR codes');
        
        const qrCodesData = generateQRCodeData(data, 'CF', data.quantidade);
        
        console.log('QR codes gerados:', qrCodesData.length);
        console.log('VERIFICAÇÃO: Quantidade solicitada vs gerada:', data.quantidade, 'vs', qrCodesData.length);
        
        if (qrCodesData.length !== data.quantidade) {
          console.error('❌ ERRO: Quantidade de QR codes não confere!');
          console.error('Esperado:', data.quantidade, 'Gerado:', qrCodesData.length);
        } else {
          console.log('✅ SUCESSO: Quantidade de QR codes está correta!');
        }
        
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
        
        toast({
          title: "Item adicionado",
          description: `${data.nome} foi adicionado ao estoque! ${qrCodesData.length} QR codes serão gerados.`,
        });
      } else {
        console.log('Quantidade zero - não gerando QR codes');
        toast({
          title: "Item adicionado",
          description: `${data.nome} foi adicionado ao estoque com quantidade zero!`,
        });
      }
      
      console.log('=== FIM addItem NO HOOK ===');
    } catch (error) {
      console.error('❌ ERRO ao adicionar item:', error);
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

      const quantityIncrease = newQuantity - currentItem.quantidade;

      console.log('=== updateItemQuantity ===');
      console.log('Quantidade atual:', currentItem.quantidade);
      console.log('Nova quantidade:', newQuantity);
      console.log('Aumento de quantidade:', quantityIncrease);

      const { error } = await supabase
        .from('camara_fria_items')
        .update({ quantidade: newQuantity })
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantidade: newQuantity } : item
      ));

      // Gerar QR codes apenas se houve aumento de quantidade
      if (quantityIncrease > 0) {
        const updatedItem = { ...currentItem, quantidade: newQuantity };
        setLastAddedItem(updatedItem);
        
        console.log('Gerando QR codes para aumento de quantidade:', quantityIncrease);
        const qrCodesData = generateQRCodeData(updatedItem, 'CF', quantityIncrease);
        console.log('QR codes gerados para aumento:', qrCodesData.length);
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
      const { error } = await supabase
        .from('camara_fria_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
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
