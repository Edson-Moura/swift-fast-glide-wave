import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  TrendingUp, 
  History, 
  AlertTriangle, 
  Package2,
  FileBarChart
} from 'lucide-react';

interface ReportsSectionProps {
  reportData: {
    performanceReport: Array<{
      item: string;
      consumed: number;
      restocked: number;
      efficiency: number;
    }>;
    consumptionHistory: Array<{
      date: string;
      item: string;
      quantity: number;
      cost: number;
    }>;
    wasteAnalysis: Array<{
      item: string;
      expired: number;
      cost: number;
      percentage: number;
    }>;
    restockRecommendations: Array<{
      item: string;
      current: number;
      suggested: number;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
}

export const ReportsSection = ({ reportData }: ReportsSectionProps) => {
  const [selectedReport, setSelectedReport] = useState('performance');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Baixa';
    }
  };

  const handleExportReport = (reportType: string) => {
    // Implement CSV export functionality
    console.log(`Exporting ${reportType} report...`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <FileBarChart className="h-5 w-5" />
              <span>Relatórios Personalizados</span>
            </CardTitle>
            <CardDescription>
              Análises detalhadas de performance, consumo e recomendações
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExportReport(selectedReport)}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedReport} onValueChange={setSelectedReport}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
            <TabsTrigger value="consumption" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Consumo</span>
            </TabsTrigger>
            <TabsTrigger value="waste" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Desperdício</span>
            </TabsTrigger>
            <TabsTrigger value="restock" className="flex items-center space-x-2">
              <Package2 className="h-4 w-4" />
              <span>Reposição</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Relatório de Performance</h3>
              <div className="grid gap-4">
                {reportData.performanceReport.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.item}</div>
                      <div className="text-sm text-muted-foreground">
                        Consumido: {item.consumed} unidades
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Eficiência</div>
                        <div className="text-lg font-bold">{item.efficiency}%</div>
                      </div>
                      <Progress value={item.efficiency} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="consumption" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Histórico de Consumo</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reportData.consumptionHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="font-medium">{record.item}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(record.date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{record.quantity} unidades</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(record.cost)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="waste" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Análise de Desperdício</h3>
              {reportData.wasteAnalysis.length > 0 ? (
                <div className="grid gap-4">
                  {reportData.wasteAnalysis.map((waste, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
                      <div className="flex-1">
                        <div className="font-medium text-destructive">{waste.item}</div>
                        <div className="text-sm text-muted-foreground">
                          {waste.expired} unidades vencidas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-destructive">
                          {formatCurrency(waste.cost)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {waste.percentage}% do total
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-semibold text-destructive">
                      Total perdido: {formatCurrency(
                        reportData.wasteAnalysis.reduce((sum, item) => sum + item.cost, 0)
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum desperdício detectado</p>
                  <p className="text-sm">Excelente gestão de estoque!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="restock" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recomendações de Reposição</h3>
              <div className="grid gap-4">
                {reportData.restockRecommendations.map((restock, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{restock.item}</span>
                        <Badge variant={getPriorityColor(restock.priority)}>
                          {getPriorityLabel(restock.priority)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Estoque atual: {restock.current} unidades
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        Repor: {restock.suggested} unidades
                      </div>
                      <div className="text-sm text-muted-foreground">
                        +{restock.suggested - restock.current} unidades
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};