import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface NewItem {
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo: number;
  unidade_item: 'juazeiro_norte' | 'fortaleza';
}

interface CamaraFriaAddDialogProps {
  newItem: NewItem;
  setNewItem: (item: NewItem) => void;
  onAddNewItem: () => void;
  setDialogOpen: (open: boolean) => void;
  categorias: string[];
  selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas';
}

export function CamaraFriaAddDialog({
  newItem,
  setNewItem,
  onAddNewItem,
  setDialogOpen,
  categorias,
  selectedUnidade
}: CamaraFriaAddDialogProps) {
  const isFormValid = newItem.nome.trim() !== '' && newItem.categoria !== '';

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Se campo vazio, manter como 0
    if (value === '') {
      setNewItem({...newItem, quantidade: 0});
      return;
    }
    
    // Converter para número inteiro
    const numValue = parseInt(value, 10);
    
    // Validar se é um número válido e positivo
    if (!isNaN(numValue) && numValue >= 0) {
      setNewItem({...newItem, quantidade: numValue});
    }
  };

  const handleMinimoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setNewItem({...newItem, minimo: 0});
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setNewItem({...newItem, minimo: numValue});
      }
    }
  };

  const handleAddItem = () => {
    // Validação com feedback visual
    if (!newItem.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite o nome da carne.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newItem.categoria) {
      toast({
        title: "Categoria obrigatória",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive",
      });
      return;
    }
    
    // Garantir que a quantidade seja um número válido antes de enviar
    const quantidadeValidada = Number(newItem.quantidade);
    
    const itemValidado = {
      ...newItem,
      quantidade: quantidadeValidada
    };
    
    // Atualizar o estado com o item validado
    setNewItem(itemValidado);
    
    try {
      // Chamar a função de adicionar
      onAddNewItem();
    } catch (error) {
      console.error('Erro ao chamar onAddNewItem:', error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]" aria-describedby="dialog-description">
      <DialogHeader>
        <DialogTitle>Adicionar Nova Carne</DialogTitle>
        <DialogDescription id="dialog-description">
          Preencha os dados da nova carne para adicionar ao estoque da câmara fria
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Carne *</Label>
          <Input
            id="nome"
            placeholder="Ex: Picanha, Alcatra, Frango..."
            value={newItem.nome}
            onChange={(e) => setNewItem({...newItem, nome: e.target.value})}
            className={!newItem.nome.trim() ? 'border-red-300' : ''}
            aria-describedby={!newItem.nome.trim() ? 'nome-error' : undefined}
          />
          {!newItem.nome.trim() && (
            <p id="nome-error" className="text-xs text-red-500" role="alert">
              Nome é obrigatório
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade em Estoque</Label>
          <Input
            id="quantidade"
            type="number"
            min="0"
            step="1"
            placeholder="Digite a quantidade"
            value={newItem.quantidade === 0 ? '' : newItem.quantidade.toString()}
            onChange={handleQuantidadeChange}
            aria-describedby="quantidade-help"
          />
          <p id="quantidade-help" className="text-xs text-gray-500">
            Você pode adicionar com quantidade zero para registrar o item no estoque
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unidade">Unidade de Medida</Label>
          <Select 
            value={newItem.unidade}
            onValueChange={(value) => setNewItem({...newItem, unidade: value})}
          >
            <SelectTrigger id="unidade">
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Quilogramas (kg)</SelectItem>
              <SelectItem value="unidades">Unidades</SelectItem>
              <SelectItem value="pacotes">Pacotes</SelectItem>
              <SelectItem value="peças">Peças</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria da Carne *</Label>
          <Select 
            value={newItem.categoria}
            onValueChange={(value) => setNewItem({...newItem, categoria: value})}
          >
            <SelectTrigger 
              id="categoria"
              className={!newItem.categoria ? 'border-red-300' : ''}
              aria-describedby={!newItem.categoria ? 'categoria-error' : undefined}
            >
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.slice(1).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!newItem.categoria && (
            <p id="categoria-error" className="text-xs text-red-500" role="alert">
              Categoria é obrigatória
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minimo">Estoque Mínimo</Label>
          <Input
            id="minimo"
            type="number"
            min="0"
            step="1"
            placeholder="Digite o estoque mínimo (pode ser 0)"
            value={newItem.minimo === 0 ? '' : newItem.minimo.toString()}
            onChange={handleMinimoChange}
            aria-describedby="minimo-help"
          />
          <p id="minimo-help" className="text-xs text-gray-500">
            Quando o estoque atingir esta quantidade, será exibido um alerta
          </p>
        </div>
        
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddItem} 
            className="bg-blue-500 hover:bg-blue-600"
            disabled={!isFormValid}
            aria-describedby={!isFormValid ? 'button-help' : undefined}
          >
            Adicionar
          </Button>
          {!isFormValid && (
            <span id="button-help" className="sr-only">
              Preencha os campos obrigatórios para habilitar o botão
            </span>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

