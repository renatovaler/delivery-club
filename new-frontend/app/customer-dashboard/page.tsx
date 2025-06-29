'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SubscriptionAPI, SubscriptionItemAPI, TeamAPI, UserAPI } from '@/lib/api';
import { addDays, differenceInCalendarWeeks } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  CreditCard,
  MapPin,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Função utilitária para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any[]>([]);
  const [totalSubscribedItems, setTotalSubscribedItems] = useState(0);
  const [subscriptionSummaries, setSubscriptionSummaries] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Helpers para lidar com o fuso horário de São Paulo
  const formatInSaoPaulo = (date: Date, options: any) => {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', ...options }).format(
      date
    );
  };

  const getSaoPauloDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  };

  const isSameSaoPauloDay = (date1: Date, date2: Date) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' } as const;
    return formatInSaoPaulo(date1, options) === formatInSaoPaulo(date2, options);
  };

  useEffect(() => {
    const checkPaymentSuccess = async (userData: any) => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
          // Limpa a URL imediatamente
          window.history.replaceState({}, document.title, window.location.pathname);

          alert('Verificando sua nova assinatura...');

          try {
            // Encontra a assinatura mais recente que está pendente de pagamento para este usuário
            const pendingSubs = await SubscriptionAPI.filter({
              customer_id: userData.id,
              status: 'pending_payment',
            });

            if (pendingSubs.length > 0) {
              const subToActivate = pendingSubs[0];
              // Ativa a assinatura
              await SubscriptionAPI.update(subToActivate.id, { status: 'active' });

              alert('Assinatura ativada com sucesso! ✅');

              // Recarrega todos os dados do dashboard para refletir a nova assinatura
              await loadDashboardData(userData);
            } else {
              alert('Pagamento recebido!');
              await loadDashboardData(userData);
            }
          } catch (error) {
            console.error('Erro ao ativar assinatura do cliente:', error);
            alert('Recebemos seu pagamento, mas houve um problema ao ativar. Contate o suporte.');
          }
        }
      }
    };

    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        const userData = await UserAPI.me();
        setUser(userData);
        await checkPaymentSuccess(userData);
        await loadDashboardData(userData);
      } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const loadDashboardData = async (currentUser?: any) => {
    const userData = currentUser || (await UserAPI.me());
    if (!userData) {
      setIsLoading(false);
      return;
    }

    try {
      const userSubscriptions = await SubscriptionAPI.filter({
        customer_id: userData.id,
        status: 'active',
      });
      setSubscriptions(userSubscriptions);

      if (userSubscriptions.length > 0) {
        // Carregar todos os dados necessários em paralelo
        const teamIds = [...new Set(userSubscriptions.map((s: any) => s.team_id))];
        const teams = await Promise.all(
          teamIds.map((id: string) => TeamAPI.get(id).catch(() => null))
        );

        const validTeams = teams.filter((team) => team !== null);

        console.log('Assinaturas carregadas:', userSubscriptions);

        // Carregar todos os itens das assinaturas ativas
        const allItemsPromises = userSubscriptions.map((s: any) =>
          SubscriptionItemAPI.filter({ subscription_id: s.id })
        );
        const itemGroups = await Promise.all(allItemsPromises);
        const allItems = itemGroups.flat();

        // Calcular o total de itens (quantidade por entrega) de todas as assinaturas ativas
        const totalItems = allItems.reduce(
          (sum: number, item: any) => sum + (item.quantity_per_delivery || 0),
          0
        );
        setTotalSubscribedItems(totalItems);

        // Calcular resumos para cada assinatura individualmente
        const summaries = userSubscriptions.reduce((acc: any, sub: any) => {
          const itemsForSub = allItems.filter((item: any) => item.subscription_id === sub.id);
          acc[sub.id] = {
            totalQuantity: itemsForSub.reduce(
              (sum: number, item: any) => sum + (item.quantity_per_delivery || 0),
              0
            ),
            itemCount: itemsForSub.length,
          };
          return acc;
        }, {});
        setSubscriptionSummaries(summaries);

        // Mapeamento de dias da semana JS (0=domingo) para o formato do schema (inglês)
        const dayMappingJsToEn: { [key: number]: string } = {
          0: 'sunday',
          1: 'monday',
          2: 'tuesday',
          3: 'wednesday',
          4: 'thursday',
          5: 'friday',
          6: 'saturday',
        };

        const deliveries: any[] = [];
        const todayInSaoPaulo = getSaoPauloDate();

        // Mapear assinaturas por ID para acesso rápido
        const subscriptionsById = userSubscriptions.reduce((acc: any, sub: any) => {
          acc[sub.id] = sub;
          return acc;
        }, {});

        // Calcular próximas entregas para os próximos 7 dias
        for (let i = 0; i < 7; i++) {
          const date = addDays(todayInSaoPaulo, i);
          const dayOfWeekEn = dayMappingJsToEn[date.getDay()];
          const dayOfMonth = date.getDate();

          if (Array.isArray(allItems)) {
            allItems.forEach((item: any) => {
              if (!item || !item.subscription_id) return;

              const subscription = subscriptionsById[item.subscription_id];
              if (!subscription || subscription.status !== 'active' || !subscription.start_date)
                return;

              let isDeliveryDay = false;
              if (item.frequency === 'weekly') {
                if (Array.isArray(item.delivery_days) && item.delivery_days.includes(dayOfWeekEn)) {
                  isDeliveryDay = true;
                }
              } else if (item.frequency === 'bi-weekly') {
                if (item.biweekly_delivery_day === dayOfWeekEn) {
                  try {
                    const startDate = new Date(
                      subscription.start_date.replace(/-/g, '\/') + 'T00:00:00'
                    );
                    const weeksDiff = differenceInCalendarWeeks(date, startDate, {
                      weekStartsOn: 1,
                    });
                    if (weeksDiff >= 0 && weeksDiff % 2 === 0) {
                      isDeliveryDay = true;
                    }
                  } catch (error) {
                    console.error('Erro ao calcular data quinzenal:', error);
                  }
                }
              } else if (item.frequency === 'monthly') {
                if (item.monthly_delivery_day === dayOfMonth) {
                  isDeliveryDay = true;
                }
              }

              if (isDeliveryDay) {
                deliveries.push({
                  date,
                  subscription,
                  quantity: item.quantity_per_delivery || 0,
                  address: subscription.delivery_address,
                });
              }
            });
          }
        }

        // Agrupar entregas por data e endereço
        const groupedDeliveries = deliveries.reduce((acc: any, delivery: any) => {
          const dateKey = formatInSaoPaulo(delivery.date, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
          });
          const addressKey = delivery.address
            ? `${delivery.address.street}, ${delivery.address.number} - ${delivery.address.neighborhood}`
            : 'Endereço não informado';
          const groupKey = `${dateKey}_${addressKey}`;

          if (!acc[groupKey]) {
            acc[groupKey] = {
              date: delivery.date,
              address: addressKey,
              totalQuantity: 0,
              subscriptions: [],
            };
          }

          acc[groupKey].totalQuantity += delivery.quantity;
          if (!acc[groupKey].subscriptions.some((s: any) => s.id === delivery.subscription.id)) {
            acc[groupKey].subscriptions.push(delivery.subscription);
          }

          return acc;
        }, {});

        const sortedDeliveries = Object.values(groupedDeliveries)
          .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
          .slice(0, 5);

        setUpcomingDeliveries(sortedDeliveries);
      } else {
        setUpcomingDeliveries([]);
        setTotalSubscribedItems(0);
        setSubscriptionSummaries({});
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const totalActiveSubscriptions = subscriptions.length;
  const totalWeeklyValue = subscriptions.reduce((sum: number, sub: any) => {
    const price = parseFloat(sub.weekly_price) || 0;
    console.log(`Assinatura ${sub.id}: weekly_price = ${sub.weekly_price}, parsed = ${price}`);
    return sum + price;
  }, 0);

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-slate-200"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-6 md:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Olá, {user?.full_name}! 👋</h1>
        <p className="text-slate-600">Bem-vindo ao seu painel de controle de assinaturas</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Assinaturas Ativas</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveSubscriptions}</div>
            <p className="mt-1 text-xs text-blue-200">
              {totalActiveSubscriptions > 0 ? 'Entrega garantida' : 'Crie sua primeira assinatura'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Gasto Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWeeklyValue)}</div>
            <p className="mt-1 text-xs text-green-200">Investimento semanal em produtos</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribedItems}</div>
            <p className="mt-1 text-xs text-purple-200">Itens em suas assinaturas ativas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Próximas entregas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Calendar className="h-5 w-5" />
              Próximas Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeliveries.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeliveries.map((delivery: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-4 ${
                      isSameSaoPauloDay(delivery.date, new Date())
                        ? 'border-slate-300 bg-slate-100'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {formatInSaoPaulo(delivery.date, {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                        <p className="text-sm font-semibold text-slate-600">
                          {delivery.totalQuantity} produtos
                        </p>
                        <div className="mt-2">
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" />
                            {delivery.address}
                          </p>
                          {delivery.subscriptions.length > 1 && (
                            <p className="mt-1 text-xs text-blue-600">
                              {delivery.subscriptions.length} assinaturas neste local
                            </p>
                          )}
                        </div>
                      </div>
                      {isSameSaoPauloDay(delivery.date, new Date()) && (
                        <Badge className="ml-3 bg-blue-500 hover:bg-blue-600">Hoje</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-slate-600">Nenhuma entrega programada</p>
                <Link href="/new-subscription">
                  <Button className="mt-4 bg-slate-800 text-white hover:bg-slate-900">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Assinatura
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Minhas assinaturas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <ShoppingCart className="h-5 w-5" />
              Minhas Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.slice(0, 3).map((subscription: any) => (
                  <div key={subscription.id} className="rounded-lg bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {subscriptionSummaries[subscription.id]?.totalQuantity || 0} itens por
                          entrega
                        </p>
                        <p className="text-sm text-slate-600">
                          {subscriptionSummaries[subscription.id]?.itemCount || 0} produtos
                          diferentes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {formatCurrency(parseFloat(subscription.weekly_price) || 0)}
                        </p>
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Ativa
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}

                <Link href="/my-subscriptions">
                  <Button
                    variant="outline"
                    className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Ver Todas as Assinaturas
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="mb-4 text-slate-600">Você ainda não tem assinaturas</p>
                <Link href="/new-subscription">
                  <Button className="bg-slate-800 text-white hover:bg-slate-900">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Assinatura
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/new-subscription">
              <Button className="h-16 w-full flex-col gap-2 bg-slate-800 text-white hover:bg-slate-900">
                <Plus className="h-5 w-5" />
                Nova Assinatura
              </Button>
            </Link>
            <Link href="/my-subscriptions">
              <Button
                variant="outline"
                className="h-16 w-full flex-col gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <CreditCard className="h-5 w-5" />
                Gerenciar Assinaturas
              </Button>
            </Link>
            <Link href="/financial-history">
              <Button
                variant="outline"
                className="h-16 w-full flex-col gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <TrendingUp className="h-5 w-5" />
                Histórico Financeiro
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
