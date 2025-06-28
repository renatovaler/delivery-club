'use client';

import { useEffect, useState } from 'react';
import { User, Subscription, UserAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/use-toast';
import { formatCurrency } from '../../lib/lib';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeliveryGroup, SubscriptionSummary } from './types';
import { loadDashboardData, calculateTotalWeeklyValue } from './utils';
import { DashboardContent } from './page-part2';

export default function CustomerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<DeliveryGroup[]>([]);
  const [totalSubscribedItems, setTotalSubscribedItems] = useState(0);
  const [subscriptionSummaries, setSubscriptionSummaries] = useState<Record<string, SubscriptionSummary>>({});
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    async function initializeDashboard() {
      setIsLoading(true);
      try {
        const userData = await UserAPI.me();
        setUser(userData);
        const dashboardData = await loadDashboardData(userData);
        setSubscriptions(dashboardData.subscriptions);
        setUpcomingDeliveries(dashboardData.upcomingDeliveries);
        setTotalSubscribedItems(dashboardData.totalSubscribedItems);
        setSubscriptionSummaries(dashboardData.subscriptionSummaries);
      } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do dashboard',
        });
      } finally {
        setIsLoading(false);
      }
    }
    initializeDashboard();
  }, []);

  const totalActiveSubscriptions = subscriptions.length;
  const totalWeeklyValue = calculateTotalWeeklyValue(subscriptions);

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Olá, {user?.full_name}! 👋</h1>
        <p className="text-slate-600">Bem-vindo ao seu painel de controle de assinaturas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Assinaturas Ativas</CardTitle>
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
            <CardTitle className="text-sm font-medium text-green-100">Gasto Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWeeklyValue)}</div>
            <p className="text-xs text-green-200 mt-1">Investimento semanal em produtos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribedItems}</div>
            <p className="text-xs text-purple-200 mt-1">Itens em suas assinaturas ativas</p>
          </CardContent>
        </Card>
      </div>

      <DashboardContent
        upcomingDeliveries={upcomingDeliveries}
        subscriptions={subscriptions}
        subscriptionSummaries={subscriptionSummaries}
      />

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-slate-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="w-full h-16 bg-slate-800 hover:bg-slate-900 text-white flex-col gap-2">
              Nova Assinatura
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              Gerenciar Assinaturas
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              Histórico Financeiro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
