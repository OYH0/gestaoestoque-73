
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';

interface CamaraFriaTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CamaraFriaItem[];
  onTransfer: (itemIds: string[], targetUnidade: 'juazeiro_norte' | 'fortaleza') => void;
  currentUnidade: 'juazeiro_norte' | 'fortaleza' | 'todas';
  onClose?: () => void;
}

export function CamaraFriaTransferDialog({
  open,
  onOpenChange,
  items,
  onTransfer,
  currentUnidade,
  onClose
}: CamaraFriaTransferDialogProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [targetUnidade, setTargetUnidade] = useState<'juazeiro_norte' | 'fortaleza'>('juazeiro_norte');

  // Filtrar itens com base na unidade atual
  const availableItems = items.filter(item => {
    if (currentUnidade === 'todas') return true;
    return item.unidade_item === currentUnidade;
  });

  const handleSelectAll = () => {
    if (selectedItems.size === availableItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(availableItems.map(item => item.id)));
    }
  };

  const handleItemSelect = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleTransfer = () => {
    if (selectedItems.size > 0) {
      onTransfer(Array.from(selectedItems), targetUnidade);
      setSelectedItems(new Set());
      onOpenChange(false);
      if (onClose) onClose();
    }
  };

  const getUnidadeLabel = (unidade: string) => {
    return unidade === 'juazeiro_norte' ? 'Juazeiro do Norte' : 'Fortaleza';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transferir Itens Entre Unidades</DialogTitle>
          <DialogDescription>
            Selecione os itens que deseja transferir para outra unidade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Transferir para:</label>
              <div className="flex gap-2">
                <Button
                  variant={targetUnidade === 'juazeiro_norte' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTargetUnidade('juazeiro_norte')}
                >
                  Juazeiro do Norte
                </Button>
                <Button
                  variant={targetUnidade === 'fortaleza' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTargetUnidade('fortaleza')}
                >
                  Fortaleza
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Itens Disponíveis ({availableItems.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedItems.size === availableItems.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>

            <div className="border rounded-lg p-2 max-h-60 overflow-y-auto space-y-2">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleItemSelect(item.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.nome}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.categoria}
                      </Badge>
                      {item.unidade_item && (
                        <Badge variant="outline" className="text-xs">
                          {getUnidadeLabel(item.unidade_item)}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.quantidade} {item.unidade}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    {getUnidadeLabel(targetUnidade)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {selectedItems.size > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>{selectedItems.size}</strong> itens selecionados para transferência para{' '}
                <strong>{getUnidadeLabel(targetUnidade)}</strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={selectedItems.size === 0}
          >
            Transferir Itens ({selectedItems.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
