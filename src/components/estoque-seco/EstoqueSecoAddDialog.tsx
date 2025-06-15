
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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

interface EstoqueSecoAddDialogProps {
  newItem: NewItem;
  setNewItem: (item: NewItem) => void;
  onAddNewItem: () => void;
  setDialogOpen: (open: boolean) => void;
  categorias: string[];
  selectedUnidade: 'juazeiro_norte' | 'fortaleza' | 'todas';
}

export function EstoqueSecoAddDialog({
  newItem,
  setNewItem,
  onAddNewItem,
  setDialogOpen,
  categorias,
  selectedUnidade
}: EstoqueSecoAddDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adicionar Novo Item</DialogTitle>
        <DialogDescription>
          Preencha os dados do novo item do estoque seco para adicionar ao inventário
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Item</Label>
          <Input
            id="nome"
            placeholder="Ex: Arroz, Feijão, Óleo..."
            value={newItem.nome}
            onChange={(e) => setNewItem({...newItem, nome: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade em Estoque</Label>
          <Input
            id="quantidade"
            type="number"
            placeholder="Ex: 10, 25, 50..."
            value={newItem.quantidade || ''}
            onChange={(e) => setNewItem({...newItem, quantidade: Number(e.target.value)})}
          />
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
              <SelectItem value="litros">Litros</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
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
            placeholder="Ex: 5, 10, 15..."
            value={newItem.minimo || ''}
            onChange={(e) => setNewItem({...newItem, minimo: Number(e.target.value)})}
          />
          <p className="text-xs text-gray-500">
            Quando o estoque atingir esta quantidade, será exibido um alerta
          </p>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onAddNewItem} className="bg-amber-500 hover:bg-amber-600">
            Adicionar
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
