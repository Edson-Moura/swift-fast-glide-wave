import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, BarChart3, Settings, LogOut, ChefHat, DollarSign, Building2, MenuIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentRestaurant, userRole } = useRestaurant();

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Gerente';
      case 'chef': return 'Chef';
      case 'inventory': return 'Estoque';
      case 'staff': return 'Staff';
      default: return 'Usuário';
    }
  };

  const menuItems = [
    {
      icon: Home,
      label: 'Início',
      path: '/',
      show: true
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      path: '/dashboard',
      show: ['admin', 'manager'].includes(userRole || '')
    },
    {
      icon: DollarSign,
      label: 'Preços',
      path: '/price-management',
      show: ['admin', 'manager'].includes(userRole || '')
    },
    {
      icon: MenuIcon,
      label: 'Cardápio',
      path: '/menu-management',
      show: ['admin', 'manager', 'chef'].includes(userRole || '')
    },
    {
      icon: ChefHat,
      label: 'Inventário',
      path: '/inventory-management',
      show: ['admin', 'manager', 'inventory'].includes(userRole || '')
    },
    {
      icon: Trash2,
      label: 'Desperdício',
      path: '/waste-management',
      show: ['admin', 'manager', 'inventory', 'chef'].includes(userRole || '')
    },
    {
      icon: Building2,
      label: 'Fornecedores',
      path: '/supplier-management',
      show: ['admin', 'manager'].includes(userRole || '')
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/restaurant-setup',
      show: userRole === 'admin'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="text-left">
          <div className="flex items-center space-x-3 mb-6">
            <ChefHat className="h-8 w-8 text-primary" />
            <div>
              <SheetTitle className="text-lg">
                {currentRestaurant?.name || 'RestaurantApp'}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
        </SheetHeader>

        {user && (
          <div className="border-b pb-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium">Bem-vindo!</span>
              {userRole && (
                <Badge variant={getRoleBadgeVariant(userRole)} className="text-xs">
                  {getRoleDisplayName(userRole)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        )}

        <nav className="space-y-2">
          {menuItems.map((item) => {
            if (!item.show) return null;
            
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start h-12 text-left"
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="text-base">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="text-base">Sair</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;