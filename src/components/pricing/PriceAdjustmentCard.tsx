import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ItemPricing } from '@/hooks/usePriceManagement';
import { DollarSign, TrendingUp, Calculator, Check } from 'lucide-react';

interface PriceAdjustmentCardProps {
  item: ItemPricing;
  onUpdatePrice: (itemId: string, newPrice: number) => void;
}

export const PriceAdjustmentCard = ({ item, onUpdatePrice }: PriceAdjustmentCardProps) => {
  const [customPrice, setCustomPrice] = useState(item.current_price || item.suggested_price);
  const [isEditing, setIsEditing] = useState(false);

  const calculateMargin = (price: number) => {
    if (item.current_cost === 0) return 0;
    return ((price - item.current_cost) / price) * 100;
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 20) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getMarginVariant = (margin: number) => {
    if (margin >= 30) return 'default';
    if (margin >= 20) return 'secondary';
    return 'destructive';
  };

  const handleSavePrice = () => {
    if (customPrice && customPrice > 0) {
      onUpdatePrice(item.id, customPrice);
      setIsEditing(false);
    }
  };

  const applySuggestedPrice = () => {
    setCustomPrice(item.suggested_price);
    onUpdatePrice(item.id, item.suggested_price);
  };

  const currentMargin = calculateMargin(customPrice || item.suggested_price);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{item.item_name}</CardTitle>
            <CardDescription className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Fornecedor: {item.supplier}
              </span>
            </CardDescription>
          </div>
          <Badge variant={getMarginVariant(currentMargin)} className="text-xs">
            {currentMargin.toFixed(1)}% margem
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações de Custo */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-muted-foreground">Custo Atual</Label>
            <div className="font-medium">
              R$ {item.current_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Preço Sugerido</Label>
            <div className="font-medium text-primary">
              R$ {item.suggested_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <Separator />

        {/* Editor de Preço */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Preço de Venda</Label>
          
          {isEditing ? (
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="pl-9"
                  placeholder="0.00"
                />
              </div>
              <Button size="sm" onClick={handleSavePrice}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                R$ {(customPrice || item.suggested_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            </div>
          )}

          {/* Informações da Margem */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Margem de Lucro:</span>
            <span className={`font-medium ${getMarginColor(currentMargin)}`}>
              {currentMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        <Separator />

        {/* Ações Rápidas */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={applySuggestedPrice}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Aplicar Preço Sugerido
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const newPrice = item.current_cost * 2;
                setCustomPrice(newPrice);
                onUpdatePrice(item.id, newPrice);
              }}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              100% Markup
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const newPrice = item.current_cost * 3;
                setCustomPrice(newPrice);
                onUpdatePrice(item.id, newPrice);
              }}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              200% Markup
            </Button>
          </div>
        </div>

        {/* Indicadores Visuais */}
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Última atualização:</span>
            <span>{new Date(item.last_updated).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};