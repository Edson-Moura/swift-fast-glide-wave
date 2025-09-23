import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMenu } from '@/hooks/useMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  sale_price: z.number().min(0, 'Preço de venda deve ser maior que zero'),
  is_available: z.boolean(),
  preparation_time: z.number().min(0).optional(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  item?: any;
  onClose: () => void;
}

export const MenuItemForm = ({ item, onClose }: MenuItemFormProps) => {
  const { createMenuItem, updateMenuItem, isCreating, isUpdating } = useMenu();

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      category: item?.category || '',
      sale_price: item?.sale_price || 0,
      is_available: item?.is_available ?? true,
      preparation_time: item?.preparation_time || 0,
    },
  });

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      if (item) {
        await updateMenuItem({ ...data, id: item.id });
      } else {
        await createMenuItem({
          name: data.name,
          description: data.description || '',
          category: data.category,
          sale_price: data.sale_price,
          is_available: data.is_available,
          preparation_time: data.preparation_time,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving menu item:', error);
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Prato' : 'Adicionar Prato'}</DialogTitle>
          <DialogDescription>
            {item ? 'Edite as informações do prato.' : 'Adicione um novo prato ao cardápio.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Prato *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Risoto de Camarão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do prato..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Pratos Principais, Sobremesas, Bebidas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda (R$) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preparation_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de Preparo (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Disponível no Cardápio</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Define se o prato está disponível para pedidos
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : item ? 'Salvar Alterações' : 'Adicionar Prato'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};