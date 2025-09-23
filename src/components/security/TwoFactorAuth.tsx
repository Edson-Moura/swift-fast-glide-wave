import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ShieldCheck, Key, AlertTriangle } from 'lucide-react';
import { useSecurity, TwoFASettings } from '@/hooks/useSecurity';
import { toast } from '@/hooks/use-toast';

const TwoFactorAuth = () => {
  const { setup2FA, verify2FA, disable2FA, get2FASettings, loading } = useSecurity();
  const [settings, setSettings] = useState<TwoFASettings | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [setupMode, setSetupMode] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const data = await get2FASettings();
      setSettings(data);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSetup2FA = async () => {
    const result = await setup2FA();
    if (result) {
      setQrCode(result.qr_code);
      setSecret(result.secret);
      setBackupCodes(result.backup_codes);
      setSetupMode(true);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationToken) {
      toast({
        title: "Erro",
        description: "Por favor, insira o código de verificação",
        variant: "destructive",
      });
      return;
    }

    const success = await verify2FA(verificationToken);
    if (success) {
      setSetupMode(false);
      setVerificationToken('');
      loadSettings();
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt('Digite sua senha para desativar o 2FA:');
    if (!password) return;
    
    const success = await disable2FA(password);
    if (success) {
      setSettings(null);
      setSetupMode(false);
    }
  };

  if (loadingSettings) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {settings?.is_enabled ? (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
            <span>Autenticação de Dois Fatores (2FA)</span>
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Status do 2FA</p>
              <div className="flex items-center space-x-2">
                <Badge variant={settings?.is_enabled ? "default" : "secondary"}>
                  {settings?.is_enabled ? "Ativado" : "Desativado"}
                </Badge>
                {settings?.is_enabled && settings.last_used_at && (
                  <p className="text-xs text-muted-foreground">
                    Último uso: {new Date(settings.last_used_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            {!settings?.is_enabled && !setupMode && (
              <Button onClick={handleSetup2FA} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <Key className="h-4 w-4 mr-2" />
                Configurar 2FA
              </Button>
            )}
            
            {settings?.is_enabled && (
              <Button 
                variant="destructive" 
                onClick={handleDisable2FA} 
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Desativar 2FA
              </Button>
            )}
          </div>

          {settings?.recovery_email && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Email de recuperação: {settings.recovery_email}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Mode */}
      {setupMode && (
        <Card>
          <CardHeader>
            <CardTitle>Configurar Autenticação de Dois Fatores</CardTitle>
            <CardDescription>
              Escaneie o código QR ou insira a chave secreta em seu aplicativo autenticador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            {qrCode && (
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg border inline-block">
                  <img src={qrCode} alt="QR Code para 2FA" className="max-w-48 h-auto" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secret">Ou insira esta chave manualmente:</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="secret" 
                      value={secret} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(secret);
                        toast({ title: "Copiado!", description: "Chave copiada para a área de transferência" });
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Verification */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification">Código de Verificação</Label>
                <Input
                  id="verification"
                  placeholder="Digite o código de 6 dígitos"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  maxLength={6}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleVerify2FA} disabled={loading || !verificationToken}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Verificar e Ativar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSetupMode(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>

            {/* Backup Codes */}
            {backupCodes.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Códigos de Backup (Guarde em local seguro):</p>
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-muted p-2 rounded">
                          {code}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use estes códigos se não conseguir acessar seu aplicativo autenticador
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TwoFactorAuth;