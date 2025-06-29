'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ExpenseAPI, InvoiceAPI, ProductAPI, SubscriptionAPI, TeamAPI, UserAPI } from '@/lib/api';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Building2, DollarSign, FileText, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Função utilitária para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function AdminReports() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    totalBusinesses: 0,
    activeBusinesses: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    totalProducts: 0,
    platformExpenses: 0,
    newUsersThisMonth: 0,
  });

  const [chartData, setChartData] = useState({
    revenueData: [] as Array<{ name: string; Receita: number }>,
    businessGrowthData: [] as Array<{ name: string; 'Novas Empresas': number }>,
    categoryData: [] as Array<{ name: string; value: number }>,
    subscriptionStatusData: [] as Array<{ name: string; value: number }>,
  });

  const [selectedPeriod] = useState('6');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const monthsToLoad = parseInt(selectedPeriod);
      const startDate = subMonths(new Date(), monthsToLoad);
      const maxRecords = monthsToLoad * 100;

      // Carregar todos os dados necessários
      const [invoices, subscriptions, businesses, users, products, expenses] = await Promise.all([
        InvoiceAPI.list('created_date', maxRecords),
        SubscriptionAPI.list('created_date', maxRecords),
        TeamAPI.list('created_date', 200),
        UserAPI.list('created_date', 500),
        ProductAPI.list('created_date', 300),
        ExpenseAPI.list('created_date', maxRecords),
      ]);

      // Filtrar dados por período usando any para evitar conflitos de tipagem
      const filteredInvoices = invoices.filter(
        (invoice: any) => invoice.created_date && new Date(invoice.created_date) >= startDate
      );

      const filteredSubscriptions = subscriptions.filter(
        (sub: any) => sub.created_date && new Date(sub.created_date) >= startDate
      );

      const filteredBusinesses = businesses.filter(
        (business: any) => business.created_date && new Date(business.created_date) >= startDate
      );

      // Calcular estatísticas principais
      const totalRevenue = filteredInvoices
        .filter((i: any) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = filteredInvoices
        .filter((i: any) => {
          const invoiceDate = new Date(i.paid_date || i.created_date);
          return (
            i.status === 'paid' &&
            invoiceDate.getMonth() === currentMonth &&
            invoiceDate.getFullYear() === currentYear
          );
        })
        .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

      const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active');
      const activeBusinesses = businesses.filter((b: any) => b.subscription_status === 'active');
      const customers = users.filter((u: any) => u.user_type === 'customer');
      const activeCustomers = new Set(activeSubscriptions.map((s: any) => s.customer_id)).size;
      const platformExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      const newUsersThisMonth = users.filter((u: any) => {
        if (!u.created_date) return false;
        const userCreatedDate = new Date(u.created_date);
        return (
          userCreatedDate.getMonth() === currentMonth &&
          userCreatedDate.getFullYear() === currentYear
        );
      }).length;

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalSubscriptions: filteredSubscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        totalBusinesses: businesses.length,
        activeBusinesses: activeBusinesses.length,
        totalCustomers: customers.length,
        activeCustomers,
        totalProducts: products.length,
        platformExpenses,
        newUsersThisMonth,
      });

      // Preparar dados para gráficos
      prepareChartData(
        filteredInvoices,
        filteredBusinesses,
        businesses,
        subscriptions,
        monthsToLoad
      );
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (
    invoices: any[],
    filteredBusinesses: any[],
    allBusinesses: any[],
    subscriptions: any[],
    months: number
  ) => {
    // Dados de receita mensal
    const monthlyRevenueData: { [key: string]: number } = {};
    const monthlyBusinessData: { [key: string]: number } = {};

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'MMM/yy', { locale: ptBR });
      monthlyRevenueData[monthKey] = 0;
      monthlyBusinessData[monthKey] = 0;
    }

    // Agrupar receita por mês
    invoices
      .filter((i) => i.status === 'paid')
      .forEach((invoice) => {
        const month = format(new Date(invoice.paid_date || invoice.created_date), 'MMM/yy', {
          locale: ptBR,
        });
        if (monthlyRevenueData.hasOwnProperty(month)) {
          monthlyRevenueData[month] += invoice.amount || 0;
        }
      });

    // Agrupar empresas por mês
    filteredBusinesses.forEach((business: any) => {
      const month = format(new Date(business.created_date), 'MMM/yy', { locale: ptBR });
      if (monthlyBusinessData.hasOwnProperty(month)) {
        monthlyBusinessData[month] += 1;
      }
    });

    const revenueData = Object.keys(monthlyRevenueData).map((month) => ({
      name: month,
      Receita: parseFloat(monthlyRevenueData[month].toFixed(2)),
    }));

    const businessGrowthData = Object.keys(monthlyBusinessData).map((month) => ({
      name: month,
      'Novas Empresas': monthlyBusinessData[month],
    }));

    setChartData({
      revenueData,
      businessGrowthData,
      categoryData: [],
      subscriptionStatusData: [],
    });
  };

  const generateReport = (reportType: string) => {
    setIsGenerating(true);
    console.log(`Generating report for: ${reportType}`);
    // Simulate an async operation
    setTimeout(() => {
      alert(`Relatório de ${reportType} gerado (simulado)!`);
      setIsGenerating(false);
    }, 1500);
  };

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
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Relatórios da Plataforma</h1>
        <p className="text-slate-600">Análises detalhadas e métricas de desempenho</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
            <p className="mt-1 text-xs text-blue-200">{stats.activeBusinesses} ativas</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="mt-1 text-xs text-green-200">
              Este mês: {formatCurrency(stats.monthlyRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="mt-1 text-xs text-purple-200">{stats.newUsersThisMonth} novos este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gráfico de receita */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="h-5 w-5" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value: number) => formatCurrency(value)} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Receita" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios disponíveis */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5" />
              Relatórios Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => generateReport('businesses')}
                className="w-full justify-start bg-slate-800 text-white hover:bg-slate-900"
                disabled={isGenerating}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Relatório de Empresas
              </Button>
              <Button
                onClick={() => generateReport('revenue')}
                className="w-full justify-start bg-slate-800 text-white hover:bg-slate-900"
                disabled={isGenerating}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Relatório Financeiro
              </Button>
              <Button
                onClick={() => generateReport('users')}
                className="w-full justify-start bg-slate-800 text-white hover:bg-slate-900"
                disabled={isGenerating}
              >
                <Users className="mr-2 h-4 w-4" />
                Relatório de Usuários
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
