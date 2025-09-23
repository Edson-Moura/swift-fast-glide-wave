import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { SuppliersDashboard } from '@/components/suppliers/SuppliersDashboard';

const SupplierManagement = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <SuppliersDashboard />
    </div>
  );
};

export default SupplierManagement;