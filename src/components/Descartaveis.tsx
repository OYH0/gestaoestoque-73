import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Trash2, Plus, Minus, Check, X, History, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { DescartaveisFilters } from '@/components/descartaveis/DescartaveisFilters';
import { DescartaveisAlerts } from '@/components/descartaveis/DescartaveisAlerts';

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

interface HistoricoItem {
  id: number;
  itemName: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  unidade: string;
  data: string;
  hora: string;
}

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
      setDialogOpen(false);
      toast({
        title: "Item adicionado",
        description: `${newItem.name} foi adicionado ao estoque!`,
      });
    }
  };

  const handlePrintPDF = () => {
    generateInventoryPDF(
      items,
      'Inventário de Descartáveis',
      'Utensílios e materiais descartáveis'
    );
    toast({
      title: "PDF gerado",
      description: "O relatório foi baixado com sucesso!",
    });
  };

  const filteredItems = categoriaFiltro === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === categoriaFiltro);

  // Ordenar itens filtrados alfabeticamente
  const sortedFilteredItems = [...filteredItems].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const itemsBaixoEstoque = items.filter(item => item.quantidade <= item.minimo);
  const totalItens = items.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Descartáveis</h2>
            <p className="text-sm md:text-base text-gray-600">Utensílios e materiais descartáveis</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
            {items.length} tipos
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            {totalItens} total
          </Badge>
          {itemsBaixoEstoque.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {itemsBaixoEstoque.length} baixo estoque
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="border-gray-300 text-xs md:text-sm"
            onClick={handlePrintPDF}
          >
            <FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            PDF
          </Button>

          <Dialog open={historicoOpen} onOpenChange={setHistoricoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-300 text-xs md:text-sm">
                <History className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Histórico
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Histórico de Movimentações</DialogTitle>
                <DialogDescription>
                  Registro de entradas e saídas de descartáveis
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
              <Button className="bg-purple-500 hover:bg-purple-600 text-xs md:text-sm" size="sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do item"
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
                  <option value="unidades">unidades</option>
                  <option value="rolos">rolos</option>
                  <option value="pacotes">pacotes</option>
                  <option value="caixas">caixas</option>
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
                  <Button onClick={addNewItem} className="bg-purple-500 hover:bg-purple-600">
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {categorias.slice(1).map((categoria) => {
          const itensCategoria = items.filter(item => item.categoria === categoria);
          const totalCategoria = itensCategoria.reduce((acc, item) => acc + item.quantidade, 0);
          return (
            <Card key={categoria}>
              <CardContent className="p-3 md:p-4 text-center">
                <div className="text-lg md:text-2xl font-bold text-purple-600">{totalCategoria}</div>
                <p className="text-xs md:text-sm text-gray-600">{categoria}</p>
                <p className="text-xs text-gray-500">{itensCategoria.length} tipos</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DescartaveisAlerts itemsBaixoEstoque={itemsBaixoEstoque} />

      <DescartaveisFilters 
        categorias={categorias}
        categoriaFiltro={categoriaFiltro}
        setCategoriaFiltro={setCategoriaFiltro}
      />

      <div className="grid gap-3 md:gap-4">
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
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.categoria}
                      </Badge>
                      {item.quantidade <= item.minimo && (
                        <Badge variant="destructive" className="text-xs">
                          Baixo Estoque
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {isEditing ? editValue : item.quantidade} {item.unidade} • Mínimo: {item.minimo} {item.unidade}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 md:gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 border-red-200 text-red-600 hover:bg-red-100 p-1 md:p-2"
                          onClick={() => updateEditingQuantity(item.id, -1)}
                          disabled={editValue === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-12 md:w-16 text-center font-medium border rounded px-1 md:px-2 py-1 text-sm">
                          {editValue}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 p-1 md:p-2"
                          onClick={() => updateEditingQuantity(item.id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 p-1 md:p-2"
                          onClick={() => confirmQuantityChange(item.id)}
                        >
                          <Check className="w-3 h-3" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 p-1 md:p-2"
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
                        className="bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100 text-xs md:text-sm px-2 md:px-3"
                      >
                        Editar
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
