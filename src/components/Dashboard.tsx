
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
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

// Configuração do chart moderno
const chartConfig = {
  quantidade: {
    label: "Quantidade (kg)",
  },
} as const;

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
        {/* Gráfico de Barras - Todos os tipos de carne e quantidades */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Estoque por Tipo de Carne
            </CardTitle>
            <CardDescription className="text-base">
              Quantidade disponível de cada tipo de carne (kg)
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-[400px]">
              {meatTypesData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <BarChart 
                    data={meatTypesData} 
                    margin={{ 
                      top: 20, 
                      right: 20, 
                      left: 20, 
                      bottom: 80 
                    }}
                    barCategoryGap="15%"
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="tipo" 
                      className="text-xs"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ 
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))'
                      }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ 
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))'
                      }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: any) => [
                        `${value.toLocaleString()}kg`, 
                        'Quantidade em Estoque'
                      ]}
                    />
                    <Bar 
                      dataKey="quantidade" 
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    >
                      {meatTypesData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhum item na câmara fria</p>
                    <p className="text-sm">Adicione itens para ver o gráfico</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Top 5 carnes mais utilizadas baseado no histórico real */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package className="w-6 h-6 text-green-500" />
              Top 5 Carnes Mais Utilizadas
            </CardTitle>
            <CardDescription className="text-base">
              Carnes com maior quantidade de saídas registradas
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="h-[400px]">
              {top5MeatUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={top5MeatUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={130}
                      innerRadius={70}
                      fill="#8884d8"
                      dataKey="totalSaidas"
                      strokeWidth={3}
                      stroke="hsl(var(--background))"
                    >
                      {top5MeatUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}kg`, 'Total de Saídas']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom"
                      height={50}
                      wrapperStyle={{
                        fontSize: '14px',
                        paddingTop: '20px'
                      }}
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
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhuma movimentação registrada</p>
                    <p className="text-sm">Registre saídas para ver o gráfico</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {temAlertas && (
        <Card className="shadow-lg border-0 border-l-4 border-l-orange-500">
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
