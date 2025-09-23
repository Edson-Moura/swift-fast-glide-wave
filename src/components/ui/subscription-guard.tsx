import { ReactNode } from 'react';
import { useSubscription, SUBSCRIPTION_TIERS } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: ReactNode;
  requiredPlan: 'basic' | 'professional' | 'enterprise';
  feature: string;
  fallback?: ReactNode;
}

const PLAN_HIERARCHY = {
  'basic': 1,
  'professional': 2,
  'enterprise': 3
};

export const SubscriptionGuard = ({ 
  children, 
  requiredPlan, 
  feature, 
  fallback 
}: SubscriptionGuardProps) => {
  const { subscriptionStatus, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return <div className="animate-pulse bg-muted h-32 rounded-md" />;
  }

  const currentPlanLevel = PLAN_HIERARCHY[subscriptionStatus.plan as keyof typeof PLAN_HIERARCHY] || 0;
  const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan];
  const hasAccess = currentPlanLevel >= requiredPlanLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Star className="h-5 w-5 text-blue-500" />;
      case 'professional':
        return <Crown className="h-5 w-5 text-purple-500" />;
      case 'enterprise':
        return <Building className="h-5 w-5 text-amber-500" />;
      default:
        return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const requiredTier = SUBSCRIPTION_TIERS[requiredPlan];

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-muted rounded-full">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <CardTitle className="text-xl">Recurso Premium</CardTitle>
        <CardDescription>
          {feature} está disponível a partir do plano {requiredTier.name}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div className="flex justify-center">
          <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
            {getPlanIcon(requiredPlan)}
            Requer: {requiredTier.name}
          </Badge>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">O que você ganha com o {requiredTier.name}:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {requiredTier.features.slice(0, 3).map((feat, index) => (
              <li key={index} className="flex items-center justify-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/pricing')}
            className="flex-1"
          >
            Ver Planos
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1"
          >
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface FeatureTooltipProps {
  requiredPlan: 'basic' | 'professional' | 'enterprise';
  children: ReactNode;
}

export const FeatureTooltip = ({ requiredPlan, children }: FeatureTooltipProps) => {
  const { subscriptionStatus } = useSubscription();
  
  const currentPlanLevel = PLAN_HIERARCHY[subscriptionStatus.plan as keyof typeof PLAN_HIERARCHY] || 0;
  const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan];
  const hasAccess = currentPlanLevel >= requiredPlanLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  const requiredTier = SUBSCRIPTION_TIERS[requiredPlan];

  return (
    <div className="relative group">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
        <Badge variant="secondary" className="text-xs">
          Requer {requiredTier.name}
        </Badge>
      </div>
    </div>
  );
};