import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Snowflake, Plus, Minus, Trash2, Check, X, History } from 'lucide-react';
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

interface HistoricoItem {
  id: number;
  itemName: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  unidade: string;
  data: string;
  hora: string;
}

export function CamaraFria() {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ name: '', quantidade: 0, unidade: 'kg' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<{ [key: number]: number }>({});
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const startEditingQuantity = (id: number, currentQuantity: number) => {
    setEditingQuantities({ ...editingQuantities, [id]: currentQuantity });
  };

  const updateEditingQuantity = (id: number, delta: number) => {
    const currentEditValue = editingQuantities[id] || 0;
    const newValue = Math.max(0, currentEditValue + delta);
    setEditingQuantities({ ...editingQuantities, [id]: newValue });
  };

  const confirmQuantityChange = (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQuantity = editingQuantities[id];
    const oldQuantity = item.quantidade;
    const difference = newQuantity - oldQuantity;

    // Atualizar o item
    setItems(items.map(i => 
      i.id === id ? { ...i, quantidade: newQuantity } : i
    ));

    // Adicionar ao histórico
    const now = new Date();
    const novoHistorico: HistoricoItem = {
      id: Date.now(),
      itemName: item.name,
      tipo: difference > 0 ? 'entrada' : 'saida',
      quantidade: Math.abs(difference),
      unidade: item.unidade,
      data: now.toLocaleDateString('pt-BR'),
      hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setHistorico([novoHistorico, ...historico]);

    // Limpar edição
    const newEditingQuantities = { ...editingQuantities };
    delete newEditingQuantities[id];
    setEditingQuantities(newEditingQuantities);

    toast({
      title: difference > 0 ? "Carne adicionada" : "Carne retirada",
      description: `${Math.abs(difference)} ${item.unidade} de ${item.name}`,
    });
  };

  const cancelQuantityEdit = (id: number) => {
    const newEditingQuantities = { ...editingQuantities };
    delete newEditingQuantities[id];
    setEditingQuantities(newEditingQuantities);
  };

  const addNewItem = () => {
    if (newItem.name && newItem.quantidade >= 0) {
      const id = Math.max(...items.map(i => i.id)) + 1;
      setItems([...items, { 
        id, 
        name: newItem.name, 
        quantidade: newItem.quantidade, 
        unidade: newItem.unidade 
      }]);
      setNewItem({ name: '', quantidade: 0, unidade: 'kg' });
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

  // Ordenar itens alfabeticamente
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

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

          <Dialog open={historicoOpen} onOpenChange={setHistoricoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-300">
                <History className="w-4 h-4 mr-2" />
                Histórico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Histórico de Movimentações</DialogTitle>
                <DialogDescription>
                  Registro de entradas e saídas de carnes
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {historico.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhuma movimentação registrada</p>
                ) : (
                  historico.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-gray-600">
                            {item.tipo === 'entrada' ? 'Entrada' : 'Saída'} de {item.quantidade} {item.unidade}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{item.data}</p>
                        <p className="text-sm text-gray-600">{item.hora}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          
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
                <DialogDescription>
                  Preencha os dados da nova carne para adicionar ao estoque
                </DialogDescription>
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
                <Select 
                  value={newItem.unidade} 
                  onValueChange={(value) => setNewItem({...newItem, unidade: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                    <SelectItem value="pacotes">Pacotes</SelectItem>
                    <SelectItem value="peças">Peças</SelectItem>
                  </SelectContent>
                </Select>
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
        {sortedItems.map((item) => {
          const isEditing = editingQuantities.hasOwnProperty(item.id);
          const editValue = editingQuantities[item.id] || item.quantidade;

          return (
            <Card key={item.id} className={`${item.quantidade === 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {isEditing ? editValue : item.quantidade} {item.unidade}
                      {item.quantidade === 0 && !isEditing && (
                        <span className="ml-2 text-red-600 font-medium">Sem estoque</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                          onClick={() => updateEditingQuantity(item.id, -1)}
                          disabled={editValue === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-16 text-center font-medium border rounded px-2 py-1">
                          {editValue}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                          onClick={() => updateEditingQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                          onClick={() => confirmQuantityChange(item.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          onClick={() => cancelQuantityEdit(item.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditingQuantity(item.id, item.quantidade)}
                          className="bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
                        >
                          Editar Quantidade
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
