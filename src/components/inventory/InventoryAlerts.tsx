import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, Clock, Package, Eye, EyeOff, Bell, BellOff, ShoppingCart, TrendingUp, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InventoryAlertsProps {
  compact?: boolean;
}

const InventoryAlerts = ({ compact = false }: InventoryAlertsProps) => {
  const { 
    alerts, 
    unreadCount, 
    criticalCount, 
    markAllAsRead,
    showToastNotifications,
    setShowToastNotifications
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'by_type'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.is_read;
    if (filter === 'critical') return alert.priority === 'critical';
    if (filter === 'by_type' && typeFilter !== 'all') return alert.type === typeFilter;
    return true;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'out_of_stock': return <X className="h-4 w-4 text-red-600" />;
      case 'expired': return <Calendar className="h-4 w-4 text-red-600" />;
      case 'expiring_soon': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'restock_suggestion': return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'high_sales': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertBadgeVariant = (type: string, priority: string) => {
    if (priority === 'critical') return 'destructive';
    if (type === 'low_stock' || type === 'expired' || type === 'out_of_stock') return 'destructive';
    if (type === 'expiring_soon') return 'secondary';
    if (type === 'high_sales') return 'default';
    return 'outline';
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return 'Médio';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'low_stock': return 'Estoque Baixo';
      case 'out_of_stock': return 'Sem Estoque';
      case 'expired': return 'Vencido';
      case 'expiring_soon': return 'Vencendo';
      case 'restock_suggestion': return 'Sugestão de Reposição';
      case 'high_sales': return 'Vendas Altas';
      default: return 'Outro';
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Alertas Recentes</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {criticalCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalCount} Críticos
            </Badge>
          )}
        </div>

        {filteredAlerts.slice(0, 5).map((alert) => (
          <div key={alert.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
            !alert.is_read ? 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20' : 'hover:bg-muted/50'
          }`}>
            <div className="flex items-center space-x-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="font-medium text-sm">{alert.product_name}</p>
                  {alert.action_required && (
                    <Badge variant="outline" className="text-xs">
                      Ação Necessária
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{alert.message}</p>
              </div>
            </div>
            <Badge variant={getAlertBadgeVariant(alert.type, alert.priority)} className="text-xs shrink-0">
              {getPriorityLabel(alert.priority)}
            </Badge>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum alerta ativo</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span>Sistema de Alertas</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount} não lidos
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Monitore automaticamente seu inventário e receba alertas inteligentes
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="toast-notifications"
                  checked={showToastNotifications}
                  onCheckedChange={setShowToastNotifications}
                />
                <Label htmlFor="toast-notifications" className="text-sm">
                  {showToastNotifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Label>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Marcar todos como lidos
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats resumidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">{alerts.length}</div>
              <div className="text-sm text-muted-foreground">Total de Alertas</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-500">{criticalCount}</div>
              <div className="text-sm text-muted-foreground">Críticos</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">{alerts.filter(a => a.type === 'expiring_soon').length}</div>
              <div className="text-sm text-muted-foreground">Vencendo</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{alerts.filter(a => a.type === 'restock_suggestion').length}</div>
              <div className="text-sm text-muted-foreground">Sugestões</div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todos ({alerts.length})
            </Button>
            <Button 
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="flex items-center space-x-2"
            >
              <EyeOff className="h-4 w-4" />
              <span>Não lidos ({unreadCount})</span>
            </Button>
            <Button 
              variant={filter === 'critical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('critical')}
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Críticos ({criticalCount})</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum alerta encontrado</h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Tudo está funcionando perfeitamente! 🎉' : 
                 filter === 'unread' ? 'Não há alertas não lidos.' : 
                 filter === 'critical' ? 'Não há alertas críticos.' :
                 'Nenhum alerta para o filtro selecionado.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`transition-all ${
              !alert.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''
            } ${alert.priority === 'critical' ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap">
                        <h4 className="font-medium text-sm">{alert.product_name}</h4>
                        <Badge variant={getAlertBadgeVariant(alert.type, alert.priority)} className="text-xs">
                          {getPriorityLabel(alert.priority)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(alert.type)}
                        </Badge>
                        {!alert.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            Novo
                          </Badge>
                        )}
                        {alert.action_required && (
                          <Badge variant="destructive" className="text-xs">
                            Ação Necessária
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 break-words">
                        {alert.message}
                      </p>
                      
                      {/* Informações adicionais */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(alert.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {alert.suggested_quantity && (
                          <span className="text-blue-600 font-medium">
                            Sugestão: {alert.suggested_quantity} unidades
                          </span>
                        )}
                        {alert.expiry_date && (
                          <span className="text-red-600 font-medium">
                            Validade: {format(new Date(alert.expiry_date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Guia de tipos de alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Alertas</CardTitle>
          <CardDescription>
            Entenda os diferentes tipos de alertas e suas prioridades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <h4 className="font-semibold text-red-700">Estoque Baixo/Crítico</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Produtos com quantidade igual ou menor que o estoque mínimo definido.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Calendar className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800">Produtos Vencidos</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Produtos que já passaram da data de validade e devem ser removidos.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <Clock className="h-6 w-6 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-semibold text-yellow-700">Próximo do Vencimento</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Produtos que vencem nos próximos 7 dias. Use prioritariamente.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-700">Sugestão de Reposição</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Produtos que devem ser repostos em breve, com sugestão de quantidade.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold text-green-700">Vendas Altas</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Produtos com vendas acima do esperado que podem esgotar rapidamente.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <X className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h4 className="font-semibold text-red-800">Sem Estoque</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Produtos completamente esgotados que precisam de reposição urgente.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAlerts;