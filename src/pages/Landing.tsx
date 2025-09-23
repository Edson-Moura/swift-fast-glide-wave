import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  Package, 
  BarChart3, 
  Users, 
  Shield, 
  DollarSign, 
  CheckCircle, 
  Star, 
  TrendingUp,
  Clock,
  Smartphone,
  Building2,
  ArrowRight,
  Crown,
  Building
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Package,
      title: "Controle de Estoque Inteligente",
      description: "Monitore ingredientes em tempo real com alertas automáticos de baixo estoque e datas de validade."
    },
    {
      icon: ChefHat,
      title: "Gestão de Cardápio",
      description: "Crie pratos, calcule custos baseados no inventário e receba sugestões de otimização."
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Dashboards com vendas, custos, performance de pratos e análise de lucratividade."
    },
    {
      icon: Users,
      title: "Gestão de Equipe",
      description: "Controle de acesso por perfis: admin, gerente, chef, funcionário do estoque."
    },
    {
      icon: DollarSign,
      title: "Otimização de Preços",
      description: "Ajuste inteligente de preços baseado em custos, demanda e metas de lucratividade."
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Backup automático, autenticação 2FA e logs de segurança para proteger seus dados."
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "R$ 49",
      period: "/mês",
      description: "Para restaurantes pequenos",
      icon: Star,
      features: [
        "Até 1 restaurante",
        "Até 5 usuários",
        "Gestão completa de estoque",
        "Cardápio completo",
        "Relatórios básicos",
        "Suporte prioritário"
      ],
      highlight: false
    },
    {
      name: "Profissional",
      price: "R$ 99",
      period: "/mês",
      description: "Para restaurantes em crescimento",
      icon: Crown,
      features: [
        "Até 1 restaurante",
        "Usuários ilimitados",
        "Gestão avançada de estoque",
        "Cardápio e preços inteligentes",
        "Relatórios avançados",
        "Gestão de fornecedores",
        "Suporte 24/7"
      ],
      highlight: true
    },
    {
      name: "Enterprise",
      price: "R$ 199",
      period: "/mês",
      description: "Para redes de restaurantes",
      icon: Building,
      features: [
        "Restaurantes ilimitados",
        "Usuários ilimitados",
        "Gestão de rede centralizada",
        "Relatórios consolidados",
        "API personalizada",
        "Suporte dedicado",
        "Treinamento incluído"
      ],
      highlight: false
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Proprietária",
      restaurant: "Cantina da Maria",
      content: "Desde que implementamos o RestaurantApp, conseguimos reduzir o desperdício em 40% e nossos custos ficaram muito mais previsíveis. A gestão de estoque é fantástica!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Chef Executivo", 
      restaurant: "Bistrô do Chef",
      content: "A funcionalidade de cálculo automático de custos dos pratos me poupa horas de trabalho toda semana. Agora posso focar no que realmente importa: criar pratos incríveis.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Gerente",
      restaurant: "Rede Sabor & Cia",
      content: "Gerenciar 5 restaurantes ficou muito mais fácil com os relatórios consolidados. Tenho visibilidade completa do negócio em tempo real.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10K+", label: "Restaurantes ativos" },
    { number: "98%", label: "Satisfação dos clientes" },
    { number: "30%", label: "Redução de desperdício" },
    { number: "24/7", label: "Suporte disponível" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container-mobile mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">RestaurantApp</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
        <div className="container-mobile mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <TrendingUp className="h-4 w-4 mr-2" />
            Sistema #1 em gestão de restaurantes
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transforme seu
            <span className="text-primary block">Restaurante</span>
            em um negócio
            <span className="text-primary">inteligente</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Gerencie estoque, cardápio, equipe e finanças em uma única plataforma. 
            Reduza custos, aumente a eficiência e tome decisões baseadas em dados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              Experimentar Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Clock className="mr-2 h-5 w-5" />
              Agendar Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container-mobile mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para gerenciar seu restaurante
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recursos completos para otimizar cada aspecto do seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-mobile mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Por que escolher o RestaurantApp?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Implementação Rápida</h3>
                    <p className="text-muted-foreground">Configure seu restaurante em menos de 30 minutos e comece a usar imediatamente.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Acesso Mobile</h3>
                    <p className="text-muted-foreground">Gerencie seu restaurante de qualquer lugar com nossa interface responsiva.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Escalabilidade</h3>
                    <p className="text-muted-foreground">Comece pequeno e cresça. Nosso sistema acompanha o crescimento do seu negócio.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-8 rounded-lg border">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary mb-2">30 dias</div>
                <div className="text-muted-foreground">Teste grátis</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Acesso completo a todos os recursos</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Suporte especializado</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Sem compromisso ou taxa de cancelamento</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/auth')}
              >
                Começar Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24" id="pricing">
        <div className="container-mobile mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos que crescem com seu negócio
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para seu restaurante. Comece com 30 dias grátis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.highlight ? 'border-primary border-2 shadow-lg' : 'border'}`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline justify-center mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.highlight ? '' : 'variant-outline'}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => navigate('/auth')}
                  >
                    Experimentar Grátis
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Todos os planos incluem 30 dias de teste grátis
            </p>
            <p className="text-sm text-muted-foreground">
              Cancele a qualquer momento. Sem taxas ocultas.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container-mobile mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mais de 10.000 restaurantes confiam no RestaurantApp para otimizar sua gestão
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                      <CardDescription>
                        {testimonial.role} • {testimonial.restaurant}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container-mobile mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para revolucionar seu restaurante?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a mais de 10.000 restaurantes que já transformaram sua gestão com o RestaurantApp.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={() => navigate('/auth')}
          >
            Começar Agora - Grátis por 30 dias
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container-mobile mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <ChefHat className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">RestaurantApp</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 RestaurantApp. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;