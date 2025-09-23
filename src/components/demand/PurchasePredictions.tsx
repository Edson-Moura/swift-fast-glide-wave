import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  ShoppingCart,
  AlertCircle,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useDemandForecast } from '@/hooks/useDemandForecast';

interface PurchaseRecommendation {
  product_id: string;
  product_name: string;
  current_stock: number;
  suggested_quantity: number;
  estimated_cost: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  reason: string;
  days_until_needed: number;
  supplier_suggestion?: string;
}

export const PurchasePredictions = () => {
  const { demandForecasts, loading } = useDemandForecast();
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Gerar recomendações de compra baseadas nas previsões
  const generatePurchaseRecommendations = (): PurchaseRecommendation[] => {
    return demandForecasts.map(forecast => {
      let priority: 'urgent' | 'high' | 'medium' | 'low' = 'low';
      let reason = 'Reposição regular baseada no consumo histórico';
      
      // Determinar prioridade
      if (forecast.days_until_stockout <= 3 && forecast.days_until_stockout > 0) {
        priority = 'urgent';
        reason = 'Estoque crítico - pode esgotar em menos de 3 dias';
      } else if (forecast.days_until_stockout <= 7 && forecast.days_until_stockout > 0) {
        priority = 'high';
        reason = 'Estoque baixo - necessária reposição em breve';
      } else if (forecast.trend === 'increasing') {
        priority = 'medium';
        reason = 'Demanda crescente - aumentar estoque preventivamente';
      }

      // Calcular custo estimado (simulado - seria baseado no custo por unidade)
      const estimatedCost = forecast.suggested_reorder_quantity * 10; // Valor exemplo

      return {
        product_id: forecast.product_id,
        product_name: forecast.product_name,
        current_stock: forecast.current_stock,
        suggested_quantity: forecast.suggested_reorder_quantity,
        estimated_cost: estimatedCost,
        priority,
        reason,
        days_until_needed: forecast.days_until_stockout > 0 ? forecast.days_until_stockout : 30,
        supplier_suggestion: 'Fornecedor Padrão' // Seria baseado em dados reais
      };
    }).filter(rec => rec.suggested_quantity > 0);
  };

  const purchaseRecommendations = generatePurchaseRecommendations();
  
  // Filtrar por prioridade
  const filteredRecommendations = selectedPriority === 'all' 
    ? purchaseRecommendations 
    : purchaseRecommendations.filter(rec => rec.priority === selectedPriority);

  // Agrupar por prioridade
  const urgentRecommendations = purchaseRecommendations.filter(rec => rec.priority === 'urgent');
  const highPriorityRecommendations = purchaseRecommendations.filter(rec => rec.priority === 'high');
  const mediumPriorityRecommendations = purchaseRecommendations.filter(rec => rec.priority === 'medium');

  // Calcular totais
  const totalEstimatedCost = purchaseRecommendations.reduce((sum, rec) => sum + rec.estimated_cost, 0);
  const totalItems = purchaseRecommendations.reduce((sum, rec) => sum + rec.suggested_quantity, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      default: return 'Baixa';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'medium': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      default: return <Package className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando previsões...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Previsões de Compras</h2>
          <p className="text-muted-foreground">
            Recomendações inteligentes para evitar falta de produtos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens para Comprar</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalItems} unidades total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Estimado</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstimatedCost)}</div>
            <p className="text-xs text-muted-foreground">
              Valor aproximado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Urgentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              Precisam ser feitas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highPriorityRecommendations.length}</div>
            <p className="text-xs text-muted-foreground">
              Próximos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Recomendações */}
      <Tabs defaultValue="priority" className="space-y-4">
        <TabsList>
          <TabsTrigger value="priority">Por Prioridade</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="cost">Por Custo</TabsTrigger>
        </TabsList>

        <TabsContent value="priority" className="space-y-4">
          {/* Urgentes */}
          {urgentRecommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Compras Urgentes</span>
                </CardTitle>
                <CardDescription>
                  Estes produtos podem esgotar nos próximos 3 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {urgentRecommendations.map((rec) => (
                    <div key={rec.product_id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{rec.product_name}</h4>
                          <Badge variant="destructive">Urgente</Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(rec.estimated_cost)}</p>
                          <p className="text-sm text-muted-foreground">{rec.suggested_quantity} unidades</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Estoque Atual</p>
                          <p className="font-medium">{rec.current_stock} un</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dias Restantes</p>
                          <p className="font-medium text-red-600">{rec.days_until_needed} dias</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fornecedor</p>
                          <p className="font-medium">{rec.supplier_suggestion}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Todas as recomendações filtradas */}
          <Card>
            <CardHeader>
              <CardTitle>Todas as Recomendações</CardTitle>
              <CardDescription>
                {filteredRecommendations.length} recomendações de compra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRecommendations.map((rec) => (
                  <div key={rec.product_id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getPriorityIcon(rec.priority)}
                        <h4 className="font-medium">{rec.product_name}</h4>
                        <Badge variant={getPriorityColor(rec.priority)}>
                          {getPriorityLabel(rec.priority)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(rec.estimated_cost)}</p>
                        <p className="text-sm text-muted-foreground">{rec.suggested_quantity} unidades</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Estoque Atual</p>
                        <p className="font-medium">{rec.current_stock} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Comprar</p>
                        <p className="font-medium text-primary">{rec.suggested_quantity} un</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Prazo</p>
                        <p className="font-medium">{rec.days_until_needed} dias</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fornecedor</p>
                        <p className="font-medium">{rec.supplier_suggestion}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-2">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Cronograma de Compras</span>
              </CardTitle>
              <CardDescription>
                Organize suas compras por urgência temporal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Hoje/Urgente */}
                {urgentRecommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-red-600 mb-3">Comprar Hoje</h3>
                    <div className="space-y-2 ml-4 border-l-2 border-red-200 pl-4">
                      {urgentRecommendations.map((rec) => (
                        <div key={rec.product_id} className="p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{rec.product_name}</span>
                            <span className="text-sm">{rec.suggested_quantity} un - {formatCurrency(rec.estimated_cost)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Esta Semana */}
                {highPriorityRecommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-orange-600 mb-3">Esta Semana</h3>
                    <div className="space-y-2 ml-4 border-l-2 border-orange-200 pl-4">
                      {highPriorityRecommendations.map((rec) => (
                        <div key={rec.product_id} className="p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{rec.product_name}</span>
                            <span className="text-sm">{rec.suggested_quantity} un - {formatCurrency(rec.estimated_cost)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Este Mês */}
                {mediumPriorityRecommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-yellow-600 mb-3">Este Mês</h3>
                    <div className="space-y-2 ml-4 border-l-2 border-yellow-200 pl-4">
                      {mediumPriorityRecommendations.map((rec) => (
                        <div key={rec.product_id} className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{rec.product_name}</span>
                            <span className="text-sm">{rec.suggested_quantity} un - {formatCurrency(rec.estimated_cost)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recomendações por Custo</CardTitle>
              <CardDescription>
                Ordenadas por valor estimado (maior para menor)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredRecommendations
                  .sort((a, b) => b.estimated_cost - a.estimated_cost)
                  .map((rec) => (
                    <div key={rec.product_id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{rec.product_name}</h4>
                          <Badge variant={getPriorityColor(rec.priority)}>
                            {getPriorityLabel(rec.priority)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{formatCurrency(rec.estimated_cost)}</p>
                          <p className="text-sm text-muted-foreground">{rec.suggested_quantity} unidades</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
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