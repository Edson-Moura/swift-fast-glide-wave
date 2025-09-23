import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { usePriceManagement } from '@/hooks/usePriceManagement';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricingDashboard } from '@/components/pricing/PricingDashboard';
import { PriceAdjustmentCard } from '@/components/pricing/PriceAdjustmentCard';
import { AutoPriceCalculator } from '@/components/pricing/AutoPriceCalculator';
import { SubscriptionGuard } from '@/components/ui/subscription-guard';
import { Loader2, LogOut, ChefHat, ArrowLeft, Search, RefreshCw } from 'lucide-react';
import MobileNav from '@/components/ui/mobile-nav';
import LoadingScreen from '@/components/ui/loading-screen';
import { useState } from 'react';

const PriceManagement = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { currentRestaurant, userRole } = useRestaurant();
  const { 
    pricingData, 
    summary, 
    loading: pricingLoading, 
    updateItemPrice, 
    recalculateAllPrices,
    applyPricingRuleByCategory,
    refetch 
  } = usePriceManagement();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const hasAccess = ['admin', 'manager'].includes(userRole || '');

  if (loading || pricingLoading) {
    return <LoadingScreen message="Carregando sistema de preços..." />;
  }

  if (!user || !currentRestaurant) {
    return null;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar a gestão de preços
          </p>
          <Button onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const filteredPricing = pricingData.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(pricingData.map(item => item.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-mobile mx-auto py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MobileNav />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div className="flex items-center space-x-3">
              <ChefHat className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-primary">
                  Gestão de Preços
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentRestaurant.name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="hidden sm:flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Atualizar</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="hidden md:flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-mobile mx-auto py-6 sm:py-8">
        {!summary ? (
          <div className="text-center py-12">
            <Loader2 className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-6 animate-spin" />
            <h2 className="text-xl sm:text-2xl font-bold mb-3">Carregando Dados de Preços</h2>
            <p className="text-muted-foreground leading-relaxed">
              Analisando custos e calculando preços sugeridos...
            </p>
          </div>
        ) : (
          <SubscriptionGuard 
            requiredPlan="professional" 
            feature="Gestão Avançada de Preços"
          >
            <>
              {/* Introdução */}
              <div className="mb-6 sm:mb-8 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Gestão Inteligente de Preços</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Otimize seus preços baseado em custos, demanda e margem de lucro desejada
                </p>
              </div>

              {/* Dashboard de Preços */}
              <div className="mb-8">
                <PricingDashboard summary={summary} />
              </div>

              {/* Tabs de Gestão */}
              <Tabs defaultValue="items" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="items">Ajuste de Itens</TabsTrigger>
                  <TabsTrigger value="auto">Recálculo Automático</TabsTrigger>
                </TabsList>

                {/* Ajuste Individual de Itens */}
                <TabsContent value="items" className="space-y-6">
                  {/* Barra de Pesquisa */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por item ou categoria..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Grid de Itens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPricing.map((item) => (
                      <PriceAdjustmentCard
                        key={item.id}
                        item={item}
                        onUpdatePrice={updateItemPrice}
                      />
                    ))}
                  </div>

                  {filteredPricing.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Nenhum item encontrado com os filtros aplicados.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Calculadora Automática */}
                <TabsContent value="auto">
                  <AutoPriceCalculator
                    onRecalculateAll={recalculateAllPrices}
                    onApplyByCategory={applyPricingRuleByCategory}
                    categories={categories}
                  />
                </TabsContent>
              </Tabs>
            </>
          </SubscriptionGuard>
        )}
      </main>
    </div>
  );
};

export default PriceManagement;