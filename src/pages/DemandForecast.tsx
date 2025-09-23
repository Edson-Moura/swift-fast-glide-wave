import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DemandAnalysis } from '@/components/demand/DemandAnalysis';
import { PurchasePredictions } from '@/components/demand/PurchasePredictions';
import { SubscriptionGuard } from '@/components/ui/subscription-guard';
import { 
  TrendingUp, 
  ShoppingCart, 
  BarChart3,
  Brain
} from 'lucide-react';

export default function DemandForecast() {
  const features = [
    {
      icon: <Brain className="h-5 w-5" />,
      title: "Análise Inteligente",
      description: "IA analisa padrões de consumo histórico para prever demanda futura"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Tendências de Mercado",
      description: "Identifica produtos em alta ou baixa para otimizar estoque"
    },
    {
      icon: <ShoppingCart className="h-5 w-5" />,
      title: "Compras Inteligentes",
      description: "Recomendações de quando e quanto comprar de cada produto"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Previsões Precisas",
      description: "Evite faltas e excessos com previsões baseadas em dados reais"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <SubscriptionGuard 
        requiredPlan="professional" 
        feature="Análise e Previsão de Demanda"
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Análise e Previsão de Demanda
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Use inteligência artificial para prever a demanda de produtos e otimizar suas compras, 
              evitando faltas de estoque e reduzindo desperdícios.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-2 p-2 bg-primary/10 rounded-lg w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="analysis" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Análise de Demanda</span>
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Previsões de Compra</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-6">
              <DemandAnalysis />
            </TabsContent>

            <TabsContent value="predictions" className="space-y-6">
              <PurchasePredictions />
            </TabsContent>
          </Tabs>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Como Funciona</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">1</div>
                  <div>
                    <p className="font-medium">Coleta de Dados</p>
                    <p className="text-sm text-muted-foreground">Analisa o histórico de consumo dos últimos 90 dias</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">2</div>
                  <div>
                    <p className="font-medium">Análise de Padrões</p>
                    <p className="text-sm text-muted-foreground">Identifica tendências e sazonalidades</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">3</div>
                  <div>
                    <p className="font-medium">Previsões Inteligentes</p>
                    <p className="text-sm text-muted-foreground">Gera recomendações personalizadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Benefícios</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm">Redução de até 30% nos custos de estoque</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-sm">Evita faltas de produtos populares</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <p className="text-sm">Otimiza o fluxo de caixa</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className="text-sm">Melhora a satisfação dos clientes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SubscriptionGuard>
    </div>
  );
}