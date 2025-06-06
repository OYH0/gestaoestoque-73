
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Minus, ShoppingCart } from 'lucide-react';
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

export function EstoqueSeco() {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ name: '', quantidade: 0, unidade: 'kg', categoria: 'Outros', minimo: 5 });
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');

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
      setItems([...items, { id, ...newItem }]);
      setNewItem({ name: '', quantidade: 0, unidade: 'kg', categoria: 'Outros', minimo: 5 });
      toast({
        title: "Item adicionado",
        description: `${newItem.name} foi adicionado ao estoque!`,
      });
    }
  };

  const filteredItems = categoriaFiltro === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === categoriaFiltro);

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

      {/* Adicionar novo item */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Novo Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={newItem.unidade}
              onChange={(e) => setNewItem({...newItem, unidade: e.target.value})}
            >
              <option value="kg">kg</option>
              <option value="litros">litros</option>
              <option value="pacotes">pacotes</option>
              <option value="unidades">unidades</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={newItem.categoria}
              onChange={(e) => setNewItem({...newItem, categoria: e.target.value})}
            >
              {categorias.slice(1).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button onClick={addNewItem} className="bg-orange-500 hover:bg-orange-600">
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de itens */}
      <div className="grid gap-4">
        {filteredItems.map((item) => (
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
                    {item.quantidade} {item.unidade} • Mínimo: {item.minimo} {item.unidade}
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
