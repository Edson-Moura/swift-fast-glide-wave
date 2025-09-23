import { useState } from 'react';
import { Category, useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Utensils, Coffee, Leaf, Snowflake, Droplets, Sparkles } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
}

const CategoryManager = ({ categories }: CategoryManagerProps) => {
  const { products } = useInventory();
  const [newCategory, setNewCategory] = useState('');

  // Count products per category
  const categoryStats = categories.map(category => ({
    ...category,
    productCount: products.filter(p => p.category === category.name).length,
    totalValue: products
      .filter(p => p.category === category.name)
      .reduce((sum, p) => sum + (p.current_stock * p.cost_per_unit), 0)
  }));

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('alimento') || name.includes('comida')) return <Utensils className="h-5 w-5" />;
    if (name.includes('bebida') || name.includes('líquido')) return <Coffee className="h-5 w-5" />;
    if (name.includes('fresco') || name.includes('vegetal') || name.includes('fruta')) return <Leaf className="h-5 w-5" />;
    if (name.includes('congelado') || name.includes('gelado')) return <Snowflake className="h-5 w-5" />;
    if (name.includes('limpeza') || name.includes('higiene')) return <Sparkles className="h-5 w-5" />;
    if (name.includes('líquido') || name.includes('molho')) return <Droplets className="h-5 w-5" />;
    return <Package className="h-5 w-5" />;
  };

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('alimento') || name.includes('comida')) return 'bg-orange-100 border-orange-200';
    if (name.includes('bebida')) return 'bg-blue-100 border-blue-200';
    if (name.includes('fresco') || name.includes('vegetal') || name.includes('fruta')) return 'bg-green-100 border-green-200';
    if (name.includes('congelado')) return 'bg-cyan-100 border-cyan-200';
    if (name.includes('limpeza')) return 'bg-purple-100 border-purple-200';
    if (name.includes('carne')) return 'bg-red-100 border-red-200';
    return 'bg-gray-100 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Gerenciar Categorias</span>
          </CardTitle>
          <CardDescription>
            Organize seus produtos em categorias para melhor controle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Nome da nova categoria..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button onClick={() => {
              // Here you would normally add the category to the database
              // For now, we'll just clear the input as categories are auto-generated from products
              setNewCategory('');
            }}>
              Adicionar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            As categorias são criadas automaticamente quando você adiciona produtos. 
            Você pode criar uma categoria personalizada aqui para usar em futuros produtos.
          </p>
        </CardContent>
      </Card>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral das Categorias</CardTitle>
          <CardDescription>
            Estatísticas das suas categorias de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-primary/5">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium">Total de Categorias</span>
              </div>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-green-600" />
                <span className="font-medium">Total de Produtos</span>
              </div>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Valor Total</span>
              </div>
              <p className="text-2xl font-bold">
                R$ {categoryStats.reduce((sum, cat) => sum + cat.totalValue, 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryStats.map((category) => (
          <Card key={category.id} className={`${getCategoryColor(category.name)} border-2`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(category.name)}
                  <CardTitle className="text-base">{category.name}</CardTitle>
                </div>
                <Badge variant="secondary">
                  {category.productCount} produtos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Produtos:</span>
                <span className="text-sm">{category.productCount}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valor total:</span>
                <span className="text-sm font-bold">
                  R$ {category.totalValue.toLocaleString('pt-BR')}
                </span>
              </div>

              {/* Top products in this category */}
              <div className="mt-4">
                <h5 className="text-sm font-medium mb-2">Principais produtos:</h5>
                <div className="space-y-1">
                  {products
                    .filter(p => p.category === category.name)
                    .sort((a, b) => (b.current_stock * b.cost_per_unit) - (a.current_stock * a.cost_per_unit))
                    .slice(0, 3)
                    .map(product => (
                      <div key={product.id} className="flex justify-between items-center text-xs">
                        <span className="truncate">{product.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {product.current_stock} {product.unit}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground">
              As categorias aparecerão automaticamente quando você adicionar produtos ao estoque.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryManager;