import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, RotateCcw, Plus, Package } from 'lucide-react';

const movementSchema = z.object({
  product_id: z.string().min(1, 'Produto é obrigatório'),
  type: z.enum(['entrada', 'saida', 'ajuste'], {
    required_error: 'Tipo de movimentação é obrigatório'
  }),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unit_cost: z.number().min(0).optional(),
  reason: z.string().min(1, 'Motivo é obrigatório'),
  reference: z.string().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

const StockMovement = () => {
  const { products, addStockMovement } = useInventory();
  const [loading, setLoading] = useState(false);

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      product_id: '',
      type: 'entrada',
      quantity: 0,
      unit_cost: 0,
      reason: '',
      reference: '',
    },
  });

  const selectedProduct = products.find(p => p.id === form.watch('product_id'));
  const movementType = form.watch('type');

  const onSubmit = async (data: MovementFormData) => {
    setLoading(true);
    try {
      await addStockMovement({
        product_id: data.product_id,
        type: data.type,
        quantity: data.quantity,
        unit_cost: data.unit_cost,
        reason: data.reason,
        reference: data.reference
      });
      form.reset();
    } catch (error) {
      console.error('Error adding stock movement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'saida': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'ajuste': return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entrada': return 'bg-green-100 text-green-800 border-green-200';
      case 'saida': return 'bg-red-100 text-red-800 border-red-200';
      case 'ajuste': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Movement Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Nova Movimentação de Estoque</span>
          </CardTitle>
          <CardDescription>
            Registre entradas, saídas ou ajustes de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {product.current_stock} {product.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Movimentação *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entrada">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span>Entrada</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="saida">
                            <div className="flex items-center space-x-2">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <span>Saída</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ajuste">
                            <div className="flex items-center space-x-2">
                              <RotateCcw className="h-4 w-4 text-blue-500" />
                              <span>Ajuste</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {movementType === 'ajuste' ? 'Nova Quantidade Total *' : 'Quantidade *'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0" 
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      {selectedProduct && (
                        <p className="text-xs text-muted-foreground">
                          Estoque atual: {selectedProduct.current_stock} {selectedProduct.unit}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {movementType === 'entrada' && (
                  <FormField
                    control={form.control}
                    name="unit_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Unitário (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0,00" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referência</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Compra #1234, Receita #5678" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o motivo da movimentação..." 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Current Stock Info */}
              {selectedProduct && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Produto</p>
                        <p className="font-semibold">{selectedProduct.name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Estoque Atual</p>
                        <p className="font-semibold">{selectedProduct.current_stock} {selectedProduct.unit}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Estoque Mínimo</p>
                        <p className="font-semibold">{selectedProduct.min_stock} {selectedProduct.unit}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Preço Unitário</p>
                        <p className="font-semibold">R$ {selectedProduct.cost_per_unit.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                >
                  Limpar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Registrar Movimentação'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Movement Types Info */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Movimentação</CardTitle>
          <CardDescription>
            Entenda quando usar cada tipo de movimentação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold text-green-700">Entrada</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Use para registrar compras, devoluções de clientes ou recebimento de produtos.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-500 mt-1" />
              <div>
                <h4 className="font-semibold text-red-700">Saída</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Use para registrar consumo na cozinha, vendas, perdas ou desperdício.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 border rounded-lg">
              <RotateCcw className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-700">Ajuste</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Use para corrigir o estoque após inventário físico ou correção de erros.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockMovement;