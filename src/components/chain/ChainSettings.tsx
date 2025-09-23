import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, Bell, Database, Users } from 'lucide-react';
import { useChain } from '@/hooks/useChain';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ChainSetting {
  id: string;
  setting_key: string;
  setting_value: any;
}

const ChainSettings = () => {
  const { currentChain, updateChain } = useChain();
  const [settings, setSettings] = useState<ChainSetting[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    name: '',
    description: '',
    headquarters_address: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
  });

  const [operationalSettings, setOperationalSettings] = useState({
    auto_restock_enabled: false,
    centralized_purchasing: false,
    inventory_sync: true,
    menu_standardization: false,
    price_sync: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    low_stock_alerts: true,
    daily_reports: false,
    weekly_reports: true,
    monthly_reports: true,
    email_notifications: true,
  });

  useEffect(() => {
    if (currentChain) {
      loadSettings();
      setGeneralSettings({
        name: currentChain.name || '',
        description: currentChain.description || '',
        headquarters_address: currentChain.headquarters_address || '',
        contact_email: currentChain.contact_email || '',
        contact_phone: currentChain.contact_phone || '',
        logo_url: currentChain.logo_url || '',
      });
    }
  }, [currentChain]);

  const loadSettings = async () => {
    if (!currentChain) return;

    try {
      const { data, error } = await supabase
        .from('chain_settings')
        .select('*')
        .eq('chain_id', currentChain.id);

      if (error) throw error;

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as any);

      // Load operational settings
      setOperationalSettings({
        auto_restock_enabled: settingsMap.auto_restock_enabled || false,
        centralized_purchasing: settingsMap.centralized_purchasing || false,
        inventory_sync: settingsMap.inventory_sync || true,
        menu_standardization: settingsMap.menu_standardization || false,
        price_sync: settingsMap.price_sync || false,
      });

      // Load notification settings
      setNotificationSettings({
        low_stock_alerts: settingsMap.low_stock_alerts || true,
        daily_reports: settingsMap.daily_reports || false,
        weekly_reports: settingsMap.weekly_reports || true,
        monthly_reports: settingsMap.monthly_reports || true,
        email_notifications: settingsMap.email_notifications || true,
      });

      setSettings(data || []);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveGeneralSettings = async () => {
    if (!currentChain) return;

    setLoading(true);
    try {
      await updateChain(currentChain.id, generalSettings);
      toast({
        title: "Configurações atualizadas",
        description: "As configurações gerais foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving general settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    if (!currentChain) return;

    try {
      const { error } = await supabase
        .from('chain_settings')
        .upsert({
          chain_id: currentChain.id,
          setting_key: key,
          setting_value: value,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving setting:', error);
      toast({
        title: "Erro ao salvar configuração",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleOperationalChange = (key: string, value: boolean) => {
    setOperationalSettings(prev => ({ ...prev, [key]: value }));
    saveSetting(key, value);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    saveSetting(key, value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Configurações da Rede</h2>
          <p className="text-muted-foreground">
            Gerencie as configurações e políticas da sua rede de restaurantes
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="operational">Operacional</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>
                Configure as informações básicas da rede
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Rede</Label>
                  <Input
                    id="name"
                    value={generalSettings.name}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_email">E-mail de Contato</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={generalSettings.contact_email}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Telefone</Label>
                  <Input
                    id="contact_phone"
                    value={generalSettings.contact_phone}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="logo_url">URL do Logo</Label>
                  <Input
                    id="logo_url"
                    value={generalSettings.logo_url}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={generalSettings.description}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="headquarters_address">Endereço da Sede</Label>
                <Textarea
                  id="headquarters_address"
                  value={generalSettings.headquarters_address}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, headquarters_address: e.target.value }))}
                  rows={2}
                />
              </div>

              <Button onClick={saveGeneralSettings} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Configurações Operacionais</span>
              </CardTitle>
              <CardDescription>
                Configure como a rede deve operar e sincronizar dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="inventory_sync">Sincronização de Inventário</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar dados de inventário entre todas as unidades
                  </p>
                </div>
                <Switch
                  id="inventory_sync"
                  checked={operationalSettings.inventory_sync}
                  onCheckedChange={(value) => handleOperationalChange('inventory_sync', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="centralized_purchasing">Compras Centralizadas</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilitar sistema de compras centralizado para a rede
                  </p>
                </div>
                <Switch
                  id="centralized_purchasing"
                  checked={operationalSettings.centralized_purchasing}
                  onCheckedChange={(value) => handleOperationalChange('centralized_purchasing', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto_restock_enabled">Reposição Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar sugestões automáticas de reposição de estoque
                  </p>
                </div>
                <Switch
                  id="auto_restock_enabled"
                  checked={operationalSettings.auto_restock_enabled}
                  onCheckedChange={(value) => handleOperationalChange('auto_restock_enabled', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="menu_standardization">Padronização do Menu</Label>
                  <p className="text-sm text-muted-foreground">
                    Manter menus padronizados em todas as unidades
                  </p>
                </div>
                <Switch
                  id="menu_standardization"
                  checked={operationalSettings.menu_standardization}
                  onCheckedChange={(value) => handleOperationalChange('menu_standardization', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="price_sync">Sincronização de Preços</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar preços entre todas as unidades da rede
                  </p>
                </div>
                <Switch
                  id="price_sync"
                  checked={operationalSettings.price_sync}
                  onCheckedChange={(value) => handleOperationalChange('price_sync', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Configurações de Notificações</span>
              </CardTitle>
              <CardDescription>
                Configure quando e como receber notificações da rede
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="email_notifications">Notificações por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações por e-mail
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(value) => handleNotificationChange('email_notifications', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="low_stock_alerts">Alertas de Baixo Estoque</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alertas quando itens estiverem com baixo estoque
                  </p>
                </div>
                <Switch
                  id="low_stock_alerts"
                  checked={notificationSettings.low_stock_alerts}
                  onCheckedChange={(value) => handleNotificationChange('low_stock_alerts', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="daily_reports">Relatórios Diários</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber resumo diário da performance da rede
                  </p>
                </div>
                <Switch
                  id="daily_reports"
                  checked={notificationSettings.daily_reports}
                  onCheckedChange={(value) => handleNotificationChange('daily_reports', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="weekly_reports">Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber resumo semanal da performance da rede
                  </p>
                </div>
                <Switch
                  id="weekly_reports"
                  checked={notificationSettings.weekly_reports}
                  onCheckedChange={(value) => handleNotificationChange('weekly_reports', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="monthly_reports">Relatórios Mensais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber resumo mensal da performance da rede
                  </p>
                </div>
                <Switch
                  id="monthly_reports"
                  checked={notificationSettings.monthly_reports}
                  onCheckedChange={(value) => handleNotificationChange('monthly_reports', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Configurações de Segurança</span>
              </CardTitle>
              <CardDescription>
                Configure políticas de segurança e acesso da rede
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Políticas de Acesso</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure quem pode acessar e modificar dados da rede
                </p>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Permissões
                </Button>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Auditoria e Logs</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Configurar logs de atividades e auditoria da rede
                </p>
                <Button variant="outline" size="sm">
                  Configurar Auditoria
                </Button>
              </div>

              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Backup e Recuperação</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Configurar backups automáticos dos dados da rede
                </p>
                <Button variant="outline" size="sm">
                  Configurar Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChainSettings;