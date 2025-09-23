import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface SessionInfo {
  id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string;
  device_info: any;
  location_info?: any;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

const ActiveSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

  useEffect(() => {
    loadActiveSessions();
  }, [user]);

  const loadActiveSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions((data || []).map(session => ({
        ...session,
        ip_address: session.ip_address as string || 'Desconhecido'
      })));
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sessões ativas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId);
    try {
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== sessionId));
      toast({
        title: "Sessão Terminada",
        description: "A sessão foi encerrada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível terminar a sessão",
        variant: "destructive",
      });
    } finally {
      setTerminatingSession(null);
    }
  };

  const terminateAllSessions = async () => {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('user_id', user?.id);

      if (error) throw error;

      setSessions([]);
      toast({
        title: "Todas as Sessões Terminadas",
        description: "Todas as sessões foram encerradas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao terminar todas as sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível terminar todas as sessões",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dias atrás`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Carregando sessões...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Sessões Ativas</span>
            </CardTitle>
            <CardDescription>
              Gerencie onde você está logado
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={terminateAllSessions}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Terminar Todas
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma sessão ativa encontrada</p>
          </div>
        ) : (
          sessions.map((session, index) => (
            <div key={session.id}>
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    {getDeviceIcon(session.device_info?.type)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {session.device_info?.browser} em {session.device_info?.os}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {session.device_info?.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3" />
                        <span>IP: {session.ip_address}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>Última atividade: {formatLastActivity(session.last_activity)}</span>
                      </div>
                      
                      {session.location_info?.city && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {session.location_info.city}
                            {session.location_info.country && `, ${session.location_info.country}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => terminateSession(session.id)}
                  disabled={terminatingSession === session.id}
                >
                  {terminatingSession === session.id ? (
                    'Terminando...'
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Terminar
                    </>
                  )}
                </Button>
              </div>
              
              {index < sessions.length - 1 && <Separator className="my-4" />}
            </div>
          ))
        )}
        
        {sessions.length > 2 && (
          <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span>
              Você tem {sessions.length} sessões ativas. 
              Considere terminar sessões não utilizadas por segurança.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveSessions;