import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Snowflake, 
  Thermometer,
  Wine,
  FileText,
  Activity,
  ShoppingCart,
  DollarSign,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';
import { useEstoqueSecoData } from '@/hooks/useEstoqueSecoData';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';
import { useBebidas } from '@/hooks/useBebidas';
import { useCamaraRefrigeradaData } from '@/hooks/useCamaraRefrigeradaData';

const CHART_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function Dashboard() {
  const isMobile = useIsMobile();
  const { items: camaraFriaItems } = useCamaraFriaData();
  const { historico: camaraFriaHistorico } = useCamaraFriaHistorico();
  const { items: estoqueSecoItems } = useEstoqueSecoData();
  const { items: descartaveisItems } = useDescartaveisData();
  const { items: bebidasItems } = useBebidas();
  const { items: camaraRefrigeradaItems } = useCamaraRefrigeradaData();

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalItems = camaraFriaItems.length + estoqueSecoItems.length + descartaveisItems.length + bebidasItems.length + camaraRefrigeradaItems.length;
    
    const lowStockItems = [
      ...camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5)),
      ...estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5)),
      ...descartaveisItems.filter(item => item.quantidade <= (item.minimo || 10)),
      ...bebidasItems.filter(item => item.quantidade <= (item.minimo || 20))
    ];

    const totalValue = [
      ...camaraFriaItems.map(item => (item.preco_unitario || 0) * item.quantidade),
      ...estoqueSecoItems.map(item => (item.preco_unitario || 0) * item.quantidade),
      ...bebidasItems.map(item => (item.preco_unitario || 0) * item.quantidade)
    ].reduce((sum, value) => sum + value, 0);

    const recentMovements = camaraFriaHistorico.filter(item => {
      const itemDate = new Date(item.data_operacao || '');
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return itemDate >= sevenDaysAgo;
    }).length;

    return {
      totalItems,
      lowStockCount: lowStockItems.length,
      totalValue,
      recentMovements,
      categories: {
        camaraFria: camaraFriaItems.length,
        estoqueSeco: estoqueSecoItems.length,
        descartaveis: descartaveisItems.length,
        bebidas: bebidasItems.length,
        camaraRefrigerada: camaraRefrigeradaItems.length
      }
    };
  }, [camaraFriaItems, estoqueSecoItems, descartaveisItems, bebidasItems, camaraRefrigeradaItems, camaraFriaHistorico]);

  // Dados das carnes mais utilizadas (baseado nas saídas da câmara fria)
  const topUsedMeats = useMemo(() => {
    const meatUsage = camaraFriaHistorico
      .filter(item => item.tipo === 'saida')
      .reduce((acc, item) => {
        const existing = acc.find(a => a.name === item.item_nome);
        if (existing) {
          existing.value += item.quantidade;
        } else {
          acc.push({ 
            name: item.item_nome, 
            value: item.quantidade,
            color: CHART_COLORS[acc.length % CHART_COLORS.length]
          });
        }
        return acc;
      }, [] as any[])
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 carnes mais utilizadas

    return meatUsage;
  }, [camaraFriaHistorico]);

  // Dados para resumo de categorias
  const categoryData = useMemo(() => [
    { name: 'Câmara Fria', value: stats.categories.camaraFria, icon: Snowflake, color: '#3b82f6' },
    { name: 'Estoque Seco', value: stats.categories.estoqueSeco, icon: Package, color: '#f59e0b' },
    { name: 'Descartáveis', value: stats.categories.descartaveis, icon: FileText, color: '#10b981' },
    { name: 'Bebidas', value: stats.categories.bebidas, icon: Wine, color: '#ef4444' },
    { name: 'Câmara Refrigerada', value: stats.categories.camaraRefrigerada, icon: Thermometer, color: '#8b5cf6' }
  ].filter(item => item.value > 0), [stats.categories]);

  // Análise de movimentação por dia (últimos 7 dias)
  const movementAnalysis = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayMovements = camaraFriaHistorico.filter(item => 
        item.data_operacao?.split('T')[0] === date
      );

      const entradas = dayMovements.filter(item => item.tipo === 'entrada').length;
      const saidas = dayMovements.filter(item => item.tipo === 'saida').length;

      return {
        date,
        day: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        entradas,
        saidas,
        total: entradas + saidas
      };
    });
  }, [camaraFriaHistorico]);

  // Top itens mais movimentados
  const topMovedItems = useMemo(() => {
    const itemMovements = camaraFriaHistorico.reduce((acc, movement) => {
      const key = movement.item_nome;
      if (!acc[key]) {
        acc[key] = { nome: key, total: 0, entradas: 0, saidas: 0 };
      }
      acc[key].total += movement.quantidade;
      if (movement.tipo === 'entrada') {
        acc[key].entradas += movement.quantidade;
      } else {
        acc[key].saidas += movement.quantidade;
      }
      return acc;
    }, {} as Record<string, any>);

    return Object.values(itemMovements)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 5);
  }, [camaraFriaHistorico]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Layout Mobile - Elementos principais no topo */}
      {isMobile && (
        <div className="space-y-6">
          {/* Carnes Mais Utilizadas - Mobile First */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-blue-500" />
                Carnes Mais Utilizadas
              </CardTitle>
              <CardDescription>
                Carnes com maior quantidade de saídas da câmara fria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {topUsedMeats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topUsedMeats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                        strokeWidth={2}
                        stroke="#ffffff"
                      >
                        {topUsedMeats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} utilizados`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma saída de carne registrada</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Movimentações - Mobile */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Movimentações (7 dias)
              </CardTitle>
              <CardDescription>
                Entradas e saídas registradas nos últimos dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={movementAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} ${name === 'entradas' ? 'entradas' : 'saídas'}`, 
                        name === 'entradas' ? 'Entradas' : 'Saídas'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="entradas" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="saidas" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Itens Mais Movimentados - Mobile */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Itens Mais Movimentados
              </CardTitle>
              <CardDescription>
                Produtos com maior quantidade de entradas e saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topMovedItems.length > 0 ? (
                <div className="space-y-4">
                  {topMovedItems.map((item: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.nome}</p>
                          <p className="text-xs text-gray-600">
                            {item.entradas} entradas • {item.saidas} saídas
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {item.total} total
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma movimentação registrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Itens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-600">
              <Activity className="w-3 h-3 mr-1" />
              Todos os estoques
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Baixo Estoque</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Requer atenção
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Movimentações</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recentMovements}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-600">
              <Calendar className="w-3 h-3 mr-1" />
              Últimos 7 dias
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais - Desktop Only */}
      {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carnes Mais Utilizadas */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-blue-500" />
              Carnes Mais Utilizadas
            </CardTitle>
            <CardDescription>
              Carnes com maior quantidade de saídas da câmara fria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {topUsedMeats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topUsedMeats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="#ffffff"
                    >
                      {topUsedMeats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} utilizados`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma saída de carne registrada</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Movimentações dos Últimos 7 Dias */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Movimentações (7 dias)
            </CardTitle>
            <CardDescription>
              Entradas e saídas registradas nos últimos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} ${name === 'entradas' ? 'entradas' : 'saídas'}`, 
                      name === 'entradas' ? 'Entradas' : 'Saídas'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="entradas" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="saidas" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Seção de Insights e Alertas - Desktop Only */}
      {!isMobile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Itens Movimentados */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Itens Mais Movimentados
            </CardTitle>
            <CardDescription>
              Produtos com maior quantidade de entradas e saídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topMovedItems.length > 0 ? (
              <div className="space-y-4">
                {topMovedItems.map((item: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.nome}</p>
                        <p className="text-xs text-gray-600">
                          {item.entradas} entradas • {item.saidas} saídas
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {item.total} total
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma movimentação registrada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo por Categoria */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" />
              Resumo de Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <IconComponent 
                          className="w-4 h-4" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-gray-600">{category.value} itens</p>
                      </div>
                    </div>
                    <div 
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Alertas de Baixo Estoque */}
      {stats.lowStockCount > 0 && (
        <Card className="shadow-lg border-l-4 border-l-red-500 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Baixo Estoque ({stats.lowStockCount} itens)
            </CardTitle>
            <CardDescription className="text-red-600">
              Itens que precisam de reposição urgente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ...camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5)).slice(0, 6),
                ...estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5)).slice(0, 3),
                ...bebidasItems.filter(item => item.quantidade <= (item.minimo || 20)).slice(0, 3)
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.nome}</p>
                    <p className="text-xs text-red-600">
                      {item.quantidade} / {item.minimo || 5} mín.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}