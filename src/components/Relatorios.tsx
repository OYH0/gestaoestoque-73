
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, TrendingUp, Download, Filter, BarChart3 } from 'lucide-react';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useEstoqueSecoData } from '@/hooks/useEstoqueSecoData';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend, AreaChart, Area } from 'recharts';

export function Relatorios() {
  const { items: camaraFriaItems } = useCamaraFriaData();
  const { items: estoqueSecoItems } = useEstoqueSecoData();
  const { items: descartaveisItems } = useDescartaveisData();
  
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mes');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');

  // Dados consolidados
  const totalItens = camaraFriaItems.length + estoqueSecoItems.length + descartaveisItems.length;
  const valorEstimado = [
    ...camaraFriaItems.map(item => (item.preco_unitario || 0) * item.quantidade),
    ...estoqueSecoItems.map(item => (item.preco_unitario || 0) * item.quantidade),
    ...descartaveisItems.map(item => (item.preco_unitario || 0) * item.quantidade)
  ].reduce((acc, val) => acc + val, 0);

  // Dados para gráficos
  const distribuicaoEstoque = [
    { name: 'Câmara Fria', value: camaraFriaItems.length, color: '#3b82f6' },
    { name: 'Estoque Seco', value: estoqueSecoItems.length, color: '#f59e0b' },
    { name: 'Descartáveis', value: descartaveisItems.length, color: '#ef4444' },
  ];

  const categoriasData = [
    ...camaraFriaItems.reduce((acc, item) => {
      const existing = acc.find(a => a.categoria === item.categoria);
      if (existing) {
        existing.quantidade += item.quantidade;
      } else {
        acc.push({ categoria: item.categoria, quantidade: item.quantidade, setor: 'Câmara Fria' });
      }
      return acc;
    }, [] as any[]),
    ...estoqueSecoItems.reduce((acc, item) => {
      const existing = acc.find(a => a.categoria === item.categoria);
      if (existing) {
        existing.quantidade += item.quantidade;
      } else {
        acc.push({ categoria: item.categoria, quantidade: item.quantidade, setor: 'Estoque Seco' });
      }
      return acc;
    }, [] as any[])
  ];

  const movimentacaoMensal = [
    { mes: 'Jan', entradas: Math.floor(Math.random() * 50) + 20, saidas: Math.floor(Math.random() * 40) + 15 },
    { mes: 'Fev', entradas: Math.floor(Math.random() * 45) + 18, saidas: Math.floor(Math.random() * 35) + 12 },
    { mes: 'Mar', entradas: Math.floor(Math.random() * 55) + 25, saidas: Math.floor(Math.random() * 45) + 20 },
    { mes: 'Abr', entradas: Math.floor(Math.random() * 48) + 22, saidas: Math.floor(Math.random() * 38) + 16 },
    { mes: 'Mai', entradas: Math.floor(Math.random() * 52) + 28, saidas: Math.floor(Math.random() * 42) + 18 },
    { mes: 'Jun', entradas: Math.floor(Math.random() * 58) + 30, saidas: Math.floor(Math.random() * 48) + 22 },
  ];

  const itensCriticos = [
    ...camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5)),
    ...estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5)),
    ...descartaveisItems.filter(item => item.quantidade <= (item.minimo || 5))
  ];

  const exportarRelatorio = (tipo: string) => {
    // Simular exportação
    const dados = {
      periodo: periodoSelecionado,
      totalItens,
      valorEstimado,
      itensCriticos: itensCriticos.length,
      data: new Date().toLocaleDateString('pt-BR')
    };
    
    console.log('Exportando relatório:', tipo, dados);
    // Aqui implementaria a lógica real de exportação
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">Análises detalhadas do seu estoque</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Última Semana</SelectItem>
              <SelectItem value="mes">Último Mês</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
              <SelectItem value="ano">Último Ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportarRelatorio('PDF')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItens}</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{itensCriticos.length}</div>
            <p className="text-xs text-muted-foreground">
              Baixo estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eficiência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de disponibilidade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Distribuição do Estoque
            </CardTitle>
            <CardDescription>
              Proporção de itens por setor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribuicaoEstoque}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribuicaoEstoque.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Movimentação Mensal
            </CardTitle>
            <CardDescription>
              Entradas e saídas do estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movimentacaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="entradas" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Entradas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saidas" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    name="Saídas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Categoria</CardTitle>
          <CardDescription>
            Quantidade de itens por categoria e setor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoriasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Itens Críticos */}
      {itensCriticos.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Itens com Estoque Crítico
            </CardTitle>
            <CardDescription>
              Produtos que precisam de reposição urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {itensCriticos.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {item.quantidade} {item.unidade} | Mínimo: {item.minimo || 5} {item.unidade}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">Crítico</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Relatórios e exportações disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => exportarRelatorio('estoque-completo')}
            >
              <FileText className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Relatório Completo</div>
                <div className="text-sm text-muted-foreground">Todos os itens do estoque</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => exportarRelatorio('baixo-estoque')}
            >
              <Calendar className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Itens Críticos</div>
                <div className="text-sm text-muted-foreground">Produtos em falta</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col gap-2"
              onClick={() => exportarRelatorio('movimentacao')}
            >
              <TrendingUp className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Movimentação</div>
                <div className="text-sm text-muted-foreground">Entradas e saídas</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
