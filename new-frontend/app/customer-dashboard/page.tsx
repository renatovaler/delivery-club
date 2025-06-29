'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart,
  CreditCard,
  Package,
  Calendar,
  MapPin,
  Plus,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { User, Subscription, DeliveryGroup, SubscriptionSummary } from './dashboard-types';
import { 
  formatInSaoPaulo, 
  getSaoPauloDate, 
  isSameSaoPauloDay,
  loadDashboardData,
  calculateTotalWeeklyValue
} from './dashboard-service';
import { UserAPI } from '@/lib/api';

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<DeliveryGroup[]>([]);
  const [totalSubscribedItems, setTotalSubscribedItems] = useState(0);
  const [subscriptionSummaries, setSubscriptionSummaries] = useState<Record<string, SubscriptionSummary>>({});
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    const checkPaymentSuccess = async (userData: User) => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);

        toast({
          title: "Verificando sua nova assinatura...",
          description: "Aguarde um momento.",
        });

        try {
          // Implementar lógica de verificação de pagamento
          // ...
        } catch (error) {
          console.error("Erro ao ativar assinatura do cliente:", error);
          toast({
            title: "Erro na Ativação",
            description: "Recebemos seu pagamento, mas houve um problema ao ativar. Contate o suporte.",
            variant: "destructive",
          });
        }
      }
    };

    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        const userData = await UserAPI.me();
        setUser(userData);
        await checkPaymentSuccess(userData);
        const dashboardData = await loadDashboardData(userData);
        setSubscriptions(dashboardData.subscriptions);
        setUpcomingDeliveries(dashboardData.upcomingDeliveries);
        setTotalSubscribedItems(dashboardData.totalSubscribedItems);
        setSubscriptionSummaries(dashboardData.subscriptionSummaries);
      } catch (error) {
        console.error("Erro ao inicializar dashboard:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalActiveSubscriptions = subscriptions.length;
  const totalWeeklyValue = calculateTotalWeeklyValue(subscriptions);

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Olá, {user?.full_name}! 👋
        </h1>
        <p className="text-slate-600">
          Bem-vindo ao seu painel de controle de assinaturas
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveSubscriptions}</div>
            <p className="text-xs text-blue-200 mt-1">
              {totalActiveSubscriptions > 0 ? 'Entrega garantida' : 'Crie sua primeira assinatura'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Gasto Semanal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWeeklyValue)}</div>
            <p className="text-xs text-green-200 mt-1">
              Investimento semanal em produtos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribedItems}</div>
            <p className="text-xs text-purple-200 mt-1">
              Itens em suas assinaturas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas entregas e Minhas assinaturas */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Próximas entregas */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Calendar className="w-5 h-5" />
              Próximas Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeliveries.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeliveries.map((delivery, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isSameSaoPauloDay(delivery.date, new Date())
                        ? 'bg-slate-100 border-slate-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {formatInSaoPaulo(delivery.date, { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-sm text-slate-600 font-semibold">
                          {delivery.totalQuantity} produtos
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {delivery.address}
                          </p>
                          {delivery.subscriptions.length > 1 && (
                            <p className="text-xs text-blue-600 mt-1">
                              {delivery.subscriptions.length} assinaturas neste local
                            </p>
                          )}
                        </div>
                      </div>
                      {isSameSaoPauloDay(delivery.date, new Date()) && (
                        <Badge className="bg-blue-500 hover:bg-blue-600 ml-3">
                          Hoje
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">Nenhuma entrega programada</p>
                <Link href="/new-subscription" className="inline-block mt-4">
                  <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Assinatura
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Minhas assinaturas */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <ShoppingCart className="w-5 h-5" />
              Minhas Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.slice(0, 3).map((subscription) => (
                  <div key={subscription.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {subscriptionSummaries[subscription.id]?.totalQuantity || 0} itens por entrega
                        </p>
                        <p className="text-sm text-slate-600">
                          {subscriptionSummaries[subscription.id]?.itemCount || 0} produtos diferentes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {formatCurrency(subscription.weekly_price)}
                        </p>
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Ativa
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link href="/my-subscriptions" className="block">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                    Ver Todas as Assinaturas
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Você ainda não tem assinaturas</p>
                <Link href="/new-subscription" className="inline-block">
                  <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Assinatura
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-slate-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/new-subscription" className="block">
              <Button className="w-full h-16 bg-slate-800 hover:bg-slate-900 text-white flex-col gap-2">
                <Plus className="w-5 h-5" />
                Nova Assinatura
              </Button>
            </Link>
            <Link href="/my-subscriptions" className="block">
              <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
                <CreditCard className="w-5 h-5" />
                Gerenciar Assinaturas
              </Button>
            </Link>
            <Link href="/financial-history" className="block">
              <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
                <TrendingUp className="w-5 h-5" />
                Histórico Financeiro
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
