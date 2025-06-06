import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Snowflake, Thermometer, Package, Trash2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Dados de quantidade por tipo de carne da Câmara Fria
const meatTypesData = [
  { tipo: 'Coração de Frango', quantidade: 45 },
  { tipo: 'Costela Bovina', quantidade: 30 },
  { tipo: 'Picanha Suína', quantidade: 25 },
  { tipo: 'Capa de Filé', quantidade: 40 },
  { tipo: 'Coxão Mole', quantidade: 15 },
  { tipo: 'Coxa e Sobrecoxa', quantidade: 35 },
];

// Top 5 carnes mais utilizadas
const topMeatsData = [
  { name: 'Coração de Frango', value: 247, color: '#3b82f6' },
  { name: 'Capa de Filé', value: 230, color: '#10b981' },
  { name: 'Coxa e Sobrecoxa', value: 165, color: '#f59e0b' },
  { name: 'Costela Bovina', value: 163, color: '#ef4444' },
  { name: 'Picanha Suína', value: 109, color: '#8b5cf6' },
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
                  <Bar dataKey="quantidade" fill="#3b82f6" radius={[2, 2, 0, 0]} />
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
      <Card className="shadow-md border-0 border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="w-5 h-5" />
            Alertas do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Estoque Seco com baixa capacidade</p>
                <p className="text-xs text-muted-foreground">Apenas 45% da capacidade utilizada</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Câmara Fria operando normalmente</p>
                <p className="text-xs text-muted-foreground">Temperatura estável em -18°C</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
