import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calculator, RefreshCw, Settings, Target } from 'lucide-react';

interface AutoPriceCalculatorProps {
  onRecalculateAll: (markup?: number) => void;
  onApplyByCategory: (category: string, markup: number) => void;
  categories: string[];
}

export const AutoPriceCalculator = ({ 
  onRecalculateAll, 
  onApplyByCategory, 
  categories 
}: AutoPriceCalculatorProps) => {
  const [globalMarkup, setGlobalMarkup] = useState(2.5);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryMarkup, setCategoryMarkup] = useState(2.5);
  const [profitTargetPercent, setProfitTargetPercent] = useState(25);

  const presetMarkups = [
    { label: '100% (2x)', value: 2.0, description: 'Conservador' },
    { label: '150% (2.5x)', value: 2.5, description: 'Padrão' },
    { label: '200% (3x)', value: 3.0, description: 'Premium' },
    { label: '300% (4x)', value: 4.0, description: 'Alto valor' }
  ];

  const calculateMarkupFromProfit = (profitPercent: number) => {
    // Se queremos X% de lucro, o markup deve ser 1 / (1 - X/100)
    return 1 / (1 - profitPercent / 100);
  };

  const handleProfitTargetChange = (profit: number) => {
    setProfitTargetPercent(profit);
    const calculatedMarkup = calculateMarkupFromProfit(profit);
    setGlobalMarkup(calculatedMarkup);
  };

  return (
    <div className="space-y-6">
      {/* Recálculo Global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Recálculo Automático</span>
          </CardTitle>
          <CardDescription>
            Aplicar regras de precificação em todos os produtos
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Presets de Markup */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Markups Pré-definidos</Label>
            <div className="grid grid-cols-2 gap-2">
              {presetMarkups.map((preset) => (
                <Button
                  key={preset.value}
                  variant={globalMarkup === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGlobalMarkup(preset.value)}
                  className="text-xs"
                >
                  <div className="text-center">
                    <div className="font-medium">{preset.label}</div>
                    <div className="text-xs opacity-70">{preset.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Markup Personalizado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Markup Personalizado</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                value={globalMarkup}
                onChange={(e) => setGlobalMarkup(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Multiplicador do custo (ex: 2.5 = 150% markup)
              </p>
            </div>
            
            <div>
              <Label className="text-sm">Meta de Lucro (%)</Label>
              <Input
                type="number"
                step="1"
                min="1"
                max="80"
                value={profitTargetPercent}
                onChange={(e) => handleProfitTargetChange(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Margem de lucro desejada
              </p>
            </div>
          </div>

          {/* Preview do Markup */}
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span>Markup: {((globalMarkup - 1) * 100).toFixed(1)}%</span>
              <Badge variant="outline">
                Margem: {(100 - (100 / globalMarkup)).toFixed(1)}%
              </Badge>
            </div>
          </div>

          <Button 
            onClick={() => onRecalculateAll(globalMarkup)}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalcular Todos os Preços
          </Button>
        </CardContent>
      </Card>

      {/* Aplicação por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Por Categoria</span>
          </CardTitle>
          <CardDescription>
            Aplicar markup específico para uma categoria
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm">Markup</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                value={categoryMarkup}
                onChange={(e) => setCategoryMarkup(Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <Button 
            onClick={() => selectedCategory && onApplyByCategory(selectedCategory, categoryMarkup)}
            disabled={!selectedCategory}
            className="w-full"
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Aplicar à Categoria
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};