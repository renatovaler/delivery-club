
import { Team, User } from '@/api/entities';
import { validateStripeKeys } from '@/api/functions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';
import { AlertTriangle, ArrowLeft, CheckCircle, ExternalLink, Key, Loader2, Save, ShieldCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function StripeConfiguration() {
  const toast = useToast().toast;
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // New state variables for keys and validation/saving process
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  // Removed: webhookSecret
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationStatus, setValidationStatus] = useState('not_tested');

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
        setPublicKey(teamData.stripe_public_key || '');
        setSecretKey(teamData.stripe_secret_key || '');
        // Removed: setWebhookSecret

        // If keys are configured, set validation status to valid
        if (teamData.stripe_public_key && teamData.stripe_secret_key) {
          setValidationStatus('valid');
        } else {
          setValidationStatus('not_tested');
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
    if (!publicKey.trim() || !secretKey.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha a chave pública e secreta do Stripe para validar.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se as chaves têm o tamanho esperado
    // Stripe publishable keys are usually 'pk_test_...' or 'pk_live_...', generally 24-25 chars.
    // Secret keys are 'sk_test_...' or 'sk_live_...', can be 50-60+ chars.
    // Setting a minimum length like 20 for initial check.
    if (publicKey.trim().length < 20 || secretKey.trim().length < 20) {
      toast({
        title: "Chaves incompletas",
        description: "Verifique se você copiou as chaves completas do Stripe.",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    setValidationStatus('not_tested');

    try {
      console.log('[StripeConfiguration] Chamando função de validação...');
      console.log('[StripeConfiguration] Tamanhos das chaves:', {
        public_key_length: publicKey.trim().length,
        secret_key_length: secretKey.trim().length
      });

      const result = await validateStripeKeys({
        public_key: publicKey.trim(),
        secret_key: secretKey.trim()
      });

      console.log('[StripeConfiguration] Resultado recebido:', result);

      // Tratar o resultado de forma mais robusta
      if (result && result.data) {
        if (result.data.valid === true) {
          setValidationStatus('valid');
          toast({
            title: "✅ Chaves validadas!",
            description: "As chaves do Stripe foram validadas com sucesso."
          });
        } else {
          setValidationStatus('invalid');
          const errorMsg = result.data.error || "As chaves fornecidas não são válidas.";
          toast({
            title: "❌ Chaves inválidas",
            description: errorMsg,
            variant: "destructive"
          });
        }
      } else if (result && result.error) {
        setValidationStatus('invalid');
        toast({
          title: "❌ Erro na validação",
          description: result.error,
          variant: "destructive"
        });
      } else {
        console.error('[StripeConfiguration] Resultado inesperado:', result);
        setValidationStatus('invalid');
        toast({
          title: "Erro inesperado",
          description: "Resposta inválida do servidor. Tente novamente.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("[StripeConfiguration] Erro ao validar chaves:", error);

      let errorMessage = "Erro interno ao validar as chaves. Tente novamente.";

      // Tratar erros específicos do Stripe
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('400')) {
          if (error.message.includes('Invalid API Key') || error.message.includes('invalid_api_key')) {
            errorMessage = "Chave secreta inválida. Verifique se você copiou a chave completa do dashboard do Stripe.";
          } else if (error.message.includes('No such') || error.message.includes('No such customer')) {
            errorMessage = "Chave não encontrada ou erro de permissão. Verifique se você está usando as chaves corretas e se possui as permissões necessárias.";
          } else {
            errorMessage = "Erro de validação: Verifique se as chaves estão corretas e completas.";
          }
        } else if (error.message.includes('401')) {
          errorMessage = "Não autorizado: Chave de API inválida ou sem permissão.";
        } else if (error.message.includes('403')) {
          errorMessage = "Acesso proibido: Verifique as permissões da sua chave de API.";
        } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          errorMessage = "Erro de rede. Verifique sua conexão ou tente novamente mais tarde.";
        }
      }

      setValidationStatus('invalid');
      toast({
        title: "Erro na validação",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveKeys = async () => {
    if (!publicKey.trim() || !secretKey.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha a chave pública e secreta do Stripe para salvar.",
        variant: "destructive"
      });
      return;
    }

    if (validationStatus !== 'valid') {
      toast({
        title: "Validação necessária",
        description: "Por favor, valide as chaves do Stripe antes de salvá-las.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await Team.update(user.current_team_id, {
        stripe_public_key: publicKey.trim(),
        stripe_secret_key: secretKey.trim(),
        // Removed: stripe_webhook_secret
      });

      toast({
        title: "✅ Configuração salva!",
        description: "As chaves do Stripe foram salvas com sucesso."
      });
      await loadStripeConfiguration();
    } catch (error) {
      console.error("Erro ao salvar chaves:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as chaves do Stripe. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <Link to={createPageUrl("BusinessSettings")}>
        <Button variant="outline" size="icon" className="mb-4"><ArrowLeft className="w-4 h-4" /></Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Configuração do Stripe</h1>
        <p className="text-slate-600">
          Insira suas chaves de API do Stripe para processar pagamentos.
        </p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Key className="w-5 h-5" />
            Chaves de API
          </CardTitle>
          <CardDescription>
            Suas chaves não são armazenadas em texto plano e são usadas exclusivamente para a comunicação segura com o Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="publicKey">Chave Pública (Publishable Key)</Label>
            <Input
              id="publicKey"
              type="text" // changed type to text for easier input
              placeholder="pk_live_... ou pk_test_..."
              value={publicKey}
              onChange={(e) => {
                setPublicKey(e.target.value);
                setValidationStatus('not_tested'); // Reset validation status on change
              }}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Exemplo: pk_test_...
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretKey">Chave Secreta (Secret Key)</Label>
            <Input
              id="secretKey"
              type="text" // changed type to text from password for easier visibility of truncated keys
              placeholder="sk_live_... ou sk_test_..."
              value={secretKey}
              onChange={(e) => {
                setSecretKey(e.target.value);
                setValidationStatus('not_tested'); // Reset validation status on change
              }}
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Exemplo: sk_test_...
            </p>
            <p className="text-xs text-red-500">
              ⚠️ Certifique-se de copiar a chave completa (geralmente mais de 50 caracteres)
            </p>
          </div>
          {/* Removed: campo do webhook secret */}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div>
            {validationStatus === "valid" && (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                Chaves Válidas
              </Badge>
            )}
            {validationStatus === "invalid" && (
              <Badge className="bg-red-100 text-red-800 border-red-300">
                <XCircle className="w-4 h-4 mr-2" />
                Chaves Inválidas
              </Badge>
            )}
             {validationStatus === "not_tested" && (
              <Badge variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Chaves não testadas
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleValidateKeys}
              disabled={isSaving || isValidating || !publicKey.trim() || !secretKey.trim()}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Validar
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveKeys}
              disabled={isSaving || isValidating || !publicKey.trim() || !secretKey.trim() || validationStatus !== 'valid'}
              className="bg-slate-800 hover:bg-slate-900 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Chaves
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
            <CardTitle className="text-xl font-semibold">Instruções</CardTitle>
        </CardHeader>
        <CardContent>
            <CardDescription className="text-slate-600">
                <p className="mb-2">Para configurar o Stripe:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li>Crie ou acesse sua conta no <a href="https://dashboard.stripe.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Dashboard do Stripe <ExternalLink className="inline-block w-3 h-3" /></a>.</li>
                    <li>Vá em 'Desenvolvedores' &gt; 'Chaves de API' para encontrar suas Chaves Publicável e Secreta.</li>
                    <li>Copie e cole as chaves nos campos acima.</li>
                    <li>Clique em "Validar" para testar suas chaves.</li>
                    <li>Clique em "Salvar Chaves" para finalizar a configuração.</li>
                </ol>
                <p className="mt-4 text-sm text-slate-500">
                    <strong>Nota:</strong> Os webhooks são gerenciados automaticamente pela plataforma, não é necessário configurá-los manualmente.
                </p>
            </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
