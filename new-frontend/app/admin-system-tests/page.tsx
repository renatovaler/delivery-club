'use client';

import { useState, useEffect } from 'react';
import { UserAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Progress from '../../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useToast } from '../../components/ui/use-toast';
import {
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Clock,
  User as UserIcon,
  Building2,
  Shield,
  Activity,
  FileText,
  Eye,
  Loader2
} from 'lucide-react';

const SYSTEM_PAGES = {
  system_admin: [
    { name: "AdminDashboard", title: "Dashboard Admin", category: "dashboard" },
    { name: "AdminBusinesses", title: "Gestão de Empresas", category: "management" },
    { name: "AdminUsers", title: "Gestão de Usuários", category: "management" },
    { name: "AdminUserDetails", title: "Detalhes do Usuário", category: "management" },
    { name: "AdminReports", title: "Relatórios Admin", category: "reports" },
    { name: "AdminSubscriptions", title: "Assinaturas Admin", category: "management" },
    { name: "AdminPlans", title: "Gestão de Planos", category: "management" },
    { name: "AdminSystemTests", title: "Testes do Sistema", category: "tools" },
    { name: "SelfHostGuideLaravel", title: "Self-Host Laravel", category: "guides" },
    { name: "SelfHostGuideNodeJS", title: "Self-Host Node.js", category: "guides" },
    { name: "FAQ", title: "FAQ", category: "support" },
    { name: "Profile", title: "Perfil", category: "account" }
  ],
  business_owner: [
    { name: "BusinessDashboard", title: "Dashboard Empresa", category: "dashboard" },
    { name: "ProductManagement", title: "Gestão de Produtos", category: "products" },
    { name: "DeliveryManagement", title: "Gestão de Entregas", category: "delivery" },
    { name: "Customers", title: "Clientes", category: "customers" },
    { name: "FinancialManagement", title: "Gestão Financeira", category: "finance" },
    { name: "PriceHistory", title: "Histórico de Preços", category: "products" },
    { name: "PlatformInvoices", title: "Faturas da Plataforma", category: "finance" },
    { name: "PaymentHistory", title: "Histórico de Pagamentos", category: "finance" },
    { name: "DeliveryAreas", title: "Áreas de Cobertura", category: "delivery" },
    { name: "BusinessSettings", title: "Configurações", category: "settings" },
    { name: "StripeConfiguration", title: "Configuração Stripe", category: "settings" },
    { name: "TeamManagement", title: "Gestão de Equipe", category: "team" },
    { name: "FAQ", title: "FAQ", category: "support" },
    { name: "Profile", title: "Perfil", category: "account" }
  ],
  customer: [
    { name: "CustomerDashboard", title: "Dashboard Cliente", category: "dashboard" },
    { name: "MySubscriptions", title: "Minhas Assinaturas", category: "subscriptions" },
    { name: "FinancialHistory", title: "Histórico Financeiro", category: "finance" },
    { name: "NewSubscription", title: "Nova Assinatura", category: "subscriptions" },
    { name: "CustomerSupport", title: "Suporte", category: "support" },
    { name: "PlatformReports", title: "Denúncias", category: "support" },
    { name: "FAQ", title: "FAQ", category: "support" },
    { name: "Profile", title: "Perfil", category: "account" }
  ],
  public: [
    { name: "Onboarding", title: "Onboarding", category: "auth" }
  ]
};

const CATEGORY_COLORS = {
  dashboard: "bg-blue-100 text-blue-800",
  management: "bg-purple-100 text-purple-800",
  products: "bg-green-100 text-green-800",
  delivery: "bg-orange-100 text-orange-800",
  customers: "bg-cyan-100 text-cyan-800",
  finance: "bg-emerald-100 text-emerald-800",
  settings: "bg-gray-100 text-gray-800",
  team: "bg-indigo-100 text-indigo-800",
  subscriptions: "bg-pink-100 text-pink-800",
  support: "bg-yellow-100 text-yellow-800",
  reports: "bg-red-100 text-red-800",
  tools: "bg-violet-100 text-violet-800",
  guides: "bg-teal-100 text-teal-800",
  account: "bg-slate-100 text-slate-800",
  auth: "bg-amber-100 text-amber-800"
};

export default function AdminSystemTests() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState("system_admin");
  const [testSummary, setTestSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await UserAPI.me();
      if (userData.user_type !== 'system_admin') {
        toast({
          title: "Acesso negado",
          description: "Apenas administradores podem acessar esta página.",
          variant: "destructive"
        });
        window.history.back();
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível verificar suas permissões.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runSingleTest = async (page) => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Simular teste de carregamento da página
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = createPageUrl(page.name);
      
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve({
          status: 'failed',
          error: 'Timeout - página não carregou em 10 segundos',
          loadTime: 10000
        });
      }, 10000);

      iframe.onload = () => {
        clearTimeout(timeout);
        const loadTime = Date.now() - startTime;
        
        try {
          // Verificar se a página carregou corretamente
          const doc = iframe.contentDocument || iframe.contentWindow.document;
          const hasError = doc.querySelector('.error, [data-testid="error"]');
          const hasContent = doc.body && doc.body.children.length > 0;
          
          let status = 'passed';
          let error = null;
          
          if (hasError) {
            status = 'failed';
            error = 'Página contém elementos de erro';
          } else if (!hasContent) {
            status = 'failed';
            error = 'Página não possui conteúdo';
          } else if (loadTime > 5000) {
            status = 'warning';
            error = 'Página carregou lentamente (>5s)';
          }
          
          document.body.removeChild(iframe);
          resolve({
            status,
            error,
            loadTime
          });
        } catch (err) {
          document.body.removeChild(iframe);
          resolve({
            status: 'failed',
            error: `Erro ao acessar conteúdo da página: ${err.message}`,
            loadTime
          });
        }
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve({
          status: 'failed',
          error: 'Falha ao carregar a página',
          loadTime: Date.now() - startTime
        });
      };

      document.body.appendChild(iframe);
    });
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);
    setTestResults({});
    
    const pagesToTest = SYSTEM_PAGES[selectedUserType] || [];
    const totalTests = pagesToTest.length;
    
    let passed = 0;
    let failed = 0;
    let warnings = 0;
    const results = {};

    for (let i = 0; i < pagesToTest.length; i++) {
      const page = pagesToTest[i];
      setTestProgress(Math.round(((i + 1) / totalTests) * 100));
      
      try {
        const result = await runSingleTest(page);
        results[page.name] = {
          ...result,
          timestamp: new Date().toISOString()
        };
        
        if (result.status === 'passed') passed++;
        else if (result.status === 'failed') failed++;
        else if (result.status === 'warning') warnings++;
        
        setTestResults({ ...results });
      } catch (error) {
        console.error(`Erro ao testar ${page.name}:`, error);
        results[page.name] = {
          status: 'failed',
          error: error.message,
          loadTime: 0,
          timestamp: new Date().toISOString()
        };
        failed++;
      }
    }

    setTestSummary({
      total: totalTests,
      passed,
      failed,
      warnings
    });

    setIsRunningTests(false);
    
    toast({
      title: "Testes concluídos!",
      description: `${passed} passaram, ${failed} falharam, ${warnings} avisos`,
      variant: passed === totalTests ? "default" : "destructive"
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      passed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800"
    };
    
    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status === 'passed' ? 'Passou' : status === 'failed' ? 'Falhou' : 'Aviso'}
      </Badge>
    );
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

  const pagesToTest = SYSTEM_PAGES[selectedUserType] || [];
  
  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Testes do Sistema</h1>
        <p className="text-slate-600">Execute testes automáticos em todas as páginas do sistema para identificar problemas.</p>
      </div>

      {/* Controles principais */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TestTube className="w-5 h-5" />
            Controles de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de Usuário:</label>
              <select 
                value={selectedUserType} 
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
                disabled={isRunningTests}
              >
                <option value="system_admin">Administrador</option>
                <option value="business_owner">Empresário</option>
                <option value="customer">Cliente</option>
                <option value="public">Páginas Públicas</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunningTests}
                className="bg-slate-800 hover:bg-slate-900 text-white"
              >
                {isRunningTests ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Executar Todos os Testes
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setTestResults({});
                  setTestSummary({ total: 0, passed: 0, failed: 0, warnings: 0 });
                  setTestProgress(0);
                }}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
          
          {isRunningTests && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Progresso do teste</span>
                <span>{testProgress}%</span>
              </div>
              <Progress value={testProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo dos resultados */}
      {testSummary.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0">
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{testSummary.total}</p>
                <p className="text-slate-600">Total de Testes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0">
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{testSummary.passed}</p>
                <p className="text-slate-600">Passou</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0">
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-red-100 rounded-lg mr-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{testSummary.failed}</p>
                <p className="text-slate-600">Falhou</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg border-0">
            <CardContent className="flex items-center p-6">
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{testSummary.warnings}</p>
                <p className="text-slate-600">Avisos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de páginas e resultados */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5" />
            Páginas para Teste ({pagesToTest.length})
          </CardTitle>
          <CardDescription>
            Páginas disponíveis para o tipo de usuário: {selectedUserType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pagesToTest.map((page) => {
              const result = testResults[page.name];
              return (
                <div key={page.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result?.status)}
                    <div>
                      <h4 className="font-medium text-slate-900">{page.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={CATEGORY_COLORS[page.category] || "bg-gray-100 text-gray-800"}>
                          {page.category}
                        </Badge>
                        <span className="text-xs text-slate-500">{page.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {result && (
                      <>
                        {getStatusBadge(result.status)}
                        <div className="text-right text-sm text-slate-600">
                          <div>{result.loadTime}ms</div>
                          {result.error && (
                            <div className="text-xs text-red-600 max-w-xs truncate" title={result.error}>
                              {result.error}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(createPageUrl(page.name), '_blank')}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
