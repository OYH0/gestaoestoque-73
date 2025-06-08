
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface QRScanResult {
  success: boolean;
  itemName?: string;
  quantityRemoved?: number;
  error?: string;
}

export function useQRCodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const processQRCode = async (qrCodeData: string): Promise<QRScanResult> => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    setIsProcessing(true);

    try {
      // Parse QR code ID (formato: CF-XXXXX-XXXXXX-001)
      const parts = qrCodeData.split('-');
      if (parts.length < 4) {
        return { success: false, error: 'QR Code inválido' };
      }

      const tipo = parts[0] as 'CF' | 'ES' | 'DESC';
      const itemIdPart = parts[1];
      
      let tableDisplayName: string;
      
      switch (tipo) {
        case 'CF':
          tableDisplayName = 'Câmara Fria';
          break;
        case 'ES':
          tableDisplayName = 'Estoque Seco';
          break;
        case 'DESC':
          tableDisplayName = 'Descartáveis';
          break;
        default:
          return { success: false, error: 'Tipo de estoque não reconhecido' };
      }

      let items: any[] = [];
      let searchError: any = null;

      // Buscar item no banco de dados baseado no tipo
      if (tipo === 'CF') {
        const { data, error } = await supabase
          .from('camara_fria_items')
          .select('*')
          .ilike('id', `%${itemIdPart}%`)
          .gt('quantidade', 0);
        items = data || [];
        searchError = error;
      } else if (tipo === 'ES') {
        const { data, error } = await supabase
          .from('estoque_seco_items')
          .select('*')
          .ilike('id', `%${itemIdPart}%`)
          .gt('quantidade', 0);
        items = data || [];
        searchError = error;
      } else if (tipo === 'DESC') {
        const { data, error } = await supabase
          .from('descartaveis_items')
          .select('*')
          .ilike('id', `%${itemIdPart}%`)
          .gt('quantidade', 0);
        items = data || [];
        searchError = error;
      }

      if (searchError) {
        console.error('Erro ao buscar item:', searchError);
        return { success: false, error: 'Erro ao buscar item no banco de dados' };
      }

      if (!items || items.length === 0) {
        return { success: false, error: 'Item não encontrado ou sem estoque' };
      }

      // Se encontrou múltiplos itens, pegar o primeiro (mais provável)
      const item = items[0];

      // Verificar se há estoque disponível
      if (item.quantidade <= 0) {
        return { success: false, error: 'Item sem estoque disponível' };
      }

      // Reduzir quantidade
      const newQuantity = item.quantidade - 1;
      
      let updateError: any = null;

      // Atualizar quantidade baseado no tipo
      if (tipo === 'CF') {
        const { error } = await supabase
          .from('camara_fria_items')
          .update({ quantidade: newQuantity })
          .eq('id', item.id);
        updateError = error;
      } else if (tipo === 'ES') {
        const { error } = await supabase
          .from('estoque_seco_items')
          .update({ quantidade: newQuantity })
          .eq('id', item.id);
        updateError = error;
      } else if (tipo === 'DESC') {
        const { error } = await supabase
          .from('descartaveis_items')
          .update({ quantidade: newQuantity })
          .eq('id', item.id);
        updateError = error;
      }

      if (updateError) {
        console.error('Erro ao atualizar quantidade:', updateError);
        return { success: false, error: 'Erro ao atualizar estoque' };
      }

      // Registrar no histórico (se for câmara refrigerada)
      if (tipo === 'CF') {
        const { error: historyError } = await supabase
          .from('camara_refrigerada_historico')
          .insert([{
            item_nome: item.nome,
            quantidade: 1,
            unidade: item.unidade,
            categoria: item.categoria,
            tipo: 'retirada',
            observacoes: `Retirada via QR Code: ${qrCodeData}`,
            user_id: user.id
          }]);

        if (historyError) {
          console.error('Erro ao registrar histórico:', historyError);
        }
      }

      toast({
        title: "Item retirado com sucesso!",
        description: `1 ${item.unidade} de ${item.nome} foi removido do ${tableDisplayName}`,
      });

      return {
        success: true,
        itemName: item.nome,
        quantityRemoved: 1
      };

    } catch (error) {
      console.error('Erro ao processar QR code:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isScanning,
    setIsScanning,
    isProcessing,
    processQRCode,
  };
}
