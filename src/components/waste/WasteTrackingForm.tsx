import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { useInventory } from '@/hooks/useInventory';
import { useWasteTracking, WasteEntry } from '@/hooks/useWasteTracking';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';

const wasteCategories = [
  { value: 'expired', label: 'Validade Vencida' },
  { value: 'preparation_error', label: 'Erro no Preparo' },
  { value: 'spoiled', label: 'Estragado' },
  { value: 'damaged', label: 'Danificado' },
  { value: 'other', label: 'Outro' },
];

const WasteTrackingForm = () => {
  const { products: inventoryItems, refetch: fetchInventoryItems } = useInventory();
  const { addWasteEntry, loading } = useWasteTracking();
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();

  const [formData, setFormData] = useState({
    inventory_item_id: '',
    quantity_wasted: '',
    unit: '',
    waste_reason: '',
    waste_category: '' as WasteEntry['waste_category'] | '',
    cost_impact: '',
    waste_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const selectedItem = inventoryItems.find(item => item.id === formData.inventory_item_id);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        unit: selectedItem.unit,
        cost_impact: (parseFloat(prev.quantity_wasted || '0') * selectedItem.cost_per_unit).toString()
      }));
    }
  }, [selectedItem, formData.quantity_wasted]);

  const handleQuantityChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      quantity_wasted: value,
      cost_impact: selectedItem 
        ? (parseFloat(value || '0') * selectedItem.cost_per_unit).toString()
        : '0'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !currentRestaurant?.id) return;

    try {
      await addWasteEntry({
        restaurant_id: currentRestaurant.id,
        inventory_item_id: formData.inventory_item_id,
        quantity_wasted: parseFloat(formData.quantity_wasted),
        unit: formData.unit,
        waste_reason: formData.waste_reason,
        waste_category: formData.waste_category as WasteEntry['waste_category'],
        cost_impact: parseFloat(formData.cost_impact),
        registered_by: user.id,
        waste_date: formData.waste_date,
        notes: formData.notes || undefined,
      });

      // Reset form
      setFormData({
        inventory_item_id: '',
        quantity_wasted: '',
        unit: '',
        waste_reason: '',
        waste_category: '',
        cost_impact: '',
        waste_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (error) {
      console.error('Erro ao registrar desperdício:', error);
    }
  };

  const isFormValid = formData.inventory_item_id && 
                     formData.quantity_wasted && 
                     formData.waste_reason && 
                     formData.waste_category;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Registrar Desperdício
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inventory_item_id">Item do Inventário *</Label>
              <Select value={formData.inventory_item_id} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, inventory_item_id: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {item.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="waste_category">Categoria do Desperdício *</Label>
              <Select value={formData.waste_category} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, waste_category: value as WasteEntry['waste_category'] }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {wasteCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity_wasted">Quantidade Desperdiçada *</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity_wasted"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity_wasted}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="0.00"
                />
                <Input
                  value={formData.unit}
                  readOnly
                  className="w-20"
                  placeholder="Un."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cost_impact">Impacto no Custo (R$)</Label>
              <Input
                id="cost_impact"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_impact}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_impact: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="waste_date">Data do Desperdício</Label>
              <div className="relative">
                <Input
                  id="waste_date"
                  type="date"
                  value={formData.waste_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, waste_date: e.target.value }))}
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor="waste_reason">Motivo do Desperdício *</Label>
              <Input
                id="waste_reason"
                value={formData.waste_reason}
                onChange={(e) => setFormData(prev => ({ ...prev, waste_reason: e.target.value }))}
                placeholder="Ex: Produto vencido, queimou na cozinha..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais sobre o desperdício..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isFormValid || loading}
          >
            {loading ? 'Registrando...' : 'Registrar Desperdício'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WasteTrackingForm;