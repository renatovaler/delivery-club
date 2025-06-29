'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { ProductAPI, SubscriptionAPI, TeamAPI, UserAPI } from '@/lib/api';
import { PlanAPI } from '@/lib/api/plan';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Building2,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  Play,
  Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Função utilitária para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface TeamDetails {
  team: any;
  owner: any;
  plan: any;
  totalCustomers: number;
  activeSubscriptions: number;
  totalProducts: number;
  monthlyRevenue: number;
}

export default function AdminSubscriptions() {
  const [teams, setTeams] = useState<any[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [plans, setPlans] = useState<{ [key: string]: any }>({});
  const [users, setUsers] = useState<{ [key: string]: any }>({});
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planStats, setPlanStats] = useState({
    total: 0,
    active: 0,
    trial: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

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
        TeamAPI.list('created_date', 500),
        PlanAPI.list('created_date', 100),
        UserAPI.list('created_date', 1000),
      ]);

      const plansMap = allPlans.reduce((acc: any, plan: any) => {
        acc[plan.id] = plan;
        return acc;
      }, {});

      const usersMap = allUsers.reduce((acc: any, user: any) => {
        acc[user.id] = user;
        return acc;
      }, {});

      setTeams(allTeams);
      setPlans(plansMap);
      setUsers(usersMap);

      // Calcular estatísticas
      calculatePlanStats(allTeams, plansMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Não foi possível carregar os dados das assinaturas.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePlanStats = (teams: any[], plansMap: any) => {
    const active = teams.filter((t: any) => t.subscription_status === 'active');
    const trial = teams.filter((t: any) => t.subscription_status === 'trial');
    const cancelled = teams.filter((t: any) => t.subscription_status === 'cancelled');
    const totalRevenue = active.reduce((sum: number, t: any) => {
      const plan = plansMap[t.plan_id];
      return sum + (plan?.price || 0);
    }, 0);

    setPlanStats({
      total: teams.length,
      active: active.length,
      trial: trial.length,
      cancelled: cancelled.length,
      totalRevenue: totalRevenue,
    });
  };

  const applyFilters = () => {
    let filtered = teams.filter((t: any) => {
      const owner = users[t.owner_id];

      const matchesSearch =
        (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (owner?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || t.subscription_status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredTeams(filtered);
  };

  const handleViewDetails = async (team: any) => {
    setSelectedTeam(team);
    setIsLoading(true);
    setShowDetailsModal(true);

    try {
      // Simular busca de dados do proprietário
      const owner = users[team.owner_id] || null;

      const [subscriptions, productsData] = await Promise.all([
        SubscriptionAPI.filter({ team_id: team.id }),
        ProductAPI.list('created_date', 100).then((products: any[]) =>
          products.filter((p: any) => p.team_id === team.id)
        ),
      ]);

      const monthlyRevenue =
        subscriptions
          .filter((s: any) => s.status === 'active')
          .reduce((sum: number, s: any) => sum + (s.weekly_price || 0), 0) * 4.33;

      setTeamDetails({
        team,
        owner,
        plan: plans[team.plan_id] || null,
        totalCustomers: new Set(subscriptions.map((s: any) => s.customer_id)).size,
        activeSubscriptions: subscriptions.filter((s: any) => s.status === 'active').length,
        totalProducts: productsData.length,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      alert('Não foi possível carregar os detalhes da empresa.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      active: { text: 'Ativa', className: 'bg-green-500 hover:bg-green-600' },
      trial: { text: 'Trial', className: 'bg-blue-500 hover:bg-blue-600' },
      cancelled: { text: 'Cancelada', className: 'bg-red-500 hover:bg-red-600' },
      cancellation_pending: {
        text: 'Cancelamento Agendado',
        className: 'bg-yellow-500 hover:bg-yellow-600',
      },
    };
    const config = statusMap[status] || {
      text: status,
      className: 'bg-gray-500 hover:bg-gray-600',
    };
    return <Badge className={config.className}>{config.text}</Badge>;
  };

  if (isLoading && teams.length === 0) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-slate-200"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-200"></div>
            ))}
          </div>
          <div className="h-64 rounded-xl bg-slate-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-6 md:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Assinaturas da Plataforma</h1>
        <p className="text-slate-600">
          Gerencie os planos e assinaturas das empresas que utilizam a plataforma.
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Receita Mensal (MRR)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(planStats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Assinaturas Ativas</CardTitle>
            <Play className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planStats.active}</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Empresas em Trial</CardTitle>
            <Clock className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planStats.trial}</div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planStats.total}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5" />
            Todas as Assinaturas de Empresas ({filteredTeams.length})
          </CardTitle>

          {/* Filtros */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar por empresa ou proprietário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 rounded-md border px-3 py-2 text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="trial">Trial</option>
              <option value="cancellation_pending">Cancel. Agendado</option>
              <option value="cancelled">Canceladas</option>
            </select>
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
                  filteredTeams.map((team: any) => {
                    const owner = users[team.owner_id];
                    const plan = plans[team.plan_id];

                    return (
                      <TableRow key={team.id}>
                        <TableCell>
                          <div className="font-medium">{team.name || 'Empresa não encontrada'}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {owner?.full_name || 'Proprietário não encontrado'}
                            </div>
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
                          {team.created_date
                            ? format(new Date(team.created_date), 'dd/MM/yyyy', { locale: ptBR })
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(team)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell className="py-12 text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
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
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa</DialogTitle>
            <p className="text-slate-600">
              Informações completas sobre a empresa e sua assinatura na plataforma.
            </p>
          </DialogHeader>

          {isLoading && !teamDetails ? (
            <p>Carregando detalhes...</p>
          ) : (
            teamDetails && (
              <div className="space-y-6 py-4">
                {/* Informações da Empresa e Proprietário */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Building2 className="h-5 w-5" />
                        {teamDetails.team.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <strong>Proprietário:</strong> {teamDetails.owner?.full_name || 'N/A'}
                      </div>
                      <div>
                        <strong>Email:</strong> {teamDetails.owner?.email || 'N/A'}
                      </div>
                      <div>
                        <strong>Desde:</strong>{' '}
                        {format(new Date(teamDetails.team.created_date), 'dd/MM/yyyy')}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="h-5 w-5" />
                        Plano Atual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <strong>Plano:</strong> {teamDetails.plan?.name || 'Nenhum'}
                      </div>
                      <div>
                        <strong>Status:</strong>{' '}
                        {getStatusBadge(teamDetails.team.subscription_status)}
                      </div>
                      <div>
                        <strong>Valor Mensal:</strong>{' '}
                        {formatCurrency(teamDetails.plan?.price || 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Métricas de Uso */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Métricas de Uso da Plataforma</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
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
                      <p className="text-2xl font-bold">
                        {formatCurrency(teamDetails.monthlyRevenue)}
                      </p>
                      <p className="text-sm text-gray-500">Receita /mês</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
