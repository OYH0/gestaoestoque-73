import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface HistoricoItem {
  id: string;
  item_nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  tipo: 'entrada' | 'saida';
  data_operacao: string;
  observacoes?: string;
  user_id: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
}

export function useBebidasHistorico(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);

  const addHistoricoItem = useCallback(async (item: Omit<HistoricoItem, 'id' | 'data_operacao' | 'user_id'>) => {
    try {
      // Simular adição ao histórico
      const mockHistoricoItem: HistoricoItem = {
        id: Date.now().toString(),
        ...item,
        data_operacao: new Date().toISOString(),
        user_id: 'mock-user-id'
      };

      setHistorico(prev => [mockHistoricoItem, ...prev]);

      console.log('Histórico simulado atualizado:', mockHistoricoItem);

      return mockHistoricoItem;
    } catch (error) {
      console.error('Error adding historico item:', error);
      toast({
        title: "Erro ao adicionar ao histórico",
        description: "Não foi possível adicionar o item ao histórico.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const fetchHistorico = useCallback(async () => {
    setLoading(true);
    try {
      // Simular fetch do histórico
      const mockHistorico: HistoricoItem[] = [
        {
          id: '1',
          item_nome: 'Coca-Cola 350ml',
          quantidade: 10,
          unidade: 'un',
          categoria: 'Refrigerantes',
          tipo: 'entrada',
          data_operacao: new Date().toISOString(),
          observacoes: 'Entrada inicial simulada',
          user_id: 'mock-user-id',
          unidade_item: 'juazeiro_norte'
        }
      ];
      setHistorico(mockHistorico);
    } catch (error) {
      console.error('Error fetching historico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "As tabelas de histórico ainda não foram criadas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    historico,
    loading,
    addHistoricoItem,
    fetchHistorico
  };
}