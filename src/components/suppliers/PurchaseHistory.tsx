import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, TrendingUp, Package } from 'lucide-react';
import { useSuppliers } from '@/hooks/useSuppliers';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const PurchaseHistory = () => {
  const { purchases, suppliers } = useSuppliers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  // Filter purchases
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSupplier = 
      selectedSupplier === 'all' || purchase.supplier_name === selectedSupplier;

    return matchesSearch && matchesSupplier;
  });

  // Sort purchases
  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime();
      case 'supplier':
        return a.supplier_name.localeCompare(b.supplier_name);
      case 'item':
        return a.item_name.localeCompare(b.item_name);
      case 'value':
        return b.total_cost - a.total_cost;
      default:
        return 0;
    }
  });

  // Calculate totals
  const totalValue = filteredPurchases.reduce((sum, purchase) => sum + purchase.total_cost, 0);
  const totalItems = filteredPurchases.length;
  const uniqueSuppliers = [...new Set(filteredPurchases.map(p => p.supplier_name))].length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Únicos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueSuppliers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre o histórico de compras por fornecedor, item ou data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por item ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os fornecedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os fornecedores</SelectItem>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data (mais recente)</SelectItem>
                <SelectItem value="supplier">Fornecedor (A-Z)</SelectItem>
                <SelectItem value="item">Item (A-Z)</SelectItem>
                <SelectItem value="value">Valor (maior primeiro)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Compras</CardTitle>
          <CardDescription>
            Visualize todas as compras realizadas com seus fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedPurchases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(purchase.purchase_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{purchase.supplier_name}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{purchase.item_name}</TableCell>
                    <TableCell className="text-right">{purchase.quantity}</TableCell>
                    <TableCell className="text-right">R$ {purchase.unit_cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {purchase.total_cost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                {searchTerm || selectedSupplier !== 'all'
                  ? 'Nenhuma compra encontrada com os filtros aplicados.'
                  : 'Nenhuma compra registrada ainda.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};