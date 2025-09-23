import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  expiredItems: number;
  totalValue: number;
  topConsumingItems: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  monthlyConsumption: Array<{
    date: string;
    value: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  alertsSummary: {
    total: number;
    unread: number;
    byType: Record<string, number>;
  };
}

interface ReportData {
  performanceReport: Array<{
    item: string;
    consumed: number;
    restocked: number;
    efficiency: number;
  }>;
  consumptionHistory: Array<{
    date: string;
    item: string;
    quantity: number;
    cost: number;
  }>;
  wasteAnalysis: Array<{
    item: string;
    expired: number;
    cost: number;
    percentage: number;
  }>;
  restockRecommendations: Array<{
    item: string;
    current: number;
    suggested: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export const useDashboard = () => {
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && currentRestaurant) {
      fetchDashboardData();
    }
  }, [user, currentRestaurant]);

  const fetchDashboardData = async () => {
    if (!currentRestaurant) return;

    try {
      setLoading(true);
      
      // Fetch inventory items
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*');

      if (itemsError) throw itemsError;

      // Fetch consumption history (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: consumption, error: consumptionError } = await supabase
        .from('consumption_history')
        .select('*, inventory_items(name, unit, cost_per_unit)')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (consumptionError) throw consumptionError;

      // Fetch alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select('*');

      if (alertsError) throw alertsError;

      // Fetch restock suggestions
      const { data: restockSuggestions, error: restockError } = await supabase
        .from('restock_suggestions')
        .select('*, inventory_items(name, current_stock, unit)');

      if (restockError) throw restockError;

      // Process dashboard stats
      const stats = processDashboardStats(items || [], consumption || [], alerts || []);
      const reports = processReportData(items || [], consumption || [], restockSuggestions || []);

      setDashboardStats(stats);
      setReportData(reports);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processDashboardStats = (items: any[], consumption: any[], alerts: any[]): DashboardStats => {
    const currentDate = new Date();
    
    // Calculate basic stats
    const totalItems = items.length;
    const lowStockItems = items.filter(item => Number(item.current_stock) <= Number(item.min_stock)).length;
    const expiredItems = items.filter(item => item.expiry_date && new Date(item.expiry_date) < currentDate).length;
    const totalValue = items.reduce((sum, item) => sum + (Number(item.current_stock) * Number(item.cost_per_unit || 0)), 0);

    // Top consuming items (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentConsumption = consumption.filter(c => new Date(c.date) >= sevenDaysAgo);
    const itemConsumption: Record<string, { name: string; quantity: number; unit: string }> = {};
    
    recentConsumption.forEach(curr => {
      const inventoryItem = curr.inventory_items as any;
      const itemName = inventoryItem?.name || 'Unknown';
      const unit = inventoryItem?.unit || '';
      
      if (!itemConsumption[itemName]) {
        itemConsumption[itemName] = { name: itemName, quantity: 0, unit };
      }
      itemConsumption[itemName].quantity += Number(curr.quantity);
    });

    const topConsumingItems = Object.values(itemConsumption)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Monthly consumption trend
    const monthlyData: Record<string, number> = {};
    consumption.forEach(curr => {
      const date = curr.date;
      const inventoryItem = curr.inventory_items as any;
      const value = Number(curr.quantity) * Number(inventoryItem?.cost_per_unit || 0);
      
      if (!monthlyData[date]) {
        monthlyData[date] = 0;
      }
      monthlyData[date] += value;
    });

    const monthlyConsumption = Object.entries(monthlyData)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);

    // Category distribution
    const categoryStats: Record<string, number> = {};
    items.forEach(item => {
      const categoryName = item.category || 'Sem Categoria';
      const value = Number(item.current_stock) * Number(item.cost_per_unit || 0);
      
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = 0;
      }
      categoryStats[categoryName] += value;
    });

    const categoryDistribution = Object.entries(categoryStats).map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0
    }));

    // Alerts summary
    const alertsByType: Record<string, number> = {};
    alerts.forEach(alert => {
      const type = alert.alert_type;
      alertsByType[type] = (alertsByType[type] || 0) + 1;
    });

    const alertsSummary = {
      total: alerts.length,
      unread: alerts.filter(alert => !alert.is_read).length,
      byType: alertsByType
    };

    return {
      totalItems,
      lowStockItems,
      expiredItems,
      totalValue,
      topConsumingItems,
      monthlyConsumption,
      categoryDistribution,
      alertsSummary
    };
  };

  const processReportData = (items: any[], consumption: any[], restockSuggestions: any[]): ReportData => {
    // Performance report
    const performanceReport = items.slice(0, 10).map(item => {
      const itemConsumption = consumption.filter(c => c.item_id === item.id);
      const consumed = itemConsumption.reduce((sum, c) => sum + Number(c.quantity), 0);
      const restocked = 0; // This would need a restock history table
      const currentQty = Number(item.current_stock);
      const efficiency = currentQty > 0 ? Math.min(100, (consumed / currentQty) * 100) : 0;
      
      return {
        item: item.name,
        consumed,
        restocked,
        efficiency: Math.round(efficiency)
      };
    });

    // Consumption history with costs
    const consumptionHistory = consumption.slice(0, 50).map(c => {
      const inventoryItem = c.inventory_items as any;
      return {
        date: c.date,
        item: inventoryItem?.name || 'Unknown',
        quantity: Number(c.quantity),
        cost: Number(c.quantity) * Number(inventoryItem?.cost_per_unit || 0)
      };
    });

    // Waste analysis (expired items)
    const currentDate = new Date();
    const expiredItems = items.filter(item => item.expiry_date && new Date(item.expiry_date) < currentDate);
    const totalInventoryValue = items.reduce((sum, i) => sum + (Number(i.current_stock) * Number(i.cost_per_unit || 0)), 0);
    
    const wasteAnalysis = expiredItems.map(item => {
      const cost = Number(item.current_stock) * Number(item.cost_per_unit || 0);
      return {
        item: item.name,
        expired: Number(item.current_stock),
        cost,
        percentage: totalInventoryValue > 0 ? Math.round((cost / totalInventoryValue) * 100) : 0
      };
    });

    // Restock recommendations
    const restockRecommendations = restockSuggestions.map((suggestion: any) => {
      const inventoryItem = suggestion.inventory_items as any;
      const daysUntilStockout = Number(suggestion.days_until_stockout || 0);
      let priority: 'high' | 'medium' | 'low' = 'low';
      
      if (daysUntilStockout <= 3) priority = 'high';
      else if (daysUntilStockout <= 7) priority = 'medium';
      
      return {
        item: inventoryItem?.name || 'Unknown',
        current: Number(inventoryItem?.current_stock || 0),
        suggested: Number(suggestion.suggested_quantity),
        priority
      };
    });

    return {
      performanceReport,
      consumptionHistory,
      wasteAnalysis,
      restockRecommendations
    };
  };

  return {
    dashboardStats,
    reportData,
    loading,
    refetch: fetchDashboardData
  };
};