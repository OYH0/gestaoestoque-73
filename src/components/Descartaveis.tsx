
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, Package2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const initialItems = [
  { id: 1, name: 'Pratos Descartáveis', quantidade: 200, unidade: 'unidades', categoria: 'Utensílios', minimo: 50 },
  { id: 2, name: 'Copos Descartáveis 200ml', quantidade: 150, unidade: 'unidades', categoria: 'Utensílios', minimo: 100 },
  { id: 3, name: 'Copos Descartáveis 300ml', quantidade: 80, unidade: 'unidades', categoria: 'Utensílios', minimo: 50 },
  { id: 4, name: 'Garfos Descartáveis', quantidade: 120, unidade: 'unidades', categoria: 'Utensílios', minimo: 80 },
  { id: 5, name: 'Facas Descartáveis', quantidade: 90, unidade: 'unidades', categoria: 'Utensílios', minimo: 60 },
  { id: 6, name: 'Guardanapos', quantidade: 500, unidade: 'unidades', categoria: 'Higiene', minimo: 200 },
  { id: 7, name: 'Papel Toalha', quantidade: 12, unidade: 'rolos', categoria: 'Higiene', minimo: 6 },
  { id: 8, name: 'Saco de Lixo 50L', quantidade: 25, unidade: 'unidades', categoria: 'Limpeza', minimo: 15 },
  { id: 9, name: 'Saco de Lixo 100L', quantidade: 18, unidade: 'unidades', categoria: 'Limpeza', minimo: 10 },
  { id: 10, name: 'Detergente', quantidade: 8, unidade: 'unidades', categoria: 'Limpeza', minimo: 5 },
  { id: 11, name: 'Papel Alumínio', quantidade: 4, unidade: 'rolos', categoria: 'Embalagens', minimo: 3 },
  { id: 12, name: 'Papel Filme', quantidade: 3, unidade: 'rolos', categoria: 'Embalagens', minimo: 2 },
];

const categorias = ['Todos', 'Utensílios', 'Higiene', 'Limpeza', 'Embalagens'];

export function Descartaveis() {
  const [items, setItems] = useState(initialItems);
  const [newItem, setNewItem] = useState({ 
    name: '', 
    quantidade: 0, 
    unidade: 'unidades', 
    categoria: 'Utensílios', 
    minimo: 10 
  });
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
      setNewItem({ 
        name: '', 
        quantidade: 0, 
        unidade: 'unidades', 
        categoria: 'Utensílios', 
        minimo: 10 
      });
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
  const totalItens = items.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Descartáveis</h2>
            <p className="text-gray-600">Utensílios e materiais descartáveis</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {items.length} tipos
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {totalItens} total
          </Badge>
          {itemsBaixoEstoque.length > 0 && (
            <Badge variant="destructive">
              {itemsBaixoEstoque.length} baixo estoque
            </Badge>
          )}
        </div>
      </div>

      {/* Estatísticas por categoria */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categorias.slice(1).map((categoria) => {
          const itensCategoria = items.filter(item => item.categoria === categoria);
          const totalCategoria = itensCategoria.reduce((acc, item) => acc + item.quantidade, 0);
          return (
            <Card key={categoria}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{totalCategoria}</div>
                <p className="text-sm text-gray-600">{categoria}</p>
                <p className="text-xs text-gray-500">{itensCategoria.length} tipos</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas de baixo estoque */}
      {itemsBaixoEstoque.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Itens com Baixo Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {itemsBaixoEstoque.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-red-600 font-medium">{item.quantidade}</span>
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
                className={categoriaFiltro === categoria ? "bg-purple-500 hover:bg-purple-600" : ""}
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
            Adicionar Novo Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input
              placeholder="Nome do item"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="md:col-span-2"
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
              <option value="unidades">unidades</option>
              <option value="rolos">rolos</option>
              <option value="pacotes">pacotes</option>
              <option value="caixas">caixas</option>
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
            <Button onClick={addNewItem} className="bg-purple-500 hover:bg-purple-600">
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
                  <div className="flex items-center gap-3 flex-wrap">
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
