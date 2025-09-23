import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trash2, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  BarChart3,
  Target
} from 'lucide-react';
import { useWasteTracking } from '@/hooks/useWasteTracking';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CATEGORY_COLORS = {
  expired: '#ef4444',
  preparation_error: '#f97316', 
  spoiled: '#eab308',
  damaged: '#8b5cf6',
  other: '#6b7280'
};

const CATEGORY_LABELS = {
  expired: 'Validade Vencida',
  preparation_error: 'Erro no Preparo',
  spoiled: 'Estragado',
  damaged: 'Danificado',
  other: 'Outro'
};

const WasteReports = () => {
  const { statistics, suggestions, fetchStatistics, fetchSuggestions, loading } = useWasteTracking();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    handleFilter();
  }, []);

  const handleFilter = () => {
    fetchStatistics(dateRange.startDate, dateRange.endDate);
    fetchSuggestions();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const categoryChartData = statistics?.waste_by_category 
    ? Object.entries(statistics.waste_by_category).map(([category, cost]) => ({
        category: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category,
        cost: Number(cost),
        fill: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6b7280'
      }))
    : [];

  const reasonChartData = statistics?.waste_by_reason 
    ? Object.entries(statistics.waste_by_reason).map(([reason, cost]) => ({
        reason: reason.length > 20 ? reason.substring(0, 20) + '...' : reason,
        cost: Number(cost)
      }))
    : [];

  const dailyTrendData = statistics?.daily_waste_trend 
    ? Object.entries(statistics.daily_waste_trend)
        .map(([date, cost]) => ({
          date: new Date(date).toLocaleDateString('pt-BR'),
          cost: Number(cost)
        }))
        .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - 
                        new Date(b.date.split('/').reverse().join('-')).getTime())
    : [];

  return (
    <div className="space-y-6">
      {/* Filtros de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <Button onClick={handleFilter} disabled={loading}>
              {loading ? 'Carregando...' : 'Filtrar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-destructive">
                  R$ {statistics?.total_waste_cost?.toFixed(2) || '0,00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Itens Desperdiçados</p>
                <p className="text-2xl font-bold">
                  {statistics?.total_items_wasted || 0}
                </p>
              </div>
              <Trash2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Item Mais Desperdiçado</p>
                <p className="text-lg font-semibold">
                  {statistics?.most_wasted_item || 'N/A'}
                </p>
                <p className="text-sm text-destructive">
                  R$ {statistics?.most_wasted_item_cost?.toFixed(2) || '0,00'}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sugestões</p>
                <p className="text-2xl font-bold text-primary">
                  {suggestions.length}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="reasons">Por Motivo</TabsTrigger>
          <TabsTrigger value="trends">Tendência</TabsTrigger>
          <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desperdício por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, cost }) => `${category}: R$ ${cost.toFixed(2)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cost"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Custo']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado de desperdício encontrado para o período selecionado.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reasons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desperdício por Motivo</CardTitle>
            </CardHeader>
            <CardContent>
              {reasonChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reasonChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="reason" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Custo']} />
                    <Bar dataKey="cost" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado de desperdício encontrado para o período selecionado.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência Diária de Desperdício</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Custo']} />
                    <Bar dataKey="cost" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum dado de tendência encontrado para o período selecionado.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Sugestões para Redução de Desperdício
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length > 0 ? (
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority === 'high' ? 'Alta' : 
                           suggestion.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Economia Estimada</p>
                          <p className="font-bold text-green-600">
                            R$ {suggestion.estimated_savings.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm">{suggestion.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma sugestão disponível no momento. Continue registrando desperdícios para receber recomendações personalizadas.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WasteReports;