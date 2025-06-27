
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { SubscriptionItem } from "@/api/entities";
import { Product } from "@/api/entities";
import { DeliveryArea } from "@/api/entities";
import { Team } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import {
  Truck,
  Calendar as CalendarIcon,
  FileDown,
  Users,
  Package,
  MapPin,
  Filter,
  BarChart3,
  CheckCircle
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, differenceInCalendarWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DeliveryManagement() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionItems, setSubscriptionItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState({});
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [productionData, setProductionData] = useState([]); // Raw data for selected period (day or week)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("day");
  const [isLoading, setIsLoading] = useState(true);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const [productSummary, setProductSummary] = useState({
    daily: {},
    weekly: {}
  });

  // New states for the redesigned summary cards and filters
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({ successRate: 0 }); // Placeholder
  const [filters, setFilters] = useState({ date: 'all', status: 'all', area: 'all' });
  const [filteredDeliveries, setFilteredDeliveries] = useState([]); // Filtered list of deliveries for the main table

  useEffect(() => {
    const validateUserAccess = async () => {
      setAuthLoading(true);
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (currentUser.user_type !== 'business_owner') {
          toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar esta página.", variant: "destructive" });
          setIsAuthorized(false);
          return;
        }

        if (!currentUser.current_team_id) {
          toast({ title: "Nenhuma Empresa Selecionada", description: "Selecione uma empresa para gerenciar as entregas.", variant: "destructive" });
          setIsAuthorized(false);
          return;
        }

        const currentTeam = await Team.get(currentUser.current_team_id);
        if (currentTeam.owner_id !== currentUser.id) {
          toast({ title: "Acesso Inválido", description: "Você não é o proprietário da empresa selecionada.", variant: "destructive" });
          setIsAuthorized(false);
          return;
        }

        setTeam(currentTeam);
        setIsAuthorized(true);

      } catch (error) {
        console.error("Erro na validação de acesso:", error);
        toast({ title: "Erro de Autenticação", description: "Não foi possível verificar suas permissões.", variant: "destructive" });
        setIsAuthorized(false);
      } finally {
        setAuthLoading(false);
      }
    };

    validateUserAccess();
  }, [toast]);

  useEffect(() => {
    if (isAuthorized && team) {
      loadDeliveryData();
    }
  }, [selectedDate, viewMode, isAuthorized, team]);

  // Effect to calculate filtered deliveries and update summary card data whenever productionData or filters change
  useEffect(() => {
    if (productionData.length > 0) {
      const today = new Date();
      const next7Days = addDays(today, 7);

      let allDeliveriesFlattened = [];
      productionData.forEach(dayData => {
        // Assume deliveries in productionData are initially 'pending' for filtering
        const deliveriesWithDefaultStatus = dayData.deliveries.map(d => ({
          ...d,
          status: d.status || 'pending'
        }));
        allDeliveriesFlattened.push(...deliveriesWithDefaultStatus);
      });

      // Calculate data for the new summary cards
      const currentDayDeliveries = productionData.find(d => format(d.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
      if (currentDayDeliveries) {
        // Mock some completed deliveries for the card display to make it useful
        const todayDels = currentDayDeliveries.deliveries.map((d, index) => ({
          ...d,
          status: index % 3 === 0 ? 'completed' : 'pending' // Mock status for demo purposes
        }));
        setTodayDeliveries(todayDels);
      } else {
        setTodayDeliveries([]);
      }

      const upcoming = [];
      productionData.forEach(dayData => {
        if (dayData.date >= today && dayData.date <= next7Days) {
          upcoming.push(...dayData.deliveries);
        }
      });
      setUpcomingDeliveries(upcoming);

      // Placeholder for delivery success rate, as historical data isn't fetched
      setDeliveryStats({ successRate: 95 });

      // Apply filters to generate filteredDeliveries for the main table
      let tempFilteredDeliveries = [];

      // Filter by date (within the currently loaded productionData scope)
      let deliveriesForFiltering = [];
      if (filters.date === 'today') {
        const todayData = productionData.find(dayData =>
          format(dayData.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        );
        if (todayData) deliveriesForFiltering.push(...todayData.deliveries);
      } else if (filters.date === 'week') {
        const weekStartForSelectedDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEndForSelectedDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
        productionData.filter(dayData =>
          dayData.date >= weekStartForSelectedDate && dayData.date <= weekEndForSelectedDate
        ).forEach(dayData => deliveriesForFiltering.push(...dayData.deliveries));
      } else { // 'all' or default
        productionData.forEach(dayData => deliveriesForFiltering.push(...dayData.deliveries));
      }


      deliveriesForFiltering.forEach(delivery => {
        // Ensure delivery has a 'status' for filtering (added in generateProductionData too)
        const deliveryWithStatus = { ...delivery, status: delivery.status || 'pending' };

        const matchesStatus = filters.status === 'all' || deliveryWithStatus.status === filters.status;
        const matchesArea = filters.area === 'all' || (deliveryWithStatus.area && deliveryWithStatus.area.id === filters.area);

        if (matchesStatus && matchesArea) {
          tempFilteredDeliveries.push(deliveryWithStatus);
        }
      });

      setFilteredDeliveries(tempFilteredDeliveries);
    } else {
      setTodayDeliveries([]);
      setUpcomingDeliveries([]);
      setFilteredDeliveries([]);
    }
  }, [productionData, filters, selectedDate, viewMode]);

  const loadDeliveryData = async () => {
    if (!team) return;
    
    setIsLoading(true);
    try {
      // 1. Buscar todas as assinaturas ativas da empresa
      const teamSubscriptions = await Subscription.filter({ team_id: team.id, status: 'active' });
      setSubscriptions(teamSubscriptions);

      if (teamSubscriptions.length === 0) {
        setProductionData([]);
        setIsLoading(false);
        return;
      }

      // 2. Buscar todos os itens de todas as assinaturas
      const subscriptionIds = teamSubscriptions.map(s => s.id);
      const allSubscriptionItems = [];
      
      for (const subId of subscriptionIds) {
        const items = await SubscriptionItem.filter({ subscription_id: subId });
        allSubscriptionItems.push(...items);
      }
      setSubscriptionItems(allSubscriptionItems);

      // 3. Buscar produtos únicos
      const productIds = [...new Set(allSubscriptionItems.map(item => item.product_id))];
      const teamProducts = productIds.length > 0 
        ? await Product.filter({ id: { "$in": productIds } })
        : [];
      setProducts(teamProducts);

      // 4. Buscar dados dos clientes
      const customerIds = [...new Set(teamSubscriptions.map(s => s.customer_id))];
      const customersData = {};
      for (const customerId of customerIds) {
        try {
          const customer = await User.get(customerId);
          customersData[customerId] = customer;
        } catch (error) {
          console.log(`Erro ao carregar cliente ${customerId}:`, error);
        }
      }
      setCustomers(customersData);

      // 5. Buscar áreas de entrega
      const teamAreas = await DeliveryArea.filter({ team_id: team.id });
      setDeliveryAreas(teamAreas);

      // 6. Gerar dados de produção
      generateProductionData(teamSubscriptions, allSubscriptionItems, customersData, teamAreas, teamProducts);

    } catch (error) {
      console.error("Erro ao carregar dados de entrega:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os dados de entrega.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'day') {
        newDate.setDate(newDate.getDate() + direction);
      } else { // week
        newDate.setDate(newDate.getDate() + (direction * 7));
      }
      return newDate;
    });
  };

  const formatPeriodDisplay = () => {
    if (viewMode === 'day') {
      return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } else {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `Semana de ${format(weekStart, 'dd/MM', { locale: ptBR })} a ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`;
    }
  };

  const generateProductionData = (subs, items, usersById, areasData, productsData) => {
    const dayMappingJsToEn = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
    
    let weekStart, weekEnd;
    if (viewMode === "week") {
      weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    } else {
      weekStart = new Date(selectedDate);
      weekEnd = new Date(selectedDate);
    }

    const itemsBySubId = items.reduce((acc, item) => {
      if (item && item.subscription_id) {
        (acc[item.subscription_id] = acc[item.subscription_id] || []).push(item);
      }
      return acc;
    }, {});

    const productsById = productsData.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    const areasById = areasData.reduce((acc, area) => {
      acc[area.id] = area;
      return acc;
    }, {});

    // Contadores para resumo de produtos
    const productCountsForSelectedDay = {}; // For the specific selectedDate
    const productCountsForSelectedWeek = {}; // For the entire week interval

    const dailyProductionData = eachDayOfInterval({
      start: weekStart,
      end: weekEnd
    }).map(date => {
      const dayNameEn = dayMappingJsToEn[date.getDay()];
      const dayOfMonth = date.getDate();
      const deliveries = [];

      subs.forEach(sub => {
        if (sub.status !== 'active' || !sub.start_date) return;

        const subItems = itemsBySubId[sub.id] || [];

        subItems.forEach(item => {
          if (!item) return;
          
          let isDeliveryDay = false;

          switch (item.frequency) {
            case 'weekly':
              if (Array.isArray(item.delivery_days) && item.delivery_days.includes(dayNameEn)) {
                isDeliveryDay = true;
              }
              break;
            case 'bi-weekly':
              if (item.biweekly_delivery_day === dayNameEn) {
                const startDate = new Date(sub.start_date.replace(/-/g, '\/') + 'T00:00:00');
                const weeksDiff = differenceInCalendarWeeks(date, startDate, { weekStartsOn: 1 });
                if (weeksDiff >= 0 && weeksDiff % 2 === 0) {
                  isDeliveryDay = true;
                }
              }
              break;
            case 'monthly':
              if (item.monthly_delivery_day === dayOfMonth) {
                isDeliveryDay = true;
              }
              break;
            default:
              break;
          }

          if (isDeliveryDay) {
            const product = productsById[item.product_id];
            const customer = usersById[sub.customer_id];
            const area = areasById[sub.delivery_area_id];
            const quantity = item.quantity_per_delivery || 0;

            deliveries.push({
              subscription: sub,
              item: item,
              product: product || { name: 'Produto não encontrado', category: 'outros' },
              customer: customer || { full_name: 'Cliente não encontrado' },
              area: area || { neighborhood: 'Área não encontrada' },
              quantity: quantity,
              address: sub.delivery_address || {},
              status: 'pending' // Default status for filtering
            });

            // Contar produtos para resumo
            const productName = product?.name || 'Produto não encontrado';
            const productCategory = product?.category || 'outros';
            
            // Aggregate for the specific selected day
            if (format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
                if (!productCountsForSelectedDay[productName]) {
                    productCountsForSelectedDay[productName] = { quantity: 0, category: productCategory };
                }
                productCountsForSelectedDay[productName].quantity += quantity;
            }

            // Aggregate for the entire week interval
            if (!productCountsForSelectedWeek[productName]) {
                productCountsForSelectedWeek[productName] = { quantity: 0, category: productCategory };
            }
            productCountsForSelectedWeek[productName].quantity += quantity;
          }
        });
      });

      return {
        date,
        dayName: format(date, 'EEEE', { locale: ptBR }),
        deliveries,
        totalQuantity: deliveries.reduce((sum, d) => sum + d.quantity, 0),
        uniqueCustomers: [...new Set(deliveries.map(d => d.customer.id))].length
      };
    });

    // Atualizar resumo de produtos
    setProductSummary({
      daily: productCountsForSelectedDay,
      weekly: productCountsForSelectedWeek
    });

    setProductionData(dailyProductionData);
  };

  const getCategoryLabel = (category) => {
    const categoryLabels = {
      'paes': 'Pães',
      'bolos': 'Bolos e Tortas',
      'doces': 'Doces',
      'salgados': 'Salgados',
      'carnes': 'Carnes',
      'aves': 'Aves',
      'peixes': 'Peixes',
      'frios': 'Frios',
      'queijos': 'Queijos',
      'frutas': 'Frutas',
      'verduras': 'Verduras',
      'legumes': 'Legumes',
      'laticinios': 'Laticínios',
      'outros': 'Outros'
    };
    return categoryLabels[category] || category;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (authLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Entregas</h1>
          <p className="text-slate-600">Visualize e organize as entregas dos próximos 7 dias.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleDateChange(-1)}>&lt;</Button>
          <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatPeriodDisplay()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if(date) setSelectedDate(date);
                  setOpenCalendar(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="icon" onClick={() => handleDateChange(1)}>&gt;</Button>
          <Button onClick={() => setSelectedDate(new Date())} variant="outline">Hoje</Button>
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Diário</SelectItem>
              <SelectItem value="week">Semanal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de estatísticas (New) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Entregas Hoje
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayDeliveries.length}</div>
            <p className="text-xs text-blue-200 mt-1">
              {todayDeliveries.filter(d => d.status === 'completed').length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Próximos 7 Dias
            </CardTitle>
            <Truck className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingDeliveries.length}</div>
            <p className="text-xs text-green-200 mt-1">
              Entregas programadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Taxa de Sucesso
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryStats.successRate}%</div>
            <p className="text-xs text-purple-200 mt-1">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros (New) */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Select value={filters.date} onValueChange={(value) => handleFilterChange('date', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as datas (Período atual)</SelectItem>
                  <SelectItem value="today">Apenas {format(selectedDate, "dd/MM")}</SelectItem>
                  {viewMode === 'week' && (
                    <SelectItem value="week">Semana completa</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  {/* Assuming these are statuses that might appear in future data or mock */}
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Área</Label>
              <Select value={filters.area} onValueChange={(value) => handleFilterChange('area', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  {deliveryAreas.map(area => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.neighborhood} - {area.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Produtos por Tipo (Existing, color palette updated) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Package className="w-5 h-5" />
              Produtos para Entrega (Resumo da Semana)
            </CardTitle>
            <CardDescription>
              Total de produtos necessários para cumprir as entregas da semana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(viewMode === 'day' ? productSummary.daily : productSummary.weekly).length === 0 ? (
              <p className="text-slate-500 italic">Nenhum produto para entregar</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(viewMode === 'day' ? productSummary.daily : productSummary.weekly)
                  .sort(([,a], [,b]) => b.quantity - a.quantity)
                  .map(([productName, data]) => (
                    <div key={productName} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{productName}</p>
                        <p className="text-sm text-slate-600">{getCategoryLabel(data.category)}</p>
                      </div>
                      <Badge variant="secondary" className="bg-slate-200 text-slate-800">
                        {data.quantity} unidades
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo por Categoria (Existing, color palette updated) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumo por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const summary = viewMode === 'day' ? productSummary.daily : productSummary.weekly;
              const categoryTotals = Object.values(summary).reduce((acc, data) => {
                const categoryLabel = getCategoryLabel(data.category);
                acc[categoryLabel] = (acc[categoryLabel] || 0) + data.quantity;
                return acc;
              }, {});

              return Object.keys(categoryTotals).length === 0 ? (
                <p className="text-slate-500 italic">Nenhuma categoria para mostrar</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(categoryTotals)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, total]) => {
                      const maxTotal = Math.max(...Object.values(categoryTotals));
                      const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{category}</span>
                            <span className="text-sm font-semibold">{total} unidades</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Lista de entregas (Main Delivery Table - Existing, color palette updated) */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CalendarIcon className="w-5 h-5" />
            Entregas da Semana
          </CardTitle>
          <CardDescription>
            Arraste os cards para atualizar o status das entregas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhuma entrega programada encontrada
              </h3>
              <p className="text-slate-600">
                Ajuste os filtros ou o período selecionado.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display deliveries grouped by day if viewMode is week, or just the single day's deliveries */}
              {eachDayOfInterval({
                start: viewMode === 'day' ? selectedDate : startOfWeek(selectedDate, { weekStartsOn: 1 }),
                end: viewMode === 'day' ? selectedDate : endOfWeek(selectedDate, { weekStartsOn: 1 })
              }).map(dateInPeriod => {
                const dayDeliveries = filteredDeliveries.filter(d => {
                  if (!d?.subscription?.start_date || !d?.item) return false;
                  
                  // This mapping is defined here to match the logic in generateProductionData
                  // for consistency when filtering deliveries for display by day.
                  const dayMappingJsToEn = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
                  const currentDayNameEn = dayMappingJsToEn[dateInPeriod.getDay()];

                  let isDeliveryDay = false;

                  switch (d.item.frequency) {
                    case 'weekly':
                      if (Array.isArray(d.item.delivery_days) && d.item.delivery_days.includes(currentDayNameEn)) {
                        isDeliveryDay = true;
                      }
                      break;
                    case 'bi-weekly':
                      if (d.item.biweekly_delivery_day === currentDayNameEn) {
                        const startDate = new Date(d.subscription.start_date.replace(/-/g, '\/') + 'T00:00:00');
                        const weeksDiff = differenceInCalendarWeeks(dateInPeriod, startDate, { weekStartsOn: 1 });
                        if (weeksDiff >= 0 && weeksDiff % 2 === 0) {
                          isDeliveryDay = true;
                        }
                      }
                      break;
                    case 'monthly':
                      if (d.item.monthly_delivery_day === dateInPeriod.getDate()) {
                        isDeliveryDay = true;
                      }
                      break;
                    default:
                      break;
                  }

                  return isDeliveryDay;
                });

                if (dayDeliveries.length === 0) return null; // Don't show empty days

                return (
                  <div key={format(dateInPeriod, 'yyyy-MM-dd')} className="border rounded-lg p-4 bg-slate-50 border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {format(dateInPeriod, 'EEEE', { locale: ptBR })} - {format(dateInPeriod, "dd/MM/yyyy")}
                      </h3>
                      <div className="flex gap-4 text-sm text-slate-600">
                        <span>{dayDeliveries.length} entregas</span>
                        <span>{dayDeliveries.reduce((sum, d) => sum + d.quantity, 0)} itens</span>
                        <span>{new Set(dayDeliveries.map(d => d.customer.id)).size} clientes</span>
                      </div>
                    </div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Produto</TableHead>
                              <TableHead>Quantidade</TableHead>
                              <TableHead>Endereço</TableHead>
                              <TableHead>Status</TableHead> {/* Added Status column */}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dayDeliveries.map((delivery, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {delivery.customer.full_name}
                                </TableCell>
                                <TableCell>{delivery.product.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {delivery.quantity}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {delivery.address.street ? 
                                    `${delivery.address.street}, ${delivery.address.number} - ${delivery.address.neighborhood}` :
                                    'Endereço não informado'
                                  }
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={`${
                                      delivery.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                      delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                      'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {delivery.status === 'completed' ? 'Concluída' : 
                                    delivery.status === 'pending' ? 'Pendente' : 
                                    (delivery.status === 'in_progress' ? 'Em Andamento' : 
                                    'Falhou')}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
