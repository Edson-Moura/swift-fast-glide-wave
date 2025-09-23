import { useState, useEffect, useCallback } from 'react';
import { useInventory, InventoryAlert } from '@/hooks/useInventory';
import { useSalesAlerts } from '@/hooks/useSalesAlerts';
import { useToast } from '@/components/ui/use-toast';
import { addDays, isAfter, isBefore, parseISO, differenceInDays } from 'date-fns';

export interface NotificationSystem {
  alerts: InventoryAlert[];
  unreadCount: number;
  criticalCount: number;
  generateAlerts: () => InventoryAlert[];
  markAllAsRead: () => void;
  showToastNotifications: boolean;
  setShowToastNotifications: (show: boolean) => void;
}

export const useNotifications = (): NotificationSystem => {
  const { products, alerts, markAlertAsRead } = useInventory();
  const { salesAlerts } = useSalesAlerts();
  const { toast } = useToast();
  const [showToastNotifications, setShowToastNotifications] = useState(true);
  const [lastAlertCheck, setLastAlertCheck] = useState<Date>(new Date());

  // Generate all types of alerts
  const generateAlerts = useCallback((): InventoryAlert[] => {
    const generatedAlerts: InventoryAlert[] = [];
    const now = new Date();

    products.forEach(product => {
      // 1. Alertas de estoque baixo
      if (product.current_stock <= product.min_stock) {
        const priority = product.current_stock === 0 ? 'critical' : 'high';
        generatedAlerts.push({
          id: `low_stock_${product.id}`,
          product_id: product.id,
          product_name: product.name,
          type: 'low_stock',
          message: product.current_stock === 0 
            ? `${product.name} está em falta total no estoque!`
            : `Estoque baixo: ${product.name} tem apenas ${product.current_stock} ${product.unit} (mínimo: ${product.min_stock})`,
          priority,
          is_read: false,
          created_at: now.toISOString(),
          action_required: true,
          suggested_quantity: Math.max(product.max_stock || product.min_stock * 2, product.min_stock * 2)
        });
      }

      // 2. Alertas de validade
      if (product.expiry_date) {
        const expiryDate = parseISO(product.expiry_date);
        const daysToExpiry = differenceInDays(expiryDate, now);

        if (daysToExpiry < 0) {
          // Produto vencido
          generatedAlerts.push({
            id: `expired_${product.id}`,
            product_id: product.id,
            product_name: product.name,
            type: 'expired',
            message: `${product.name} venceu há ${Math.abs(daysToExpiry)} dias! Remova do estoque.`,
            priority: 'critical',
            is_read: false,
            created_at: now.toISOString(),
            action_required: true,
            expiry_date: product.expiry_date
          });
        } else if (daysToExpiry <= 3) {
          // Produto vencendo em 3 dias ou menos
          generatedAlerts.push({
            id: `expiring_soon_${product.id}`,
            product_id: product.id,
            product_name: product.name,
            type: 'expiring_soon',
            message: `${product.name} vence em ${daysToExpiry} dias. Use prioritariamente ou promova vendas.`,
            priority: 'high',
            is_read: false,
            created_at: now.toISOString(),
            action_required: true,
            expiry_date: product.expiry_date
          });
        } else if (daysToExpiry <= 7) {
          // Produto vencendo em até 7 dias
          generatedAlerts.push({
            id: `expiring_soon_${product.id}`,
            product_id: product.id,
            product_name: product.name,
            type: 'expiring_soon',
            message: `${product.name} vence em ${daysToExpiry} dias. Monitore o uso.`,
            priority: 'medium',
            is_read: false,
            created_at: now.toISOString(),
            expiry_date: product.expiry_date
          });
        }
      }

      // 3. Sugestões de reposição inteligente
      if (product.current_stock <= product.min_stock * 1.5 && product.current_stock > 0) {
        const suggestedQuantity = (product.max_stock || product.min_stock * 3) - product.current_stock;
        generatedAlerts.push({
          id: `restock_suggestion_${product.id}`,
          product_id: product.id,
          product_name: product.name,
          type: 'restock_suggestion',
          message: `Considere repor ${product.name}. Estoque atual: ${product.current_stock} ${product.unit}. Sugestão: comprar ${suggestedQuantity} ${product.unit}.`,
          priority: 'medium',
          is_read: false,
          created_at: now.toISOString(),
          suggested_quantity: suggestedQuantity
        });
      }
    });

    return generatedAlerts;
  }, [products]);

  const allAlerts = [...generateAlerts(), ...alerts, ...salesAlerts];
  const unreadCount = allAlerts.filter(alert => !alert.is_read).length;
  const criticalCount = allAlerts.filter(alert => alert.priority === 'critical' && !alert.is_read).length;

  // Marcar todos como lidos
  const markAllAsRead = useCallback(async () => {
    const unreadAlerts = allAlerts.filter(alert => !alert.is_read);
    
    for (const alert of unreadAlerts) {
      if (!alert.id.startsWith('low_stock_') && !alert.id.startsWith('expired_') && 
          !alert.id.startsWith('expiring_soon_') && !alert.id.startsWith('restock_suggestion_')) {
        await markAlertAsRead(alert.id);
      }
    }
  }, [allAlerts, markAlertAsRead]);

  // Mostrar notificações toast para alertas críticos
  useEffect(() => {
    if (!showToastNotifications) return;

    const newCriticalAlerts = allAlerts.filter(alert => 
      alert.priority === 'critical' && 
      !alert.is_read && 
      new Date(alert.created_at) > lastAlertCheck
    );

    newCriticalAlerts.forEach(alert => {
      toast({
        title: "⚠️ Alerta Crítico",
        description: alert.message,
        variant: "destructive",
        duration: 8000,
      });
    });

    if (newCriticalAlerts.length > 0) {
      setLastAlertCheck(new Date());
    }
  }, [allAlerts, showToastNotifications, lastAlertCheck, toast]);

  return {
    alerts: allAlerts,
    unreadCount,
    criticalCount,
    generateAlerts,
    markAllAsRead,
    showToastNotifications,
    setShowToastNotifications
  };
};