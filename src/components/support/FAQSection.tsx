import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: number;
}

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'menu', label: 'Cardápio' },
    { value: 'inventory', label: 'Inventário' },
    { value: 'suppliers', label: 'Fornecedores' },
    { value: 'analytics', label: 'Análises' },
    { value: 'security', label: 'Segurança' },
    { value: 'general', label: 'Geral' },
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Erro ao carregar FAQs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas frequentes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      menu: 'bg-blue-100 text-blue-800',
      inventory: 'bg-green-100 text-green-800',
      suppliers: 'bg-purple-100 text-purple-800',
      analytics: 'bg-orange-100 text-orange-800',
      security: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getCategoryLabel = (category: string) => {
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj?.label || 'Geral';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando perguntas frequentes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span>Perguntas Frequentes</span>
          </CardTitle>
          <CardDescription>
            Encontre respostas para as dúvidas mais comuns sobre o sistema
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar perguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQs List */}
      <Card>
        <CardContent className="p-0">
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem key={faq.id} value={`item-${index}`}>
                  <AccordionTrigger className="px-6 py-4 text-left">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{faq.question}</span>
                      <Badge 
                        variant="secondary" 
                        className={`ml-4 ${getCategoryColor(faq.category)}`}
                      >
                        {getCategoryLabel(faq.category)}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Nenhuma pergunta encontrada</p>
              <p className="text-muted-foreground">
                {searchTerm ? 'Tente alterar os termos de busca' : 'Não há perguntas disponíveis no momento'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQSection;