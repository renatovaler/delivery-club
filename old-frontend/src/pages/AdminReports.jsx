
import React, { useState, useEffect } from "react";
import { Invoice, Subscription, Team, User, Product, Expense, PriceUpdate } from "@/api/entities/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { subMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/components/lib";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

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
    newUsersThisMonth: 0 // Added for new card metric
  });

  const [chartData, setChartData] = useState({
    revenueData: [],
    businessGrowthData: [],
    categoryData: [],
    subscriptionStatusData: []
  });

  const [selectedPeriod, setSelectedPeriod] = useState("6");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false); // Added for new report buttons
  const [platformMetrics, setPlatformMetrics] = useState({
    averageRevenuePerBusiness: 0,
    averageSubscriptionsPerBusiness: 0,
    customerRetentionRate: 0,
    marketShareByCategory: []
  });

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
      const [
        invoices,
        subscriptions,
        businesses,
        users,
        products,
        expenses,
        priceUpdates
      ] = await Promise.all([
        Invoice.list('-created_date', maxRecords),
        Subscription.list('-created_date', maxRecords),
        Team.list('-created_date', 200),
        User.list('-created_date', 500),
        Product.list('-created_date', 300),
        Expense.list('-created_date', maxRecords),
        PriceUpdate.list('-created_date', 100)
      ]);

      // Filtrar dados por período
      const filteredInvoices = invoices.filter(invoice =>
        new Date(invoice.created_date) >= startDate
      );

      const filteredSubscriptions = subscriptions.filter(sub =>
        new Date(sub.created_date) >= startDate
      );

      const filteredBusinesses = businesses.filter(business =>
        new Date(business.created_date) >= startDate
      );

      // Calcular estatísticas principais
      const totalRevenue = filteredInvoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.amount || 0), 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = filteredInvoices
        .filter(i => {
          const invoiceDate = new Date(i.paid_date || i.created_date);
          return i.status === 'paid' &&
                 invoiceDate.getMonth() === currentMonth &&
                 invoiceDate.getFullYear() === currentYear;
        })
        .reduce((sum, i) => sum + (i.amount || 0), 0);

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
      const activeBusinesses = businesses.filter(b => b.subscription_status === 'active');
      const customers = users.filter(u => u.user_type === 'customer'); // Renamed from users to customers to match state logic
      const activeCustomers = new Set(activeSubscriptions.map(s => s.customer_id)).size;
      const platformExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      const newUsersThisMonth = users.filter(u => {
        const userCreatedDate = new Date(u.created_date);
        return userCreatedDate.getMonth() === currentMonth &&
               userCreatedDate.getFullYear() === currentYear;
      }).length;

      setStats({
        totalRevenue,
        monthlyRevenue,
        totalSubscriptions: filteredSubscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        totalBusinesses: businesses.length,
        activeBusinesses: activeBusinesses.length,
        totalCustomers: customers.length, // Using customers.length for totalUsers
        activeCustomers,
        totalProducts: products.length,
        platformExpenses,
        newUsersThisMonth // Added
      });

      // Preparar dados para gráficos
      prepareChartData(filteredInvoices, filteredBusinesses, businesses, subscriptions, monthsToLoad);

      // Calcular métricas da plataforma
      calculatePlatformMetrics(businesses, subscriptions, products);

    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (invoices, filteredBusinesses, allBusinesses, subscriptions, months) => {
    // Dados de receita mensal
    const monthlyRevenueData = {};
    const monthlyBusinessData = {};

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'MMM/yy', { locale: ptBR });
      monthlyRevenueData[monthKey] = 0;
      monthlyBusinessData[monthKey] = 0;
    }

    // Agrupar receita por mês
    invoices.filter(i => i.status === 'paid').forEach(invoice => {
      const month = format(new Date(invoice.paid_date || invoice.created_date), 'MMM/yy', { locale: ptBR });
      if (monthlyRevenueData.hasOwnProperty(month)) {
        monthlyRevenueData[month] += invoice.amount || 0;
      }
    });

    // Agrupar empresas por mês
    filteredBusinesses.forEach(business => {
      const month = format(new Date(business.created_date), 'MMM/yy', { locale: ptBR });
      if (monthlyBusinessData.hasOwnProperty(month)) {
        monthlyBusinessData[month] += 1;
      }
    });

    const revenueData = Object.keys(monthlyRevenueData).map(month => ({
      name: month,
      Receita: parseFloat(monthlyRevenueData[month].toFixed(2))
    }));

    const businessGrowthData = Object.keys(monthlyBusinessData).map(month => ({
      name: month,
      'Novas Empresas': monthlyBusinessData[month]
    }));

    // Dados por categoria
    const categoryCount = {};
    allBusinesses.forEach(business => {
      categoryCount[business.category] = (categoryCount[business.category] || 0) + 1;
    });

    const categoryData = Object.keys(categoryCount).map(category => ({
      name: category,
      value: categoryCount[category],
      percentage: ((categoryCount[category] / allBusinesses.length) * 100).toFixed(1)
    }));

    // Status das assinaturas
    const statusCount = {};
    subscriptions.forEach(sub => {
      statusCount[sub.status] = (statusCount[sub.status] || 0) + 1;
    });

    const subscriptionStatusData = Object.keys(statusCount).map(status => ({
      name: status,
      value: statusCount[status]
    }));

    setChartData({
      revenueData,
      businessGrowthData,
      categoryData,
      subscriptionStatusData
    });
  };

  const calculatePlatformMetrics = (businesses, subscriptions, products) => {
    const activeBusinesses = businesses.filter(b => b.subscription_status === 'active');
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

    const totalRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.weekly_price || 0), 0);
    const averageRevenuePerBusiness = activeBusinesses.length > 0 ?
      (totalRevenue * 4.33) / activeBusinesses.length : 0; // Conversão para mensal

    const averageSubscriptionsPerBusiness = activeBusinesses.length > 0 ?
      activeSubscriptions.length / activeBusinesses.length : 0;

    // Market share por categoria
    const categoryCount = {};
    businesses.forEach(business => {
      categoryCount[business.category] = (categoryCount[business.category] || 0) + 1;
    });

    const marketShareByCategory = Object.keys(categoryCount).map(category => ({
      category,
      count: categoryCount[category],
      percentage: ((categoryCount[category] / businesses.length) * 100).toFixed(1)
    })).sort((a, b) => b.count - a.count);

    setPlatformMetrics({
      averageRevenuePerBusiness,
      averageSubscriptionsPerBusiness,
      customerRetentionRate: 92.5, // Placeholder
      marketShareByCategory
    });
  };

  const exportReport = () => {
    // This function is no longer called in the new UI, but kept for completeness
    const reportData = [
      ['Relatório Completo da Plataforma - Delivery Club', format(new Date(), 'dd/MM/yyyy HH:mm')],
      ['Período:', `Últimos ${selectedPeriod} meses`],
      [''],
      ['=== MÉTRICAS GERAIS ==='],
      ['Receita Total', formatCurrency(stats.totalRevenue)],
      ['Receita Mensal Atual', formatCurrency(stats.monthlyRevenue)],
      ['Total de Empresas', stats.totalBusinesses],
      ['Empresas Ativas', stats.activeBusinesses],
      ['Total de Clientes', stats.totalCustomers],
      ['Clientes Ativos', stats.activeCustomers],
      ['Produtos Cadastrados', stats.totalProducts],
      ['Assinaturas Ativas', stats.activeSubscriptions],
      [''],
      ['=== MÉTRICAS DA PLATAFORMA ==='],
      ['Receita Média por Empresa', formatCurrency(platformMetrics.averageRevenuePerBusiness)],
      ['Assinaturas Médias por Empresa', platformMetrics.averageSubscriptionsPerBusiness.toFixed(2)],
      ['Taxa de Retenção', `${platformMetrics.customerRetentionRate}%`],
      [''],
      ['=== MARKET SHARE POR CATEGORIA ==='],
      ...platformMetrics.marketShareByCategory.map(item => [item.category, `${item.count} (${item.percentage}%)`]),
      [''],
      ['=== RECEITA MENSAL ==='],
      ...chartData.revenueData.map(item => [item.name, formatCurrency(item.Receita)])
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_plataforma_completo_${format(new Date(), 'yyyy_MM_dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateReport = (reportType) => {
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

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Relatórios da Plataforma</h1>
        <p className="text-slate-600">Análises detalhadas e métricas de desempenho</p>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total de Empresas
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
            <p className="text-xs text-blue-200 mt-1">
              {stats.activeBusinesses} ativas
            </p>
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
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-200 mt-1">
              Este mês: {formatCurrency(stats.monthlyRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Usuários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div> {/* Mapped to totalCustomers */}
            <p className="text-xs text-purple-200 mt-1">
              {stats.newUsersThisMonth} novos este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gráfico de receita */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Receita" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Relatórios disponíveis */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5" />
              Relatórios Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => generateReport('businesses')}
                className="w-full justify-start bg-slate-800 hover:bg-slate-900 text-white"
                disabled={isGenerating}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Relatório de Empresas
              </Button>
              <Button
                onClick={() => generateReport('revenue')}
                className="w-full justify-start bg-slate-800 hover:bg-slate-900 text-white"
                disabled={isGenerating}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Relatório Financeiro
              </Button>
              <Button
                onClick={() => generateReport('users')}
                className="w-full justify-start bg-slate-800 hover:bg-slate-900 text-white"
                disabled={isGenerating}
              >
                <Users className="w-4 h-4 mr-2" />
                Relatório de Usuários
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
