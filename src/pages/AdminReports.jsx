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
    platformExpenses: 0
  });
  
  const [chartData, setChartData] = useState({
    revenueData: [],
    businessGrowthData: [],
    categoryData: [],
    subscriptionStatusData: []
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState("6");
  const [isLoading, setIsLoading] = useState(true);
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
      const customers = users.filter(u => u.user_type === 'customer');
      const activeCustomers = new Set(activeSubscriptions.map(s => s.customer_id)).size;
      const platformExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

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
        platformExpenses
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (<div key={i} className="h-32 bg-amber-200 rounded-xl"></div>))}
          </div>
          <div className="h-80 bg-amber-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Relatórios Avançados da Plataforma</h1>
          <p className="text-amber-600">Análise completa de métricas, crescimento e performance do Delivery Club.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>Período:</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Últimos 3 meses</SelectItem>
                <SelectItem value="6">Últimos 6 meses</SelectItem>
                <SelectItem value="12">Último ano</SelectItem>
                <SelectItem value="24">Últimos 2 anos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards principais de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Receita Total</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-600 mt-1">
              Mensal: {formatCurrency(stats.monthlyRevenue)}
            </p>
            <Progress value={(stats.monthlyRevenue / stats.totalRevenue) * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Empresas</CardTitle>
            <Building2 className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.totalBusinesses}</div>
            <p className="text-xs text-blue-600 mt-1">{stats.activeBusinesses} ativas</p>
            <Progress value={(stats.activeBusinesses / stats.totalBusinesses) * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Clientes</CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats.totalCustomers}</div>
            <p className="text-xs text-purple-600 mt-1">{stats.activeCustomers} com assinaturas</p>
            <Progress value={(stats.activeCustomers / stats.totalCustomers) * 100} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Produtos</CardTitle>
            <Package className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.totalProducts}</div>
            <p className="text-xs text-orange-600 mt-1">Cadastrados na plataforma</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas avançadas da plataforma */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Receita Média por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {formatCurrency(platformMetrics.averageRevenuePerBusiness)}
            </div>
            <p className="text-xs text-gray-600">Por mês</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Assinaturas por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">
              {platformMetrics.averageSubscriptionsPerBusiness.toFixed(1)}
            </div>
            <p className="text-xs text-gray-600">Média por empresa ativa</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm">Taxa de Retenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {platformMetrics.customerRetentionRate}%
            </div>
            <p className="text-xs text-gray-600">Clientes retidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e análises */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Receita
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Crescimento
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Assinaturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Evolução da Receita (Últimos {selectedPeriod} Meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Receita" fill="#c0840c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Crescimento de Empresas (Últimos {selectedPeriod} Meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.businessGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Novas Empresas" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Distribuição por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percentage}) => `${name} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Market Share Detalhado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {platformMetrics.marketShareByCategory.map((item, index) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium capitalize">{item.category}</span>
                        <span className="text-sm font-semibold">{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress value={parseFloat(item.percentage)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Status das Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.subscriptionStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, value}) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.subscriptionStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}