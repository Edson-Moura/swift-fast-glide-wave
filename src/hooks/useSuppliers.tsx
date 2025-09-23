import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  products: string[];
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  supplier_name: string;
  item_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  purchase_date: string;
  created_at: string;
}

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch suppliers from inventory items
  const fetchSuppliers = async () => {
    try {
      const { data: items, error } = await supabase
        .from('suppliers')
        .select('*');

      if (error) throw error;

      // Map suppliers from database
      const suppliersData: Supplier[] = items?.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        contact_person: supplier.contact_person,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        products: [], // You can extend this based on your needs
        created_at: supplier.created_at,
        updated_at: supplier.updated_at
      })) || [];
      
      setSuppliers(suppliersData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Fetch purchase history
  const fetchPurchaseHistory = async () => {
    try {
      const { data: purchases, error } = await supabase
        .from('purchase_history')
        .select(`
          *,
          suppliers(name)
        `);

      if (error) throw error;

      const purchasesData: Purchase[] = purchases?.map((purchase) => ({
        id: purchase.id,
        supplier_name: purchase.suppliers?.name || 'Fornecedor Desconhecido',
        item_name: purchase.item_name,
        quantity: purchase.quantity,
        unit_cost: purchase.unit_price,
        total_cost: purchase.total_amount,
        purchase_date: purchase.purchase_date,
        created_at: purchase.created_at
      })) || [];

      setPurchases(purchasesData);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Add new supplier
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          name: supplierData.name,
          contact_person: supplierData.contact_person,
          phone: supplierData.phone,
          email: supplierData.email,
          address: supplierData.address,
          restaurant_id: '00000000-0000-0000-0000-000000000000' // This should be dynamic
        })
        .select()
        .single();

      if (error) throw error;

      const newSupplier: Supplier = {
        id: data.id,
        name: data.name,
        contact_person: data.contact_person,
        phone: data.phone,
        email: data.email,
        address: data.address,
        products: [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setSuppliers(prev => [...prev, newSupplier]);
      
      toast({
        title: "Sucesso",
        description: "Fornecedor cadastrado com sucesso!"
      });

      return newSupplier;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update supplier
  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      setSuppliers(prev => 
        prev.map(supplier => 
          supplier.id === id 
            ? { ...supplier, ...supplierData, updated_at: new Date().toISOString() }
            : supplier
        )
      );

      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Delete supplier
  const deleteSupplier = async (id: string) => {
    try {
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Fornecedor removido com sucesso!"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  // Get purchases by supplier
  const getPurchasesBySupplier = (supplierName: string) => {
    return purchases.filter(purchase => 
      purchase.supplier_name.toLowerCase() === supplierName.toLowerCase()
    );
  };

  // Get total spent by supplier
  const getTotalSpentBySupplier = (supplierName: string) => {
    return getPurchasesBySupplier(supplierName)
      .reduce((total, purchase) => total + purchase.total_cost, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchSuppliers(), fetchPurchaseHistory()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  return {
    suppliers,
    purchases,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getPurchasesBySupplier,
    getTotalSpentBySupplier,
    refetch: () => Promise.all([fetchSuppliers(), fetchPurchaseHistory()])
  };
};