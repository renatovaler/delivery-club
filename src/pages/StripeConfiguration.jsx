import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Team } from '@/api/entities';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Save, Key, AlertTriangle, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { validateStripeKeys } from '@/api/functions';

export default function StripeConfiguration() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [keys, setKeys] = useState({ public_key: '', secret_key: '' });
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    loadStripeConfiguration();
  }, []);

  const loadStripeConfiguration = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.user_type !== 'business_owner') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (userData.current_team_id) {
        const teamData = await Team.get(userData.current_team_id);
        
        if (teamData.owner_id !== userData.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar os dados desta empresa.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        setTeam(teamData);
        setKeys({
          public_key: teamData.stripe_public_key || '',
          secret_key: teamData.stripe_secret_key || ''
        });

        // Se já tem chaves configuradas, mostrar como validadas
        if (teamData.stripe_public_key && teamData.stripe_secret_key) {
          setValidationResult({ 
            valid: true, 
            account_id: 'Configurado',
            environment: teamData.stripe_public_key.includes('_test_') ? 'test' : 'live'
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar configuração do Stripe:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações do Stripe.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateKeys = async () => {
    if (!keys.public_key.trim() || !keys.secret_key.trim()) {
      toast({
        title: "Chaves obrigatórias",
        description: "Preencha ambas as chaves antes de validar.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const { data, error } = await validateStripeKeys({
        public_key: keys.public_key.trim(),
        secret_key: keys.secret_key.trim()
      });

      if (error) {
        setValidationResult({ valid: false, error: error.error || 'Erro na validação' });
        toast({
          title: "Chaves inválidas",
          description: error.error || 'Erro na validação das chaves',
          variant: "destructive"
        });
      } else if (data && data.valid) {
        setValidationResult(data);
        toast({
          title: "Chaves válidas! ✅",
          description: `Conta: ${data.account_email || data.account_id} (${data.environment})`
        });
      } else {
        setValidationResult({ valid: false, error: 'Resposta inválida do servidor' });
        toast({
          title: "Erro na validação",
          description: "Resposta inválida do servidor",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao validar chaves:", error);
      setValidationResult({ valid: false, error: 'Erro de conexão' });
      toast({
        title: "Erro de conexão",
        description: "Não foi possível validar as chaves. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validationResult || !validationResult.valid) {
      toast({
        title: "Validação necessária",
        description: "Valide as chaves antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await Team.update(team.id, {
        stripe_public_key: keys.public_key.trim(),
        stripe_secret_key: keys.secret_key.trim()
      });
      
      toast({ 
        title: "Configurações salvas! 🎉", 
        description: "Sua empresa agora está pronta para receber pagamentos dos clientes." 
      });
      
      // Recarregar dados da equipe
      await loadStripeConfiguration();
      
    } catch (error) {
      console.error("Erro ao salvar chaves:", error);
      toast({ 
        title: "Erro ao salvar", 
        description: "Não foi possível salvar as chaves. Tente novamente.", 
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8"><div className="animate-pulse h-8 bg-amber-200 rounded w-1/3"></div></div>;
  }

  const hasValidKeys = validationResult && validationResult.valid;
  const keysChanged = keys.public_key !== (team?.stripe_public_key || '') || 
                     keys.secret_key !== (team?.stripe_secret_key || '');

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("BusinessSettings")}>
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Configuração do Stripe</h1>
          <p className="text-amber-600">Conecte sua conta Stripe para receber pagamentos dos seus clientes.</p>
        </div>
      </div>

      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
        <AlertTriangle className="h-4 w-4 !text-red-500" />
        <AlertTitle>Aviso de Segurança Importante</AlertTitle>
        <AlertDescription>
          Sua chave secreta do Stripe é uma informação extremamente sensível. Nunca a compartilhe publicamente. 
          As chaves serão validadas antes de serem salvas para garantir que funcionem corretamente.
        </AlertDescription>
      </Alert>

      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle>Suas Chaves de API do Stripe</CardTitle>
          <CardDescription>
            Você pode encontrar suas chaves no{' '}
            <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline font-medium">
              Dashboard do Stripe <ExternalLink className="inline-block w-3 h-3" />
            </a>. Use as chaves do modo de produção para pagamentos reais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="public_key" className="flex items-center gap-2">
              <Key className="w-4 h-4" /> Chave Publicável (Publishable Key)
            </Label>
            <Input
              id="public_key"
              value={keys.public_key}
              onChange={(e) => {
                setKeys(prev => ({ ...prev, public_key: e.target.value }));
                setValidationResult(null); // Reset validation when keys change
              }}
              placeholder="pk_live_... ou pk_test_..."
            />
            <p className="text-xs text-gray-500">Esta chave é segura para ser usada no frontend do seu aplicativo.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret_key" className="flex items-center gap-2">
              <Key className="w-4 h-4" /> Chave Secreta (Secret Key)
            </Label>
            <Input
              id="secret_key"
              type="password"
              value={keys.secret_key}
              onChange={(e) => {
                setKeys(prev => ({ ...prev, secret_key: e.target.value }));
                setValidationResult(null); // Reset validation when keys change
              }}
              placeholder="sk_live_... ou sk_test_..."
            />
            <p className="text-xs text-gray-500">Esta chave deve ser mantida em segredo e nunca exposta publicamente.</p>
          </div>

          {/* Status da validação */}
          {validationResult && (
            <Alert className={validationResult.valid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4 !text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 !text-red-500" />
              )}
              <AlertTitle>
                {validationResult.valid ? "Chaves Válidas ✅" : "Chaves Inválidas ❌"}
              </AlertTitle>
              <AlertDescription>
                {validationResult.valid ? (
                  <div>
                    <p>Suas chaves foram validadas com sucesso!</p>
                    {validationResult.account_email && (
                      <p className="text-sm mt-1">Conta: {validationResult.account_email}</p>
                    )}
                    <p className="text-sm">Ambiente: {validationResult.environment === 'test' ? 'Teste' : 'Produção'}</p>
                  </div>
                ) : (
                  validationResult.error
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button 
              onClick={handleValidateKeys} 
              disabled={isValidating || !keys.public_key.trim() || !keys.secret_key.trim()}
              variant="outline"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Validar Chaves
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !hasValidKeys || !keysChanged}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Chaves
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}