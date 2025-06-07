
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewItem {
  name: string;
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
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adicionar Nova Carne</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <Input
          placeholder="Nome da carne"
          value={newItem.name}
          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
        />
        <Input
          type="number"
          placeholder="Quantidade"
          value={newItem.quantidade}
          onChange={(e) => setNewItem({...newItem, quantidade: Number(e.target.value)})}
        />
        <select 
          className="px-3 py-2 border border-gray-300 rounded-md w-full"
          value={newItem.unidade}
          onChange={(e) => setNewItem({...newItem, unidade: e.target.value})}
        >
          <option value="kg">kg</option>
          <option value="unidades">unidades</option>
          <option value="pacotes">pacotes</option>
        </select>
        <select 
          className="px-3 py-2 border border-gray-300 rounded-md w-full"
          value={newItem.categoria}
          onChange={(e) => setNewItem({...newItem, categoria: e.target.value})}
        >
          {categorias.slice(1).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="Quantidade mínima"
          value={newItem.minimo}
          onChange={(e) => setNewItem({...newItem, minimo: Number(e.target.value)})}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={onAddNewItem} className="bg-blue-500 hover:bg-blue-600">
            Adicionar
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
