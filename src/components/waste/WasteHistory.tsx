import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Trash2, Search, Filter } from 'lucide-react';
import { useWasteTracking } from '@/hooks/useWasteTracking';

const CATEGORY_LABELS = {
  expired: 'Validade Vencida',
  preparation_error: 'Erro no Preparo', 
  spoiled: 'Estragado',
  damaged: 'Danificado',
  other: 'Outro'
};

const WasteHistory = () => {
  const { wasteEntries, fetchWasteEntries, deleteWasteEntry, loading } = useWasteTracking();
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    search: ''
  });

  useEffect(() => {
    handleFilter();
  }, []);

  const handleFilter = () => {
    fetchWasteEntries(filters.startDate, filters.endDate);
  };

  const filteredEntries = wasteEntries.filter(entry => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const itemName = (entry as any).inventory_items?.name?.toLowerCase() || '';
      const reason = entry.waste_reason.toLowerCase();
      const notes = entry.notes?.toLowerCase() || '';
      
      return itemName.includes(searchTerm) || 
             reason.includes(searchTerm) || 
             notes.includes(searchTerm);
    }
    return true;
  });

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'expired': return 'destructive';
      case 'preparation_error': return 'default';
      case 'spoiled': return 'secondary';
      case 'damaged': return 'outline';
      default: return 'outline';
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteWasteEntry(id);
    } catch (error) {
      console.error('Erro ao remover registro:', error);
    }
  };

  const totalCost = filteredEntries.reduce((sum, entry) => sum + entry.cost_impact, 0);
  const totalQuantity = filteredEntries.reduce((sum, entry) => sum + entry.quantity_wasted, 0);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Item, motivo, observações..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilter} disabled={loading} className="w-full">
                {loading ? 'Carregando...' : 'Aplicar Filtros'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total de Registros</p>
              <p className="text-2xl font-bold">{filteredEntries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold text-destructive">R$ {totalCost.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Quantidade Total</p>
              <p className="text-2xl font-bold">{totalQuantity.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Desperdícios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.waste_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {(entry as any).inventory_items?.name || 'Item não encontrado'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryBadgeVariant(entry.waste_category)}>
                          {CATEGORY_LABELS[entry.waste_category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.quantity_wasted.toFixed(2)} {entry.unit}
                      </TableCell>
                      <TableCell className="max-w-48 truncate" title={entry.waste_reason}>
                        {entry.waste_reason}
                      </TableCell>
                      <TableCell className="text-destructive font-medium">
                        R$ {entry.cost_impact.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover este registro de desperdício? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEntry(entry.id!)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-sm text-muted-foreground">
                {filters.search 
                  ? 'Tente ajustar os filtros ou termos de busca.' 
                  : 'Nenhum desperdício registrado no período selecionado.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WasteHistory;