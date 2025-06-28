'use client';

import { useEffect, useState } from 'react';
import { User, Subscription, SubscriptionItem, Team, UserAPI, SubscriptionAPI, SubscriptionItemAPI, TeamAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/use-toast';
import { formatCurrency } from '../../lib/lib';
import { format, addDays, differenceInCalendarWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeliveryGroup {
  date: Date;
  address: string;
  totalQuantity: number;
  subscriptions: Subscription[];
}

interface SubscriptionSummary {
  totalQuantity: number;
  itemCount: number;
}

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
        await loadDashboardData(userData);
      } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }
    initializeDashboard();
  }, []);

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Olá, {user?.full_name}! 👋</h1>
        <p className="text-slate-600">Bem-vindo ao seu painel de controle de assinaturas</p>
      </div>
    </div>
  );
}
