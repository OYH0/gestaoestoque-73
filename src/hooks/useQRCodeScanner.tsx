
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
      console.log('Processando QR Code:', qrCodeData);
      
      // Parse QR code ID (formato: CF-XXXXX-XXXXXX-001)
      const parts = qrCodeData.split('-');
      if (parts.length < 4) {
        return { success: false, error: 'QR Code inválido - formato incorreto' };
      }

      const tipo = parts[0] as 'CF' | 'ES' | 'DESC';
      const itemIdPart = parts[1];
      
      let tableDisplayName: string;
      let tableName: string;
      
      switch (tipo) {
        case 'CF':
          tableDisplayName = 'Câmara Fria';
          tableName = 'camara_fria_items';
          break;
        case 'ES':
          tableDisplayName = 'Estoque Seco';
          tableName = 'estoque_seco_items';
          break;
        case 'DESC':
          tableDisplayName = 'Descartáveis';
          tableName = 'descartaveis_items';
          break;
        default:
          return { success: false, error: 'Tipo de estoque não reconhecido' };
      }

      console.log(`Buscando item do tipo ${tipo} com ID contendo: ${itemIdPart}`);

      // Buscar item no banco de dados
      const { data: items, error: searchError } = await supabase
        .from(tableName)
        .select('*')
        .gt('quantidade', 0);

      if (searchError) {
        console.error('Erro ao buscar item:', searchError);
        return { success: false, error: 'Erro ao buscar item no banco de dados' };
      }

      // Filtrar localmente
      const filteredItems = items?.filter(item => {
        const itemIdStr = String(item.id);
        const nomeStr = String(item.nome).toLowerCase();
        const searchStr = itemIdPart.toLowerCase();
        
        return itemIdStr.includes(itemIdPart) || nomeStr.includes(searchStr);
      }) || [];

      console.log('Itens encontrados:', filteredItems.length);

      if (filteredItems.length === 0) {
        return { success: false, error: 'Item não encontrado ou sem estoque' };
      }

      // Se encontrou múltiplos itens, pegar o primeiro
      const item = filteredItems[0];
      console.log('Item selecionado:', item.nome, 'Quantidade:', item.quantidade);

      // Verificar se há estoque disponível
      if (item.quantidade <= 0) {
        return { success: false, error: 'Item sem estoque disponível' };
      }

      // Reduzir quantidade
      const newQuantity = item.quantidade - 1;
      
      console.log(`Atualizando quantidade de ${item.quantidade} para ${newQuantity}`);

      // Atualizar quantidade
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ quantidade: newQuantity })
        .eq('id', item.id);

      if (updateError) {
        console.error('Erro ao atualizar quantidade:', updateError);
        return { success: false, error: 'Erro ao atualizar estoque' };
      }

      // Registrar no histórico (apenas para câmara fria)
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

      console.log('QR Code processado com sucesso!');

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
