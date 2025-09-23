import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChefHat, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center container-mobile py-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <ChefHat className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-bold text-primary">404</h1>
          <h2 className="text-xl sm:text-2xl font-semibold">Página não encontrada</h2>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/')}
          className="btn-mobile inline-flex items-center space-x-2"
        >
          <Home className="h-4 w-4" />
          <span>Voltar ao Início</span>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;