import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface BebidasAddDialogProps {
  newItem: any;
  setNewItem: (item: any) => void;
  onAddNewItem: () => void;
  setDialogOpen: (open: boolean) => void;
  categorias: string[];
  selectedUnidade?: 'juazeiro_norte' | 'fortaleza' | 'todas';
}

export function BebidasAddDialog({
  newItem,
  setNewItem,
  onAddNewItem,
  setDialogOpen,
  categorias,
  selectedUnidade = 'todas'
}: BebidasAddDialogProps) {
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddNewItem();
  };

  return (
    <DialogContent className={`${isMobile ? 'w-[95%] max-w-sm' : 'sm:max-w-md'}`}>
      <DialogHeader>
        <DialogTitle className={isMobile ? "text-lg" : "text-xl"}>
          Adicionar Nova Bebida
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome" className={isMobile ? "text-sm" : ""}>
            Nome da Bebida *
          </Label>
          <Input
            id="nome"
            type="text"
            placeholder="Ex: Coca-Cola 2L"
            value={newItem.nome}
            onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
            className={isMobile ? "text-sm" : ""}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="quantidade" className={isMobile ? "text-sm" : ""}>
              Quantidade *
            </Label>
            <Input
              id="quantidade"
              type="number"
              min="0"
              value={newItem.quantidade}
              onChange={(e) => setNewItem({ ...newItem, quantidade: e.target.value })}
              className={isMobile ? "text-sm" : ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimo" className={isMobile ? "text-sm" : ""}>
              Estoque Mínimo
            </Label>
            <Input
              id="minimo"
              type="number"
              min="0"
              value={newItem.minimo}
              onChange={(e) => setNewItem({ ...newItem, minimo: parseInt(e.target.value) || 0 })}
              className={isMobile ? "text-sm" : ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria" className={isMobile ? "text-sm" : ""}>
            Categoria *
          </Label>
          <Select
            value={newItem.categoria}
            onValueChange={(value) => setNewItem({ ...newItem, categoria: value })}
            required
          >
            <SelectTrigger className={isMobile ? "text-sm" : ""}>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.filter(cat => cat !== 'Todos').map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUnidade === 'todas' && (
          <div className="space-y-2">
            <Label htmlFor="unidade_item" className={isMobile ? "text-sm" : ""}>
              Unidade *
            </Label>
            <Select
              value={newItem.unidade_item}
              onValueChange={(value) => setNewItem({ ...newItem, unidade_item: value })}
              required
            >
              <SelectTrigger className={isMobile ? "text-sm" : ""}>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="juazeiro_norte">Juazeiro do Norte</SelectItem>
                <SelectItem value="fortaleza">Fortaleza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fornecedor" className={isMobile ? "text-sm" : ""}>
            Fornecedor
          </Label>
          <Input
            id="fornecedor"
            type="text"
            placeholder="Nome do fornecedor"
            value={newItem.fornecedor || ''}
            onChange={(e) => setNewItem({ ...newItem, fornecedor: e.target.value })}
            className={isMobile ? "text-sm" : ""}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            className={`flex-1 ${isMobile ? 'text-sm' : ''}`}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className={`flex-1 bg-blue-500 hover:bg-blue-600 ${isMobile ? 'text-sm' : ''}`}
          >
            Adicionar
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}