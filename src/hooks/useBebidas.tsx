import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQRCodeGenerator } from '@/hooks/useQRCodeGenerator';

export interface BebidasItem {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  data_entrada?: string;
  data_validade?: string;
  temperatura?: number;
  temperatura_ideal?: number;
  fornecedor?: string;
  observacoes?: string;
  unidade_item?: 'juazeiro_norte' | 'fortaleza';
  minimo?: number;
  preco_unitario?: number;
}

export function useBebidas(selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas') {
  const [items, setItems] = useState<BebidasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<any[]>([]);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<BebidasItem | null>(null);
  const { user } = useAuth();
  const { generateQRCodeData } = useQRCodeGenerator();
  const mountedRef = useRef(true);
  const loggedRef = useRef(false);
  const pendingOperationRef = useRef(false);

  const stableSelectedUnidade = useRef(selectedUnidade);
  stableSelectedUnidade.current = selectedUnidade;

  const fetchItems = useCallback(async () => {
    if (!user || !mountedRef.current || pendingOperationRef.current) return;
    
    if (!loggedRef.current) {
      console.log('=== FETCH INICIAL BEBIDAS ===');
      loggedRef.current = true;
    }
    
    try {
      setLoading(true);
      
      // Usar dados mockados enquanto conectamos ao banco real
      const mockItems: BebidasItem[] = [
        {
          id: '1',
          nome: 'Coca-Cola 350ml',
          quantidade: 50,
          unidade: 'un',
          categoria: 'Refrigerantes',
          data_entrada: '2024-01-15',
          unidade_item: 'juazeiro_norte',
          minimo: 20,
          preco_unitario: 3.50
        },
        {
          id: '2',
          nome: 'Água Mineral 500ml',
          quantidade: 15,
          unidade: 'un',
          categoria: 'Águas',
          data_entrada: '2024-01-14',
          unidade_item: 'fortaleza',
          minimo: 30,
          preco_unitario: 2.00
        }
      ];
      
      // Filtrar por unidade se necessário
      let filteredItems = mockItems;
      if (selectedUnidade && selectedUnidade !== 'todas') {
        filteredItems = mockItems.filter(item => item.unidade_item === selectedUnidade);
      }
      
      if (!mountedRef.current) return;
      setItems(filteredItems);
      
    } catch (error) {
      console.error('Error fetching bebidas:', error);
      if (mountedRef.current) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as bebidas.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user, selectedUnidade]);

  useEffect(() => {
    if (user) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [user, fetchItems]);

  useEffect(() => {
    if (user && stableSelectedUnidade.current !== selectedUnidade) {
      stableSelectedUnidade.current = selectedUnidade;
      fetchItems();
    }
  }, [selectedUnidade, user, fetchItems]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addItem = async (newItem: Omit<BebidasItem, 'id'> & { unidade_item?: 'juazeiro_norte' | 'fortaleza' }) => {
    if (!user || pendingOperationRef.current) return;

    pendingOperationRef.current = true;

    try {
      console.log('=== ADICIONANDO BEBIDA ===');
      console.log('Item recebido:', newItem);

      if (!newItem.nome || newItem.nome.trim() === '') {
        throw new Error('Nome do item é obrigatório');
      }

      if (newItem.quantidade < 0) {
        throw new Error('Quantidade não pode ser negativa');
      }

      // Simular criação do item até conectar com banco real
      const mockId = `bebida_${Date.now()}`;
      const mappedData: BebidasItem = {
        id: mockId,
        nome: newItem.nome.trim(),
        quantidade: Number(newItem.quantidade),
        unidade: newItem.unidade || 'un',
        categoria: newItem.categoria,
        data_entrada: new Date().toISOString().split('T')[0],
        data_validade: newItem.data_validade,
        temperatura: newItem.temperatura,
        temperatura_ideal: newItem.temperatura_ideal,
        fornecedor: newItem.fornecedor?.trim() || undefined,
        observacoes: newItem.observacoes?.trim() || undefined,
        unidade_item: newItem.unidade_item || 'juazeiro_norte',
        minimo: newItem.minimo || 10,
        preco_unitario: newItem.preco_unitario || undefined
      };
      
      setItems(prev => [...prev, mappedData]);
      setLastAddedItem(mappedData);
      
      if (Number(newItem.quantidade) > 0) {
        const qrCodesData = generateQRCodeData(mappedData, 'BD', Number(newItem.quantidade));
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }
      
      toast({
        title: "✅ Bebida adicionada com sucesso!",
        description: `${newItem.nome} foi adicionada ao estoque.`,
      });

      return mappedData;
    } catch (error) {
      console.error('Error adding bebida:', error);
      toast({
        title: "Erro ao adicionar bebida",
        description: error instanceof Error ? error.message : "Não foi possível adicionar a bebida.",
        variant: "destructive",
      });
      throw error;
    } finally {
      pendingOperationRef.current = false;
    }
  };

  const updateItemQuantity = async (id: string, newQuantity: number) => {
    if (pendingOperationRef.current) return;

    pendingOperationRef.current = true;

    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item não encontrado');
      }

      if (newQuantity < 0) {
        throw new Error('Quantidade não pode ser negativa');
      }

      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantidade: Number(newQuantity) } : item
      ));

      const quantityDifference = Number(newQuantity) - currentItem.quantidade;

      if (quantityDifference > 0) {
        const updatedItem = { ...currentItem, quantidade: Number(newQuantity) };
        setLastAddedItem(updatedItem);
        
        const qrCodesData = generateQRCodeData(updatedItem, 'BD', quantityDifference);
        setQrCodes(qrCodesData);
        
        setTimeout(() => {
          setShowQRGenerator(true);
        }, 100);
      }

      toast({
        title: "✅ Quantidade atualizada!",
        description: `Quantidade de ${currentItem.nome} atualizada para ${newQuantity}`,
      });

      return {
        item: currentItem,
        quantityDifference,
        newQuantity: Number(newQuantity)
      };
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erro ao atualizar quantidade",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a quantidade.",
        variant: "destructive",
      });
      throw error;
    } finally {
      pendingOperationRef.current = false;
    }
  };

  const deleteItem = async (id: string) => {
    if (pendingOperationRef.current) return;

    pendingOperationRef.current = true;

    try {
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) {
        throw new Error('Item não encontrado');
      }

      setItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: "✅ Bebida removida!",
        description: `${currentItem.nome} foi removida do estoque.`,
      });

      return currentItem;
    } catch (error) {
      console.error('Error deleting bebida:', error);
      toast({
        title: "Erro ao remover bebida",
        description: error instanceof Error ? error.message : "Não foi possível remover a bebida.",
        variant: "destructive",
      });
      throw error;
    } finally {
      pendingOperationRef.current = false;
    }
  };

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