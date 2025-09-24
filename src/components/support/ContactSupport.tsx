import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  Clock,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Zap,
  DollarSign,
  BookOpen
} from 'lucide-react';
import { z } from 'zod';

const contactFormSchema = z.object({
  subject: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  priority: z.string().min(1, 'Selecione uma prioridade'),
  message: z.string().min(20, 'Mensagem deve ter pelo menos 20 caracteres'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactSupport = () => {
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ContactFormData>({
    subject: '',
    category: '',
    priority: '',
    message: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const categories = [
    { value: 'technical', label: 'Problemas Técnicos', icon: AlertCircle },
    { value: 'billing', label: 'Cobrança e Pagamento', icon: DollarSign },
    { value: 'feature', label: 'Solicitação de Funcionalidade', icon: Zap },
    { value: 'training', label: 'Treinamento e Uso', icon: BookOpen },
    { value: 'general', label: 'Questão Geral', icon: MessageCircle },
  ];

  const priorities = [
    { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-800', description: 'Dúvida geral - 24-48h' },
    { value: 'medium', label: 'Média', color: 'bg-blue-100 text-blue-800', description: 'Problema moderado - 12-24h' },
    { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800', description: 'Problema urgente - 4-8h' },
    { value: 'critical', label: 'Crítica', color: 'bg-red-100 text-red-800', description: 'Sistema inoperante - 1-2h' },
  ];

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      contactFormSchema.parse(formData);
      setErrors({});
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para enviar uma mensagem",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Create support ticket
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          restaurant_id: currentRestaurant?.id || null,
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          priority: formData.priority,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Mensagem Enviada!",
        description: "Recebemos sua mensagem e responderemos em breve",
        variant: "default",
      });

      // Reset form
      setFormData({
        subject: '',
        category: '',
        priority: '',
        message: '',
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<ContactFormData> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        console.error('Erro ao enviar mensagem:', error);
        toast({
          title: "Erro",
          description: "Não foi possível enviar sua mensagem. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Entre em Contato</span>
          </CardTitle>
          <CardDescription>
            Nosso time de suporte está pronto para ajudar você
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Envie sua Mensagem</CardTitle>
              <CardDescription>
                Descreva seu problema ou dúvida com o máximo de detalhes possível
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Assunto</label>
                <Input
                  placeholder="Descreva brevemente o problema..."
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            <category.icon className="h-4 w-4" />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prioridade</label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className={priority.color}>
                              {priority.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {priority.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-destructive">{errors.priority}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  placeholder="Descreva em detalhes o problema ou dúvida. Inclua passos para reproduzir o erro, mensagens de erro específicas, ou qualquer informação relevante..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.message.length}/500 caracteres
                </p>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          {/* Contact Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outros Canais de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">suporte@restaurantapp.com</p>
                  <p className="text-xs text-muted-foreground mt-1">Resposta em até 24h</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">(11) 9999-9999</p>
                  <p className="text-xs text-muted-foreground mt-1">Seg-Sex, 9h-18h</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <MessageCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Chat Online</p>
                  <p className="text-sm text-muted-foreground">Disponível no sistema</p>
                  <p className="text-xs text-muted-foreground mt-1">Resposta imediata</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Tempo de Resposta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorities.map(priority => (
                <div key={priority.value} className="flex items-center justify-between">
                  <Badge variant="secondary" className={priority.color}>
                    {priority.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {priority.description.split(' - ')[1]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Status */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Sistema Operacional</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Todos os serviços funcionando normalmente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;