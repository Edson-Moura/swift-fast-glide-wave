import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, Database, Eye, Lock } from 'lucide-react';
import LoadingScreen from '@/components/ui/loading-screen';
import TwoFactorAuth from '@/components/security/TwoFactorAuth';
import BackupManagement from '@/components/security/BackupManagement';
import SecurityLogs from '@/components/security/SecurityLogs';
import ActiveSessions from '@/components/security/ActiveSessions';

const Security = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { currentRestaurant, userRole, loading: restaurantLoading } = useRestaurant();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || restaurantLoading) {
    return <LoadingScreen message="Carregando configurações de segurança..." />;
  }

  if (!user || !currentRestaurant) {
    return null;
  }

  // Verificar permissões - apenas admins e managers podem acessar configurações de segurança
  const hasAccess = ['admin', 'manager'].includes(userRole || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-mobile mx-auto py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-3">
              <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">
                  Segurança de Dados
                </h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {currentRestaurant.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-mobile mx-auto py-6 sm:py-8">
        {!hasAccess ? (
          // Sem permissão
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-destructive" />
                <span>Acesso Negado</span>
              </CardTitle>
              <CardDescription>
                Apenas administradores e gerentes podem acessar as configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Segurança de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Proteja seus dados com backup automático e autenticação de dois fatores
              </p>
            </div>

            <Tabs defaultValue="backup" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="backup" className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Backup</span>
                </TabsTrigger>
                <TabsTrigger value="2fa" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>2FA</span>
                </TabsTrigger>
                <TabsTrigger value="sessions" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Sessões</span>
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Logs</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="backup" className="space-y-6">
                <BackupManagement />
              </TabsContent>

              <TabsContent value="2fa" className="space-y-6">
                <TwoFactorAuth />
              </TabsContent>

              <TabsContent value="sessions" className="space-y-6">
                <ActiveSessions />
              </TabsContent>

              <TabsContent value="logs" className="space-y-6">
                <SecurityLogs />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Security;