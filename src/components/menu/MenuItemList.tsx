import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenu } from '@/hooks/useMenu';
import { MenuItemForm } from './MenuItemForm';
import { MenuItemIngredients } from './MenuItemIngredients';
import { Plus, Edit, Trash2, ChefHat, DollarSign, Clock, TrendingUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const MenuItemList = () => {
  const { menuItems, deleteMenuItem, isLoading } = useMenu();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showIngredients, setShowIngredients] = useState<string | null>(null);

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(menuItems.map(item => item.category))];

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleDelete = (itemId: string) => {
    deleteMenuItem(itemId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPriorityColor = (margin: number) => {
    if (margin < 10) return 'destructive';
    if (margin < 30) return 'secondary';
    return 'default';
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando pratos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <Input
          placeholder="Buscar pratos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button
          onClick={() => {
            setSelectedItem(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Prato
        </Button>
      </div>

      <div className="grid gap-4">
        {categories.map(category => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  {category}
                  <Badge variant="outline">{categoryItems.length} pratos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryItems.map(item => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <Badge variant={item.is_available ? 'default' : 'secondary'}>
                            {item.is_available ? 'Disponível' : 'Indisponível'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-muted-foreground">Venda:</span>
                            <span className="font-medium">{formatCurrency(item.sale_price)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-muted-foreground">Custo:</span>
                            <span className="font-medium">{formatCurrency(item.cost_price)}</span>
                          </div>
                          {item.preparation_time && (
                            <div className="flex items-center gap-1 col-span-2">
                              <Clock className="h-3 w-3" />
                              <span className="text-muted-foreground">Preparo:</span>
                              <span className="font-medium">{item.preparation_time} min</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant={getPriorityColor(item.profit_margin)}>
                            Margem: {item.profit_margin.toFixed(1)}%
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowIngredients(item.id)}
                          >
                            Ingredientes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir Prato</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{item.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum prato encontrado.
        </div>
      )}

      {showForm && (
        <MenuItemForm
          item={selectedItem}
          onClose={() => {
            setShowForm(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showIngredients && (
        <MenuItemIngredients
          menuItemId={showIngredients}
          onClose={() => setShowIngredients(null)}
        />
      )}
    </div>
  );
};