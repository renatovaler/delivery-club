
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Expense } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { SubscriptionItem } from "@/api/entities";
import { Product } from "@/api/entities";
import { Plan } from "@/api/entities";
import { ProductCostHistory } from "@/api/entities";
import { TeamSubscriptionHistory } from "@/api/entities"; // Added import
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, EXPENSE_CATEGORIES } from "@/components/lib";
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trash2,
  Edit,
  Download,
  MoreVertical,
  AlertCircle,
  PieChart,
  BarChart3,
  Target,
  Package,
  Users,
  CreditCard,
  Calculator,
  Info // Adicionado ícone de Informação
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  eachDayOfInterval,
  differenceInCalendarWeeks,
  getDaysInMonth
} from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FinancialManagement() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [plan, setPlan] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionItems, setSubscriptionItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [costHistory, setCostHistory] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]); // Added state for subscription history
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Estados para análises financeiras detalhadas
  const [revenueAnalysis, setRevenueAnalysis] = useState({
    totalRevenue: 0,
    productRevenue: {},
    customerSegmentation: [],
    subscriptionMetrics: {}
  });
  const [costAnalysis, setCostAnalysis] = useState({
    totalCosts: 0,
    platformCosts: 0,
    productCosts: 0,
    operationalExpenses: 0,
    costBreakdown: {}
  });
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState({
    grossProfit: 0,
    netProfit: 0,
    grossMargin: 0,
    netMargin: 0,
    profitPerCustomer: 0,
    breakEvenPoint: 0
  });

  const { toast } = useToast();

  const PERIOD_OPTIONS = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'yearly', label: 'Anual' }
  ];

  const calculatePeriodDates = (date, period) => {
    const baseDate = new Date(date);
    let startDate, endDate;

    switch (period) {
      case 'weekly':
        const dayOfWeek = baseDate.getDay();
        const daysFromMonday = (dayOfWeek + 6) % 7;
        startDate = new Date(baseDate);
        startDate.setDate(baseDate.getDate() - daysFromMonday);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'monthly':
        startDate = startOfMonth(baseDate);
        endDate = endOfMonth(baseDate);
        break;
      case 'quarterly':
        const quarter = Math.floor(baseDate.getMonth() / 3);
        startDate = new Date(baseDate.getFullYear(), quarter * 3, 1);
        endDate = new Date(baseDate.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'semestral':
        const semester = Math.floor(baseDate.getMonth() / 6);
        startDate = new Date(baseDate.getFullYear(), semester * 6, 1);
        endDate = new Date(baseDate.getFullYear(), semester * 6 + 6, 0);
        break;
      case 'yearly':
        startDate = new Date(baseDate.getFullYear(), 0, 1);
        endDate = new Date(baseDate.getFullYear(), 11, 31);
        break;
      default:
        startDate = startOfMonth(baseDate);
        endDate = endOfMonth(baseDate);
    }
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  };

  const formatPeriodDisplay = (date, period) => {
    const { startDate, endDate } = calculatePeriodDates(date, period);
    
    switch (period) {
      case 'weekly':
        return `Semana de ${format(startDate, 'dd/MM', { locale: ptBR })} a ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`;
      case 'monthly':
        return format(date, 'MMMM yyyy', { locale: ptBR });
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${quarter}º Trimestre de ${date.getFullYear()}`;
      case 'semestral':
        const semester = Math.floor(date.getMonth() / 6) + 1;
        return `${semester}º Semestre de ${date.getFullYear()}`;
      case 'yearly':
        return `Ano de ${date.getFullYear()}`;
      default:
        return format(date, 'MMMM yyyy', { locale: ptBR });
    }
  };

  const loadFinancialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.user_type !== 'business_owner') {
        toast({ title: "Acesso negado", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (userData.current_team_id) {
        const teamData = await Team.get(userData.current_team_id);
        if (teamData.owner_id !== userData.id) {
          toast({ title: "Acesso negado", description: "Você não é o proprietário desta empresa.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        setTeam(teamData);

        // Carregar todos os dados em paralelo
        const [teamPlan, teamSubscriptions, teamProducts, teamExpenses, teamSubHistory] = await Promise.all([
          teamData.plan_id ? Plan.get(teamData.plan_id) : Promise.resolve(null),
          Subscription.filter({ team_id: teamData.id }),
          Product.filter({ team_id: teamData.id }),
          Expense.filter({ team_id: teamData.id }, '-date'),
          TeamSubscriptionHistory.filter({ team_id: teamData.id }, '-start_date') // Load subscription history
        ]);
        
        setPlan(teamPlan);
        setSubscriptions(teamSubscriptions);
        setProducts(teamProducts);
        setExpenses(teamExpenses);
        setSubscriptionHistory(teamSubHistory); // Set subscription history state
        
        // Carregar itens de assinatura
        const allSubscriptionItems = [];
        for (const sub of teamSubscriptions) {
          const items = await SubscriptionItem.filter({ subscription_id: sub.id });
          allSubscriptionItems.push(...items);
        }
        setSubscriptionItems(allSubscriptionItems);
        
        // Carregar histórico de custos para todos os produtos
        const allCostHistory = [];
        const productIds = teamProducts.map(p => p.id);
        if (productIds.length > 0) {
            const historyPromises = productIds.map(id => ProductCostHistory.filter({ product_id: id }));
            const historyResults = await Promise.all(historyPromises);
            allCostHistory.push(...historyResults.flat());
        }
        setCostHistory(allCostHistory);

      } else {
        toast({ title: "Nenhuma equipe encontrada", variant: "warning" });
      }
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  useEffect(() => {
    if (!isLoading && subscriptions.length > 0) {
      calculateFinancialAnalysis();
    }
  }, [subscriptions, subscriptionItems, products, expenses, costHistory, subscriptionHistory, selectedDate, selectedPeriod, isLoading]);

  const calculateFinancialAnalysis = () => {
    if (!subscriptions.length) return;

    // Processar histórico de custos para busca rápida
    const costHistoryByProduct = costHistory.reduce((acc, entry) => {
        (acc[entry.product_id] = acc[entry.product_id] || []).push(entry);
        return acc;
    }, {});
    // Ordenar cada histórico por data descendente para encontrar o mais recente antes da data de entrega
    for (const productId in costHistoryByProduct) {
        costHistoryByProduct[productId].sort((a, b) => new Date(b.effective_date + 'T00:00:00') - new Date(a.effective_date + 'T00:00:00'));
    }

    const getCostForDate = (product, deliveryDate) => {
        if (!product) return 0;
        const history = costHistoryByProduct[product.id];
        if (history) {
            // Find the most recent cost entry whose effective_date is on or before deliveryDate
            const relevantCostEntry = history.find(entry => new Date(entry.effective_date + 'T00:00:00') <= deliveryDate);
            if (relevantCostEntry) {
                return relevantCostEntry.cost_per_unit;
            }
        }
        // Fallback to the current cost from the Product entity if no historical data is found
        return product.cost_per_unit || 0;
    };


    const { startDate, endDate } = calculatePeriodDates(selectedDate, selectedPeriod);
    const dayMappingJsToEn = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };

    // === ANÁLISE DE RECEITAS E CUSTOS DE PRODUTO (CPV) ===
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
    const productsById = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
    
    let totalRevenue = 0;
    let totalProductCosts = 0; // Custo de Produto Vendido (CPV)
    const productRevenue = {};

    const itemsBySubId = subscriptionItems.reduce((acc, item) => {
      if (item && item.subscription_id) {
        (acc[item.subscription_id] = acc[item.subscription_id] || []).push(item);
      }
      return acc;
    }, {});

    const daysInPeriod = eachDayOfInterval({ start: startDate, end: endDate });

    activeSubscriptions.forEach(sub => {
      if (!sub.start_date) return;
      
      const subItems = itemsBySubId[sub.id] || [];
      const subStartDate = new Date(sub.start_date.replace(/-/g, '\/') + 'T00:00:00'); // Ensure date parsing

      daysInPeriod.forEach(date => {
        const dayNameEn = dayMappingJsToEn[date.getDay()];
        const dayOfMonth = date.getDate();

        subItems.forEach(item => {
          if (!item) return;

          let isDeliveryDay = false;
          if (item.frequency === 'weekly' && Array.isArray(item.delivery_days) && item.delivery_days.includes(dayNameEn)) {
            isDeliveryDay = true;
          } else if (item.frequency === 'bi-weekly' && item.biweekly_delivery_day === dayNameEn) {
            const weeksDiff = differenceInCalendarWeeks(date, subStartDate, { weekStartsOn: 1 }); // weekStartsOn: 1 means Monday
            if (weeksDiff >= 0 && weeksDiff % 2 === 0) isDeliveryDay = true;
          } else if (item.frequency === 'monthly' && item.monthly_delivery_day === dayOfMonth) {
            isDeliveryDay = true;
          }

          if (isDeliveryDay) {
            const product = productsById[item.product_id];
            const quantity = item.quantity_per_delivery || 0;
            const price = item.unit_price || 0;
            
            const revenueFromDelivery = quantity * price;
            totalRevenue += revenueFromDelivery;
            
            if (product) {
              productRevenue[product.id] = (productRevenue[product.id] || 0) + revenueFromDelivery;
              // Usar a função que busca o custo histórico
              const cost = getCostForDate(product, date);
              const costFromDelivery = quantity * cost;
              totalProductCosts += costFromDelivery;
            }
          }
        });
      });
    });

    // Segmentação de clientes
    const customerSegmentation = activeSubscriptions.map(sub => {
      // Simple approximation for periodValue per customer based on overall totalRevenue
      const subTotalRevenueApprox = activeSubscriptions.length > 0 ? totalRevenue / activeSubscriptions.length : 0;
      return {
        id: sub.id,
        customerId: sub.customer_id,
        periodValue: subTotalRevenueApprox,
        itemsCount: subscriptionItems.filter(item => item.subscription_id === sub.id).length
      };
    }).sort((a, b) => b.periodValue - a.periodValue);
    
    setRevenueAnalysis({
      totalRevenue,
      productRevenue,
      customerSegmentation,
      subscriptionMetrics: {
        totalSubscriptions: activeSubscriptions.length,
        averageSubscriptionValue: activeSubscriptions.length ? totalRevenue / activeSubscriptions.length : 0
      }
    });

    // === ANÁLISE DE CUSTOS ===
    // Despesas operacionais do período
    const periodExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date + 'T00:00:00');
      return expenseDate >= startDate && expenseDate <= endDate;
    });
    setFilteredExpenses(periodExpenses);

    const operationalExpenses = periodExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // CORREÇÃO: Custo da assinatura da plataforma baseado no histórico, com cálculo diário exato
    let platformCosts = 0;
    const periodDays = eachDayOfInterval({ start: startDate, end: endDate });

    periodDays.forEach(day => {
        // Encontra a assinatura histórica ativa para o dia específico
        const activeSubscriptionForDay = subscriptionHistory
            .sort((a, b) => new Date(b.start_date.replace(/-/g, '\/')) - new Date(a.start_date.replace(/-/g, '\/'))) // Garante que o mais recente venha primeiro
            .find(sub => {
                const subStartDate = new Date(sub.start_date.replace(/-/g, '\/'));
                const subEndDate = sub.end_date ? new Date(sub.end_date.replace(/-/g, '\/')) : null;

                if (!subEndDate) {
                    return day >= subStartDate;
                }
                return day >= subStartDate && day <= subEndDate;
            });

        let dailyRate = 0;
        if (activeSubscriptionForDay) {
            const daysInMonth = getDaysInMonth(day); // Calcula dias no mês do dia atual
            dailyRate = (activeSubscriptionForDay.plan_price || 0) / daysInMonth;
        } else if (plan) {
            // Fallback para o plano atual se não houver histórico para a data
            const daysInMonth = getDaysInMonth(day);
            dailyRate = (plan.price || 0) / daysInMonth;
        }
        
        platformCosts += dailyRate;
    });

    // Breakdown de custos por categoria (for operational expenses)
    const costBreakdown = periodExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + (expense.amount || 0);
      return acc;
    }, {});

    const totalCosts = totalProductCosts + operationalExpenses + platformCosts;
    const costPerCustomer = activeSubscriptions.length ? totalCosts / activeSubscriptions.length : 0; // Local variable

    setCostAnalysis({
      totalCosts,
      platformCosts,
      productCosts: totalProductCosts,
      operationalExpenses,
      costBreakdown
    });

    // === ANÁLISE DE LUCRATIVIDADE ===
    const grossProfit = totalRevenue - totalProductCosts; // Receita - Custo do Produto
    const netProfit = grossProfit - operationalExpenses - platformCosts;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const profitPerCustomer = activeSubscriptions.length ? netProfit / activeSubscriptions.length : 0;
    
    // Ponto de equilíbrio (receita necessária para cobrir todos os custos)
    const breakEvenPoint = totalProductCosts + operationalExpenses + platformCosts;

    setProfitabilityAnalysis({
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      profitPerCustomer,
      breakEvenPoint
    });
  };

  const handlePeriodChange = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      switch (selectedPeriod) {
        case 'weekly':
          newDate.setDate(prev.getDate() + (direction * 7));
          break;
        case 'monthly':
          newDate.setMonth(prev.getMonth() + direction);
          break;
        case 'quarterly':
          newDate.setMonth(prev.getMonth() + (direction * 3));
          break;
        case 'semestral':
          newDate.setMonth(prev.getMonth() + (direction * 6));
          break;
        case 'yearly':
          newDate.setFullYear(prev.getFullYear() + direction);
          break;
        default:
          newDate.setMonth(prev.getMonth() + direction);
      }
      return newDate;
    });
  };

  const handleSaveExpense = async () => {
    if (!expenseData.description || !expenseData.amount || !expenseData.category) {
      toast({ title: "Dados incompletos", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await Expense.update(editingExpense.id, { ...expenseData, amount: parseFloat(expenseData.amount) });
        toast({ title: "Despesa atualizada" });
      } else {
        await Expense.create({ ...expenseData, amount: parseFloat(expenseData.amount), team_id: team.id });
        toast({ title: "Despesa adicionada" });
      }
      setShowAddExpense(false);
      setExpenseData({ description: '', amount: '', category: '', date: format(new Date(), 'yyyy-MM-dd') }); // Reset form
      setEditingExpense(null);
      await loadFinancialData(); // Reload all data to recalculate analysis
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
      toast({ title: "Erro ao salvar despesa", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseData({
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date
    });
    setShowAddExpense(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await Expense.delete(expenseId);
      toast({ title: "Despesa excluída" });
      await loadFinancialData(); // Reload all data
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  const exportFinancialReport = () => {
    const reportData = [
      [`Relatório Financeiro Completo - ${team?.name || 'Sua Empresa'}`],
      [`Período: ${formatPeriodDisplay(selectedDate, selectedPeriod)}`],
      [''],
      ['=== RESUMO EXECUTIVO ==='],
      ['Receita Total', formatCurrency(revenueAnalysis.totalRevenue)],
      ['Custo dos Produtos (CPV)', formatCurrency(costAnalysis.productCosts)],
      ['Despesas Operacionais', formatCurrency(costAnalysis.operationalExpenses)],
      ['Custo da Assinatura da Plataforma', formatCurrency(costAnalysis.platformCosts)],
      ['Custos Totais', formatCurrency(costAnalysis.totalCosts)],
      ['Lucro Bruto', formatCurrency(profitabilityAnalysis.grossProfit)],
      ['Lucro Líquido', formatCurrency(profitabilityAnalysis.netProfit)],
      ['Margem Bruta', `${profitabilityAnalysis.grossMargin.toFixed(1)}%`],
      ['Margem Líquida', `${profitabilityAnalysis.netMargin.toFixed(1)}%`],
      ['Ponto de Equilíbrio', formatCurrency(profitabilityAnalysis.breakEvenPoint)],
      [''],
      ['=== ANÁLISE DE RECEITAS ==='],
      ['Número de Assinaturas Ativas', revenueAnalysis.subscriptionMetrics.totalSubscriptions],
      ['Receita Média por Assinatura', formatCurrency(revenueAnalysis.subscriptionMetrics.averageSubscriptionValue)],
      [''],
      ['=== RECEITA POR PRODUTO ==='],
      ...Object.entries(revenueAnalysis.productRevenue).map(([productId, revenue]) => {
        const product = products.find(p => p.id === productId);
        return [product?.name || 'Produto Desconhecido', formatCurrency(revenue)];
      }),
      [''],
      ['=== DESPESAS POR CATEGORIA (OPERACIONAIS) ==='],
      ...Object.entries(costAnalysis.costBreakdown).map(([category, cost]) => [category, formatCurrency(cost)]),
      [''],
      ['=== DESPESAS DETALHADAS ==='],
      ['Data', 'Descrição', 'Categoria', 'Valor (R$)'],
      ...filteredExpenses.map(exp => [
        format(new Date(exp.date + 'T00:00:00'), 'dd/MM/yyyy'),
        exp.description,
        exp.category,
        exp.amount.toFixed(2).replace('.', ',')
      ])
    ];

    const csvContent = reportData.map(row => row.join(',')).join('\n');
    // Adiciona o BOM (Byte Order Mark) para garantir que o Excel entenda o charset UTF-8
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileNameDate = format(selectedDate, 'yyyy_MM_dd');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_financeiro_completo_${selectedPeriod}_${fileNameDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user || user.user_type !== 'business_owner' || (team && team.owner_id !== user.id)) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
        <p className="text-gray-600">Você não tem permissão para visualizar esta página.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Painel Financeiro Completo</h1>
        <p className="text-slate-600">
          Análise detalhada da performance financeira da sua empresa com insights de receitas, custos e lucratividade.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Controles de Período */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="period-select" className="text-sm font-medium">Período:</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger id="period-select" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handlePeriodChange(-1)}>
              &lt;
            </Button>
            <span className="font-medium text-lg min-w-[200px] text-center">
              {formatPeriodDisplay(selectedDate, selectedPeriod)}
            </span>
            <Button variant="outline" size="icon" onClick={() => handlePeriodChange(1)}>
              &gt;
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={exportFinancialReport} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Dialog open={showAddExpense} onOpenChange={(isOpen) => { setShowAddExpense(isOpen); if (!isOpen) setEditingExpense(null); }}>
            <Button onClick={() => setShowAddExpense(true)} className="bg-slate-800 hover:bg-slate-900 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Despesa
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingExpense ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input 
                    id="description" 
                    value={expenseData.description} 
                    onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    step="0.01" 
                    value={expenseData.amount} 
                    onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={expenseData.category} onValueChange={(value) => setExpenseData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={expenseData.date} 
                    onChange={(e) => setExpenseData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {setShowAddExpense(false); setExpenseData({ description: '', amount: '', category: '', date: format(new Date(), 'yyyy-MM-dd') });}}>Cancelar</Button>
                <Button onClick={handleSaveExpense} className="bg-slate-800 hover:bg-slate-900 text-white" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-100">
              <TrendingUp className="w-5 h-5" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(revenueAnalysis.totalRevenue)}</p>
            <p className="text-sm text-green-200 mt-2">{revenueAnalysis.subscriptionMetrics.totalSubscriptions} assinaturas ativas</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-100">
              <TrendingDown className="w-5 h-5" />
              Custos Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(costAnalysis.totalCosts)}</p>
            <p className="text-sm text-red-200 mt-2">
              Produtos + Despesas + Assinatura
            </p>
          </CardContent>
        </Card>

        <Card className={`shadow-lg border-0 ${profitabilityAnalysis.netProfit >= 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'} text-white`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${profitabilityAnalysis.netProfit >= 0 ? 'text-blue-100' : 'text-orange-100'}`}>
              <DollarSign className="w-5 h-5" />
              Lucro Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(profitabilityAnalysis.netProfit)}
            </p>
            <p className="text-sm mt-2">Margem Líquida: {profitabilityAnalysis.netMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-100">
              <PieChart className="w-5 h-5" />
              Lucro Bruto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(profitabilityAnalysis.grossProfit)}</p>
            <p className="text-sm text-purple-200 mt-2">Margem Bruta: {profitabilityAnalysis.grossMargin.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Análises Detalhadas em Abas */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Lucratividade
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Despesas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Assinatura */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Métricas de Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total de Assinaturas:</span>
                  <span className="font-semibold">{revenueAnalysis.subscriptionMetrics.totalSubscriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Receita Média por Assinatura:</span>
                  <span className="font-semibold">{formatCurrency(revenueAnalysis.subscriptionMetrics.averageSubscriptionValue)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Top Produtos por Receita */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Top Produtos por Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(revenueAnalysis.productRevenue)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([productId, revenue]) => {
                      const product = products.find(p => p.id === productId);
                      const percentage = (revenue / revenueAnalysis.totalRevenue) * 100;
                      return (
                        <div key={productId} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{product?.name || 'Produto Desconhecido'}</span>
                            <span className="text-sm font-semibold">{formatCurrency(revenue)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}% da receita total</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Clientes */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Clientes por Valor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor {PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label}</TableHead>
                      <TableHead>Itens na Assinatura</TableHead>
                      <TableHead>% da Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueAnalysis.customerSegmentation.slice(0, 10).map((customer, index) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            Cliente {customer.customerId.slice(-8)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(customer.periodValue)}</TableCell>
                        <TableCell>{customer.itemsCount} itens</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {((customer.periodValue / revenueAnalysis.totalRevenue) * 100).toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown de Custos */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Breakdown de Custos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Custo dos Produtos (CPV):</span>
                    <span className="font-semibold text-red-600">{formatCurrency(costAnalysis.productCosts)}</span>
                  </div>
                  <Progress value={(costAnalysis.productCosts / costAnalysis.totalCosts) * 100} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Despesas Operacionais:</span>
                    <span className="font-semibold text-orange-600">{formatCurrency(costAnalysis.operationalExpenses)}</span>
                  </div>
                  <Progress value={(costAnalysis.operationalExpenses / costAnalysis.totalCosts) * 100} className="h-2" />
                  
                  <div className="flex justify-between">
                    <span>Assinatura da Plataforma:</span>
                    <span className="font-semibold text-yellow-600">{formatCurrency(costAnalysis.platformCosts)}</span>
                  </div>
                  <Progress value={(costAnalysis.platformCosts / costAnalysis.totalCosts) * 100} className="h-2" />
                  
                  <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded-md mt-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>O custo da assinatura no período atual é calculado proporcionalmente aos dias restantes, com base na data de início do seu plano.</span>
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t mt-4">
                    <span className="font-semibold">Total de Custos:</span>
                    <span className="font-bold text-red-700">{formatCurrency(costAnalysis.totalCosts)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custos Operacionais por Categoria */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(costAnalysis.costBreakdown)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, cost]) => {
                      const percentage = (cost / costAnalysis.operationalExpenses) * 100;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{category}</span>
                            <span className="text-sm font-semibold">{formatCurrency(cost)}</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}% das despesas operacionais</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Assinaturas da Plataforma */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Histórico de Assinaturas da Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plano</TableHead>
                      <TableHead>Preço Mensal</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionHistory.length > 0 ? (
                      subscriptionHistory.map((subHistory) => (
                        <TableRow key={subHistory.id}>
                          <TableCell className="font-medium">{subHistory.plan_name}</TableCell>
                          <TableCell>{formatCurrency(subHistory.plan_price)}</TableCell>
                          <TableCell>
                            {format(new Date(subHistory.start_date + 'T00:00:00'), 'dd/MM/yyyy')} - {' '}
                            {subHistory.end_date ? 
                              format(new Date(subHistory.end_date + 'T00:00:00'), 'dd/MM/yyyy') : 
                              'Atual'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              subHistory.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 
                              subHistory.status === 'cancelled' ? 'bg-red-500 hover:bg-red-600' :
                              'bg-gray-500 hover:bg-gray-600'
                            }>
                              {subHistory.status === 'active' ? 'Ativo' : 
                               subHistory.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          Nenhum histórico de assinatura encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Eficiência */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Métricas de Eficiência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(costAnalysis.totalCosts / revenueAnalysis.subscriptionMetrics.totalSubscriptions || 0)}</p>
                  <p className="text-sm text-gray-600">Custo por Cliente</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {((costAnalysis.totalCosts / revenueAnalysis.totalRevenue) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Custos sobre Receita</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {costAnalysis.operationalExpenses > 0 ? (costAnalysis.platformCosts / costAnalysis.operationalExpenses * 100).toFixed(1) : '0.0'}%
                  </p>
                  <p className="text-sm text-gray-600">Assinatura vs Operacional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análise de Margens */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Análise de Margens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Margem Bruta:</span>
                      <span className="font-semibold">{profitabilityAnalysis.grossMargin.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.max(0, profitabilityAnalysis.grossMargin)} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Margem Líquida:</span>
                      <span className="font-semibold">{profitabilityAnalysis.netMargin.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.max(0, profitabilityAnalysis.netMargin)} className="h-2" />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span>Lucro Bruto:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(profitabilityAnalysis.grossProfit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lucro Líquido:</span>
                    <span className={`font-bold ${profitabilityAnalysis.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(profitabilityAnalysis.netProfit)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas por Cliente */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Métricas por Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(profitabilityAnalysis.profitPerCustomer)}</p>
                    <p className="text-sm text-gray-600">Lucro por Cliente</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-blue-600">
                        {formatCurrency(revenueAnalysis.totalRevenue / revenueAnalysis.subscriptionMetrics.totalSubscriptions || 0)}
                      </p>
                      <p className="text-sm text-gray-600">Receita por Cliente</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-semibold text-red-600">{formatCurrency(costAnalysis.totalCosts / revenueAnalysis.subscriptionMetrics.totalSubscriptions || 0)}</p>
                      <p className="text-xs text-gray-600">Custo por Cliente</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Simulação de Target */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Simulação de Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-lg font-semibold text-green-800">Para 20% de Margem Líquida</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(costAnalysis.totalCosts / 0.8)}
                  </p>
                  <p className="text-sm text-gray-600">Receita necessária</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-semibold text-blue-800">Para 30% de Margem Líquida</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(costAnalysis.totalCosts / 0.7)}
                  </p>
                  <p className="text-sm text-gray-600">Receita necessária</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-lg font-semibold text-purple-800">Dobrar Lucro Atual</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(revenueAnalysis.totalRevenue + Math.abs(profitabilityAnalysis.netProfit))}
                  </p>
                  <p className="text-sm text-gray-600">Receita necessária</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          {/* Tabela de Despesas Detalhada */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Despesas Detalhadas - {formatPeriodDisplay(selectedDate, selectedPeriod)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                        <TableCell>{format(new Date(expense.date + 'T00:00:00'), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium text-red-600">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                                <Edit className="w-4 h-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteExpense(expense.id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        Nenhuma despesa registrada para {formatPeriodDisplay(selectedDate, selectedPeriod)}.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
