
import React, { useState, useEffect } from "react";
import { Team, User, Plan, Subscription, Product } from "@/api/entities/index";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/components/lib";
import {
  CreditCard,
  Search,
  MoreVertical,
  Eye,
  Building2,
  Users,
  Package,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  XCircle,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminSubscriptions() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [plans, setPlans] = useState({});
  const [users, setUsers] = useState({});
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planStats, setPlanStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    cancelled: 0,
    totalRevenue: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, teams, users]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar dados principais em paralelo
      const [allTeams, allPlans, allUsers] = await Promise.all([
        Team.list('-created_date', 500),
        Plan.list(),
        User.list()
      ]);

      const plansMap = allPlans.reduce((acc, plan) => {
        acc[plan.id] = plan;
        return acc;
      }, {});

      const usersMap = allUsers.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      setTeams(allTeams);
      setPlans(plansMap);
      setUsers(usersMap);

      // Calcular estatísticas
      calculatePlanStats(allTeams, plansMap);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados das assinaturas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePlanStats = (teams, plansMap) => {
    const active = teams.filter(t => t.subscription_status === 'active');
    const trial = teams.filter(t => t.subscription_status === 'trial');
    const cancelled = teams.filter(t => t.subscription_status === 'cancelled');
    const totalRevenue = active.reduce((sum, t) => {
      const plan = plansMap[t.plan_id];
      return sum + (plan?.price || 0);
    }, 0);

    setPlanStats({
      total: teams.length,
      active: active.length,
      trial: trial.length,
      cancelled: cancelled.length,
      totalRevenue: totalRevenue
    });
  };

  const applyFilters = () => {
    let filtered = teams.filter(t => {
      const owner = users[t.owner_id];
      
      const matchesSearch = 
        (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (owner?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || t.subscription_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredTeams(filtered);
  };

  const handleViewDetails = async (team) => {
    setSelectedTeam(team);
    setIsLoading(true);
    setShowDetailsModal(true);
    
    try {
      const [owner, subscriptions, productsData] = await Promise.all([
        User.get(team.owner_id).catch(() => null),
        Subscription.filter({ team_id: team.id }),
        Product.filter({ team_id: team.id })
      ]);

      const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (s.weekly_price || 0), 0) * 4.33;

      setTeamDetails({
        team,
        owner,
        plan: plans[team.plan_id] || null,
        totalCustomers: new Set(subscriptions.map(s => s.customer_id)).size,
        activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
        totalProducts: productsData.length,
        monthlyRevenue,
      });
      
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da empresa.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: "Ativa", className: "bg-green-500 hover:bg-green-600" },
      trial: { text: "Trial", className: "bg-blue-500 hover:bg-blue-600" },
      cancelled: { text: "Cancelada", className: "bg-red-500 hover:bg-red-600" },
      cancellation_pending: { text: "Cancelamento Agendado", className: "bg-yellow-500 hover:bg-yellow-600" },
    };
    const config = statusMap[status] || { text: status, className: "bg-gray-500 hover:bg-gray-600" };
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  if (isLoading && teams.length === 0) {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Assinaturas da Plataforma</h1>
        <p className="text-slate-600">Gerencie os planos e assinaturas das empresas que utilizam a plataforma.</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Receita Mensal (MRR)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(planStats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Assinaturas Ativas</CardTitle>
            <Play className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planStats.active}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Empresas em Trial</CardTitle>
            <Clock className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planStats.trial}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planStats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5" />
            Todas as Assinaturas de Empresas ({filteredTeams.length})
          </CardTitle>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por empresa ou proprietário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="cancellation_pending">Cancel. Agendado</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor Mensal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.length > 0 ? (
                  filteredTeams.map((team) => {
                    const owner = users[team.owner_id];
                    const plan = plans[team.plan_id];
                    
                    return (
                      <TableRow key={team.id}>
                        <TableCell>
                          <div className="font-medium">{team.name || 'Empresa não encontrada'}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{owner?.full_name || 'Proprietário não encontrado'}</div>
                            <div className="text-sm text-gray-500">{owner?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{plan?.name || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {plan ? formatCurrency(plan.price) : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(team.subscription_status)}</TableCell>
                        <TableCell>
                          {team.created_date ? format(new Date(team.created_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(team)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma empresa encontrada.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa</DialogTitle>
            <DialogDescription>
              Informações completas sobre a empresa e sua assinatura na plataforma.
            </DialogDescription>
          </DialogHeader>
          
          {isLoading && !teamDetails ? (
            <p>Carregando detalhes...</p>
          ) : teamDetails && (
            <div className="space-y-6 py-4">
              {/* Informações da Empresa e Proprietário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {teamDetails.team.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                       <div><strong>Proprietário:</strong> {teamDetails.owner?.full_name || 'N/A'}</div>
                       <div><strong>Email:</strong> {teamDetails.owner?.email || 'N/A'}</div>
                       <div><strong>Desde:</strong> {format(new Date(teamDetails.team.created_date), 'dd/MM/yyyy')}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Plano Atual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                       <div><strong>Plano:</strong> {teamDetails.plan?.name || 'Nenhum'}</div>
                       <div><strong>Status:</strong> {getStatusBadge(teamDetails.team.subscription_status)}</div>
                       <div><strong>Valor Mensal:</strong> {formatCurrency(teamDetails.plan?.price || 0)}</div>
                    </CardContent>
                  </Card>
              </div>

              {/* Métricas de Uso */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Métricas de Uso da Plataforma</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{teamDetails.totalCustomers}</p>
                    <p className="text-sm text-gray-500">Clientes</p>
                  </div>
                   <div>
                    <p className="text-2xl font-bold">{teamDetails.activeSubscriptions}</p>
                    <p className="text-sm text-gray-500">Assinaturas Ativas</p>
                  </div>
                   <div>
                    <p className="text-2xl font-bold">{teamDetails.totalProducts}</p>
                    <p className="text-sm text-gray-500">Produtos</p>
                  </div>
                   <div>
                    <p className="text-2xl font-bold">{formatCurrency(teamDetails.monthlyRevenue)}</p>
                    <p className="text-sm text-gray-500">Receita /mês</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
