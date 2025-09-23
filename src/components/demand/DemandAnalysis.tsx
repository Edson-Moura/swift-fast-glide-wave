import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  BarChart3,
  RefreshCw,
  Calendar,
  Package
} from 'lucide-react';
import { useDemandForecast } from '@/hooks/useDemandForecast';

export const DemandAnalysis = () => {
  const { 
    demandForecasts, 
    loading, 
    updateForecasts, 
    getHighDemandProducts,
    getCriticalStockProducts 
  } = useDemandForecast();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high': 
        return <Badge variant="default" className="bg-green-100 text-green-800">Alta</Badge>;
      case 'medium': 
        return <Badge variant="secondary">Média</Badge>;
      default: 
        return <Badge variant="outline">Baixa</Badge>;
    }
  };

  const getStockoutUrgency = (days: number) => {
    if (days <= 3) return { color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Crítico' };
    if (days <= 7) return { color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Urgente' };
    if (days <= 14) return { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'Atenção' };
    return { color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'OK' };
  };

  const highDemandProducts = getHighDemandProducts(5);
  const criticalStockProducts = getCriticalStockProducts(14);

  const totalProducts = demandForecasts.length;
  const productsWithTrend = demandForecasts.filter(p => p.trend !== 'stable');
  const avgDailyConsumption = totalProducts > 0 
    ? demandForecasts.reduce((sum, p) => sum + p.daily_consumption_avg, 0) / totalProducts 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Analisando demanda...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Análise de Demanda</h2>
          <p className="text-muted-foreground">
            Previsões inteligentes baseadas no histórico de consumo
          </p>
        </div>
        <Button onClick={updateForecasts} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Previsões
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Analisados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {productsWithTrend.length} com tendência
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consumo Médio Diário</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyConsumption.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              unidades por dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalStockProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              risco de esgotamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendência Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {demandForecasts.filter(p => p.trend === 'increasing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              produtos em alta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Análise */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="high-demand">Alta Demanda</TabsTrigger>
          <TabsTrigger value="critical">Estoque Crítico</TabsTrigger>
          <TabsTrigger value="forecasts">Previsões Detalhadas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Produtos com Maior Demanda */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Top 5 - Maior Demanda</span>
                </CardTitle>
                <CardDescription>
                  Produtos com maior consumo médio diário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {highDemandProducts.map((product, index) => (
                    <div key={product.product_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.daily_consumption_avg.toFixed(1)} unidades/dia
                          </p>
                        </div>
                      </div>
                      {getTrendIcon(product.trend)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Produtos Críticos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Estoque Crítico</span>
                </CardTitle>
                <CardDescription>
                  Produtos com risco de esgotamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalStockProducts.slice(0, 5).map((product) => {
                    const urgency = getStockoutUrgency(product.days_until_stockout);
                    return (
                      <div key={product.product_id} className={`p-3 rounded-lg border ${urgency.bg}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{product.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Estoque: {product.current_stock} unidades
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className={urgency.color}>
                              {urgency.label}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {product.days_until_stockout} dias
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="high-demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produtos de Alta Demanda</CardTitle>
              <CardDescription>
                Análise detalhada dos produtos com maior consumo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getHighDemandProducts(10).map((product) => (
                  <div key={product.product_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{product.product_name}</h4>
                        {getTrendIcon(product.trend)}
                        {getConfidenceBadge(product.confidence_level)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Estoque Atual</p>
                        <p className="font-medium">{product.current_stock} unidades</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Consumo Diário</p>
                        <p className="font-medium">{product.daily_consumption_avg.toFixed(1)} un/dia</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Consumo Semanal</p>
                        <p className="font-medium">{product.weekly_consumption_avg.toFixed(1)} un/sem</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reposição Sugerida</p>
                        <p className="font-medium text-primary">{product.suggested_reorder_quantity} un</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Produtos com Estoque Crítico</span>
              </CardTitle>
              <CardDescription>
                Produtos que precisam de reposição urgente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getCriticalStockProducts(30).map((product) => {
                  const urgency = getStockoutUrgency(product.days_until_stockout);
                  return (
                    <div key={product.product_id} className={`p-4 border rounded-lg ${urgency.bg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{product.product_name}</h4>
                          <Badge variant="outline" className={urgency.color}>
                            {urgency.label}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Esgotamento Previsto</p>
                          <p className="font-medium">{formatDate(product.predicted_stockout_date)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Estoque Atual</p>
                          <p className="font-medium">{product.current_stock} un</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Consumo Diário</p>
                          <p className="font-medium">{product.daily_consumption_avg.toFixed(1)} un/dia</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dias Restantes</p>
                          <p className={`font-medium ${urgency.color}`}>{product.days_until_stockout} dias</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reposição Sugerida</p>
                          <p className="font-medium text-primary">{product.suggested_reorder_quantity} un</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progressão do consumo</span>
                          <span className={urgency.color}>{((product.current_stock / (product.current_stock + product.suggested_reorder_quantity)) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress 
                          value={((product.current_stock / (product.current_stock + product.suggested_reorder_quantity)) * 100)} 
                          className="mt-2" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsões Detalhadas</CardTitle>
              <CardDescription>
                Análise completa de demanda para todos os produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demandForecasts.map((product) => (
                  <div key={product.product_id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{product.product_name}</h4>
                        {getTrendIcon(product.trend)}
                        {getConfidenceBadge(product.confidence_level)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Previsão de Esgotamento</p>
                        <p className="font-medium">
                          {product.days_until_stockout > 0 
                            ? `${product.days_until_stockout} dias` 
                            : 'Sem previsão'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Estoque</p>
                        <p className="font-medium">{product.current_stock} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Diário</p>
                        <p className="font-medium">{product.daily_consumption_avg.toFixed(1)} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Semanal</p>
                        <p className="font-medium">{product.weekly_consumption_avg.toFixed(1)} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mensal</p>
                        <p className="font-medium">{product.monthly_consumption_avg.toFixed(0)} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reposição</p>
                        <p className="font-medium text-primary">{product.suggested_reorder_quantity} un</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};