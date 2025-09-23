import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Star, Building, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionStatusProps {
  compact?: boolean;
}

export const SubscriptionStatus = ({ compact = false }: SubscriptionStatusProps) => {
  const { subscriptionStatus, loading, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return compact ? (
      <Badge variant="outline" className="animate-pulse">
        Carregando...
      </Badge>
    ) : null;
  }

  const currentTier = SUBSCRIPTION_TIERS[subscriptionStatus.plan];
  
  const getPlanIcon = () => {
    switch (subscriptionStatus.plan) {
      case 'basic':
        return <Star className="h-4 w-4" />;
      case 'professional':
        return <Crown className="h-4 w-4" />;
      case 'enterprise':
        return <Building className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPlanColor = () => {
    switch (subscriptionStatus.plan) {
      case 'basic':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'professional':
        return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'enterprise':
        return 'bg-amber-500/10 text-amber-600 border-amber-200';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const isTrialExpiringSoon = () => {
    if (!subscriptionStatus.subscription_end || subscriptionStatus.plan === 'free') return false;
    const endDate = new Date(subscriptionStatus.subscription_end);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge className={`${getPlanColor()} flex items-center gap-1`}>
          {getPlanIcon()}
          {currentTier.name}
        </Badge>
        {isTrialExpiringSoon() && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expira em breve
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getPlanIcon()}
            Plano {currentTier.name}
          </CardTitle>
          {subscriptionStatus.plan === 'free' && (
            <Badge variant="outline">Gratuito</Badge>
          )}
        </div>
        <CardDescription>
          {subscriptionStatus.plan === 'free' 
            ? 'Você está usando o plano gratuito' 
            : `Assinatura ${subscriptionStatus.subscribed ? 'ativa' : 'inativa'}`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {subscriptionStatus.subscription_end && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Renovação: {new Date(subscriptionStatus.subscription_end).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        {isTrialExpiringSoon() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800 font-medium text-sm">
              <AlertTriangle className="h-4 w-4" />
              Sua assinatura expira em breve
            </div>
            <p className="text-yellow-700 text-xs mt-1">
              Renovar sua assinatura para continuar usando todos os recursos.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {subscriptionStatus.plan === 'free' ? (
            <Button 
              onClick={() => navigate('/pricing')} 
              className="flex-1"
            >
              Fazer Upgrade
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={openCustomerPortal}
              className="flex-1"
            >
              Gerenciar
            </Button>
          )}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pricing')}
            className="flex-1"
          >
            Ver Planos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};