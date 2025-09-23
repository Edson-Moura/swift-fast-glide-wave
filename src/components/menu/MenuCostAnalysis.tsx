import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMenu } from '@/hooks/useMenu';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

export const MenuCostAnalysis = () => {
  const { menuItems, isLoading } = useMenu();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getMarginColor = (margin: number) => {
    if (margin < 0) return 'text-red-600';
    if (margin < 20) return 'text-orange-600';
    if (margin < 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getMarginBadgeVariant = (margin: number) => {
    if (margin < 0) return 'destructive';
    if (margin < 20) return 'secondary';
    return 'default';
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando análise...</div>;
  }

  const totalItems = menuItems.length;
  const profitableItems = menuItems.filter(item => item.profit_margin > 0).length;
  const averageMargin = totalItems > 0 
    ? menuItems.reduce((sum, item) => sum + item.profit_margin, 0) / totalItems 
    : 0;
  
  const highMarginItems = menuItems.filter(item => item.profit_margin > 40);
  const lowMarginItems = menuItems.filter(item => item.profit_margin < 20);
  const negativeMarginItems = menuItems.filter(item => item.profit_margin < 0);

  const totalRevenue = menuItems.reduce((sum, item) => sum + item.sale_price, 0);
  const totalCost = menuItems.reduce((sum, item) => sum + item.cost_price, 0);

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pratos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {profitableItems} lucrativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMarginColor(averageMargin)}`}>
              {averageMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Margem de lucro média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Preços de venda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Custo dos ingredientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análise por categoria de margem */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Alta Margem (&gt;40%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {highMarginItems.length}
            </div>
            <Progress value={(highMarginItems.length / totalItems) * 100} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {((highMarginItems.length / totalItems) * 100).toFixed(1)}% do cardápio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-orange-600">Baixa Margem (&lt;20%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {lowMarginItems.length}
            </div>
            <Progress value={(lowMarginItems.length / totalItems) * 100} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {((lowMarginItems.length / totalItems) * 100).toFixed(1)}% do cardápio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Margem Negativa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {negativeMarginItems.length}
            </div>
            <Progress value={(negativeMarginItems.length / totalItems) * 100} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {((negativeMarginItems.length / totalItems) * 100).toFixed(1)}% do cardápio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada por Prato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {menuItems
              .sort((a, b) => a.profit_margin - b.profit_margin)
              .map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant={getMarginBadgeVariant(item.profit_margin)}>
                        {item.profit_margin.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Custo</p>
                      <p className="font-medium">{formatCurrency(item.cost_price)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Venda</p>
                      <p className="font-medium">{formatCurrency(item.sale_price)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Lucro</p>
                      <p className={`font-medium ${getMarginColor(item.profit_margin)}`}>
                        {formatCurrency(item.sale_price - item.cost_price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};