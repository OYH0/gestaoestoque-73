import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Minus, Check, X, History, FileText, Loader2, QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateInventoryPDF } from '@/utils/pdfGenerator';
import { EstoqueSecoFilters } from '@/components/estoque-seco/EstoqueSecoFilters';
import { EstoqueSecoAlerts } from '@/components/estoque-seco/EstoqueSecoAlerts';
import { QRScanner } from '@/components/qr-scanner/QRScanner';
import { QRCodeGenerator } from '@/components/qr-scanner/QRCodeGenerator';
import { useEstoqueSecoData } from '@/hooks/useEstoqueSecoData';

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
  const { 
    items, 
    loading, 
    addItem, 
    updateItemQuantity, 
    deleteItem,
    qrCodes,
    showQRGenerator,
    setShowQRGenerator,
    lastAddedItem
  } = useEstoqueSecoData();
  const [newItem, setNewItem] = useState({ nome: '', quantidade: 0, unidade: 'kg', categoria: 'Outros', minimo: 5 });
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [historicoOpen, setHistoricoOpen] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<{ [key: string]: number }>({});
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const startEditingQuantity = (id: string, currentQuantity: number) => {
    setEditingQuantities({ ...editingQuantities, [id]: currentQuantity });
  };

  const updateEditingQuantity = (id: string, delta: number) => {
    const currentEditValue = editingQuantities[id] || 0;
    const newValue = Math.max(0, currentEditValue + delta);
    setEditingQuantities({ ...editingQuantities, [id]: newValue });
  };

  const confirmQuantityChange = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQuantity = editingQuantities[id];
    const oldQuantity = item.quantidade;
    const difference = newQuantity - oldQuantity;

    await updateItemQuantity(id, newQuantity);

    const now = new Date();
    const novoHistorico: HistoricoItem = {
      id: Date.now(),
      itemName: item.nome,
      tipo: difference > 0 ? 'entrada' : 'saida',
      quantidade: Math.abs(difference),
      unidade: item.unidade,
      data: now.toLocaleDateString('pt-BR'),
      hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setHistorico([novoHistorico, ...historico]);

    const newEditingQuantities = { ...editingQuantities };
    delete newEditingQuantities[id];
    setEditingQuantities(newEditingQuantities);

    toast({
      title: difference > 0 ? "Item adicionado" : "Item retirado",
      description: `${Math.abs(difference)} ${item.unidade} de ${item.nome}`,
    });
  };

  const cancelQuantityEdit = (id: string) => {
    const newEditingQuantities = { ...editingQuantities };
    delete newEditingQuantities[id];
    setEditingQuantities(newEditingQuantities);
  };

  const addNewItem = async () => {
    if (newItem.nome && newItem.quantidade >= 0) {
      await addItem({
        ...newItem,
        minimo: newItem.minimo
      });
      setNewItem({ nome: '', quantidade: 0, unidade: 'kg', categoria: 'Outros', minimo: 5 });
      setDialogOpen(false);
    }
  };

  const handlePrintPDF = () => {
    generateInventoryPDF(
      items,
      'Inventário de Estoque Seco',
      'Produtos não perecíveis'
    );
    toast({
      title: "PDF gerado",
      description: "O relatório foi baixado com sucesso!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando dados...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredItems = categoriaFiltro === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === categoriaFiltro);

  const sortedFilteredItems = [...filteredItems].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  const itemsBaixoEstoque = items.filter(item => item.quantidade <= (item.minimo || 5));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Estoque Seco</h2>
            <p className="text-sm md:text-base text-gray-600">Produtos não perecíveis</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            {items.length} itens
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQRScanner(true)}
            className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100 text-xs md:text-sm"
          >
            <QrCode className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Escanear QR
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
              <Button className="bg-orange-500 hover:bg-orange-600 text-xs md:text-sm" size="sm">
                <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Arroz, Feijão, Farinha de trigo..."
                    value={newItem.nome}
                    onChange={(e) => setNewItem({...newItem, nome: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade em Estoque</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    placeholder="Quantidade disponível"
                    value={newItem.quantidade}
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
                      <SelectItem value="litros">Litros</SelectItem>
                      <SelectItem value="pacotes">Pacotes</SelectItem>
                      <SelectItem value="unidades">Unidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria do Produto</Label>
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
                    placeholder="Quantidade mínima para alerta"
                    value={newItem.minimo}
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
                  <Button onClick={addNewItem} className="bg-orange-500 hover:bg-orange-600">
                    Adicionar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <EstoqueSecoAlerts itemsBaixoEstoque={itemsBaixoEstoque} />

      <EstoqueSecoFilters 
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
                item.quantidade <= (item.minimo || 5)
                  ? 'border-red-200 bg-red-50' 
                  : 'border-gray-200'
              }`}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.nome}</h3>
                      <Badge variant="outline" className="text-xs">
                        {item.categoria}
                      </Badge>
                      {item.quantidade <= (item.minimo || 5) && (
                        <Badge variant="destructive" className="text-xs">
                          Baixo Estoque
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {isEditing ? editValue : item.quantidade} {item.unidade} • Mínimo: {item.minimo || 5} {item.unidade}
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
                        className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100 text-xs md:text-sm px-2 md:px-3"
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

      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {lastAddedItem && (
        <QRCodeGenerator
          isOpen={showQRGenerator}
          onClose={() => setShowQRGenerator(false)}
          qrCodes={qrCodes}
          itemName={lastAddedItem.nome}
        />
      )}
    </div>
  );
}
