import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useSecurity, SecurityLog } from '@/hooks/useSecurity';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SecurityLogs = () => {
  const { getSecurityLogs } = useSecurity();
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getSecurityLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      login: 'Login',
      failed_login: 'Falha no Login',
      backup_created: 'Backup Criado',
      data_access: 'Acesso aos Dados',
      '2fa_enabled': '2FA Ativado',
      '2fa_disabled': '2FA Desativado',
      password_changed: 'Senha Alterada',
      profile_updated: 'Perfil Atualizado'
    };
    return labels[eventType] || eventType;
  };

  const getEventIcon = (eventType: string) => {
    const icons: Record<string, any> = {
      login: CheckCircle,
      failed_login: AlertTriangle,
      backup_created: Shield,
      data_access: Info,
      '2fa_enabled': Shield,
      '2fa_disabled': AlertTriangle,
      password_changed: Shield,
      profile_updated: Info
    };
    const Icon = icons[eventType] || Info;
    return Icon;
  };

  const getEventVariant = (eventType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      login: 'default',
      failed_login: 'destructive',
      backup_created: 'default',
      data_access: 'secondary',
      '2fa_enabled': 'default',
      '2fa_disabled': 'destructive',
      password_changed: 'default',
      profile_updated: 'secondary'
    };
    return variants[eventType] || 'secondary';
  };

  const renderEventDetails = (log: SecurityLog) => {
    const details = log.event_details;
    
    switch (log.event_type) {
      case 'backup_created':
        return (
          <div className="text-xs text-muted-foreground mt-1">
            Tipo: {details.backup_type} • Tamanho: {details.data_size} chars
          </div>
        );
      
      case 'failed_login':
        return (
          <div className="text-xs text-muted-foreground mt-1">
            Motivo: {details.reason || 'Credenciais inválidas'}
          </div>
        );
      
      case 'data_access':
        return (
          <div className="text-xs text-muted-foreground mt-1">
            Recurso: {details.resource} • Ação: {details.action}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Logs de Segurança</span>
        </CardTitle>
        <CardDescription>
          Histórico de eventos de segurança e atividades do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Nenhum evento de segurança registrado ainda.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const Icon = getEventIcon(log.event_type);
              return (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">
                          {getEventTypeLabel(log.event_type)}
                        </p>
                        <Badge 
                          variant={getEventVariant(log.event_type)}
                          className="text-xs"
                        >
                          {log.event_type}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss", { 
                          locale: ptBR 
                        })}
                        {log.ip_address && (
                          <span className="ml-2">• IP: {String(log.ip_address)}</span>
                        )}
                      </div>
                      
                      {renderEventDetails(log)}
                      
                      {log.user_agent && (
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                          User Agent: {String(log.user_agent)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-muted-foreground">
                    {log.user_id && (
                      <div>User ID: {log.user_id.slice(0, 8)}...</div>
                    )}
                    {log.restaurant_id && (
                      <div>Rest ID: {log.restaurant_id.slice(0, 8)}...</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityLogs;