import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import ChainDashboard from '@/components/chain/ChainDashboard';
import LoadingScreen from '@/components/ui/loading-screen';

const ChainManagement = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Carregando..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <ChainDashboard />;
};

export default ChainManagement;