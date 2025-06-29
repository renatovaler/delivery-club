'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserAPI } from '@/lib/api';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader2,
  Play,
  RotateCcw,
  TestTube,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Definição de todas as páginas do sistema por tipo de usuário
const SYSTEM_PAGES = {
  system_admin: [
    { name: 'admin-dashboard', title: 'Dashboard Admin', category: 'dashboard' },
    { name: 'admin-businesses', title: 'Gestão de Empresas', category: 'management' },
    { name: 'admin-users', title: 'Gestão de Usuários', category: 'management' },
    { name: 'admin-user-details', title: 'Detalhes do Usuário', category: 'management' },
    { name: 'admin-reports', title: 'Relatórios Admin', category: 'reports' },
    { name: 'admin-plans', title: 'Gestão de Planos', category: 'management' },
    { name: 'admin-system-tests', title: 'Testes do Sistema', category: 'tools' },
  ],
  business_owner: [
    { name: 'business-dashboard', title: 'Dashboard Empresa', category: 'dashboard' },
    { name: 'product-management', title: 'Gestão de Produtos', category: 'products' },
    { name: 'delivery-management', title: 'Gestão de Entregas', category: 'delivery' },
    { name: 'customers', title: 'Clientes', category: 'customers' },
    { name: 'financial-management', title: 'Gestão Financeira', category: 'finance' },
    { name: 'team-management', title: 'Gestão de Equipe', category: 'team' },
  ],
  customer: [
    { name: 'customer-dashboard', title: 'Dashboard Cliente', category: 'dashboard' },
    { name: 'my-subscriptions', title: 'Minhas Assinaturas', category: 'subscriptions' },
    { name: 'financial-history', title: 'Histórico Financeiro', category: 'finance' },
    { name: 'new-subscription', title: 'Nova Assinatura', category: 'subscriptions' },
    { name: 'customer-support', title: 'Suporte', category: 'support' },
  ],
  public: [
    { name: 'login', title: 'Login', category: 'auth' },
    { name: 'register', title: 'Registro', category: 'auth' },
    { name: 'welcome', title: 'Boas-vindas', category: 'auth' },
  ],
};

const CATEGORY_COLORS = {
  dashboard: 'bg-blue-100 text-blue-800',
  management: 'bg-purple-100 text-purple-800',
  products: 'bg-green-100 text-green-800',
  delivery: 'bg-orange-100 text-orange-800',
  customers: 'bg-cyan-100 text-cyan-800',
  finance: 'bg-emerald-100 text-emerald-800',
  settings: 'bg-gray-100 text-gray-800',
  team: 'bg-indigo-100 text-indigo-800',
  subscriptions: 'bg-pink-100 text-pink-800',
  support: 'bg-yellow-100 text-yellow-800',
  reports: 'bg-red-100 text-red-800',
  tools: 'bg-violet-100 text-violet-800',
  guides: 'bg-teal-100 text-teal-800',
  account: 'bg-slate-100 text-slate-800',
  auth: 'bg-amber-100 text-amber-800',
};

interface TestResult {
  status: 'passed' | 'failed' | 'warning';
  error?: string;
  loadTime: number;
  timestamp: string;
}

