
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { SubscriptionItem } from "@/api/entities";
import { Product } from "@/api/entities";
import { DeliveryArea } from "@/api/entities";
import { Team } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress"; // Added Progress component
import {
  Truck,
  Calendar as CalendarIcon,
  FileDown,
  Users,
  Package,
  MapPin,
  Filter,
  BarChart3 // Added BarChart3 icon
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
  const [productionData, setProductionData] = useState([]);
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

  const loadDeliveryData = async () => {
    if (!team) return;
    
    setIsLoading(true);
    try {
      console.log("Carregando dados de entrega para equipe:", team.id);

      // 1. Buscar todas as assinaturas ativas da empresa
      const teamSubscriptions = await Subscription.filter({ team_id: team.id, status: 'active' });
      console.log("Assinaturas encontradas:", teamSubscriptions);
      setSubscriptions(teamSubscriptions);

      if (teamSubscriptions.length === 0) {
        console.log("Nenhuma assinatura ativa encontrada");
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
      
      console.log("Itens de assinatura encontrados:", allSubscriptionItems);
      setSubscriptionItems(allSubscriptionItems);

      // 3. Buscar produtos únicos
      const productIds = [...new Set(allSubscriptionItems.map(item => item.product_id))];
      const teamProducts = productIds.length > 0 
        ? await Product.filter({ id: { "$in": productIds } })
        : [];
      console.log("Produtos encontrados:", teamProducts);
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

  const generateProductionData = (subs, items, usersById, areasById, productsData) => {
    console.log("=== DEBUG: Gerando dados de produção ===");
    console.log("Assinaturas:", subs);
    console.log("Itens:", items);
    
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

      console.log(`Processando data: ${format(date, 'yyyy-MM-dd')} (${dayNameEn})`);

      subs.forEach(sub => {
        if (sub.status !== 'active' || !sub.start_date) return;

        const subItems = itemsBySubId[sub.id] || [];
        console.log(`Assinatura ${sub.id}: ${subItems.length} itens`);

        subItems.forEach(item => {
          if (!item) return;
          
          let isDeliveryDay = false;
          console.log(`Item ${item.id}: frequency=${item.frequency}`);

          switch (item.frequency) {
            case 'weekly':
              if (Array.isArray(item.delivery_days) && item.delivery_days.includes(dayNameEn)) {
                isDeliveryDay = true;
                console.log(`✓ Entrega semanal confirmada para ${dayNameEn}`);
              }
              break;
            case 'bi-weekly':
              if (item.biweekly_delivery_day === dayNameEn) {
                const startDate = new Date(sub.start_date.replace(/-/g, '\/') + 'T00:00:00');
                const weeksDiff = differenceInCalendarWeeks(date, startDate, { weekStartsOn: 1 });
                if (weeksDiff >= 0 && weeksDiff % 2 === 0) {
                  isDeliveryDay = true;
                  console.log(`✓ Entrega quinzenal confirmada para ${dayNameEn}`);
                }
              }
              break;
            case 'monthly':
              if (item.monthly_delivery_day === dayOfMonth) {
                isDeliveryDay = true;
                console.log(`✓ Entrega mensal confirmada para dia ${dayOfMonth}`);
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
              address: sub.delivery_address || {}
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

            console.log(`➤ Entrega adicionada: ${quantity} ${productName}`);
          }
        });
      });

      console.log(`Total de entregas para ${format(date, 'yyyy-MM-dd')}: ${deliveries.length}`);

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

    console.log("Dados de produção gerados:", dailyProductionData);
    console.log("Resumo de produtos:", { daily: productCountsForSelectedDay, weekly: productCountsForSelectedWeek });
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

  if (authLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="h-64 bg-amber-200 rounded-xl"></div>
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
      <div className="p-6 md:p-8 space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="h-64 bg-amber-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Gestão de Entregas</h1>
          <p className="text-amber-600">Gerencie e visualize as entregas programadas.</p>
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

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Diferentes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Áreas de Entrega</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryAreas.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entregas Hoje</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionData.find(d => format(d.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))?.deliveries.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NOVO: Resumo de Produtos por Tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumo Diário / Semanal de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produtos para {viewMode === 'day' ? 'Hoje' : 'Esta Semana'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(viewMode === 'day' ? productSummary.daily : productSummary.weekly).length === 0 ? (
              <p className="text-amber-500 italic">Nenhum produto para entregar</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(viewMode === 'day' ? productSummary.daily : productSummary.weekly)
                  .sort(([,a], [,b]) => b.quantity - a.quantity)
                  .map(([productName, data]) => (
                    <div key={productName} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-amber-900">{productName}</p>
                        <p className="text-sm text-amber-600">{getCategoryLabel(data.category)}</p>
                      </div>
                      <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                        {data.quantity} unidades
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo por Categoria */}
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
                <p className="text-amber-500 italic">Nenhuma categoria para mostrar</p>
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

      {/* Dados de Produção/Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Entregas - {formatPeriodDisplay()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productionData.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Nenhuma entrega programada
              </h3>
              <p className="text-amber-600">
                Não há entregas programadas para {viewMode === 'day' ? 'este dia' : 'esta semana'}.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {productionData.map((dayData) => (
                <div key={format(dayData.date, 'yyyy-MM-dd')} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-amber-900">
                      {dayData.dayName} - {format(dayData.date, "dd/MM/yyyy")}
                    </h3>
                    <div className="flex gap-4 text-sm text-amber-600">
                      <span>{dayData.deliveries.length} entregas</span>
                      <span>{dayData.totalQuantity} itens</span>
                      <span>{dayData.uniqueCustomers} clientes</span>
                    </div>
                  </div>

                  {dayData.deliveries.length === 0 ? (
                    <p className="text-amber-500 italic">Nenhuma entrega programada</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Produto</TableHead>
                            <TableHead>Quantidade</TableHead>
                            <TableHead>Endereço</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dayData.deliveries.map((delivery, index) => (
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
