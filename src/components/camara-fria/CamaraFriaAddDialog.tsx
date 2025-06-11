
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
    if (value === '') {
      setNewItem({...newItem, quantidade: 0});
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setNewItem({...newItem, quantidade: numValue});
      }
    }
  };

  const handleMinimoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setNewItem({...newItem, minimo: 0});
    } else {
      const numValue = Number(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setNewItem({...newItem, minimo: numValue});
      }
    }
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
            placeholder="Digite a quantidade (pode ser 0)"
            value={newItem.quantidade === 0 ? '' : newItem.quantidade.toString()}
            onChange={handleQuantidadeChange}
          />
          <p className="text-xs text-gray-500">
            Você pode adicionar com quantidade zero para registrar o item no estoque
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
            onClick={onAddNewItem} 
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
