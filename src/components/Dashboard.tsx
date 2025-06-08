
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Snowflake, Thermometer, Package, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useEstoqueSecoData } from '@/hooks/useEstoqueSecoData';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';

export function Dashboard() {
  const isMobile = useIsMobile();
  const { items: camaraFriaItems } = useCamaraFriaData();
  const { items: estoqueSecoItems } = useEstoqueSecoData();
  const { items: descartaveisItems } = useDescartaveisData();

  // Processar dados para gráficos
  const meatTypesData = camaraFriaItems
    .reduce((acc, item) => {
      const existing = acc.find(a => a.tipo === item.nome);
      if (existing) {
        existing.quantidade += item.quantidade;
      } else {
        acc.push({ 
          tipo: item.nome, 
          quantidade: item.quantidade,
          color: '#' + Math.floor(Math.random()*16777215).toString(16)
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 8);

  const topMeatsData = meatTypesData.slice(0, 5);

  // Simular dados de utilização das top 5 carnes (percentual de retiradas)
  const top5MeatUsage = topMeatsData.map((meat, index) => ({
    nome: meat.tipo,
    percentualRetirada: Math.max(20, 90 - (index * 15) + Math.random() * 10), // Simular percentual de uso
    estoqueAtual: meat.quantidade,
    color: meat.color
  })).sort((a, b) => b.percentualRetirada - a.percentualRetirada);

  // Dados para alertas de baixo estoque
  const carnesBaixoEstoque = camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5));
  const estoqueBaixo = estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5));
  
  const temAlertas = carnesBaixoEstoque.length > 0 || estoqueBaixo.length > 0;

  // Dados de estoque por categoria
  const stockData = [
    { name: 'Câmara Fria', value: Math.min(100, (camaraFriaItems.length / 20) * 100), color: '#3b82f6' },
    { name: 'Estoque Seco', value: Math.min(100, (estoqueSecoItems.length / 15) * 100), color: '#f59e0b' },
    { name: 'Descartáveis', value: Math.min(100, (descartaveisItems.length / 10) * 100), color: '#ef4444' },
  ];

  const statsCards = [
    {
      title: 'Câmara Fria',
      value: camaraFriaItems.length.toString(),
      description: 'Produtos armazenados',
      icon: Snowflake,
      progress: Math.min(100, (camaraFriaItems.length / 20) * 100),
      trend: '+12%',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Estoque Seco',
      value: estoqueSecoItems.length.toString(),
      description: 'Itens diversos',
      icon: Package,
      progress: Math.min(100, (estoqueSecoItems.length / 15) * 100),
      trend: '-3%',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
    },
    {
      title: 'Descartáveis',
      value: descartaveisItems.length.toString(),
      description: 'Unidades disponíveis',
      icon: Trash2,
      progress: Math.min(100, (descartaveisItems.length / 10) * 100),
      trend: '+15%',
      color: 'from-red-500 to-red-600',
      bgColor: 'from-red-50 to-red-100',
    },
  ];

  // Dados para alertas de baixo estoque
  const carnesBaixoEstoque = camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5));
  const estoqueBaixo = estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5));
  
  const temAlertas = carnesBaixoEstoque.length > 0 || estoqueBaixo.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu estoque</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Sistema atualizado
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {!isMobile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((card, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgColor} opacity-50`} />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                    card.trend.startsWith('+') ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                  }`}>
                    {card.trend}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{card.value}</div>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Capacidade</span>
                      <span>{Math.round(card.progress)}%</span>
                    </div>
                    <Progress value={card.progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meatTypesData.length > 0 && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Quantidade por Tipo de Carne - Câmara Fria
              </CardTitle>
              <CardDescription>
                Quantidade atual de cada tipo de carne (kg)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={meatTypesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="tipo" 
                      stroke="#888" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis stroke="#888" />
                    <Tooltip />
                    <Bar dataKey="quantidade" radius={[2, 2, 0, 0]}>
                      {meatTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {top5MeatUsage.length > 0 && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Top 5 Carnes Mais Utilizadas
              </CardTitle>
              <CardDescription>
                Percentual de retiradas do estoque por tipo de carne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top5MeatUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="nome" 
                      stroke="#888" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                    />
                    <YAxis stroke="#888" label={{ value: '% Utilização', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                        return [`${numValue.toFixed(1)}%`, 'Percentual de Utilização'];
                      }}
                      labelFormatter={(label) => `Carne: ${label}`}
                    />
                    <Bar dataKey="percentualRetirada" radius={[2, 2, 0, 0]}>
                      {top5MeatUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {topMeatsData.length > 0 && (
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Distribuição por Categoria
              </CardTitle>
              <CardDescription>
                Categorias com maior quantidade em estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={topMeatsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="quantidade"
                      >
                        {topMeatsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {topMeatsData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.tipo}</div>
                        <div className="text-xs text-muted-foreground">{item.quantidade}kg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Nível de Estoque por Setor
            </CardTitle>
            <CardDescription>
              Percentual de ocupação de cada setor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Ocupação']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {temAlertas && (
        <Card className="shadow-md border-0 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Baixo Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {carnesBaixoEstoque.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Câmara Fria - Carnes</h4>
                  <div className="space-y-2">
                    {carnesBaixoEstoque.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            Estoque atual: {item.quantidade}{item.unidade} | Mínimo: {item.minimo || 5}{item.unidade}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {estoqueBaixo.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Estoque Seco</h4>
                  <div className="space-y-2">
                    {estoqueBaixo.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            Estoque atual: {item.quantidade} | Mínimo: {item.minimo || 5}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
