import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Package, Target } from 'lucide-react';
import { PricingSummary } from '@/hooks/usePriceManagement';

interface PricingDashboardProps {
  summary: PricingSummary;
}

export const PricingDashboard = ({ summary }: PricingDashboardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total de Itens */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total_items}</div>
          <p className="text-xs text-muted-foreground">
            Produtos no sistema
          </p>
        </CardContent>
      </Card>

      {/* Itens Precisando Ajuste */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Precisam Ajuste</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {summary.items_needing_update}
          </div>
          <p className="text-xs text-muted-foreground">
            Margem abaixo do ideal
          </p>
        </CardContent>
      </Card>

      {/* Margem Média */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold">{summary.average_margin}%</div>
            {summary.average_margin >= 25 ? (
              <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive ml-2" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            <Badge variant={summary.average_margin >= 25 ? 'default' : 'destructive'} className="text-xs">
              {summary.average_margin >= 25 ? 'Saudável' : 'Baixa'}
            </Badge>
          </p>
        </CardContent>
      </Card>

      {/* Receita Potencial */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Potencial</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            R$ {summary.total_potential_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Com preços sugeridos
          </p>
        </CardContent>
      </Card>

      {/* Inflação de Custos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inflação de Custos</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-2xl font-bold">{summary.cost_inflation_trend}%</div>
            <Badge variant="outline" className="text-xs ml-2">
              Último mês
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Tendência de aumento
          </p>
        </CardContent>
      </Card>

      {/* Alertas de Preço */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.items_needing_update > 0 ? (
              <Badge variant="destructive" className="w-full justify-center">
                Ação Necessária
              </Badge>
            ) : (
              <Badge variant="default" className="w-full justify-center">
                Preços Otimizados
              </Badge>
            )}
            <p className="text-xs text-muted-foreground text-center">
              {summary.items_needing_update > 0 
                ? `${summary.items_needing_update} itens precisam de revisão`
                : 'Todos os preços estão otimizados'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};