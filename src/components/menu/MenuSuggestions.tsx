import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenu } from '@/hooks/useMenu';
import { AlertCircle, CheckCircle, RefreshCw, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export const MenuSuggestions = () => {
  const { menuSuggestions, generateSuggestions, resolveSuggestion, isLoading } = useMenu();

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock': return AlertCircle;
      case 'low_stock': return AlertTriangle;
      case 'high_cost': return DollarSign;
      case 'optimize_price': return TrendingUp;
      default: return AlertCircle;
    }
  };

  const getSuggestionColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSuggestionTypeLabel = (type: string) => {
    switch (type) {
      case 'out_of_stock': return 'Sem Estoque';
      case 'low_stock': return 'Estoque Baixo';
      case 'high_cost': return 'Custo Elevado';
      case 'optimize_price': return 'Otimizar Preço';
      default: return type;
    }
  };

  const handleGenerateSuggestions = () => {
    generateSuggestions();
  };

  const handleResolveSuggestion = (suggestionId: string) => {
    resolveSuggestion(suggestionId);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando sugestões...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Sugestões Ativas</h3>
          <p className="text-sm text-muted-foreground">
            {menuSuggestions.length} sugestões pendentes
          </p>
        </div>
        <Button onClick={handleGenerateSuggestions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Sugestões
        </Button>
      </div>

      {menuSuggestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tudo certo!</h3>
            <p className="text-muted-foreground text-center">
              Não há sugestões pendentes. Seu cardápio está otimizado com base no estoque atual.
            </p>
            <Button variant="outline" onClick={handleGenerateSuggestions} className="mt-4">
              Verificar novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {menuSuggestions.map(suggestion => {
            const Icon = getSuggestionIcon(suggestion.suggestion_type);
            
            return (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {suggestion.menu_items?.name}
                        </CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={getSuggestionColor(suggestion.priority)}>
                            {suggestion.priority === 'high' ? 'Alta' : 
                             suggestion.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                          </Badge>
                          <Badge variant="outline">
                            {getSuggestionTypeLabel(suggestion.suggestion_type)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveSuggestion(suggestion.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolver
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground">{suggestion.message}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Criado em: {new Date(suggestion.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};