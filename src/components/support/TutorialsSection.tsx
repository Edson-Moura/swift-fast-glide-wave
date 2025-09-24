import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  ChefHat, 
  Package, 
  BarChart3, 
  DollarSign,
  Building2,
  Shield,
  Video,
  FileText
} from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  type: 'video' | 'article';
  icon: any;
  link: string;
}

const TutorialsSection = () => {
  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Primeiros Passos: Configurando seu Restaurante',
      description: 'Aprenda a configurar as informações básicas do seu restaurante e adicionar sua primeira equipe.',
      duration: '5 min',
      level: 'beginner',
      category: 'Configuração',
      type: 'video',
      icon: ChefHat,
      link: '#'
    },
    {
      id: '2',
      title: 'Gerenciamento de Inventário: Do Básico ao Avançado',
      description: 'Como cadastrar produtos, definir estoques mínimos e configurar alertas automáticos.',
      duration: '12 min',
      level: 'beginner',
      category: 'Inventário',
      type: 'video',
      icon: Package,
      link: '#'
    },
    {
      id: '3',
      title: 'Criando seu Primeiro Prato no Cardápio',
      description: 'Passo a passo para criar pratos, definir ingredientes e calcular custos automaticamente.',
      duration: '8 min',
      level: 'beginner',
      category: 'Cardápio',
      type: 'video',
      icon: ChefHat,
      link: '#'
    },
    {
      id: '4',
      title: 'Configurando Fornecedores e Compras',
      description: 'Como cadastrar fornecedores, registrar compras e acompanhar histórico de pedidos.',
      duration: '10 min',
      level: 'intermediate',
      category: 'Fornecedores',
      type: 'article',
      icon: Building2,
      link: '#'
    },
    {
      id: '5',
      title: 'Análise de Demanda e Previsões Inteligentes',
      description: 'Entenda como a IA analisa seus dados para otimizar compras e reduzir desperdícios.',
      duration: '15 min',
      level: 'advanced',
      category: 'Análises',
      type: 'video',
      icon: BarChart3,
      link: '#'
    },
    {
      id: '6',
      title: 'Gestão de Preços e Margem de Lucro',
      description: 'Estratégias para definir preços competitivos mantendo lucratividade adequada.',
      duration: '18 min',
      level: 'intermediate',
      category: 'Preços',
      type: 'video',
      icon: DollarSign,
      link: '#'
    },
    {
      id: '7',
      title: 'Segurança de Dados e Backup Automático',
      description: 'Configure backups automáticos e implemente autenticação de dois fatores.',
      duration: '7 min',
      level: 'intermediate',
      category: 'Segurança',
      type: 'article',
      icon: Shield,
      link: '#'
    },
    {
      id: '8',
      title: 'Gerenciando Rede de Restaurantes',
      description: 'Funcionalidades avançadas para administrar múltiplas unidades de forma centralizada.',
      duration: '20 min',
      level: 'advanced',
      category: 'Rede',
      type: 'video',
      icon: Building2,
      link: '#'
    },
    {
      id: '9',
      title: 'Controle de Desperdício e Otimização',
      description: 'Como rastrear perdas, identificar padrões e implementar ações para reduzir desperdícios.',
      duration: '14 min',
      level: 'intermediate',
      category: 'Operacional',
      type: 'article',
      icon: BarChart3,
      link: '#'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return 'Geral';
    }
  };

  const categories = [...new Set(tutorials.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>Tutoriais e Guias</span>
          </CardTitle>
          <CardDescription>
            Aprenda a usar todas as funcionalidades do sistema com nossos guias passo a passo
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Categories */}
      {categories.map(category => {
        const categoryTutorials = tutorials.filter(t => t.category === category);
        
        return (
          <div key={category} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTutorials.map(tutorial => {
                const IconComponent = tutorial.icon;
                
                return (
                  <Card key={tutorial.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <IconComponent className="h-6 w-6 text-primary shrink-0" />
                        <div className="flex items-center space-x-2">
                          {tutorial.type === 'video' ? (
                            <Video className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Badge 
                            variant="secondary" 
                            className={getLevelColor(tutorial.level)}
                          >
                            {getLevelLabel(tutorial.level)}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">{tutorial.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <CardDescription className="text-sm mb-4 line-clamp-2">
                        {tutorial.description}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{tutorial.duration}</span>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          <Play className="h-3 w-3" />
                          <span>Assistir</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Quick Start Guide */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Guia de Início Rápido</span>
          </CardTitle>
          <CardDescription>
            Novo no sistema? Comece por aqui para configurar tudo em poucos minutos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-background/50">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                1
              </div>
              <p className="text-sm font-medium">Configure seu Restaurante</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-background/50">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                2
              </div>
              <p className="text-sm font-medium">Cadastre Produtos</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-background/50">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                3
              </div>
              <p className="text-sm font-medium">Crie seu Cardápio</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-background/50">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                4
              </div>
              <p className="text-sm font-medium">Adicione sua Equipe</p>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Play className="h-4 w-4 mr-2" />
              Começar Agora (8 min)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TutorialsSection;