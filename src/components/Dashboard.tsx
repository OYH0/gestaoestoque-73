
import React, { useMemo } from 'react';
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

// Função para determinar a cor baseada na quantidade
const getColorByQuantity = (quantidade: number, maxQuantity: number) => {
  const percentage = quantidade / maxQuantity;
  
  if (percentage >= 0.7) {
    return '#10b981'; // Verde para alta quantidade (70%+)
  } else if (percentage >= 0.4) {
    return '#f59e0b'; // Laranja para média quantidade (40-70%)
  } else if (percentage >= 0.1) {
    return '#ef4444'; // Vermelho para baixa quantidade (10-40%)
  } else {
    return '#991b1b'; // Vermelho escuro para quantidade muito baixa (<10%)
  }
};

const PIE_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'
];

// Função para abreviar nomes longos
const abreviarNome = (nome: string): string => {
  const abreviacoes: { [key: string]: string } = {
    'Filé de Peito': 'Peito',
    'Coxa e Sobrecoxa': 'Sobrecoxa',
    'Coração de Frango': 'Coração',
    'Coração de Frango ': 'Coração', // Versão com espaço no final
    'Picanha Suína': 'Picanha Suína',
    'Coxão Duro': 'Coxão Duro',
    'Costela Janelinha': 'Costela Jan.',
    'Alcatra com Maminha': 'Alcatra c/ Mam.',
    'Capa de Filé G': 'Capa Filé G',
    'Linguiça Mista': 'Linguiça Mista',
    'Costelão Bovino 9': 'Costelão Bovino',
    'Cupim': 'Cupim',
    'Contra Filé': 'Contra Filé',
    'Coxinha da Asa': 'Coxinha Asa',
    'Fralda': 'Fralda',
    'Capa de Filé P': 'Capa Filé P',
    'Costela Suína': 'Costela Suína',
    'Coxão Mole': 'Coxão Mole',
    'Picanha Bovina': 'Picanha Bov.',
    'Linguiça de Frango': 'Ling. Frango',
    'Pernil Suíno': 'Pernil Suíno',
    'Linguiça Apimentada': 'Ling. Apiment.',
    'Maminha da Alcatra': 'Maminha Alc.'
  };
  
  return abreviacoes[nome] || nome;
};

export function Dashboard() {
  const isMobile = useIsMobile();
  const { items: camaraFriaItems } = useCamaraFriaData();
  const { historico: camaraFriaHistorico } = useCamaraFriaHistorico();
  const { items: estoqueSecoItems } = useEstoqueSecoData();
  const { items: descartaveisItems } = useDescartaveisData();

  // Memorizar processamento dos dados para gráfico de barras
  const meatTypesDataWithColors = useMemo(() => {
    const meatTypesData = camaraFriaItems
      .reduce((acc, item) => {
        const existing = acc.find(a => a.tipo === item.nome);
        if (existing) {
          existing.quantidade += item.quantidade;
        } else {
          acc.push({ 
            tipo: item.nome, 
            tipoAbrev: abreviarNome(item.nome),
            quantidade: item.quantidade
          });
        }
        return acc;
      }, [] as any[])
      .sort((a, b) => b.quantidade - a.quantidade);

    const maxQuantity = Math.max(...meatTypesData.map(item => item.quantidade));

    return meatTypesData.map(item => ({
      ...item,
      fill: getColorByQuantity(item.quantidade, maxQuantity)
    }));
  }, [camaraFriaItems]);

  // Memorizar processamento do Top 5 carnes
  const top5MeatUsageWithPercentage = useMemo(() => {
    const top5MeatUsage = camaraFriaHistorico
      .filter(item => item.tipo === 'saida')
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
      .slice(0, 5);

    const totalSaidas = top5MeatUsage.reduce((acc, item) => acc + item.totalSaidas, 0);

    return top5MeatUsage.map(item => ({
      ...item,
      percentage: totalSaidas > 0 ? ((item.totalSaidas / totalSaidas) * 100).toFixed(1) : 0
    }));
  }, [camaraFriaHistorico]);

  // Memorizar dados de alertas
  const alertsData = useMemo(() => {
    const carnesBaixoEstoque = camaraFriaItems.filter(item => item.quantidade <= (item.minimo || 5));
    const estoqueBaixo = estoqueSecoItems.filter(item => item.quantidade <= (item.minimo || 5));
    const temAlertas = carnesBaixoEstoque.length > 0 || estoqueBaixo.length > 0;

    return { carnesBaixoEstoque, estoqueBaixo, temAlertas };
  }, [camaraFriaItems, estoqueSecoItems]);

  // Componente do gráfico de barras
  const BarChartCard = useMemo(() => (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Estoque por Tipo de Carne
        </CardTitle>
        <CardDescription>
          Quantidade disponível de cada tipo de carne (pç)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] w-full">
          {meatTypesDataWithColors && meatTypesDataWithColors.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={meatTypesDataWithColors} 
                layout="vertical"
                margin={{ 
                  top: 20, 
                  right: 20, 
                  left: 10, 
                  bottom: 20 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  domain={[0, 'dataMax + 10']}
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  type="category"
                  dataKey="tipoAbrev" 
                  width={50}
                  tick={{ fontSize: 10 }}
                  interval={0}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}pç`, 'Quantidade']}
                  labelFormatter={(label) => {
                    const item = meatTypesDataWithColors.find(d => d.tipoAbrev === label);
                    return item ? item.tipo : label;
                  }}
                />
                <Bar 
                  dataKey="quantidade" 
                  stroke="#ffffff"
                  strokeWidth={1}
                  radius={[0, 12, 12, 0]} // Somente extremidade direita arredondada
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
  ), [meatTypesDataWithColors, camaraFriaItems]);

  // Componente do gráfico de pizza
  const PieChartCard = useMemo(() => (
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
          {top5MeatUsageWithPercentage.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={top5MeatUsageWithPercentage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.percentage}%`}
                      outerRadius={80}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="totalSaidas"
                      strokeWidth={2}
                      stroke="#ffffff"
                      cornerRadius={4} // Reduzido para bordas menos arredondadas
                    >
                      {top5MeatUsageWithPercentage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value}pç (${props.payload.percentage}%)`, 
                        'Total de Saídas'
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return payload[0].payload.nome;
                        }
                        return label;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                {top5MeatUsageWithPercentage.map((item, index) => (
                  <div key={index} className="flex items-center justify-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-center">
                      {item.nome} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
  ), [top5MeatUsageWithPercentage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center md:justify-end">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-green-500" />
          Sistema atualizado
        </div>
      </div>

      {/* Gráficos com ordem diferente para mobile e desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isMobile ? (
          <>
            {PieChartCard}
            {BarChartCard}
          </>
        ) : (
          <>
            {BarChartCard}
            {PieChartCard}
          </>
        )}
      </div>

      {/* Alertas */}
      {alertsData.temAlertas && (
        <Card className="shadow-md border-0 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Alertas de Baixo Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alertsData.carnesBaixoEstoque.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Câmara Fria - Carnes</h4>
                  <div className="space-y-2">
                    {alertsData.carnesBaixoEstoque.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            Estoque atual: {item.quantidade}pç | Mínimo: {item.minimo || 5}pç
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {alertsData.estoqueBaixo.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Estoque Seco</h4>
                  <div className="space-y-2">
                    {alertsData.estoqueBaixo.map((item, index) => (
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
