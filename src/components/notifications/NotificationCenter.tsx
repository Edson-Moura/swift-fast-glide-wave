import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  X, 
  AlertTriangle, 
  Clock, 
  Package,
  ShoppingCart,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter = ({ className }: NotificationCenterProps) => {
  const { alerts, unreadCount, criticalCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewCritical, setHasNewCritical] = useState(false);

  // Detectar novos alertas críticos
  useEffect(() => {
    if (criticalCount > 0) {
      setHasNewCritical(true);
      const timer = setTimeout(() => setHasNewCritical(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [criticalCount]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'out_of_stock':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Calendar className="h-4 w-4 text-red-600" />;
      case 'expiring_soon':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'restock_suggestion':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'high_sales':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const recentAlerts = alerts
    .filter(alert => !alert.is_read)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  return (
    <div className={cn("relative", className)}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 hover:bg-accent",
          hasNewCritical && "animate-pulse"
        )}
      >
        {unreadCount > 0 ? (
          <BellRing className={cn(
            "h-5 w-5",
            criticalCount > 0 ? "text-red-500" : "text-primary"
          )} />
        ) : (
          <Bell className="h-5 w-5 text-muted-foreground" />
        )}
        
        {unreadCount > 0 && (
          <Badge 
            variant={criticalCount > 0 ? "destructive" : "default"}
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border-2">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Notificações</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary">{unreadCount}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="max-h-96">
              <CardContent className="p-0">
                {recentAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma notificação nova</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-4 hover:bg-accent/50 transition-colors cursor-pointer",
                          getPriorityColor(alert.priority)
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="font-medium text-sm truncate">
                                {alert.product_name}
                              </p>
                              {alert.priority === 'critical' && (
                                <Badge variant="destructive" className="text-xs">
                                  Crítico
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                              {alert.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(alert.created_at), "HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </ScrollArea>

            {recentAlerts.length > 0 && (
              <div className="p-3 border-t bg-muted/30">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsOpen(false);
                    // Navegar para página completa de alertas
                    window.location.href = '/inventory-management?tab=alerts';
                  }}
                >
                  Ver todos os alertas
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;