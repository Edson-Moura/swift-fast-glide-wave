import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, BarChart3, TrendingUp, TrendingDown, AlertTriangle, Package, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const InventoryReports = () => {
  const { products, categories, stats } = useInventory();
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('30');

  // Prepare data for charts
  const categoryData = categories.map(category => {
    const categoryProducts = products.filter(p => p.category === category.name);
    return {
      name: category.name,
      quantity: categoryProducts.reduce((sum, p) => sum + p.current_stock, 0),
      value: categoryProducts.reduce((sum, p) => sum + (p.current_stock * p.cost_per_unit), 0),
      products: categoryProducts.length
    };
  });

  const stockStatusData = [
    { name: 'Estoque Normal', value: products.filter(p => p.current_stock > p.min_stock).length, color: '#22c55e' },
    { name: 'Estoque Baixo', value: products.filter(p => p.current_stock <= p.min_stock && p.current_stock > 0).length, color: '#f59e0b' },
    { name: 'Sem Estoque', value: products.filter(p => p.current_stock === 0).length, color: '#ef4444' }
  ];

  const topProductsByValue = products
    .map(product => ({
      ...product,
      totalValue: product.current_stock * product.cost_per_unit
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);

  const lowStockProducts = products
    .filter(p => p.current_stock <= p.min_stock)
    .sort((a, b) => (a.current_stock / a.min_stock) - (b.current_stock / b.min_stock));

  const exportReport = (type: string) => {
    // Here you would implement the actual export functionality
    // For now, we'll just show a message
    alert(`Exportando relatório: ${type}`);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Relatórios de Inventário</span>
          </CardTitle>
          <CardDescription>
            Análises detalhadas do seu estoque e movimentações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Visão Geral</SelectItem>
                <SelectItem value="categories">Por Categoria</SelectItem>
                <SelectItem value="stock-status">Status do Estoque</SelectItem>
                <SelectItem value="top-products">Produtos Top</SelectItem>
                <SelectItem value="alerts">Alertas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => exportReport(reportType)}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} com estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalValue?.toLocaleString('pt-BR') || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor do estoque atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Itens em Alerta</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Estoque baixo ou zerado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes categorias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status do Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'categories' && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório por Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.products} produtos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {category.value.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.quantity} unidades
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'top-products' && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Maior Valor em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProductsByValue.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R$ {product.totalValue.toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.current_stock} {product.unit} × R$ {product.cost_per_unit.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Alerta</CardTitle>
            <CardDescription>
              Produtos com estoque baixo ou zerado que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum alerta!</h3>
                  <p className="text-muted-foreground">
                    Todos os produtos estão com estoque adequado.
                  </p>
                </div>
              ) : (
                lowStockProducts.map((product) => {
                  const percentage = product.min_stock > 0 ? (product.current_stock / product.min_stock) * 100 : 0;
                  const isOutOfStock = product.current_stock === 0;
                  
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`h-5 w-5 ${isOutOfStock ? 'text-red-600' : 'text-yellow-600'}`} />
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isOutOfStock ? 'destructive' : 'secondary'}>
                          {product.current_stock} {product.unit}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mín: {product.min_stock} {product.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(0)}% do mínimo
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryReports;