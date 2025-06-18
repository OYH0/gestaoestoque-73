import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CamaraFriaItem } from '@/hooks/useCamaraFriaData';

interface CamaraFriaAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: Omit<CamaraFriaItem, 'id'> & { unidade_item?: 'juazeiro_norte' | 'fortaleza' }) => Promise<any>;
  selectedUnidade: 'juazeiro_norte' | 'fortaleza' | 'todas';
}

const categorias = [
  'Carnes',
  'Aves',
  'Peixes',
  'Laticínios',
  'Congelados',
  'Bebidas',
  'Outros'
];

export function CamaraFriaAddDialog({
  open,
  onOpenChange,
  onAdd,
  selectedUnidade
}: CamaraFriaAddDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    categoria: '',
    minimo: '5',
    data_validade: '',
    temperatura_ideal: '',
    fornecedor: '',
    observacoes: '',
    preco_unitario: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.quantidade || isNaN(Number(formData.quantidade)) || Number(formData.quantidade) < 0) {
      newErrors.quantidade = 'Quantidade deve ser um número válido e não negativo';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    if (formData.minimo && (isNaN(Number(formData.minimo)) || Number(formData.minimo) < 0)) {
      newErrors.minimo = 'Quantidade mínima deve ser um número válido e não negativo';
    }

    if (formData.temperatura_ideal && isNaN(Number(formData.temperatura_ideal))) {
      newErrors.temperatura_ideal = 'Temperatura deve ser um número válido';
    }

    if (formData.preco_unitario && (isNaN(Number(formData.preco_unitario)) || Number(formData.preco_unitario) < 0)) {
      newErrors.preco_unitario = 'Preço deve ser um número válido e não negativo';
    }

    if (formData.data_validade) {
      const today = new Date();
      const validadeDate = new Date(formData.data_validade);
      if (validadeDate < today) {
        newErrors.data_validade = 'Data de validade não pode ser no passado';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const itemData = {
        nome: formData.nome.trim(),
        quantidade: Number(formData.quantidade),
        unidade: 'pç',
        categoria: formData.categoria,
        minimo: formData.minimo ? Number(formData.minimo) : 5,
        data_validade: formData.data_validade || undefined,
        temperatura_ideal: formData.temperatura_ideal ? Number(formData.temperatura_ideal) : undefined,
        fornecedor: formData.fornecedor.trim() || undefined,
        observacoes: formData.observacoes.trim() || undefined,
        preco_unitario: formData.preco_unitario ? Number(formData.preco_unitario) : undefined,
        unidade_item: selectedUnidade === 'todas' ? 'juazeiro_norte' : selectedUnidade
      };

      await onAdd(itemData);
      
      // Reset form
      setFormData({
        nome: '',
        quantidade: '',
        categoria: '',
        minimo: '5',
        data_validade: '',
        temperatura_ideal: '',
        fornecedor: '',
        observacoes: '',
        preco_unitario: ''
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding item:', error);
      // O erro já é tratado no hook, não precisamos fazer nada aqui
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Item à Câmara Fria</DialogTitle>
          <DialogDescription>
            Preencha as informações do novo item para adicionar ao estoque da câmara fria.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Item *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Coxinha da Asa"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.nome}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="0"
                step="1"
                value={formData.quantidade}
                onChange={(e) => handleInputChange('quantidade', e.target.value)}
                placeholder="Ex: 50"
                className={errors.quantidade ? 'border-red-500' : ''}
              />
              {errors.quantidade && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.quantidade}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.categoria}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimo">Quantidade Mínima</Label>
              <Input
                id="minimo"
                type="number"
                min="0"
                step="1"
                value={formData.minimo}
                onChange={(e) => handleInputChange('minimo', e.target.value)}
                placeholder="Ex: 5"
                className={errors.minimo ? 'border-red-500' : ''}
              />
              {errors.minimo && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.minimo}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_validade">Data de Validade</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade}
                onChange={(e) => handleInputChange('data_validade', e.target.value)}
                className={errors.data_validade ? 'border-red-500' : ''}
              />
              {errors.data_validade && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.data_validade}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperatura_ideal">Temperatura Ideal (°C)</Label>
              <Input
                id="temperatura_ideal"
                type="number"
                step="0.1"
                value={formData.temperatura_ideal}
                onChange={(e) => handleInputChange('temperatura_ideal', e.target.value)}
                placeholder="Ex: -18"
                className={errors.temperatura_ideal ? 'border-red-500' : ''}
              />
              {errors.temperatura_ideal && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.temperatura_ideal}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => handleInputChange('fornecedor', e.target.value)}
                placeholder="Ex: Fornecedor ABC"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco_unitario">Preço Unitário (R$)</Label>
              <Input
                id="preco_unitario"
                type="number"
                min="0"
                step="0.01"
                value={formData.preco_unitario}
                onChange={(e) => handleInputChange('preco_unitario', e.target.value)}
                placeholder="Ex: 2.50"
                className={errors.preco_unitario ? 'border-red-500' : ''}
              />
              {errors.preco_unitario && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{errors.preco_unitario}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais sobre o item..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Adicionar Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

