
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { Team } from "@/api/entities";
import { Plan } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Função para formatação de moeda brasileira
const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function Customers() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [customersData, setCustomersData] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSubscriptions, setCustomerSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all"
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCustomersData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customersData, filters]);

  const loadCustomersData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // VALIDAÇÃO DE PERMISSÃO CORRIGIDA
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
        
        // VALIDAÇÃO: Verificar se o usuário é realmente o dono desta empresa
        if (teamData.owner_id !== userData.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar os dados desta empresa.",
            variant: "destructive"
          });
          return;
        }
        
        setTeam(teamData);

        if (teamData.plan_id) {
          const planData = await Plan.get(teamData.plan_id).catch(() => null); // Defensive catch for plan
          setCurrentPlan(planData);
        }

        const teamSubscriptions = await Subscription.filter({
          team_id: userData.current_team_id
        }, '-created_date');
        setSubscriptions(teamSubscriptions);

        // Otimização N+1: Carregar todos os usuários uma vez e criar um mapa
        const allUsers = await UserEntity.list('', 1000); // Carrega uma lista grande de usuários
        const userMap = allUsers.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {});

        const customerIds = [...new Set(teamSubscriptions.map(s => s.customer_id))];
        const loadedCustomersData = [];

        for (const customerId of customerIds) {
          const customer = userMap[customerId]; // Get customer from the map
          if (customer) { // Only process if customer data exists in the map
            // CORREÇÃO: Calcular estatísticas do cliente com verificações de segurança
            const customerSubs = teamSubscriptions.filter(s => s.customer_id === customerId);
            const activeSubscriptions = customerSubs.filter(s => s.status === 'active').length;
            const totalWeeklyValue = customerSubs
              .filter(s => s.status === 'active')
              .reduce((sum, s) => sum + (parseFloat(s.weekly_price) || 0), 0);
            
            // CORREÇÃO: Verificar se customerSubs tem elementos antes de usar sort
            const firstSubscriptionDate = customerSubs.length > 0 
              ? customerSubs
                  .filter(s => s.start_date) // Filtrar apenas assinaturas com data de início válida
                  .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0]?.start_date
              : null;
            
            loadedCustomersData.push({
              ...customer,
              activeSubscriptions,
              totalSubscriptions: customerSubs.length,
              totalWeeklyValue,
              firstSubscriptionDate
            });
          }
        }

        setCustomersData(loadedCustomersData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de clientes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos clientes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...customersData];

    // Filtro por busca
    if (filters.search) {
      filtered = filtered.filter(customer => 
        customer.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro por status
    if (filters.status !== "all") {
      if (filters.status === "active") {
        filtered = filtered.filter(customer => customer.activeSubscriptions > 0);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter(customer => customer.activeSubscriptions === 0);
      }
    }

    setFilteredCustomers(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    
    // CORREÇÃO: Carregar assinaturas específicas do cliente com verificação de segurança
    const customerSubs = Array.isArray(subscriptions) 
      ? subscriptions.filter(s => s.customer_id === customer.id)
      : [];
    setCustomerSubscriptions(customerSubs);
  };

  const getStatusBadge = (activeSubscriptions) => {
    if (activeSubscriptions > 0) {
      return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  const getTotalActiveCustomers = () => {
    return Array.isArray(customersData) 
      ? customersData.filter(c => c.activeSubscriptions > 0).length
      : 0;
  };

  const getTotalRevenue = () => {
    return Array.isArray(customersData)
      ? customersData.reduce((sum, c) => sum + (c.totalWeeklyValue || 0), 0)
      : 0;
  };

  const canAcceptNewSubscriptions = () => {
    if (!currentPlan) return true;
    const activeSubscriptionsCount = Array.isArray(subscriptions)
      ? subscriptions.filter(sub => sub.status === 'active').length
      : 0;
    return activeSubscriptionsCount < currentPlan.max_subscriptions;
  };

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
          <div className="h-64 bg-amber-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Gestão de Clientes</h1>
        <p className="text-amber-600">Gerencie os clientes e suas assinaturas</p>
        {currentPlan && (
          <p className="text-sm text-amber-500 mt-1">
            Plano {currentPlan.name}: {subscriptions.filter(sub => sub.status === 'active').length}/{currentPlan.max_subscriptions} assinaturas ativas
          </p>
        )}
      </div>

      {/* Alerta de limite de assinaturas */}
      {currentPlan && !canAcceptNewSubscriptions() && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Limite de assinaturas atingido</p>
                <p className="text-sm text-amber-700">
                  Você está usando {Array.isArray(subscriptions) ? subscriptions.filter(sub => sub.status === 'active').length : 0} de {currentPlan.max_subscriptions} assinaturas permitidas pelo seu plano {currentPlan.name}.
                  Para aceitar mais clientes, considere fazer upgrade do seu plano.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersData.length}</div>
            <p className="text-xs text-blue-200 mt-1">
              {getTotalActiveCustomers()} ativos
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
            <div className="text-2xl font-bold">{formatCurrency(getTotalRevenue())}</div>
            <p className="text-xs text-green-200 mt-1">
              receita semanal recorrente
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customersData.reduce((sum, c) => sum + c.activeSubscriptions, 0)}
            </div>
            <p className="text-xs text-purple-200 mt-1">
              total de assinaturas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Search className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Cliente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome ou e-mail do cliente"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  <SelectItem value="active">Clientes ativos</SelectItem>
                  <SelectItem value="inactive">Clientes inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de clientes */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Users className="w-5 h-5" />
            Clientes ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-amber-600">
                {customersData.length === 0
                  ? "Você ainda não possui clientes cadastrados"
                  : "Tente ajustar os filtros para ver mais resultados"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Assinaturas</TableHead>
                    <TableHead>Valor Semanal</TableHead>
                    <TableHead>Cliente Desde</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-amber-25">
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.full_name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3" />
                              <span className="text-gray-600">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              <span className="text-gray-600">{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.activeSubscriptions} ativas</div>
                          <div className="text-sm text-gray-500">{customer.totalSubscriptions} total</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(customer.totalWeeklyValue)}
                      </TableCell>
                      <TableCell>
                        {customer.firstSubscriptionDate 
                          ? format(new Date(customer.firstSubscriptionDate), "dd 'de' MMM 'de' yyyy", { locale: ptBR })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(customer.activeSubscriptions)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewCustomer(customer)}
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Cliente</DialogTitle>
                              <DialogDescription>
                                Informações completas e histórico de assinaturas
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedCustomer && (
                              <div className="space-y-6">
                                {/* Informações do cliente */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-3">Informações Pessoais</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Nome:</strong> {selectedCustomer.full_name}</div>
                                      <div><strong>E-mail:</strong> {selectedCustomer.email}</div>
                                      {selectedCustomer.phone && (
                                        <div><strong>Telefone:</strong> {selectedCustomer.phone}</div>
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-3">Estatísticas</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Assinaturas Ativas:</strong> {selectedCustomer.activeSubscriptions}</div>
                                      <div><strong>Total de Assinaturas:</strong> {selectedCustomer.totalSubscriptions}</div>
                                      <div><strong>Valor Semanal:</strong> {formatCurrency(selectedCustomer.totalWeeklyValue)}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Assinaturas do cliente */}
                                <div>
                                  <h4 className="font-medium mb-3">Assinaturas</h4>
                                  {Array.isArray(customerSubscriptions) && customerSubscriptions.length > 0 ? (
                                    <div className="space-y-3">
                                      {customerSubscriptions.map((sub) => (
                                        <div key={sub.id} className="p-4 border rounded-lg">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium">
                                              Assinatura #{sub.id.slice(-8)}
                                            </div>
                                            <Badge className={sub.status === 'active' ? 'bg-green-500' : sub.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'}>
                                              {sub.status === 'active' ? 'Ativa' : sub.status === 'paused' ? 'Pausada' : 'Cancelada'}
                                            </Badge>
                                          </div>
                                          <div className="text-sm text-gray-600 space-y-1">
                                            <div>Valor: {formatCurrency(sub.weekly_price || 0)}/semana</div>
                                            <div>Início: {sub.start_date ? format(new Date(sub.start_date), "dd/MM/yyyy") : 'Data não informada'}</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-gray-500">Nenhuma assinatura encontrada</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
