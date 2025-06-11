
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewItem {
  nome: string;
  quantidade: number;
  unidade: string;
  categoria: string;
  minimo: number;
}

interface CamaraFriaAddDialogProps {
  newItem: NewItem;
  setNewItem: (item: NewItem) => void;
  onAddNewItem: () => void;
  setDialogOpen: (open: boolean) => void;
  categorias: string[];
}

export function CamaraFriaAddDialog({
  newItem,
  setNewItem,
  onAddNewItem,
  setDialogOpen,
  categorias
}: CamaraFriaAddDialogProps) {
  const isFormValid = newItem.nome.trim() !== '' && newItem.categoria !== '';

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('=== MUDANÇA DE QUANTIDADE NO FORMULÁRIO ===');
    console.log('Valor digitado:', value);
    
    // Se campo vazio, manter como 0
    if (value === '') {
      console.log('Campo vazio, definindo quantidade como 0');
      setNewItem({...newItem, quantidade: 0});
      return;
    }
    
    // Converter para número inteiro
    const numValue = parseInt(value, 10);
    console.log('Valor convertido para número:', numValue);
    console.log('É um número válido?', !isNaN(numValue));
    
    // Validar se é um número válido e positivo
    if (!isNaN(numValue) && numValue >= 0) {
      console.log('QUANTIDADE FINAL DEFINIDA:', numValue);
      setNewItem({...newItem, quantidade: numValue});
    } else {
      console.warn('Valor inválido ignorado:', value);
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
    console.log('=== ADICIONANDO ITEM DO FORMULÁRIO ===');
    console.log('Item completo antes de adicionar:', newItem);
    console.log('Quantidade final:', newItem.quantidade);
    console.log('Tipo da quantidade final:', typeof newItem.quantidade);
    
    // Garantir que a quantidade seja um número válido antes de enviar
    const quantidadeValidada = Number(newItem.quantidade);
    console.log('Quantidade após validação final:', quantidadeValidada);
    
    const itemValidado = {
      ...newItem,
      quantidade: quantidadeValidada
    };
    
    console.log('Item final validado:', itemValidado);
    
    // Atualizar o estado com o item validado
    setNewItem(itemValidado);
    
    // Chamar a função de adicionar
    onAddNewItem();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adicionar Nova Carne</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome da Carne</Label>
          <Input
            id="nome"
            placeholder="Ex: Picanha, Alcatra, Frango..."
            value={newItem.nome}
            onChange={(e) => setNewItem({...newItem, nome: e.target.value})}
          />
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
          />
          <p className="text-xs text-gray-500">
            Você pode adicionar com quantidade zero para registrar o item no estoque
          </p>
          <p className="text-xs text-blue-600">
            Quantidade atual: {newItem.quantidade} (Tipo: {typeof newItem.quantidade})
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unidade">Unidade de Medida</Label>
          <Select 
            value={newItem.unidade}
            onValueChange={(value) => setNewItem({...newItem, unidade: value})}
          >
            <SelectTrigger>
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
          <Label htmlFor="categoria">Categoria da Carne</Label>
          <Select 
            value={newItem.categoria}
            onValueChange={(value) => setNewItem({...newItem, categoria: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.slice(1).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          />
          <p className="text-xs text-gray-500">
            Quando o estoque atingir esta quantidade, será exibido um alerta
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddItem} 
            className="bg-blue-500 hover:bg-blue-600"
            disabled={!isFormValid}
          >
            Adicionar
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
