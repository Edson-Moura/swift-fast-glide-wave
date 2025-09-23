import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Building2, MapPin, Phone, Mail, Plus, Trash2, Search } from 'lucide-react';
import { useChain } from '@/hooks/useChain';
import { useRestaurant } from '@/hooks/useRestaurant';
import { supabase } from '@/integrations/supabase/client';

interface ChainRestaurantsProps {
  compact?: boolean;
}

const ChainRestaurants = ({ compact = false }: ChainRestaurantsProps) => {
  const { 
    currentChain, 
    chainRestaurants, 
    canManageChain, 
    addRestaurantToChain, 
    removeRestaurantFromChain 
  } = useChain();
  const { restaurants } = useRestaurant();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (canManageChain) {
      fetchAvailableRestaurants();
    }
  }, [canManageChain, currentChain]);

  const fetchAvailableRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .is('chain_id', null);

      if (error) throw error;
      setAvailableRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching available restaurants:', error);
    }
  };

  const filteredRestaurants = chainRestaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRestaurant = async (restaurantId: string) => {
    if (currentChain) {
      await addRestaurantToChain(restaurantId, currentChain.id);
      await fetchAvailableRestaurants();
      setShowAddForm(false);
    }
  };

  const handleRemoveRestaurant = async (restaurantId: string) => {
    await removeRestaurantFromChain(restaurantId);
    await fetchAvailableRestaurants();
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {filteredRestaurants.slice(0, 5).map((restaurant) => (
          <div key={restaurant.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{restaurant.name}</p>
                <p className="text-xs text-muted-foreground">{restaurant.address || 'Endereço não informado'}</p>
              </div>
            </div>
            <Badge variant="secondary">Ativa</Badge>
          </div>
        ))}
        {chainRestaurants.length > 5 && (
          <p className="text-sm text-muted-foreground text-center">
            +{chainRestaurants.length - 5} restaurantes
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar restaurantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {canManageChain && (
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Restaurante
          </Button>
        )}
      </div>

      {/* Add Restaurant Form */}
      {showAddForm && availableRestaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Restaurante à Rede</CardTitle>
            <CardDescription>
              Selecione um restaurante para adicionar à rede
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {availableRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {restaurant.address || 'Endereço não informado'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleAddRestaurant(restaurant.id)}
                  >
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <Card key={restaurant.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                    <Badge variant="secondary">Ativa</Badge>
                  </div>
                </div>
                
                {canManageChain && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRestaurant(restaurant.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {restaurant.description && (
                <p className="text-sm text-muted-foreground">
                  {restaurant.description}
                </p>
              )}
              
              <div className="space-y-2">
                {restaurant.address && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                
                {restaurant.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                
                {restaurant.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{restaurant.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{new Date(restaurant.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRestaurants.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'Nenhum restaurante encontrado' : 'Nenhum restaurante na rede'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Adicione restaurantes à sua rede para começar'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ChainRestaurants;