import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Package, Plus, Minus, ShoppingCart, Check, X, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const initialItems = [
  { id: 1, name: 'Arroz Branco', quantidade: 25, unidade: 'kg', categoria: 'Grãos', minimo: 10 },
  { id: 2, name: 'Feijão Preto', quantidade: 15, unidade: 'kg', categoria: 'Grãos', minimo: 8 },
  { id: 3, name: 'Feijão Carioca', quantidade: 12, unidade: 'kg', categoria: 'Grãos', minimo: 8 },
  { id: 4, name: 'Farinha de Mandioca', quantidade: 8, unidade: 'kg', categoria: 'Farináceos', minimo: 5 },
  { id: 5, name: 'Farinha de Trigo', quantidade: 5, unidade: 'kg', categoria: 'Farináceos', minimo: 3 },
  { id: 6, name: 'Macarrão Espaguete', quantidade: 10, unidade: 'pacotes', categoria: 'Massas', minimo: 5 },
  { id: 7, name: 'Macarrão Penne', quantidade: 8, unidade: 'pacotes', categoria: 'Massas', minimo: 5 },
  { id: 8, name: 'Sal Grosso', quantidade: 20, unidade: 'kg', categoria: 'Temperos', minimo: 10 },
  { id: 9, name: 'Açúcar Cristal', quantidade: 18, unidade: 'kg', categoria: 'Outros', minimo: 8 },
  { id: 10, name: 'Óleo de Soja', quantidade: 6, unidade: 'litros', categoria: 'Outros', minimo: 4 },
];

const categorias = ['Todos', 'Grãos', 'Farináceos', 'Massas', 'Temperos', 'Outros'];

interface HistoricoItem {
  id: number;
  itemName: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  unidade: string;
  data: string;
  hora: string;
}

export function EstoqueSeco() {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ name: '', quantidade: 0, unidade: 'kg', categoria: 'Outros', minimo: 5 });
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
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
      title: difference > 0 ? "Item adicionado" : "Item retirado",
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
      setItems([...items, { id, ...newItem }]);
      setNewItem({ name: '', quantidade: 0, unidade: 'kg', categoria: 'Outros', minimo: 5 });
      setDialogOpen(false);
      toast({
        title: "Item adicionado",
        description: `${newItem.name} foi adicionado ao estoque!`,
      });
    }
  };

  const filteredItems = categoriaFiltro === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === categoriaFiltro);

  // Ordenar itens filtrados alfabeticamente
  const sortedFilteredItems = [...filteredItems].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const itemsBaixoEstoque = items.filter(item => item.quantidade <= item.minimo);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Estoque Seco</h2>
            <p className="text-gray-600">Produtos não perecíveis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {items.length} itens
          </Badge>
          {itemsBaixoEstoque.length > 0 && (
            <Badge variant="destructive">
              {itemsBaixoEstoque.length} baixo estoque
            </Badge>
          )}

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
                  Registro de entradas e saídas de produtos
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
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do produto"
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
                  <option value="litros">litros</option>
                  <option value="pacotes">pacotes</option>
                  <option value="unidades">unidades</option>
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
                  <Button onClick={addNewItem} className="bg-orange-500 hover:bg-orange-600">
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alertas de baixo estoque */}
      {itemsBaixoEstoque.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Itens com Baixo Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {itemsBaixoEstoque.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-red-600">{item.quantidade} {item.unidade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <Button
                key={categoria}
                variant={categoriaFiltro === categoria ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaFiltro(categoria)}
                className={categoriaFiltro === categoria ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                {categoria}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de itens */}
      <div className="grid gap-4">
        {sortedFilteredItems.map((item) => {
          const isEditing = editingQuantities.hasOwnProperty(item.id);
          const editValue = editingQuantities[item.id] || item.quantidade;

          return (
            <Card 
              key={item.id} 
              className={`${
                item.quantidade <= item.minimo 
                  ? 'border-red-200 bg-red-50' 
                  : 'border-gray-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.categoria}
                      </Badge>
                      {item.quantidade <= item.minimo && (
                        <Badge variant="destructive" className="text-xs">
                          Baixo Estoque
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {isEditing ? editValue : item.quantidade} {item.unidade} • Mínimo: {item.minimo} {item.unidade}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditingQuantity(item.id, item.quantidade)}
                        className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
                      >
                        Editar Quantidade
                      </Button>
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
