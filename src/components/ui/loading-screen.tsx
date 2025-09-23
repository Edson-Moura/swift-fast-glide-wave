import { Loader2, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

const LoadingScreen = ({ 
  message = "Carregando...", 
  className 
}: LoadingScreenProps) => {
  return (
    <div className={cn(
      "flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10",
      className
    )}>
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <ChefHat className="h-12 w-12 text-primary/30" />
            <Loader2 className="absolute inset-0 h-12 w-12 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">{message}</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;