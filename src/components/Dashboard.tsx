
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Snowflake, Thermometer, Package, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';

const stockData = [
  { name: 'Coração de Frango', quantidade: 38, tipo: 'Câmara Fria' },
  { name: 'Costela Bovina', quantidade: 13, tipo: 'Câmara Fria' },
  { name: 'Capa de Filé', quantidade: 30, tipo: 'Câmara Fria' },
  { name: 'Arroz', quantidade: 25, tipo: 'Estoque Seco' },
  { name: 'Feijão', quantidade: 15, tipo: 'Estoque Seco' },
  { name: 'Pratos Descartáveis', quantidade: 200, tipo: 'Descartáveis' },
];

const pieData = [
  { name: 'Capa de Filé', value: 164, color: '#ef4444' },
  { name: 'Filé de Peito', value: 118, color: '#f97316' },
  { name: 'Coxa e Sobrecoxa', value: 81, color: '#eab308' },
  { name: 'Maminha da Alcatra', value: 58, color: '#22c55e' },
  { name: 'Coração de Frango', value: 38, color: '#3b82f6' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Visão geral do seu estoque de churrasco</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Câmara Fria</CardTitle>
            <Snowflake className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15 itens</div>
            <p className="text-xs opacity-80">Carnes congeladas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Câmara Refrigerada</CardTitle>
            <Thermometer className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8 itens</div>
            <p className="text-xs opacity-80">Descongelando</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Seco</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 itens</div>
            <p className="text-xs opacity-80">Não perecíveis</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descartáveis</CardTitle>
            <Trash2 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6 itens</div>
            <p className="text-xs opacity-80">Utensílios</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-red-500" />
              Estoque Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Bar dataKey="quantidade" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Top 5 Carnes Mais Consumidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}kg</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
              <div>
                <p className="font-medium text-gray-900">Linguiça de Frango</p>
                <p className="text-sm text-gray-600">Estoque baixo na câmara fria</p>
              </div>
              <span className="text-orange-600 font-bold">0 kg</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
              <div>
                <p className="font-medium text-gray-900">Pratos Descartáveis</p>
                <p className="text-sm text-gray-600">Necessário reposição</p>
              </div>
              <span className="text-orange-600 font-bold">50 unid</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
