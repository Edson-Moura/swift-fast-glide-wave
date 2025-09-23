import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { useDashboard } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { ReportsSection } from '@/components/dashboard/ReportsSection';
import { Loader2, LogOut, ChefHat, ArrowLeft, RefreshCw } from 'lucide-react';
import MobileNav from '@/components/ui/mobile-nav';
import LoadingScreen from '@/components/ui/loading-screen';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { currentRestaurant, userRole } = useRestaurant();
  const { dashboardStats, reportData, loading: dashboardLoading, refetch } = useDashboard();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const hasAccess = ['admin', 'manager'].includes(userRole || '');

  if (loading || dashboardLoading) {
    return <LoadingScreen message="Carregando relatórios..." />;
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
            Você não tem permissão para acessar os relatórios
          </p>
          <Button onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

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
                  Relatórios
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
        {!dashboardStats || !reportData ? (
          <div className="text-center py-12">
            <Loader2 className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-6 animate-spin" />
            <h2 className="text-xl sm:text-2xl font-bold mb-3">Carregando Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Processando informações do dashboard...
            </p>
          </div>
        ) : (
          <>
            {/* Dashboard Overview */}
            <div className="mb-6 sm:mb-8 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Painel de Controle</h2>
              <p className="text-muted-foreground leading-relaxed">
                Visão geral do status do estoque, valores e performance
              </p>
            </div>

            {/* Stats Cards */}
            <DashboardStats stats={dashboardStats} />

            {/* Charts */}
            <DashboardCharts 
              monthlyConsumption={dashboardStats.monthlyConsumption}
              categoryDistribution={dashboardStats.categoryDistribution}
            />

            {/* Reports Section */}
            <ReportsSection reportData={reportData} />
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;