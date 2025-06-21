
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { SubscriptionItem } from "@/api/entities";
import { Product } from "@/api/entities";
import { DeliveryArea } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users,
  Wheat,
  MapPin,
  TrendingUp,
  Calendar,
  Truck,
  DollarSign,
  AlertTriangle,
  ClipboardList,
  Key, // Added Key icon
} from "lucide-react";
import { format, addDays, differenceInCalendarWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/components/lib";

export default function BusinessDashboard() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [todayProduction, setTodayProduction] = useState(0);
  const [tomorrowProduction, setTomorrowProduction] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const calculateProductionForDate = (subs, subItems, date) => {
    if (!subs || !subItems) return 0;

    // date.getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const dayMappingJsToEn = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
    const dayNameEn = dayMappingJsToEn[date.getDay()];
    const dayOfMonth = date.getDate();

    const itemsBySubId = subItems.reduce((acc, item) => {
        if (item && item.subscription_id) {
            (acc[item.subscription_id] = acc[item.subscription_id] || []).push(item);
        }
        return acc;
    }, {});

    let totalProduction = 0;

    subs.forEach(sub => {
        if (sub.status !== 'active' || !sub.start_date) return;

        const itemsForThisSub = itemsBySubId[sub.id] || [];
        itemsForThisSub.forEach(item => {
            if (!item) return;
            let isDeliveryDay = false;
            switch(item.frequency) {
                case 'weekly':
                    if (Array.isArray(item.delivery_days) && item.delivery_days.includes(dayNameEn)) {
                        isDeliveryDay = true;
                    }
                    break;
                case 'bi-weekly':
                    if (item.biweekly_delivery_day === dayNameEn) {
                        // CORREÇÃO: Garante que a data de início seja tratada como local, assim como a data do loop.
                        // Replace hyphens with slashes for more consistent Date parsing across browsers.
                        // Append 'T00:00:00' to ensure it's treated as a date at midnight, local time,
                        // matching how `date` (the current production date) is likely implicitly treated.
                        const startDate = new Date(sub.start_date.replace(/-/g, '\/') + 'T00:00:00');
                        const weeksDiff = differenceInCalendarWeeks(date, startDate, { weekStartsOn: 1 });
                        if (weeksDiff >= 0 && weeksDiff % 2 === 0) { // Assuming delivery on even weeks (0, 2, 4...)
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

            if(isDeliveryDay) {
                totalProduction += (item.quantity_per_delivery || 0);
            }
        });
    });

    return totalProduction;
  };

  // Função para traduzir status da assinatura
  const translateSubscriptionStatus = (status) => {
    const statuses = {
      'active': 'Ativo',
      'trial': 'Trial',
      'paused': 'Pausado',
      'cancelled': 'Cancelado',
      'cancellation_pending': 'Cancelamento Pendente'
    };
    return statuses[status] || status;
  };

  useEffect(() => {
    loadDashboardData();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      toast({
        title: "Processando seu pagamento! ⏳",
        description: "Você será redirecionado para a página de configurações para verificação.",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = createPageUrl("BusinessSettings?payment=success");
    }
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.user_type !== 'business_owner') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        return;
      }

      if (userData.current_team_id) {
        const teamData = await Team.get(userData.current_team_id);

        if (teamData.owner_id !== userData.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar os dados desta empresa.",
            variant: "destructive"
          });
          return;
        }

        setTeam(teamData);

        const [teamSubscriptions, areas] = await Promise.all([
          Subscription.filter({
            team_id: userData.current_team_id,
            status: "active"
          }),
          DeliveryArea.filter({
            team_id: userData.current_team_id
          })
        ]);
        
        const subscriptionIds = teamSubscriptions.map(s => s.id);
        let teamSubscriptionItems = [];
        if (subscriptionIds.length > 0) {
            teamSubscriptionItems = await SubscriptionItem.filter({ subscription_id: { "$in": subscriptionIds } });
        }

        setSubscriptions(teamSubscriptions);
        setDeliveryAreas(areas);

        const today = new Date();
        const tomorrow = addDays(today, 1);

        const todayTotal = calculateProductionForDate(teamSubscriptions, teamSubscriptionItems, today);
        const tomorrowTotal = calculateProductionForDate(teamSubscriptions, teamSubscriptionItems, tomorrow);

        setTodayProduction(todayTotal);
        setTomorrowProduction(tomorrowTotal);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalCustomers = new Set(subscriptions.map(s => s.customer_id)).size;
  const weeklyRevenue = subscriptions.reduce((sum, sub) => sum + (sub.weekly_price || 0), 0);
  const activeAreas = deliveryAreas.filter(area => area.status === 'active').length;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
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
        <h1 className="text-3xl font-bold text-amber-900 mb-2 flex items-center gap-3">
          <ClipboardList className="w-8 h-8" />
          Painel da Empresa
        </h1>
        <p className="text-amber-600">
          Gerencie sua produção e entregas de produtos.
        </p>
      </div>

      {/* Alerta sobre configuração do Stripe */}
      {team && (!team.stripe_public_key || !team.stripe_secret_key) && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">Configuração do Stripe Pendente</p>
                <p className="text-sm text-amber-700 mt-1">
                  Sua empresa foi criada com sucesso, mas ainda não está disponível para vendas. Configure suas chaves do Stripe para começar a receber pedidos dos clientes.
                </p>
                <div className="flex gap-2 mt-3">
                  <Link to={createPageUrl("StripeConfiguration")}>
                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                      <Key className="w-4 h-4 mr-2" />
                      Configurar Stripe
                    </Button>
                  </Link>
                  <Link to={createPageUrl("BusinessSettings")}>
                    <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                      Configurações Gerais
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-blue-200 mt-1">
              {subscriptions.length} assinaturas ativas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Receita Semanal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(weeklyRevenue)}</div>
            <p className="text-xs text-green-200 mt-1">
              Receita semanal recorrente
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">
              Produção Hoje
            </CardTitle>
            <Wheat className="h-4 w-4 text-amber-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayProduction}</div>
            <p className="text-xs text-amber-200 mt-1">
              itens para entregar
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Áreas Ativas
            </CardTitle>
            <MapPin className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAreas}</div>
            <p className="text-xs text-purple-200 mt-1">
              locais de entrega
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Produção dos próximos dias */}
        <Card className="shadow-lg border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Calendar className="w-5 h-5" />
              Entregas Programadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-100 rounded-lg border border-amber-300">
                <div>
                  <p className="font-medium text-amber-900">Hoje</p>
                  <p className="text-sm text-amber-600">
                    {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-900">{todayProduction}</p>
                  <p className="text-sm text-amber-600">produtos</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Amanhã</p>
                  <p className="text-sm text-blue-600">
                    {format(addDays(new Date(), 1), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">{tomorrowProduction}</p>
                  <p className="text-sm text-blue-600">produtos</p>
                </div>
              </div>

              <Link to={createPageUrl("DeliveryManagement")}>
                <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">
                  <Truck className="w-4 h-4 mr-2" />
                  Ver Gestão de Entregas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Status da assinatura */}
        <Card className="shadow-lg border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <TrendingUp className="w-5 h-5" />
              Status da Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Assinatura</p>
                  <p className="text-sm text-green-600">
                    {translateSubscriptionStatus(team?.subscription_status)}
                  </p>
                </div>
                <Badge className={team?.subscription_status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-amber-500 hover:bg-amber-600'}>
                  {translateSubscriptionStatus(team?.subscription_status)}
                </Badge>
              </div>

              {team?.subscription_status === 'trial' && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Período Trial</p>
                    <p className="text-sm text-amber-600 mt-1">
                      Aproveite todos os recursos por tempo limitado
                    </p>
                    <Link to={createPageUrl("BusinessSettings")}>
                      <Button size="sm" className="mt-2 bg-amber-600 hover:bg-amber-700">
                        Ativar Assinatura
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <Link to={createPageUrl("TeamManagement")}>
                <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50">
                  Gerenciar Equipe
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to={createPageUrl("DeliveryManagement")}>
              <Button className="w-full h-16 bg-amber-600 hover:bg-amber-700 flex-col gap-2">
                <Truck className="w-5 h-5" />
                Gestão de Entregas
              </Button>
            </Link>
            <Link to={createPageUrl("Customers")}>
              <Button variant="outline" className="w-full h-16 border-amber-300 text-amber-700 hover:bg-amber-50 flex-col gap-2">
                <Users className="w-5 h-5" />
                Gerenciar Clientes
              </Button>
            </Link>
            <Link to={createPageUrl("DeliveryAreas")}>
              <Button variant="outline" className="w-full h-16 border-amber-300 text-amber-700 hover:bg-amber-50 flex-col gap-2">
                <MapPin className="w-5 h-5" />
                Áreas de Entrega
              </Button>
            </Link>
            <Link to={createPageUrl("TeamManagement")}>
              <Button variant="outline" className="w-full h-16 border-amber-300 text-amber-700 hover:bg-amber-50 flex-col gap-2">
                <Users className="w-5 h-5" />
                Equipe
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
