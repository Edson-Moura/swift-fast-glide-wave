import { useState } from 'react';
import { Product } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Edit, Package, Search, Trash2 } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import ProductForm from './ProductForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ProductListProps {
  products: Product[];
  compact?: boolean;
}

const ProductList = ({ products, compact = false }: ProductListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { deleteProduct } = useInventory();

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock = !stockFilter || stockFilter === 'all' || (
      stockFilter === 'low' && product.current_stock <= product.min_stock ||
      stockFilter === 'normal' && product.current_stock > product.min_stock ||
      stockFilter === 'out' && product.current_stock === 0
    );

    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStockStatus = (product: Product) => {
    if (product.current_stock === 0) return { status: 'out', label: 'Sem estoque', variant: 'destructive' as const };
    if (product.current_stock <= product.min_stock) return { status: 'low', label: 'Baixo', variant: 'destructive' as const };
    return { status: 'normal', label: 'Normal', variant: 'default' as const };
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {products.slice(0, 5).map((product) => {
          const stockStatus = getStockStatus(product);
          return (
            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={stockStatus.variant} className="text-xs">
                  {product.current_stock} {product.unit}
                </Badge>
                {stockStatus.status === 'low' && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status do estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="normal">Estoque normal</SelectItem>
                <SelectItem value="low">Estoque baixo</SelectItem>
                <SelectItem value="out">Sem estoque</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStockFilter('all');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product);
          return (
            <Card key={product.id} className="relative">
              {stockStatus.status === 'low' && (
                <div className="absolute top-2 right-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estoque:</span>
                  <Badge variant={stockStatus.variant}>
                    {product.current_stock} {product.unit}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mínimo:</span>
                  <span className="text-sm">{product.min_stock} {product.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Preço unitário:</span>
                  <span className="text-sm">R$ {product.cost_per_unit.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Valor total:</span>
                  <span className="text-sm font-bold">
                    R$ {(product.current_stock * product.cost_per_unit).toFixed(2)}
                  </span>
                </div>

                {product.supplier_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fornecedor:</span>
                    <span className="text-sm">{product.supplier_name}</span>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingProduct(product)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(product)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou adicione novos produtos ao estoque.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductList;