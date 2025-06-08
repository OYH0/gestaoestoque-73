
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

  // Processar dados para gráfico de barras - todos os tipos de carne
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
    .sort((a, b) => b.quantidade - a.quantidade);

  // Top 5 carnes mais utilizadas para gráfico de pizza (simulando percentual de uso)
  const top5MeatUsage = meatTypesData.slice(0, 5).map((meat, index) => ({
    nome: meat.tipo,
    percentualUso: Math.max(20, 90 - (index * 15) + Math.random() * 10), // Simular percentual de uso
    color: meat.color
  })).sort((a, b) => b.percentualUso - a.percentualUso);

  // Dados para alertas de baixo estoque
  const carnesBaixoEstoque = camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5));
  const estoqueBaixo = estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5));
  
  const temAlertas = carnesBaixoEstoque.length > 0 || estoqueBaixo.length > 0;

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
        {/* Gráfico de Barras - Todos os tipos de carne e quantidades */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Estoque por Tipo de Carne
            </CardTitle>
            <CardDescription>
              Quantidade disponível de cada tipo de carne (kg)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {meatTypesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={meatTypesData} margin={{ bottom: 80 }}>
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
                    <Tooltip 
                      formatter={(value) => [`${value}kg`, 'Quantidade']}
                      labelFormatter={(label) => `Carne: ${label}`}
                    />
                    <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                      {meatTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum item na câmara fria</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Top 5 carnes mais utilizadas */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              Top 5 Carnes Mais Utilizadas
            </CardTitle>
            <CardDescription>
              Carnes com maior percentual de utilização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {top5MeatUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={top5MeatUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ nome, percentualUso }) => `${nome}: ${percentualUso.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentualUso"
                    >
                      {top5MeatUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => {
                        const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                        return [`${numValue.toFixed(1)}%`, 'Utilização'];
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum dado de utilização disponível</p>
                  </div>
                </div>
              )}
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
