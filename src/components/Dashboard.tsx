import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Snowflake, Thermometer, Package, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

// Dados de quantidade por tipo de carne da Câmara Fria - ordenados da maior para menor quantidade
const meatTypesData = [
  { tipo: 'Coração de Frango', quantidade: 45, color: '#3b82f6' },
  { tipo: 'Capa de Filé', quantidade: 40, color: '#10b981' },
  { tipo: 'Coxa e Sobrecoxa', quantidade: 35, color: '#f59e0b' },
  { tipo: 'Costela Bovina', quantidade: 30, color: '#ef4444' },
  { tipo: 'Picanha Suína', quantidade: 25, color: '#8b5cf6' },
  { tipo: 'Filé de Peito', quantidade: 22, color: '#06b6d4' },
  { tipo: 'Coxão Mole', quantidade: 15, color: '#84cc16' },
  { tipo: 'Alcatra com Maminha', quantidade: 4, color: '#f97316' },
];

// Top 5 carnes mais utilizadas
const topMeatsData = [
  { name: 'Coração de Frango', value: 247, color: '#3b82f6' },
  { name: 'Capa de Filé', value: 230, color: '#10b981' },
  { name: 'Coxa e Sobrecoxa', value: 165, color: '#f59e0b' },
  { name: 'Costela Bovina', value: 163, color: '#ef4444' },
  { name: 'Picanha Suína', value: 109, color: '#8b5cf6' },
];

// Dados para alertas de baixo estoque
const camaraFriaItems = [
  { name: 'Coração de Frango', quantidade: 38, minimo: 40 },
  { name: 'Costela Bovina', quantidade: 13, minimo: 30 },
  { name: 'Picanha Suína', quantidade: 0, minimo: 25 },
  { name: 'Capa de Filé', quantidade: 30, minimo: 40 },
  { name: 'Coxão Mole', quantidade: 2, minimo: 15 },
  { name: 'Coxa e Sobrecoxa', quantidade: 7, minimo: 35 },
  { name: 'Alcatra com Maminha', quantidade: 4, minimo: 10 },
  { name: 'Filé de Peito', quantidade: 22, minimo: 25 },
];

const estoqueSecoItems = [
  { name: 'Arroz Branco', quantidade: 25, minimo: 10 },
  { name: 'Feijão Preto', quantidade: 15, minimo: 8 },
  { name: 'Feijão Carioca', quantidade: 12, minimo: 8 },
  { name: 'Farinha de Mandioca', quantidade: 8, minimo: 5 },
  { name: 'Farinha de Trigo', quantidade: 5, minimo: 3 },
  { name: 'Macarrão Espaguete', quantidade: 10, minimo: 5 },
  { name: 'Macarrão Penne', quantidade: 8, minimo: 5 },
  { name: 'Sal Grosso', quantidade: 20, minimo: 10 },
  { name: 'Açúcar Cristal', quantidade: 18, minimo: 8 },
  { name: 'Óleo de Soja', quantidade: 6, minimo: 4 },
];

const stockData = [
  { name: 'Câmara Fria', value: 85, color: '#3b82f6' },
  { name: 'Câmara Refrigerada', value: 65, color: '#10b981' },
  { name: 'Estoque Seco', value: 45, color: '#f59e0b' },
  { name: 'Descartáveis', value: 70, color: '#ef4444' },
];

const monthlyData = [
  { month: 'Jan', camaraFria: 400, camaraRef: 240, estoqueSeco: 200, descartaveis: 150 },
  { month: 'Fev', camaraFria: 300, camaraRef: 139, estoqueSeco: 180, descartaveis: 120 },
  { month: 'Mar', camaraFria: 200, camaraRef: 980, estoqueSeco: 220, descartaveis: 200 },
  { month: 'Abr', camaraFria: 278, camaraRef: 390, estoqueSeco: 250, descartaveis: 180 },
  { month: 'Mai', camaraFria: 189, camaraRef: 480, estoqueSeco: 210, descartaveis: 160 },
  { month: 'Jun', camaraFria: 239, camaraRef: 380, estoqueSeco: 190, descartaveis: 140 },
];

const statsCards = [
  {
    title: 'Câmara Fria',
    value: '24',
    description: 'Produtos armazenados',
    icon: Snowflake,
    progress: 85,
    trend: '+12%',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
  },
  {
    title: 'Câmara Refrigerada',
    value: '18',
    description: 'Em descongelamento',
    icon: Thermometer,
    progress: 65,
    trend: '+8%',
    color: 'from-green-500 to-green-600',
    bgColor: 'from-green-50 to-green-100',
  },
  {
    title: 'Estoque Seco',
    value: '156',
    description: 'Itens diversos',
    icon: Package,
    progress: 45,
    trend: '-3%',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-50 to-orange-100',
  },
  {
    title: 'Descartáveis',
    value: '89',
    description: 'Unidades disponíveis',
    icon: Trash2,
    progress: 70,
    trend: '+15%',
    color: 'from-red-500 to-red-600',
    bgColor: 'from-red-50 to-red-100',
  },
];

export function Dashboard() {
  const isMobile = useIsMobile();
  
  // Filtrar itens com baixo estoque
  const carnesBaixoEstoque = camaraFriaItems.filter(item => item.quantidade <= item.minimo);
  const estoqueBaixo = estoqueSecoItems.filter(item => item.quantidade <= item.minimo);
  
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

      {/* Cards de Estatísticas - Hidden on mobile */}
      {!isMobile && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <span>{card.progress}%</span>
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

        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              Top 5 Carnes Mais Utilizadas
            </CardTitle>
            <CardDescription>
              Carnes com maior movimentação (kg total)
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
                      dataKey="value"
                    >
                      {topMeatsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
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
                      <div className="text-sm font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.value}kg</div>
                    </div>
                  </div>
                ))}
              </div>
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
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Estoque atual: {item.quantidade}kg | Mínimo: {item.minimo}kg
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
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Estoque atual: {item.quantidade} | Mínimo: {item.minimo}
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
