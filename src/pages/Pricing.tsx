import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Star, Crown, Building, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LoadingScreen from '@/components/ui/loading-screen';

const Pricing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { 
    subscriptionStatus, 
    loading: subscriptionLoading, 
    createCheckoutSession, 
    openCustomerPortal,
    checkSubscription 
  } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      toast({
        title: "Assinatura ativada!",
        description: "Sua assinatura foi ativada com sucesso. Bem-vindo!",
      });
      // Check subscription status after successful payment
      checkSubscription();
    } else if (canceled === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "O processo de pagamento foi cancelado.",
        variant: "destructive",
      });
    }
  }, [searchParams, checkSubscription]);

  if (authLoading || subscriptionLoading) {
    return <LoadingScreen message="Carregando planos..." />;
  }

  const handleSubscribe = async (priceId: string, planKey: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoadingPlan(planKey);
    try {
      const url = await createCheckoutSession(priceId);
      if (url) {
        window.open(url, '_blank');
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPlanIcon = (planKey: string) => {
    switch (planKey) {
      case 'basic':
        return <Star className="h-6 w-6 text-primary" />;
      case 'professional':
        return <Crown className="h-6 w-6 text-primary" />;
      case 'enterprise':
        return <Building className="h-6 w-6 text-primary" />;
      default:
        return <CheckCircle className="h-6 w-6 text-primary" />;
    }
  };

  const getPlanColor = (planKey: string) => {
    switch (planKey) {
      case 'basic':
        return 'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20';
      case 'professional':
        return 'from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20';
      case 'enterprise':
        return 'from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20';
      default:
        return 'from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Planos e Preços</h1>
              <p className="text-sm text-muted-foreground">
                Escolha o plano ideal para seu restaurante
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12">
        {/* Current Plan Status */}
        {user && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium">
                Plano Atual: {SUBSCRIPTION_TIERS[subscriptionStatus.plan].name}
              </span>
            </div>
            {subscriptionStatus.subscribed && subscriptionStatus.subscription_end && (
              <p className="text-sm text-muted-foreground mt-2">
                Renovação em: {new Date(subscriptionStatus.subscription_end).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {Object.entries(SUBSCRIPTION_TIERS).map(([planKey, tier]) => {
            const isCurrentPlan = subscriptionStatus.plan === planKey;
            const isPopular = planKey === 'professional';
            
            return (
              <Card 
                key={planKey} 
                className={`relative overflow-hidden bg-gradient-to-br ${getPlanColor(planKey)} border-2 ${
                  isCurrentPlan ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50'
                } transition-all duration-300 hover:shadow-lg`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
                    PLANO ATUAL
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(planKey)}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription className="h-12 flex items-center justify-center">
                    {planKey === 'free' ? 'Teste todas as funcionalidades' : 
                     planKey === 'basic' ? 'Para restaurantes pequenos' :
                     planKey === 'professional' ? 'Para restaurantes em crescimento' :
                     'Para redes de restaurantes'}
                  </CardDescription>
                  <div className="text-center">
                    <span className="text-3xl font-bold">
                      {tier.price === 0 ? 'Gratuito' : `R$ ${tier.price}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-muted-foreground">/mês</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-6">
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="px-6 pt-4">
                  {!user ? (
                    <Button 
                      className="w-full" 
                      onClick={() => navigate('/auth')}
                      variant={isPopular ? "default" : "outline"}
                    >
                      Começar Agora
                    </Button>
                  ) : isCurrentPlan ? (
                    subscriptionStatus.subscribed ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={openCustomerPortal}
                      >
                        Gerenciar Assinatura
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="w-full justify-center py-2">
                        Plano Atual
                      </Badge>
                    )
                  ) : planKey === 'free' ? (
                    <Badge variant="outline" className="w-full justify-center py-2">
                      Sempre Gratuito
                    </Badge>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleSubscribe(tier.priceId!, planKey)}
                      disabled={loadingPlan === planKey}
                      variant={isPopular ? "default" : "outline"}
                    >
                      {loadingPlan === planKey ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Assinar Agora'
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Há período de teste gratuito?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim, oferecemos um plano gratuito permanente para você testar nossas funcionalidades.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Posso mudar de plano?</h3>
                <p className="text-sm text-muted-foreground">
                  Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Há suporte técnico?</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os planos incluem suporte técnico, com prioridade baseada no seu plano.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;