'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { InvoiceAPI, ProductAPI, SubscriptionAPI } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import {
  Bell,
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalCustomers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalProducts: number;
  pendingDeliveries: number;
  completedDeliveries: number;
}

interface RecentActivity {
  id: string;
  type: 'subscription' | 'delivery' | 'payment' | 'customer';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export default function BusinessDashboard() {
  const { user, loading } = useRequireAuth(['business', 'admin']);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Carregar estatísticas
      const [subscriptions, products, invoices] = await Promise.all([
        SubscriptionAPI.list('created_at', 100),
        ProductAPI.list('created_at', 100),
        InvoiceAPI.list('created_at', 30),
      ]);

      // Calcular estatísticas
      const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length;
      const monthlyRevenue = invoices
        .filter((i) => new Date(i.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, i) => sum + i.amount, 0);

      setStats({
        totalCustomers: subscriptions.length,
        activeSubscriptions,
        monthlyRevenue,
        totalProducts: products.length,
        pendingDeliveries: Math.floor(activeSubscriptions * 0.3), // Mock
        completedDeliveries: Math.floor(activeSubscriptions * 2.5), // Mock
      });

      // Simular atividades recentes
      setRecentActivity([
        {
          id: '1',
          type: 'subscription',
          message: 'Nova assinatura criada - Cliente João Silva',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'success',
        },
        {
          id: '2',
          type: 'delivery',
          message: 'Entrega concluída - Rua das Flores, 123',
          timestamp: '2024-01-15T09:15:00Z',
          status: 'success',
        },
        {
          id: '3',
          type: 'payment',
          message: 'Pagamento recebido - R$ 89,90',
          timestamp: '2024-01-15T08:45:00Z',
          status: 'success',
        },
        {
          id: '4',
          type: 'customer',
          message: 'Ticket de suporte aberto - #1234',
          timestamp: '2024-01-14T16:20:00Z',
          status: 'warning',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Users className="h-4 w-4" />;
      case 'delivery':
        return <MapPin className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'customer':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-32 w-32 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Empresarial</h1>
          <p className="mt-2 text-gray-600">
            Bem-vindo de volta, {user?.full_name}! Aqui está um resumo do seu negócio.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Relatórios
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-muted-foreground text-xs">+12% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-muted-foreground text-xs">+8% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
            <p className="text-muted-foreground text-xs">+15% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-muted-foreground text-xs">+3 novos produtos este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Entregas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status das Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.pendingDeliveries}</div>
                <div className="text-sm text-orange-700">Pendentes</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedDeliveries}</div>
                <div className="text-sm text-green-700">Concluídas</div>
              </div>
            </div>
            <div className="mt-4">
              <Button className="w-full" variant="outline">
                <MapPin className="mr-2 h-4 w-4" />
                Gerenciar Entregas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`rounded-full p-2 ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Ver Todas as Atividades
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Button variant="outline" className="h-20 flex-col">
            <Package className="mb-2 h-6 w-6" />
            Produtos
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <Users className="mb-2 h-6 w-6" />
            Clientes
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <MapPin className="mb-2 h-6 w-6" />
            Entregas
          </Button>
          <Button variant="outline" className="h-20 flex-col">
            <DollarSign className="mb-2 h-6 w-6" />
            Financeiro
          </Button>
        </div>
      </div>
    </div>
  );
}
