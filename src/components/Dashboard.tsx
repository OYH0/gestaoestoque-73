import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCamaraFriaData } from '@/hooks/useCamaraFriaData';
import { useCamaraFriaHistorico } from '@/hooks/useCamaraFriaHistorico';
import { useEstoqueSecoData } from '@/hooks/useEstoqueSecoData';
import { useDescartaveisData } from '@/hooks/useDescartaveisData';

// Cores fixas para os gráficos
const CHART_COLORS = [
  '#10b981', '#10b981', '#10b981', // Verde para os 3 primeiros
  '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', '#f59e0b', // Laranja para os próximos 5
  '#ef4444', '#ef4444', '#ef4444', '#ef4444', '#ef4444', '#ef4444', '#ef4444', '#ef4444', '#ef4444', '#ef4444' // Vermelho para o resto
];

const PIE_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'
];

export function Dashboard() {
  const isMobile = useIsMobile();
  const { items: camaraFriaItems } = useCamaraFriaData();
  const { historico: camaraFriaHistorico } = useCamaraFriaHistorico();
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
          quantidade: item.quantidade
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.quantidade - a.quantidade);

  // Debug: log dos dados para verificar
  console.log('Câmara Fria Items:', camaraFriaItems);
  console.log('Meat Types Data for Chart:', meatTypesData);
  console.log('Data has items:', meatTypesData.length > 0);
  console.log('First item sample:', meatTypesData[0]);

  // Top 5 carnes mais utilizadas baseado no histórico real de saídas
  const top5MeatUsage = camaraFriaHistorico
    .filter(item => item.tipo === 'saida') // Apenas saídas
    .reduce((acc, item) => {
      const existing = acc.find(a => a.nome === item.item_nome);
      if (existing) {
        existing.totalSaidas += item.quantidade;
      } else {
        acc.push({
          nome: item.item_nome,
          totalSaidas: item.quantidade
        });
      }
      return acc;
    }, [] as any[])
    .sort((a, b) => b.totalSaidas - a.totalSaidas)
    .slice(0, 5); // Top 5

  // Dados para alertas de baixo estoque
  const carnesBaixoEstoque = camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5));
  const estoqueBaixo = estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5));
  
  const temAlertas = carnesBaixoEstoque.length > 0 || estoqueBaixo.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center md:justify-end">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Sistema atualizado
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras Horizontais - Todos os tipos de carne e quantidades */}
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
            <div className="h-[600px] w-full">
              {meatTypesData && meatTypesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={meatTypesData} 
                    layout="vertical"
                    margin={{ 
                      top: 20, 
                      right: 50, 
                      left: 100, 
                      bottom: 20 
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      domain={[0, 'dataMax + 10']}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      type="category"
                      dataKey="tipo" 
                      width={90}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}kg`, 'Quantidade']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar 
                      dataKey="quantidade" 
                      fill="#3b82f6"
                      stroke="#2563eb"
                      strokeWidth={1}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum item na câmara fria</p>
                    <p className="text-xs mt-1">Total de itens: {camaraFriaItems?.length || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Top 5 carnes mais utilizadas baseado no histórico real */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-500" />
              Top 5 Carnes Mais Utilizadas
            </CardTitle>
            <CardDescription>
              Carnes com maior quantidade de saídas registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              {top5MeatUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={top5MeatUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="totalSaidas"
                      strokeWidth={2}
                      stroke="#ffffff"
                    >
                      {top5MeatUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}kg`, 'Total de Saídas']}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => {
                        const dataEntry = top5MeatUsage.find(item => item.totalSaidas === value);
                        return dataEntry ? dataEntry.nome : value;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma movimentação de saída registrada</p>
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
