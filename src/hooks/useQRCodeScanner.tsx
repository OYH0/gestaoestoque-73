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

// Cache global para QR codes já escaneados
const scannedQRCodes = new Set<string>();

export function useQRCodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, session } = useAuth();

  const processQRCode = async (qrCodeData: string, onSuccess?: () => void): Promise<QRScanResult> => {
    if (!user || !session) {
      console.log('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Checagem se já foi escaneado anteriormente (inclui toast de erro)
    if (scannedQRCodes.has(qrCodeData)) {
      console.log('QR Code já foi escaneado anteriormente:', qrCodeData);
      toast({
        title: "QR Code já utilizado",
        description: "Este QR Code já foi escaneado nesta sessão.",
        variant: "destructive",
      });
      return { success: false, error: 'Este QR Code já foi escaneado anteriormente' };
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
      let tableName: 'camara_fria_items' | 'estoque_seco_items' | 'descartaveis_items';
      let historyTableName: 'camara_fria_historico' | 'estoque_seco_historico' | 'descartaveis_historico';
      let items: any[] = [];
      
      // Buscar itens baseado no tipo
      try {
        if (tipo === 'CF') {
          tableDisplayName = 'Câmara Fria';
          tableName = 'camara_fria_items';
          historyTableName = 'camara_fria_historico';
          
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .gt('quantidade', 0);
          
          if (error) {
            if (error.message?.includes('rate limit')) {
              return { success: false, error: 'Limite de requisições excedido. Por favor, aguarde alguns segundos e tente novamente.' };
            }
            throw error;
          }
          items = data || [];
        } else if (tipo === 'ES') {
          tableDisplayName = 'Estoque Seco';
          tableName = 'estoque_seco_items';
          historyTableName = 'estoque_seco_historico';
          
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .gt('quantidade', 0);
          
          if (error) {
            if (error.message?.includes('rate limit')) {
              return { success: false, error: 'Limite de requisições excedido. Por favor, aguarde alguns segundos e tente novamente.' };
            }
            throw error;
          }
          items = data || [];
        } else if (tipo === 'DESC') {
          tableDisplayName = 'Descartáveis';
          tableName = 'descartaveis_items';
          historyTableName = 'descartaveis_historico';
          
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .gt('quantidade', 0);
          
          if (error) {
            if (error.message?.includes('rate limit')) {
              return { success: false, error: 'Limite de requisições excedido. Por favor, aguarde alguns segundos e tente novamente.' };
            }
            throw error;
          }
          items = data || [];
        } else {
          return { success: false, error: 'Tipo de estoque não reconhecido' };
        }
      } catch (apiError: any) {
        console.error('Erro ao buscar dados:', apiError);
        if (apiError.status === 429 || apiError.message?.includes('429')) {
          toast({
            title: "Limite de requisições excedido",
            description: "Aguarde alguns segundos antes de tentar novamente.",
            variant: "destructive",
          });
          return { success: false, error: 'Limite de requisições excedido. Por favor, aguarde alguns segundos e tente novamente.' };
        }
        return { success: false, error: 'Erro ao buscar dados: ' + apiError.message };
      }

      console.log(`Buscando item do tipo ${tipo} com ID contendo: ${itemIdPart}`);

      // Filtrar localmente
      const filteredItems = items.filter(item => {
        const itemIdStr = String(item.id);
        const nomeStr = String(item.nome).toLowerCase();
        const searchStr = itemIdPart.toLowerCase();
        
        return itemIdStr.includes(itemIdPart) || nomeStr.includes(searchStr);
      });

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

      // Atualizar quantidade baseado no tipo
      try {
        const { error } = await supabase
          .from(tableName)
          .update({ quantidade: newQuantity })
          .eq('id', item.id);

        if (error) {
          if (error.message?.includes('rate limit')) {
            return { success: false, error: 'Limite de requisições excedido. Por favor, aguarde alguns segundos e tente novamente.' };
          }
          throw error;
        }
      } catch (updateError: any) {
        console.error('Erro ao atualizar quantidade:', updateError);
        if (updateError.status === 429 || updateError.message?.includes('429')) {
          return { success: false, error: 'Limite de requisições excedido. Por favor, aguarde alguns segundos e tente novamente.' };
        }
        return { success: false, error: 'Erro ao atualizar quantidade: ' + updateError.message };
      }

      // Registrar no histórico para todos os tipos
      try {
        const { error: historyError } = await supabase
          .from(historyTableName)
          .insert([{
            item_nome: item.nome,
            quantidade: 1,
            unidade: item.unidade,
            categoria: item.categoria,
            tipo: 'saida',
            observacoes: `Retirada via QR Code: ${qrCodeData}`,
            user_id: user.id
          }]);

        if (historyError) {
          console.error('Erro ao registrar histórico:', historyError);
        }
      } catch (historyError: any) {
        // Erro no histórico não é crítico, apenas logar
        console.error('Erro ao registrar histórico:', historyError);
      }

      // Marcar QR code como escaneado APENAS após sucesso completo
      scannedQRCodes.add(qrCodeData);
      console.log('QR Code processado com sucesso e marcado como usado!');

      toast({
        title: "Item retirado com sucesso!",
        description: `1 ${item.unidade} de ${item.nome} foi removido do ${tableDisplayName}`,
      });

      // Chamar callback para atualizar os dados
      if (onSuccess) {
        onSuccess();
      }

      return {
        success: true,
        itemName: item.nome,
        quantityRemoved: 1
      };

    } catch (error: any) {
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
