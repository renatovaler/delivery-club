'use client';

import { useState, useEffect } from 'react';
import { UserAPI, SubscriptionAPI } from '../../lib/api';
import { TeamAPI, InvoiceAPI, ProductAPI, SupportTicketAPI, PlatformReportAPI, PriceUpdateAPI, ExpenseAPI } from '../../lib/api-extended';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { formatCurrency } from '../../lib/utils';
import { Building2, Users, DollarSign, TrendingUp, CreditCard, AlertTriangle, CheckCircle, MessageCircle, Shield, Star, Activity, BarChart3 } from 'lucide-react';
import { subDays, format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    trialBusinesses: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    activeSubscriptions: 0,
    pendingSupport: 0,
    pendingReports: 0,
    recentPriceUpdates: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [platformHealth, setPlatformHealth] = useState({
    businessGrowthRate: 0,
    customerSatisfaction: 0,
    averageTicketValue: 0,
    churnRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userData = await UserAPI.me();

        const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthStart = startOfMonth(new Date()).toISOString().split('T')[0];
        const monthEnd = endOfMonth(new Date()).toISOString().split('T')[0];

        const [
          allBusinesses,
          allUsers,
          recentInvoices,
          allSubscriptions,
          allProducts,
          supportTickets,
          platformReports,
          priceUpdates,
          expenses
        ] = await Promise.all([
          TeamAPI.list('-created_date', 200),
          UserAPI.list('-created_date', 500),
          InvoiceAPI.list('-created_date', 300),
          SubscriptionAPI.list('-created_date', 300),
          ProductAPI.list('-created_date', 100),
          SupportTicketAPI.list('-created_date', 50),
          PlatformReportAPI.list('-created_date', 50),
          PriceUpdateAPI.list('-created_date', 50),
          ExpenseAPI.list('-created_date', 100)
        ]);

        const activeBusinesses = allBusinesses.filter(b => b.subscription_status === 'active');
        const trialBusinesses = allBusinesses.filter(b => b.subscription_status === 'trial');
        const recentBusinesses = allBusinesses.filter(b => new Date(b.created_date) >= new Date(thirtyDaysAgo));

        const customers = allUsers.filter(u => u.user_type === 'customer');
        const businessOwners = allUsers.filter(u => u.user_type === 'business_owner');
        const recentCustomers = customers.filter(c => new Date(c.created_date) >= new Date(thirtyDaysAgo));

        const paidInvoices = recentInvoices.filter(i => i.status === 'paid');
        const monthlyInvoices = paidInvoices.filter(i => {
          const invoiceDate = new Date(i.paid_date);
          return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
        });

        const totalRevenue = paidInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);
        const monthlyRevenue = monthlyInvoices.reduce((sum, i) => sum + (i.amount || 0), 0);

        const activeSubscriptions = allSubscriptions.filter(s => s.status === 'active');
        const customersWithActiveSubscriptions = new Set(activeSubscriptions.map(s => s.customer_id)).size;

        const pendingSupport = supportTickets.filter(t => ['open', 'in_progress'].includes(t.status));
        const pendingReports = platformReports.filter(r => r.status === 'pending');
        const recentPriceUpdates = priceUpdates.filter(u => new Date(u.created_date) >= new Date(thirtyDaysAgo));

        const businessGrowthRate = allBusinesses.length > 0 ? (recentBusinesses.length / allBusinesses.length) * 100 : 0;
        const averageTicketValue = activeSubscriptions.length > 0 ? activeSubscriptions.reduce((sum, s) => sum + (s.weekly_price || 0), 0) / activeSubscriptions.length : 0;

        const activities = [
          ...recentBusinesses.slice(0, 3).map(b => ({
            type: 'business_registered',
            description: `Nova empresa cadastrada: ${b.name}`,
            date: b.created_date,
            icon: Building2,
            color: 'text-blue-600'
          })),
          ...recentCustomers.slice(0, 3).map(c => ({
            type: 'customer_registered',
            description: `Novo cliente: ${c.full_name}`,
            date: c.created_date,
            icon: Users,
            color: 'text-green-600'
          })),
          ...pendingSupport.slice(0, 3).map(t => ({
            type: 'support_ticket',
            description: `Ticket de suporte: ${t.subject}`,
            date: t.created_date,
            icon: MessageCircle,
            color: 'text-orange-600'
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

        setDashboardStats({
          totalBusinesses: allBusinesses.length,
          activeBusinesses: activeBusinesses.length,
          trialBusinesses: trialBusinesses.length,
          totalCustomers: customers.length,
          activeCustomers: customersWithActiveSubscriptions,
          totalRevenue,
          monthlyRevenue,
          totalProducts: allProducts.length,
          activeSubscriptions: activeSubscriptions.length,
          pendingSupport: pendingSupport.length,
          pendingReports: pendingReports.length,
          recentPriceUpdates: recentPriceUpdates.length
        });

        setRecentActivities(activities);

        setPlatformHealth({
          businessGrowthRate,
          customerSatisfaction: 4.2,
          averageTicketValue,
          churnRate: 5.2
        });

      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Painel Administrativo 🎯
        </h1>
        <p className="text-slate-600">
          Visão geral completa da plataforma Delivery Club
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Empresas Totais
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalBusinesses}</div>
            <div className="flex justify-between text-xs text-blue-200 mt-2">
              <span>{dashboardStats.activeBusinesses} ativas</span>
              <span>{dashboardStats.trialBusinesses} trial</span>
            </div>
            <Progress 
              value={(dashboardStats.activeBusinesses / dashboardStats.totalBusinesses) * 100} 
              className="mt-2 bg-blue-400"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</div>
            <p className="text-xs text-green-200 mt-1">
              Este mês: {formatCurrency(dashboardStats.monthlyRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeCustomers}</div>
            <p className="text-xs text-purple-200 mt-1">
              De {dashboardStats.totalCustomers} cadastrados
            </p>
            <Progress 
              value={(dashboardStats.activeCustomers / dashboardStats.totalCustomers) * 100} 
              className="mt-2 bg-purple-400"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeSubscriptions}</div>
            <p className="text-xs text-orange-200 mt-1">
              Ticket médio: {formatCurrency(platformHealth.averageTicketValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5" />
              Crescimento (30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">
              {platformHealth.businessGrowthRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Taxa de crescimento</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Star className="w-5 h-5" />
              Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">
              {platformHealth.customerSatisfaction}/5.0
            </div>
            <p className="text-sm text-gray-600">Avaliação média</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="w-5 h-5" />
              Taxa de Churn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">
              {platformHealth.churnRate}%
            </div>
            <p className="text-sm text-gray-600">Cancelamentos</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Package className="w-5 h-5" />
              Produtos Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">
              {dashboardStats.totalProducts}
            </div>
            <p className="text-sm text-gray-600">Catalogados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <AlertTriangle className="w-5 h-5" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.pendingSupport > 0 && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <MessageCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Tickets de Suporte Pendentes</p>
                    <p className="text-sm text-orange-600 mt-1">
                      {dashboardStats.pendingSupport} tickets aguardando atendimento
                    </p>
                  </div>
                </div>
              )}

              {dashboardStats.pendingReports > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Denúncias Pendentes</p>
                    <p className="text-sm text-red-600 mt-1">
                      {dashboardStats.pendingReports} denúncias para investigar
                    </p>
                  </div>
                </div>
              )}

              {dashboardStats.recentPriceUpdates > 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Atualizações de Preço Recentes</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {dashboardStats.recentPriceUpdates} produtos tiveram preços atualizados nos últimos 30 dias
                    </p>
                  </div>
                </div>
              )}

              {dashboardStats.pendingSupport === 0 && dashboardStats.pendingReports === 0 && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Sistema Funcionando Bem</p>
                    <p className="text-sm text-green-600 mt-1">
                      Não há alertas urgentes no momento
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="w-5 h-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-slate-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="w-full h-16 bg-slate-800 hover:bg-slate-900 text-white flex-col gap-2">
              <Building2 className="w-5 h-5" />
              Gerenciar Empresas
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              <Users className="w-5 h-5" />
              Usuários
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              <TrendingUp className="w-5 h-5" />
              Relatórios
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              <CreditCard className="w-5 h-5" />
              Assinaturas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
</thinking>

<plan> Create plan
