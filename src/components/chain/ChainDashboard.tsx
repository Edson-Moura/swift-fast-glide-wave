import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Package, TrendingUp, AlertTriangle, Plus, Settings } from 'lucide-react';
import { useChain } from '@/hooks/useChain';
import ChainForm from './ChainForm';
import ChainRestaurants from './ChainRestaurants';
import ChainReports from './ChainReports';
import ChainSettings from './ChainSettings';
import LoadingScreen from '@/components/ui/loading-screen';

const ChainDashboard = () => {
  const { 
    chains, 
    currentChain, 
    chainStats, 
    loading, 
    canManageChain,
    switchChain 
  } = useChain();
  
  const [showChainForm, setShowChainForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return <LoadingScreen message="Carregando redes..." />;
  }

  if (chains.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="container mx-auto py-8">
          <div className="text-center space-y-6">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nenhuma Rede Encontrada</h1>
              <p className="text-muted-foreground mt-2">
                Crie uma rede de restaurantes para começar a gerenciar múltiplas unidades
              </p>
            </div>
            <Button onClick={() => setShowChainForm(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Rede
            </Button>
          </div>
        </div>

        {showChainForm && (
          <ChainForm onClose={() => setShowChainForm(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  {currentChain?.name || 'Rede de Restaurantes'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gestão centralizada de múltiplas unidades
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Seletor de Rede */}
              {chains.length > 1 && (
                <select 
                  value={currentChain?.id || ''} 
                  onChange={(e) => switchChain(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  {chains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
              )}
              
              {canManageChain && (
                <Button 
                  variant="outline"
                  onClick={() => setShowChainForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Rede
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Restaurantes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chainStats.totalRestaurants}</div>
              <p className="text-xs text-muted-foreground">
                Unidades na rede
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {chainStats.totalInventoryValue.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                Consolidado da rede
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Itens do Menu</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chainStats.totalMenuItems}</div>
              <p className="text-xs text-muted-foreground">
                Total de pratos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {chainStats.avgProfitMargin.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Lucro médio da rede
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {chainStats.totalLowStockItems}
              </div>
              <p className="text-xs text-muted-foreground">
                Itens em baixa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            {canManageChain && (
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo por Unidade</CardTitle>
                  <CardDescription>Performance de cada restaurante da rede</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChainRestaurants compact={true} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Indicadores Consolidados</CardTitle>
                  <CardDescription>Métricas gerais da rede</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Ocupação Média</span>
                    <Badge variant="secondary">85%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Eficiência Operacional</span>
                    <Badge variant="secondary">92%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Satisfação do Cliente</span>
                    <Badge variant="secondary">4.6/5</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="restaurants">
            <ChainRestaurants />
          </TabsContent>

          <TabsContent value="reports">
            <ChainReports />
          </TabsContent>

          {canManageChain && (
            <TabsContent value="settings">
              <ChainSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Chain Form Modal */}
      {showChainForm && (
        <ChainForm onClose={() => setShowChainForm(false)} />
      )}
    </div>
  );
};

export default ChainDashboard;