export default function AdminSystemTests() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [selectedUserType, setSelectedUserType] = useState('system_admin');
  const [testSummary, setTestSummary] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await UserAPI.me();
      // Simulando verificação de tipo de usuário
      if (!userData || userData.email !== 'admin@example.com') {
        alert('Apenas administradores podem acessar esta página.');
        window.history.back();
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      alert('Não foi possível verificar suas permissões.');
    } finally {
      setIsLoading(false);
    }
  };

  const runSingleTest = async (page: any): Promise<TestResult> => {
    return new Promise((resolve) => {
      const startTime = Date.now();

      // Simular teste de carregamento da página
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `/${page.name}`;

      const timeout = setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve({
          status: 'failed',
          error: 'Timeout - página não carregou em 10 segundos',
          loadTime: 10000,
          timestamp: new Date().toISOString(),
        });
      }, 10000);

      iframe.onload = () => {
        clearTimeout(timeout);
        const loadTime = Date.now() - startTime;

        try {
          // Verificar se a página carregou corretamente
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          const hasError = doc?.querySelector('.error, [data-testid="error"]');
          const hasContent = doc?.body && doc.body.children.length > 0;

          let status: 'passed' | 'failed' | 'warning' = 'passed';
          let error: string | undefined = undefined;

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

          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve({
            status,
            error,
            loadTime,
            timestamp: new Date().toISOString(),
          });
        } catch (err: any) {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve({
            status: 'failed',
            error: `Erro ao acessar conteúdo da página: ${err.message}`,
            loadTime,
            timestamp: new Date().toISOString(),
          });
        }
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        resolve({
          status: 'failed',
          error: 'Falha ao carregar a página',
          loadTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        });
      };

      document.body.appendChild(iframe);
    });
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);
    setTestResults({});

    const pagesToTest = SYSTEM_PAGES[selectedUserType as keyof typeof SYSTEM_PAGES] || [];
    const totalTests = pagesToTest.length;

    let passed = 0;
    let failed = 0;
    let warnings = 0;
    const results: { [key: string]: TestResult } = {};

    for (let i = 0; i < pagesToTest.length; i++) {
      const page = pagesToTest[i];
      setTestProgress(Math.round(((i + 1) / totalTests) * 100));

      try {
        const result = await runSingleTest(page);
        results[page.name] = result;

        if (result.status === 'passed') passed++;
        else if (result.status === 'failed') failed++;
        else if (result.status === 'warning') warnings++;

        setTestResults({ ...results });
      } catch (error: any) {
        console.error(`Erro ao testar ${page.name}:`, error);
        results[page.name] = {
          status: 'failed',
          error: error.message,
          loadTime: 0,
          timestamp: new Date().toISOString(),
        };
        failed++;
      }
    }

    setTestSummary({
      total: totalTests,
      passed,
      failed,
      warnings,
    });

    setIsRunningTests(false);

    alert(`Testes concluídos! ${passed} passaram, ${failed} falharam, ${warnings} avisos`);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status === 'passed' ? 'Passou' : status === 'failed' ? 'Falhou' : 'Aviso'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-slate-200"></div>
          <div className="h-64 rounded-xl bg-slate-200"></div>
        </div>
      </div>
    );
  }

  const pagesToTest = SYSTEM_PAGES[selectedUserType as keyof typeof SYSTEM_PAGES] || [];

  return (
    <div className="w-full space-y-8 p-6 md:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Testes do Sistema</h1>
        <p className="text-slate-600">
          Execute testes automáticos em todas as páginas do sistema para identificar problemas.
        </p>
      </div>

      {/* Controles principais */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TestTube className="h-5 w-5" />
            Controles de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tipo de Usuário:</label>
              <select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                className="rounded-md border px-3 py-2 text-sm"
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
                className="bg-slate-800 text-white hover:bg-slate-900"
              >
                {isRunningTests ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
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
                <RotateCcw className="mr-2 h-4 w-4" />
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
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo dos resultados */}
      {testSummary.total > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-lg bg-blue-100 p-2">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{testSummary.total}</p>
                <p className="text-slate-600">Total de Testes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-lg bg-green-100 p-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{testSummary.passed}</p>
                <p className="text-slate-600">Passou</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-lg bg-red-100 p-2">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{testSummary.failed}</p>
                <p className="text-slate-600">Falhou</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="flex items-center p-6">
              <div className="mr-4 rounded-lg bg-yellow-100 p-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
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
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5" />
            Páginas para Teste ({pagesToTest.length})
          </CardTitle>
          <p className="mt-2 text-slate-600">
            Páginas disponíveis para o tipo de usuário: {selectedUserType}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pagesToTest.map((page) => {
              const result = testResults[page.name];
              return (
                <div
                  key={page.name}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result?.status)}
                    <div>
                      <h4 className="font-medium text-slate-900">{page.title}</h4>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          className={CATEGORY_COLORS[page.category] || 'bg-gray-100 text-gray-800'}
                        >
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
                            <div
                              className="max-w-xs truncate text-xs text-red-600"
                              title={result.error}
                            >
                              {result.error}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/${page.name}`, '_blank')}
                      className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" />
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
