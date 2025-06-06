
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Snowflake, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const initialItems = [
  { id: 1, name: 'Coração de Frango', quantidade: 38, unidade: 'kg' },
  { id: 2, name: 'Costela Bovina', quantidade: 13, unidade: 'kg' },
  { id: 3, name: 'Picanha Suína', quantidade: 0, unidade: 'kg' },
  { id: 4, name: 'Capa de Filé', quantidade: 30, unidade: 'kg' },
  { id: 5, name: 'Coxão Mole', quantidade: 2, unidade: 'kg' },
  { id: 6, name: 'Coxa e Sobrecoxa', quantidade: 7, unidade: 'kg' },
  { id: 7, name: 'Alcatra com Maminha', quantidade: 4, unidade: 'kg' },
  { id: 8, name: 'Filé de Peito', quantidade: 22, unidade: 'kg' },
];

export function CamaraFria() {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ name: '', quantidade: 0 });
  const [dialogOpen, setDialogOpen] = useState(false);

  const updateQuantity = (id: number, delta: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, quantidade: Math.max(0, item.quantidade + delta) }
        : item
    ));
    toast({
      title: "Quantidade atualizada",
      description: "O estoque foi atualizado com sucesso!",
    });
  };

  const addNewItem = () => {
    if (newItem.name && newItem.quantidade >= 0) {
      const id = Math.max(...items.map(i => i.id)) + 1;
      setItems([...items, { 
        id, 
        name: newItem.name, 
        quantidade: newItem.quantidade, 
        unidade: 'kg' 
      }]);
      setNewItem({ name: '', quantidade: 0 });
      setDialogOpen(false);
      toast({
        title: "Item adicionado",
        description: `${newItem.name} foi adicionado ao estoque!`,
      });
    }
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Item removido",
      description: "O item foi removido do estoque!",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Câmara Fria</h2>
            <p className="text-gray-600">Carnes congeladas para churrasco</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {items.length} tipos de carne
          </Badge>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nova Carne
              </Button>
            </DialogTrigger>
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
                  placeholder="Quantidade (kg)"
                  value={newItem.quantidade}
                  onChange={(e) => setNewItem({...newItem, quantidade: Number(e.target.value)})}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addNewItem} className="bg-blue-500 hover:bg-blue-600">
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de itens */}
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className={`${item.quantidade === 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.quantidade} {item.unidade}
                    {item.quantidade === 0 && (
                      <span className="ml-2 text-red-600 font-medium">Sem estoque</span>
                    )}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantidade === 0}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  
                  <span className="w-16 text-center font-medium">
                    {item.quantidade}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
