import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Download, 
  Database, 
  Shield, 
  Clock, 
  HardDrive,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useSecurity, BackupSettings } from '@/hooks/useSecurity';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BackupManagement = () => {
  const {
    loading,
    createBackup,
    getBackups,
    getBackupSettings,
    updateBackupSettings
  } = useSecurity();

  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadSettings(), loadBackups()]);
  };

  const loadSettings = async () => {
    const data = await getBackupSettings();
    setSettings(data || {
      id: '',
      restaurant_id: '',
      auto_backup_enabled: true,
      backup_frequency: 24,
      retention_days: 30,
      backup_types: ['inventory', 'menu', 'transactions'],
      encryption_enabled: true
    });
  };

  const loadBackups = async () => {
    setLoadingBackups(true);
    try {
      const data = await getBackups();
      setBackups(data);
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleSettingsChange = async (newSettings: Partial<BackupSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated as BackupSettings);
    await updateBackupSettings(newSettings);
  };

  const handleCreateBackup = async (type: string) => {
    setCreatingBackup(type);
    try {
      await createBackup(type);
      await loadBackups();
    } finally {
      setCreatingBackup('');
    }
  };

  const getBackupTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      inventory: 'Inventário',
      menu: 'Cardápio',
      transactions: 'Transações',
      sales: 'Vendas'
    };
    return labels[type] || type;
  };

  const getBackupTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      inventory: Database,
      menu: Database,
      transactions: Database,
      sales: Database
    };
    const Icon = icons[type] || Database;
    return <Icon className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Configurações de Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Configurações de Backup</span>
          </CardTitle>
          <CardDescription>
            Configure como e quando seus dados são salvos automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings && (
            <>
              {/* Backup Automático */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-backup">Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Criar backups automaticamente em intervalos regulares
                  </p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={settings.auto_backup_enabled}
                  onCheckedChange={(checked) => 
                    handleSettingsChange({ auto_backup_enabled: checked })
                  }
                />
              </div>

              {settings.auto_backup_enabled && (
                <>
                  {/* Frequência */}
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência (horas)</Label>
                    <Input
                      id="frequency"
                      type="number"
                      min="1"
                      max="168"
                      value={settings.backup_frequency}
                      onChange={(e) => 
                        handleSettingsChange({ backup_frequency: parseInt(e.target.value) })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Criar backup a cada {settings.backup_frequency} horas
                    </p>
                  </div>

                  {/* Retenção */}
                  <div className="space-y-2">
                    <Label htmlFor="retention">Retenção (dias)</Label>
                    <Input
                      id="retention"
                      type="number"
                      min="1"
                      max="365"
                      value={settings.retention_days}
                      onChange={(e) => 
                        handleSettingsChange({ retention_days: parseInt(e.target.value) })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Manter backups por {settings.retention_days} dias
                    </p>
                  </div>
                </>
              )}

              {/* Tipos de Backup */}
              <div className="space-y-3">
                <Label>Tipos de Dados para Backup</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['inventory', 'menu', 'transactions', 'sales'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={settings.backup_types.includes(type)}
                        onCheckedChange={(checked) => {
                          const newTypes = checked
                            ? [...settings.backup_types, type]
                            : settings.backup_types.filter(t => t !== type);
                          handleSettingsChange({ backup_types: newTypes });
                        }}
                      />
                      <Label htmlFor={type} className="text-sm">
                        {getBackupTypeLabel(type)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Criptografia */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="encryption">Criptografia</Label>
                  <p className="text-sm text-muted-foreground">
                    Criptografar dados do backup para maior segurança
                  </p>
                </div>
                <Switch
                  id="encryption"
                  checked={settings.encryption_enabled}
                  onCheckedChange={(checked) => 
                    handleSettingsChange({ encryption_enabled: checked })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Backup Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Backup Manual</span>
          </CardTitle>
          <CardDescription>
            Crie backups sob demanda de tipos específicos de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['inventory', 'menu', 'transactions', 'sales'].map((type) => (
              <Button
                key={type}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleCreateBackup(type)}
                disabled={creatingBackup === type || loading}
              >
                {creatingBackup === type ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  getBackupTypeIcon(type)
                )}
                <span className="text-sm">{getBackupTypeLabel(type)}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Backups Recentes</span>
          </CardTitle>
          <CardDescription>
            Histórico dos backups criados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBackups ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : backups.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum backup encontrado. Crie seu primeiro backup usando os botões acima.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getBackupTypeIcon(backup.backup_type)}
                    <div>
                      <p className="font-medium">{getBackupTypeLabel(backup.backup_type)}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {format(new Date(backup.created_at), "dd/MM/yyyy 'às' HH:mm", { 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(JSON.stringify(backup.backup_data).length)}
                    </Badge>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManagement;