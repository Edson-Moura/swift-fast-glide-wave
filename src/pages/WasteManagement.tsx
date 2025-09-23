import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, BarChart3, History, AlertTriangle } from 'lucide-react';
import WasteTrackingForm from '@/components/waste/WasteTrackingForm';
import WasteReports from '@/components/waste/WasteReports';
import WasteHistory from '@/components/waste/WasteHistory';
import { useWasteTracking } from '@/hooks/useWasteTracking';

const WasteManagement = () => {
  const { statistics, suggestions } = useWasteTracking();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trash2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Controle de Desperdício</h1>
        </div>
        <p className="text-muted-foreground">
          Monitore e reduza o desperdício de ingredientes para otimizar custos e sustentabilidade.
        </p>
        
        {/* Alertas de Resumo */}
        {statistics && (
          <div className="flex gap-4 mt-4">
            {statistics.total_waste_cost > 0 && (
              <Badge variant="destructive" className="text-sm">
                Desperdício este mês: R$ {statistics.total_waste_cost.toFixed(2)}
              </Badge>
            )}
            {suggestions.length > 0 && (
              <Badge variant="default" className="text-sm">
                {suggestions.length} sugestões de melhoria
              </Badge>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="register" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Registrar
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <WasteTrackingForm />
        </TabsContent>

        <TabsContent value="reports">
          <WasteReports />
        </TabsContent>

        <TabsContent value="history">
          <WasteHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WasteManagement;