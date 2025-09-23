import { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '@/components/inventory/ProductForm';
import ProductList from '@/components/inventory/ProductList';
import StockMovement from '@/components/inventory/StockMovement';
import InventoryAlerts from '@/components/inventory/InventoryAlerts';
import InventoryReports from '@/components/inventory/InventoryReports';
import CategoryManager from '@/components/inventory/CategoryManager';
import LoadingScreen from '@/components/ui/loading-screen';

const InventoryManagement = () => {
  const navigate = useNavigate();
  const { 
    products, 
    categories, 
    alerts, 
    loading, 
    stats,
    lowStockItems 
  } = useInventory();
  
  const [showProductForm, setShowProductForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return <LoadingScreen message="Carregando inventário..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-3">
              <Package className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Gestão de Inventário</h1>
                <p className="text-sm text-muted-foreground">Controle completo do estoque do restaurante</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {lowStockItems.length > 0 && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{lowStockItems.length} alertas</span>
              </Badge>
            )}
            <Button 
              onClick={() => setShowProductForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Produto</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.totalValue?.toLocaleString('pt-BR') || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total em estoque
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Itens em Baixa</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Requerem atenção
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

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Recentes</CardTitle>
                  <CardDescription>Últimos produtos adicionados ao estoque</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductList 
                    products={products.slice(0, 5)} 
                    compact={true}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Alertas Importantes</CardTitle>
                  <CardDescription>Itens que precisam de atenção</CardDescription>
                </CardHeader>
                <CardContent>
                  <InventoryAlerts 
                    compact={true}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductList products={products} />
          </TabsContent>

          <TabsContent value="movements">
            <StockMovement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager categories={categories} />
          </TabsContent>

          <TabsContent value="alerts">
            <InventoryAlerts />
          </TabsContent>

          <TabsContent value="reports">
            <InventoryReports />
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm 
          onClose={() => setShowProductForm(false)}
          onSave={() => {
            setShowProductForm(false);
            // Refresh data handled by the hook
          }}
        />
      )}
    </div>
  );
};

export default InventoryManagement;