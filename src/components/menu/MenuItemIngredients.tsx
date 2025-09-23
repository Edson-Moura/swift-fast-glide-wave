import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMenu } from '@/hooks/useMenu';
import { useInventory } from '@/hooks/useInventory';
import { Plus, Trash2, Package, Scale } from 'lucide-react';
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

interface MenuItemIngredientsProps {
  menuItemId: string;
  onClose: () => void;
}

export const MenuItemIngredients = ({ menuItemId, onClose }: MenuItemIngredientsProps) => {
  const { menuItems, menuItemIngredients, addIngredientToMenuItem, removeIngredientFromMenuItem } = useMenu();
  const { products } = useInventory();
  
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const menuItem = menuItems.find(item => item.id === menuItemId);
  const ingredients = menuItemIngredients.filter(ing => ing.menu_item_id === menuItemId);

  const availableProducts = products.filter(product => 
    !ingredients.some(ing => ing.inventory_item_id === product.id)
  );

  const handleAddIngredient = () => {
    if (!selectedInventoryId || !quantity || !unit) return;

    addIngredientToMenuItem({
      menu_item_id: menuItemId,
      inventory_item_id: selectedInventoryId,
      quantity_needed: parseFloat(quantity),
      unit,
    });

    setSelectedInventoryId('');
    setQuantity('');
    setUnit('');
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    removeIngredientFromMenuItem(ingredientId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateIngredientCost = (ingredient: any) => {
    if (!ingredient.inventory_items) return 0;
    return ingredient.quantity_needed * ingredient.inventory_items.cost_per_unit;
  };

  const totalCost = ingredients.reduce((sum, ing) => sum + calculateIngredientCost(ing), 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingredientes - {menuItem?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo de custos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Custo dos Ingredientes</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço de Venda</p>
                  <p className="text-lg font-semibold">{formatCurrency(menuItem?.sale_price || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Margem Bruta</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency((menuItem?.sale_price || 0) - totalCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adicionar ingrediente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Adicionar Ingrediente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <Select value={selectedInventoryId} onValueChange={setSelectedInventoryId}>
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Selecionar ingrediente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="number"
                  step="0.001"
                  placeholder="Qtd"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                
                <div className="flex gap-1">
                  <Input
                    placeholder="Unidade"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    size="sm"
                    onClick={handleAddIngredient}
                    disabled={!selectedInventoryId || !quantity || !unit}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de ingredientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ingredientes Utilizados ({ingredients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ingredients.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum ingrediente adicionado ainda.
                </p>
              ) : (
                <div className="space-y-3">
                  {ingredients.map(ingredient => (
                    <div 
                      key={ingredient.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {ingredient.inventory_items?.name}
                          </h4>
                          <Badge variant="outline">
                            {ingredient.inventory_items?.unit}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            <span>Necessário: {ingredient.quantity_needed} {ingredient.unit}</span>
                          </div>
                          <div>
                            <span>Custo/Unidade: {formatCurrency(ingredient.inventory_items?.cost_per_unit || 0)}</span>
                          </div>
                          <div className="font-medium">
                            <span>Total: {formatCurrency(calculateIngredientCost(ingredient))}</span>
                          </div>
                        </div>

                        {ingredient.inventory_items && (
                          <div className="mt-1">
                            <Badge 
                              variant={ingredient.inventory_items.current_stock < ingredient.quantity_needed ? 'destructive' : 'default'}
                            >
                              Estoque: {ingredient.inventory_items.current_stock} {ingredient.inventory_items.unit}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Ingrediente</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover este ingrediente da receita?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveIngredient(ingredient.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};