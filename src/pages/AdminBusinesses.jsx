
import React, { useState, useEffect } from "react";
import { Team } from "@/api/entities";
import { User } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { Product } from "@/api/entities";
import { Plan } from "@/api/entities";
import { TeamChangeHistory } from "@/api/entities"; // New import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
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
  Building2,
  Search,
  Eye,
  Users,
  Package,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  Filter,
  Clock,
  History, // New icon
  FileText, // New icon
  Home, // Adicionado
  Mail // Adicionado
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/components/lib";

// New auxiliary component for rendering address/contact details
const DataDetail = ({ title, data }) => {
    if (!data) return <div className="p-3 bg-gray-50 rounded-md text-gray-500 italic">Sem dados</div>;
    return (
        <div>
            <h4 className="font-semibold mb-2 text-gray-700">{title}</h4>
            <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-md border">
                {data.street && <p><strong>Rua:</strong> {data.street}, {data.number}</p>}
                {data.neighborhood && <p><strong>Bairro:</strong> {data.neighborhood}</p>}
                {data.city && <p><strong>Cidade:</strong> {data.city} - {data.state}</p>}
                {data.zip_code && <p><strong>CEP:</strong> {data.zip_code}</p>}
                {data.email && <p><strong>Email:</strong> {data.email}</p>}
                {data.whatsapp_numbers && <p><strong>WhatsApp:</strong> {data.whatsapp_numbers.join(', ')}</p>}
            </div>
        </div>
    );
};

