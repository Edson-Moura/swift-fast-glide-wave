import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Send,
  Ticket,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  support_responses?: SupportResponse[];
}

interface SupportResponse {
  id: string;
  message: string;
  is_staff_response: boolean;
  created_at: string;
}

const SupportTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newResponse, setNewResponse] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingResponse, setSendingResponse] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          support_responses (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return;

    try {
      setSendingResponse(true);

      const { error } = await supabase
        .from('support_responses')
        .insert({
          ticket_id: selectedTicket.id,
          message: newResponse.trim(),
          is_staff_response: false,
        });

      if (error) throw error;

      toast({
        title: "Resposta Enviada",
        description: "Sua resposta foi adicionada ao ticket",
      });

      setNewResponse('');
      fetchTickets(); // Refresh to get new response
      
      // Update selected ticket with new response
      const updatedTicket = {
        ...selectedTicket,
        support_responses: [
          ...(selectedTicket.support_responses || []),
          {
            id: 'temp',
            message: newResponse.trim(),
            is_staff_response: false,
            created_at: new Date().toISOString(),
          }
        ]
      };
      setSelectedTicket(updatedTicket);

    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua resposta",
        variant: "destructive",
      });
    } finally {
      setSendingResponse(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Média';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return 'Aberto';
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      technical: 'Técnico',
      billing: 'Cobrança',
      feature: 'Funcionalidade',
      training: 'Treinamento',
      general: 'Geral',
    };
    return categories[category as keyof typeof categories] || 'Geral';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando seus tickets...</p>
        </CardContent>
      </Card>
    );
  }

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => setSelectedTicket(null)}
          className="mb-4"
        >
          ← Voltar aos Tickets
        </Button>

        {/* Ticket Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  <span>{selectedTicket.subject}</span>
                </CardTitle>
                <CardDescription className="mt-2">
                  #{selectedTicket.id.slice(0, 8)} • {getCategoryLabel(selectedTicket.category)}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getPriorityColor(selectedTicket.priority)}>
                  {getPriorityLabel(selectedTicket.priority)}
                </Badge>
                <Badge className={getStatusColor(selectedTicket.status)}>
                  {getStatusLabel(selectedTicket.status)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Criado {formatDistanceToNow(new Date(selectedTicket.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <p>{selectedTicket.message}</p>
            </div>
          </CardContent>
        </Card>

        {/* Responses */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Conversas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTicket.support_responses && selectedTicket.support_responses.length > 0 ? (
              selectedTicket.support_responses.map((response) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-lg ${
                    response.is_staff_response
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'bg-muted/50 border-l-4 border-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {response.is_staff_response ? 'Suporte RestaurantApp' : 'Você'}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(response.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{response.message}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Ainda não há respostas para este ticket
              </p>
            )}
          </CardContent>
        </Card>

        {/* New Response */}
        {selectedTicket.status !== 'closed' && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Resposta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Digite sua resposta..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={sendResponse}
                disabled={!newResponse.trim() || sendingResponse}
                className="w-full"
              >
                {sendingResponse ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Resposta
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Meus Tickets de Suporte</span>
          </CardTitle>
          <CardDescription>
            Acompanhe o status dos seus chamados de suporte
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(ticket.category)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {ticket.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>#{ticket.id.slice(0, 8)}</span>
                      <span>
                        {formatDistanceToNow(new Date(ticket.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                      {ticket.support_responses && ticket.support_responses.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.support_responses.length} respostas</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Ver Detalhes</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Nenhum ticket de suporte</p>
              <p className="text-muted-foreground mb-6">
                Você ainda não criou nenhum chamado de suporte
              </p>
              <Button 
                onClick={() => {
                  // Navigate to contact tab - this would need to be implemented
                  // For now, we'll show a message
                  toast({
                    title: "Dica",
                    description: "Use a aba 'Contato' para criar um novo ticket",
                  });
                }}
              >
                Criar Primeiro Ticket
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;