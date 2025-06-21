
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { SubscriptionItem } from "@/api/entities"; // Import SubscriptionItem
import { Team } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/components/lib";
import {
  ShoppingCart,
  CreditCard,
  Package, // Ícone atualizado de Wheat para Package
  Calendar,
  MapPin,
  Plus,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { format, addDays, isSameDay, differenceInCalendarWeeks } from "date-fns"; // Adicionado differenceInCalendarWeeks
import { ptBR } from "date-fns/locale";


export default function CustomerDashboard() {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);
  const [totalSubscribedItems, setTotalSubscribedItems] = useState(0); // Novo estado para total de itens
  const [subscriptionSummaries, setSubscriptionSummaries] = useState({}); // Novo estado para resumos
  const [isLoading, setIsLoading] = useState(true);

  // Initialize toast hook
  const { toast } = useToast();
  
  // Helpers para lidar com o fuso horário de São Paulo usando Intl API nativa
  const formatInSaoPaulo = (date, options) => {
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', ...options }).format(date);
  };
  
  const getSaoPauloDate = () => {
      const now = new Date();
      // Formata a data atual para o fuso horário de SP e depois converte de volta para um objeto Date
      // Isso "engana" o sistema para que ele pense que a data está no fuso local, mas com a hora de SP
      return new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  };
  
  const isSameSaoPauloDay = (date1, date2) => {
      const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      return formatInSaoPaulo(date1, options) === formatInSaoPaulo(date2, options);
  };

  useEffect(() => {
    const checkPaymentSuccess = async (userData) => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            // Limpa a URL imediatamente
            window.history.replaceState({}, document.title, window.location.pathname);
            
            toast({
                title: "Verificando sua nova assinatura...",
                description: "Aguarde um momento.",
            });

            try {
                // Encontra a assinatura mais recente que está pendente de pagamento para este usuário
                const pendingSubs = await Subscription.filter(
                    { customer_id: userData.id, status: "pending_payment" },
                    '-created_date', // Ordena pela data de criação, mais recente primeiro
                    1 // Limita a apenas 1 resultado
                );

                if (pendingSubs.length > 0) {
                    const subToActivate = pendingSubs[0];
                    // Ativa a assinatura
                    await Subscription.update(subToActivate.id, { status: 'active' });
                    
                    toast({
                        title: "Assinatura ativada com sucesso! ✅",
                        description: "Seus produtos serão entregues conforme o programado.",
                    });
                    
                    // Recarrega todos os dados do dashboard para refletir a nova assinatura
                    await loadDashboardData(userData);
                } else {
                     toast({
                        title: "Pagamento recebido!",
                        description: "Não encontramos uma assinatura pendente para ativar, mas seu dashboard foi atualizado.",
                    });
                     await loadDashboardData(userData); // Still reload to ensure data is fresh
                }
            } catch (error) {
                console.error("Erro ao ativar assinatura do cliente:", error);
                 toast({
                    title: "Erro na Ativação",
                    description: "Recebemos seu pagamento, mas houve um problema ao ativar. Contate o suporte.",
                    variant: "destructive",
                });
            }
        }
    };

    const initializeDashboard = async () => {
        setIsLoading(true);
        try {
            const userData = await User.me();
            setUser(userData);
            await checkPaymentSuccess(userData); // Verifica o pagamento ANTES de carregar o resto
            await loadDashboardData(userData); // Carrega os dados normalmente (or reloads if checkPaymentSuccess triggered a change)
        } catch (error) {
            console.error("Erro ao inicializar dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    initializeDashboard();
  }, []);

  const loadDashboardData = async (currentUser) => {
    const userData = currentUser || await User.me();
    if (!userData) {
      setIsLoading(false);
      return;
    }
    
    try {
      const userSubscriptions = await Subscription.filter({
        customer_id: userData.id,
        status: "active"
      });
      setSubscriptions(userSubscriptions);

      if (userSubscriptions.length > 0) {
        // Carregar todos os dados necessários em paralelo
        const teamIds = [...new Set(userSubscriptions.map(s => s.team_id))];
        const [teams] = await Promise.all([
          Promise.all(teamIds.map(id => Team.get(id).catch(e => null)))
        ]);
        
        const validTeams = teams.filter(team => team !== null);
        
        console.log("Assinaturas carregadas:", userSubscriptions);

        // Carregar todos os itens das assinaturas ativas
        const allItems = await Promise.all(
            userSubscriptions.map(s => SubscriptionItem.filter({ subscription_id: s.id }))
        ).then(itemGroups => itemGroups.flat());

        // Calcular o total de itens (quantidade por entrega) de todas as assinaturas ativas
        const totalItems = allItems.reduce((sum, item) => sum + (item.quantity_per_delivery || 0), 0);
        setTotalSubscribedItems(totalItems);

        // Calcular resumos para cada assinatura individualmente
        const summaries = userSubscriptions.reduce((acc, sub) => {
            const itemsForSub = allItems.filter(item => item.subscription_id === sub.id);
            acc[sub.id] = {
                totalQuantity: itemsForSub.reduce((sum, item) => sum + (item.quantity_per_delivery || 0), 0),
                itemCount: itemsForSub.length
            };
            return acc;
        }, {});
        setSubscriptionSummaries(summaries);

        // Mapeamento de dias da semana JS (0=domingo) para o formato do schema (inglês)
        const dayMappingJsToEn = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
        
        const deliveries = [];
        const todayInSaoPaulo = getSaoPauloDate();

        // Mapear assinaturas por ID para acesso rápido
        const subscriptionsById = userSubscriptions.reduce((acc, sub) => {
            acc[sub.id] = sub;
            return acc;
        }, {});

        // Calcular próximas entregas para os próximos 7 dias, baseando-se nos SubscriptionItems
        for (let i = 0; i < 7; i++) {
            const date = addDays(todayInSaoPaulo, i);
            const dayOfWeekEn = dayMappingJsToEn[date.getDay()];
            const dayOfMonth = date.getDate();

            // CORREÇÃO: Verificar se allItems existe e é um array antes de usar forEach
            if (Array.isArray(allItems)) {
                allItems.forEach(item => {
                    // Verificação de segurança para o item
                    if (!item || !item.subscription_id) return;

                    const subscription = subscriptionsById[item.subscription_id];
                    // Verificação para a data de início da assinatura
                    if (!subscription || subscription.status !== 'active' || !subscription.start_date) return;

                    let isDeliveryDay = false;
                    if (item.frequency === 'weekly') {
                        // CORREÇÃO: Usar Array.isArray para garantir que a propriedade é um array antes de usar .includes()
                        if (Array.isArray(item.delivery_days) && item.delivery_days.includes(dayOfWeekEn)) {
                            isDeliveryDay = true;
                        }
                    } else if (item.frequency === 'bi-weekly') {
                        if (item.biweekly_delivery_day === dayOfWeekEn) {
                            // CORREÇÃO: Tratamento de data mais robusto para evitar erros de fuso horário
                            try {
                                const startDate = new Date(subscription.start_date.replace(/-/g, '\/') + 'T00:00:00');
                                const weeksDiff = differenceInCalendarWeeks(date, startDate, { weekStartsOn: 1 });
                                if (weeksDiff >= 0 && weeksDiff % 2 === 0) {
                                    isDeliveryDay = true;
                                }
                            } catch (error) {
                                console.error("Erro ao calcular data quinzenal:", error);
                            }
                        }
                    } else if (item.frequency === 'monthly') {
                        if (item.monthly_delivery_day === dayOfMonth) {
                            isDeliveryDay = true;
                        }
                    }

                    if (isDeliveryDay) {
                        deliveries.push({
                            date,
                            subscription,
                            quantity: item.quantity_per_delivery || 0,
                            address: subscription.delivery_address,
                        });
                    }
                });
            }
        }
        
        // Agrupar entregas por data e endereço
        const groupedDeliveries = deliveries.reduce((acc, delivery) => {
          // Usa formatInSaoPaulo para a chave da data para garantir consistência com o helper de formatação
          const dateKey = formatInSaoPaulo(delivery.date, { year: 'numeric', month: 'numeric', day: 'numeric' });
          const addressKey = delivery.address ? 
            `${delivery.address.street}, ${delivery.address.number} - ${delivery.address.neighborhood}` : 
            'Endereço não informado';
          const groupKey = `${dateKey}_${addressKey}`;
          
          if (!acc[groupKey]) {
            acc[groupKey] = {
              date: delivery.date,
              address: addressKey,
              totalQuantity: 0,
              subscriptions: [] // Armazena assinaturas únicas para esta entrega agrupada
            };
          }
          
          acc[groupKey].totalQuantity += delivery.quantity;
          // Adiciona a assinatura apenas se ainda não estiver presente para evitar duplicatas
          if (!acc[groupKey].subscriptions.some(s => s.id === delivery.subscription.id)) {
              acc[groupKey].subscriptions.push(delivery.subscription);
          }
          
          return acc;
        }, {});

        const sortedDeliveries = Object.values(groupedDeliveries)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 5);

        setUpcomingDeliveries(sortedDeliveries);
      } else {
        // Se não houver assinaturas ativas, limpa as entregas e os itens
        setUpcomingDeliveries([]);
        setTotalSubscribedItems(0);
        setSubscriptionSummaries({}); // Limpa os resumos também
      }

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } 
  };

  const totalActiveSubscriptions = subscriptions.length;
  const totalWeeklyValue = subscriptions.reduce((sum, sub) => {
    const price = parseFloat(sub.weekly_price) || 0;
    console.log(`Assinatura ${sub.id}: weekly_price = ${sub.weekly_price}, parsed = ${price}`);
    return sum + price;
  }, 0);
  // totalDailyBread foi removido, pois agora temos totalSubscribedItems

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-amber-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">
          Olá, {user?.full_name}! 👋
        </h1>
        <p className="text-amber-600">
          Bem-vindo ao seu painel de controle de assinaturas
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveSubscriptions}</div>
            <p className="text-xs text-blue-200 mt-1">
              {totalActiveSubscriptions > 0 ? 'Entrega garantida' : 'Crie sua primeira assinatura'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Gasto Semanal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalWeeklyValue)}</div>
            <p className="text-xs text-green-200 mt-1">
              Investimento semanal em produtos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-amber-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribedItems}</div>
            <p className="text-xs text-amber-200 mt-1">
              Itens em suas assinaturas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Próximas entregas */}
        <Card className="shadow-lg border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Calendar className="w-5 h-5" />
              Próximas Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeliveries.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeliveries.map((delivery, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isSameSaoPauloDay(delivery.date, new Date())
                        ? 'bg-amber-100 border-amber-300'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-amber-900">
                           {formatInSaoPaulo(delivery.date, { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <p className="text-sm text-amber-600 font-semibold">
                          {delivery.totalQuantity} produtos
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-amber-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {delivery.address}
                          </p>
                          {delivery.subscriptions.length > 1 && (
                            <p className="text-xs text-blue-600 mt-1">
                              {delivery.subscriptions.length} assinaturas neste local
                            </p>
                          )}
                        </div>
                      </div>
                      {isSameSaoPauloDay(delivery.date, new Date()) && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 ml-3">
                          Hoje
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600">Nenhuma entrega programada</p>
                <Link to={createPageUrl("NewSubscription")}>
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Assinatura
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Minhas assinaturas */}
        <Card className="shadow-lg border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <ShoppingCart className="w-5 h-5" />
              Minhas Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.slice(0, 3).map((subscription) => (
                  <div key={subscription.id} className="p-4 bg-amber-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-amber-900">
                          {subscriptionSummaries[subscription.id]?.totalQuantity || 0} itens por entrega
                        </p>
                        <p className="text-sm text-amber-600">
                          {subscriptionSummaries[subscription.id]?.itemCount || 0} produtos diferentes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-900">
                          {formatCurrency(parseFloat(subscription.weekly_price) || 0)}
                        </p>
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Ativa
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link to={createPageUrl("MySubscriptions")}>
                  <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                    Ver Todas as Assinaturas
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600 mb-4">Você ainda não tem assinaturas</p>
                <Link to={createPageUrl("NewSubscription")}>
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Assinatura
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to={createPageUrl("NewSubscription")}>
              <Button className="w-full h-16 bg-amber-600 hover:bg-amber-700 flex-col gap-2">
                <Plus className="w-5 h-5" />
                Nova Assinatura
              </Button>
            </Link>
            <Link to={createPageUrl("MySubscriptions")}>
              <Button variant="outline" className="w-full h-16 border-amber-300 text-amber-700 hover:bg-amber-50 flex-col gap-2">
                <CreditCard className="w-5 h-5" />
                Gerenciar Assinaturas
              </Button>
            </Link>
            <Link to={createPageUrl("FinancialHistory")}>
              <Button variant="outline" className="w-full h-16 border-amber-300 text-amber-700 hover:bg-amber-50 flex-col gap-2">
                <TrendingUp className="w-5 h-5" />
                Histórico Financeiro
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