export default function AdminBusinesses() {
  const [teams, setTeams] = useState([]);
  const [owners, setOwners] = useState({});
  const [businessAnalytics, setBusinessAnalytics] = useState({});
  const [plans, setPlans] = useState({});
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [businessDetails, setBusinessDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [historyDetail, setHistoryDetail] = useState(null); // New state for history details modal
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, teams, owners]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allTeams = await Team.list('', 500);
      setTeams(allTeams);

      // Carregar proprietários
      const ownerIds = [...new Set(allTeams.map(t => t.owner_id))];
      const ownerData = await Promise.all(
        ownerIds.map(id => User.get(id).catch(() => null))
      );

      const ownersMap = {};
      ownerData.filter(Boolean).forEach(owner => {
        ownersMap[owner.id] = owner;
      });
      setOwners(ownersMap);

      // Carregar planos
      const allPlans = await Plan.list();
      const plansMap = {};
      allPlans.forEach(plan => {
        plansMap[plan.id] = plan;
      });
      setPlans(plansMap);

      // Carregar analytics para cada empresa
      const analyticsPromises = allTeams.map(async (team) => {
        try {
          const [subscriptions, products] = await Promise.all([
            Subscription.filter({ team_id: team.id }),
            Product.filter({ team_id: team.id })
          ]);

          const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
          const totalRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.weekly_price || 0), 0);

          return {
            teamId: team.id,
            totalSubscriptions: subscriptions.length,
            activeSubscriptions: activeSubscriptions.length,
            totalProducts: products.length,
            weeklyRevenue: totalRevenue,
            monthlyRevenue: totalRevenue * 4.33 // Aproximação mensal
          };
        } catch (error) {
          console.error(`Erro ao carregar analytics para empresa ${team.id}:`, error);
          return {
            teamId: team.id,
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            totalProducts: 0,
            weeklyRevenue: 0,
            monthlyRevenue: 0
          };
        }
      });

      const analyticsResults = await Promise.all(analyticsPromises);
      const analyticsMap = {};
      analyticsResults.forEach(result => {
        analyticsMap[result.teamId] = result;
      });
      setBusinessAnalytics(analyticsMap);

    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = teams.filter(team => {
      const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (owners[team.owner_id] && owners[team.owner_id].full_name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === "all" || team.subscription_status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredTeams(filtered);
  };

  const handleViewBusiness = async (team) => {
    setSelectedBusiness(team);
    setIsLoading(true);

    try {
      const [subscriptions, products, owner, changeHistory] = await Promise.all([
        Subscription.filter({ team_id: team.id }),
        Product.filter({ team_id: team.id }),
        User.get(team.owner_id).catch(() => null),
        TeamChangeHistory.filter({ team_id: team.id }, '-created_date') // Fetch change history, ordered by creation date desc
      ]);

      // Fetch users who made changes in the history
      const userIdsInHistory = [...new Set(changeHistory.map(h => h.changed_by))];
      const changeHistoryUsersData = await Promise.all(
          userIdsInHistory.map(id => User.get(id).catch(() => ({ id, full_name: 'Usuário Desconhecido' })))
      );
      const changeHistoryUsersMap = {};
      changeHistoryUsersData.filter(Boolean).forEach(u => {
          changeHistoryUsersMap[u.id] = u;
      });

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
      const recentSubscriptions = subscriptions
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 5);

      setBusinessDetails({
        team,
        owner,
        subscriptions,
        activeSubscriptions,
        products,
        recentSubscriptions,
        plan: plans[team.plan_id] || null,
        changeHistory, // Add change history
        changeHistoryUsers: changeHistoryUsersMap // Add map of users who made changes
      });

      setShowDetailsModal(true);
    } catch (error) {
      console.error("Erro ao carregar detalhes da empresa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      'active': 'bg-green-500 hover:bg-green-600',
      'trial': 'bg-blue-500 hover:bg-blue-600',
      'cancelled': 'bg-red-500 hover:bg-red-500',
      'cancellation_pending': 'bg-yellow-500 hover:bg-yellow-600',
      'suspended': 'bg-gray-500 hover:bg-gray-600',
      'paused': 'bg-orange-500 hover:bg-orange-600'
    };
    const labels = {
        'active': 'Ativa',
        'trial': 'Trial',
        'cancelled': 'Cancelada',
        'cancellation_pending': 'Cancelamento Pendente',
        'suspended': 'Suspensa',
        'paused': 'Pausada',
    };
    return <Badge className={statuses[status] || 'bg-gray-400'}>{labels[status] || status}</Badge>;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'padaria': '🥖',
      'restaurante': '🍽️',
      'mercado': '🛒',
      'farmacia': '💊',
      'outros': '🏪'
    };
    return icons[category] || '🏪';
  };

  if (isLoading && teams.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="h-64 bg-amber-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Gerenciamento de Empresas</h1>
          <p className="text-amber-600">Visualize e gerencie todas as empresas cadastradas na plataforma.</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-amber-900">{teams.length}</div>
          <div className="text-sm text-amber-600">empresas cadastradas</div>
        </div>
      </div>

      {/* Resumo estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teams.filter(t => t.subscription_status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trial</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {teams.filter(t => t.subscription_status === 'trial').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total Estimada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                Object.values(businessAnalytics).reduce((sum, analytics) =>
                  sum + (analytics.monthlyRevenue || 0), 0
                )
              )}
            </div>
            <p className="text-xs text-muted-foreground">Por mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Cadastrados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Object.values(businessAnalytics).reduce((sum, analytics) =>
                sum + (analytics.totalProducts || 0), 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-amber-900">
              <Building2 className="w-5 h-5" />
              Empresas ({filteredTeams.length})
            </span>
          </CardTitle>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou proprietário..."
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
                <SelectItem value="cancelled">Canceladas</SelectItem>
                <SelectItem value="suspended">Suspensas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-50">
                  <TableHead>Empresa</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assinaturas</TableHead>
                  <TableHead>Receita Mensal</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.length > 0 ? filteredTeams.map((team) => {
                  const analytics = businessAnalytics[team.id] || {};

                  return (
                    <TableRow key={team.id} className="hover:bg-amber-25">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCategoryIcon(team.category)}</span>
                          <div>
                            <div className="font-medium">{team.name}</div>
                            <div className="text-sm text-gray-500">{team.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{owners[team.owner_id]?.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{owners[team.owner_id]?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{team.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(team.subscription_status)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{analytics.activeSubscriptions || 0}</div>
                          <div className="text-xs text-gray-500">
                            de {analytics.totalSubscriptions || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(analytics.monthlyRevenue || 0)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(team.created_date), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBusiness(team)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan="8" className="text-center py-12">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">{businessDetails?.team?.category ? getCategoryIcon(businessDetails.team.category) : '🏪'}</span>
              {businessDetails?.team?.name}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos da empresa e suas métricas
            </DialogDescription>
          </DialogHeader>

          {businessDetails && (
            <div className="space-y-6">
              {/* Informações básicas, endereço e contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informações da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Nome:</strong> {businessDetails.team.name}</div>
                    <div><strong>Categoria:</strong> {businessDetails.team.category}</div>
                    <div><strong>Status:</strong> {getStatusBadge(businessDetails.team.subscription_status)}</div>
                    <div><strong>Cadastro:</strong> {format(new Date(businessDetails.team.created_date), "dd/MM/yyyy", { locale: ptBR })}</div>
                    {businessDetails.plan && (
                      <div><strong>Plano:</strong> {businessDetails.plan.name}</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Proprietário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Nome:</strong> {businessDetails.owner?.full_name || 'N/A'}</div>
                    <div><strong>Email:</strong> {businessDetails.owner?.email || 'N/A'}</div>
                    <div><strong>Telefone:</strong> {businessDetails.owner?.phone || 'Não informado'}</div>
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><Home className="w-4 h-4"/>Endereço da Sede</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        {businessDetails.team.address ? (
                            <>
                                <p>{businessDetails.team.address.street}, {businessDetails.team.address.number}</p>
                                {businessDetails.team.address.complement && <p>{businessDetails.team.address.complement}</p>}
                                <p>{businessDetails.team.address.neighborhood}</p>
                                <p>{businessDetails.team.address.city}, {businessDetails.team.address.state}</p>
                                <p>CEP: {businessDetails.team.address.zip_code}</p>
                            </>
                        ) : (
                            <p className="text-gray-500 italic">Endereço não cadastrado.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4"/>Informações de Contato</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {businessDetails.team.contact ? (
                            <>
                                <div><strong>Email:</strong> {businessDetails.team.contact.email || 'N/A'}</div>
                                <div><strong>WhatsApp:</strong>
                                    {(businessDetails.team.contact.whatsapp_numbers || []).join(', ') || 'N/A'}
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-500 italic">Contato não cadastrado.</p>
                        )}
                    </CardContent>
                </Card>

              </div>

              {/* Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">{businessDetails.products.length}</div>
                    <p className="text-xs text-muted-foreground">Produtos</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">{businessDetails.activeSubscriptions.length}</div>
                    <p className="text-xs text-muted-foreground">Assinaturas Ativas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-purple-600">{businessDetails.subscriptions.length}</div>
                    <p className="text-xs text-muted-foreground">Total Assinaturas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(businessDetails.activeSubscriptions.reduce((sum, s) => sum + (s.weekly_price || 0), 0) * 4.33)}
                    </div>
                    <p className="text-xs text-muted-foreground">Receita Mensal Est.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Assinaturas recentes */}
              {businessDetails.recentSubscriptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Assinaturas Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {businessDetails.recentSubscriptions.map(sub => (
                        <div key={sub.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">Cliente: {sub.customer_id}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(sub.created_date), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(sub.weekly_price)}</div>
                            <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                              {sub.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Alterações */}
              {businessDetails.changeHistory && businessDetails.changeHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Histórico de Alterações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto"> {/* Added to ensure table responsiveness */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Alterado por</TableHead>
                            <TableHead>Detalhes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {businessDetails.changeHistory.map(historyItem => (
                            <TableRow key={historyItem.id}>
                              <TableCell>{format(new Date(historyItem.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                              <TableCell>
                                  <Badge variant="secondary">
                                      {historyItem.change_type === 'address' ? 'Endereço' : 'Contato'}
                                  </Badge>
                              </TableCell>
                              <TableCell>{businessDetails.changeHistoryUsers[historyItem.changed_by]?.full_name || 'N/A'}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" onClick={() => setHistoryDetail(historyItem)}>
                                  <FileText className="w-4 h-4 mr-1" /> Ver
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Histórico */}
      <Dialog open={!!historyDetail} onOpenChange={() => setHistoryDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Alteração</DialogTitle>
            <DialogDescription>Comparação entre os dados antigos e novos.</DialogDescription>
          </DialogHeader>
          {historyDetail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <DataDetail title="Dados Antigos" data={historyDetail.old_data} />
              <DataDetail title="Dados Novos" data={historyDetail.new_data} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
