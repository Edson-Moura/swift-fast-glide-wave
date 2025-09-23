import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign,
  Activity,
  Bell
} from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalItems: number;
    lowStockItems: number;
    expiredItems: number;
    totalValue: number;
    topConsumingItems: Array<{
      name: string;
      quantity: number;
      unit: string;
    }>;
    alertsSummary: {
      total: number;
      unread: number;
      byType: Record<string, number>;
    };
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStockHealthColor = () => {
    const percentage = (stats.lowStockItems / stats.totalItems) * 100;
    if (percentage > 20) return 'text-destructive';
    if (percentage > 10) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <p className="text-xs text-muted-foreground">
            Itens no estoque
          </p>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getStockHealthColor()}`}>
            {stats.lowStockItems}
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round((stats.lowStockItems / stats.totalItems) * 100)}% do estoque
          </p>
        </CardContent>
      </Card>

      {/* Expired Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Itens Vencidos</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {stats.expiredItems}
          </div>
          <p className="text-xs text-muted-foreground">
            Requer atenção imediata
          </p>
        </CardContent>
      </Card>

      {/* Total Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor do estoque atual
          </p>
        </CardContent>
      </Card>

      {/* Top Consuming Items */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Itens Mais Consumidos (7 dias)</span>
          </CardTitle>
          <CardDescription>
            Items com maior consumo na última semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topConsumingItems.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.quantity} {item.unit}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Summary */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Resumo de Alertas</span>
          </CardTitle>
          <CardDescription>
            Status dos alertas do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Total de Alertas</span>
              <Badge variant="secondary">{stats.alertsSummary.total}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Não Lidos</span>
              <Badge variant={stats.alertsSummary.unread > 0 ? "destructive" : "secondary"}>
                {stats.alertsSummary.unread}
              </Badge>
            </div>
            <div className="space-y-2">
              {Object.entries(stats.alertsSummary.byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};