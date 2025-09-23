import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Package, TrendingUp, AlertTriangle, Download, Calendar } from 'lucide-react';
import { useChain } from '@/hooks/useChain';
import { supabase } from '@/integrations/supabase/client';

interface InventorySummary {
  restaurant_id: string;
  restaurant_name: string;
  total_items: number;
  total_value: number;
  low_stock_items: number;
  categories_count: number;
}

interface MenuPerformance {
  restaurant_id: string;
  restaurant_name: string;
  total_menu_items: number;
  avg_profit_margin: number;
  high_cost_items: number;
  unavailable_items: number;
}

interface ConsolidatedInventory {
  item_name: string;
  category: string;
  total_stock: number;
  total_value: number;
  restaurants_with_item: number;
  avg_cost_per_unit: number;
  total_low_stock_restaurants: number;
}

const ChainReports = () => {
  const { currentChain } = useChain();
  const [inventorySummary, setInventorySummary] = useState<InventorySummary[]>([]);
  const [menuPerformance, setMenuPerformance] = useState<MenuPerformance[]>([]);
  const [consolidatedInventory, setConsolidatedInventory] = useState<ConsolidatedInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentChain) {
      fetchReports();
    }
  }, [currentChain]);

  const fetchReports = async () => {
    if (!currentChain) return;

    try {
      setLoading(true);

      // Buscar resumo de inventário
      const { data: inventoryData, error: inventoryError } = await supabase
        .rpc('get_chain_inventory_summary', { 
          chain_id_param: currentChain.id 
        });

      if (inventoryError) throw inventoryError;
      setInventorySummary(inventoryData || []);

      // Buscar performance do menu
      const { data: menuData, error: menuError } = await supabase
        .rpc('get_chain_menu_performance', { 
          chain_id_param: currentChain.id 
        });

      if (menuError) throw menuError;
      setMenuPerformance(menuData || []);

      // Buscar inventário consolidado
      const { data: consolidatedData, error: consolidatedError } = await supabase
        .rpc('get_chain_consolidated_inventory', { 
          chain_id_param: currentChain.id 
        });

      if (consolidatedError) throw consolidatedError;
      setConsolidatedInventory(consolidatedData || []);

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string) => {
    // Função para gerar relatórios em PDF ou Excel
    console.log('Generating report:', reportType);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatórios Consolidados</h2>
          <p className="text-muted-foreground">
            Análise completa da performance da rede
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => generateReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => generateReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventário</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidado</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Inventário por Restaurante</CardTitle>
              <CardDescription>
                Análise do estoque de cada unidade da rede
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventorySummary.map((item) => (
                  <div key={item.restaurant_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{item.restaurant_name}</h3>
                      {item.low_stock_items > 0 && (
                        <Badge variant="destructive" className="flex items-center space-x-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>{item.low_stock_items} alertas</span>
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{item.total_items}</p>
                        <p className="text-sm text-muted-foreground">Itens</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          R$ {Number(item.total_value).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-muted-foreground">Valor</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{item.categories_count}</p>
                        <p className="text-sm text-muted-foreground">Categorias</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-destructive">{item.low_stock_items}</p>
                        <p className="text-sm text-muted-foreground">Baixo Estoque</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance do Menu por Restaurante</CardTitle>
              <CardDescription>
                Análise de rentabilidade e disponibilidade dos pratos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menuPerformance.map((item) => (
                  <div key={item.restaurant_id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{item.restaurant_name}</h3>
                      <div className="flex space-x-2">
                        {item.high_cost_items > 0 && (
                          <Badge variant="destructive">
                            {item.high_cost_items} alto custo
                          </Badge>
                        )}
                        {item.unavailable_items > 0 && (
                          <Badge variant="secondary">
                            {item.unavailable_items} indisponíveis
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{item.total_menu_items}</p>
                        <p className="text-sm text-muted-foreground">Pratos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {Number(item.avg_profit_margin).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Margem Média</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-destructive">{item.high_cost_items}</p>
                        <p className="text-sm text-muted-foreground">Alto Custo</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-muted-foreground">{item.unavailable_items}</p>
                        <p className="text-sm text-muted-foreground">Indisponíveis</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventário Consolidado da Rede</CardTitle>
              <CardDescription>
                Visão unificada de todos os itens da rede
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consolidatedInventory.slice(0, 20).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.item_name}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold">{Number(item.total_stock).toFixed(0)}</p>
                        <p className="text-muted-foreground">Estoque</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">R$ {Number(item.total_value).toLocaleString('pt-BR')}</p>
                        <p className="text-muted-foreground">Valor</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{item.restaurants_with_item}</p>
                        <p className="text-muted-foreground">Unidades</p>
                      </div>
                      {item.total_low_stock_restaurants > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {item.total_low_stock_restaurants} baixo
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {consolidatedInventory.length > 20 && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Mostrando 20 de {consolidatedInventory.length} itens
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Gerais</CardTitle>
                <CardDescription>Métricas consolidadas da rede</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valor Total do Estoque</span>
                  <span className="text-lg font-bold">
                    R$ {inventorySummary.reduce((sum, item) => sum + Number(item.total_value), 0).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total de Itens</span>
                  <span className="text-lg font-bold">
                    {inventorySummary.reduce((sum, item) => sum + item.total_items, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Margem Média da Rede</span>
                  <span className="text-lg font-bold">
                    {(menuPerformance.reduce((sum, item) => sum + Number(item.avg_profit_margin), 0) / (menuPerformance.length || 1)).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Alertas de Estoque</span>
                  <span className="text-lg font-bold text-destructive">
                    {inventorySummary.reduce((sum, item) => sum + item.low_stock_items, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Performance</CardTitle>
                <CardDescription>Restaurantes ordenados por valor de estoque</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventorySummary
                    .sort((a, b) => Number(b.total_value) - Number(a.total_value))
                    .map((item, index) => (
                      <div key={item.restaurant_id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.restaurant_name}</p>
                          <p className="text-sm text-muted-foreground">
                            R$ {Number(item.total_value).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        {item.low_stock_items > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {item.low_stock_items}
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChainReports;