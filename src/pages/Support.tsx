import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { supabase } from '@/integrations/supabase/client';
import { 
  HelpCircle, 
  MessageSquare, 
  BookOpen, 
  Video, 
  Search,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FAQSection from '@/components/support/FAQSection';
import SupportTickets from '@/components/support/SupportTickets';
import TutorialsSection from '@/components/support/TutorialsSection';
import ContactSupport from '@/components/support/ContactSupport';

const Support = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('faqs');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-mobile mx-auto py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">
                  Suporte ao Cliente
                </h1>
                <p className="text-sm text-muted-foreground">Central de Ajuda e Suporte</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-mobile mx-auto py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Como podemos ajudar?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Encontre respostas rapidamente ou entre em contato conosco para suporte personalizado
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faqs" className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Tutoriais</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Contato</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faqs" className="space-y-6">
            <FAQSection />
          </TabsContent>

          <TabsContent value="tutorials" className="space-y-6">
            <TutorialsSection />
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <ContactSupport />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <SupportTickets />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Support;