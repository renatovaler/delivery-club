
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { TeamMember } from "@/api/entities";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2, // Adicionado
  ShoppingCart, // Adicionado
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { formatCurrency, translate } from "@/components/lib";

export default function AdminUsers() {
  const [users, setUsers] = useState([]); // Users for the current page
  const [allUsers, setAllUsers] = useState([]); // All users for statistics and full filtering
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0); // Total users after search/type filters, before pagination
  const [usersPerPage] = useState(20);

  // Novo estado para filtro por tipo de usuário
  const [userTypeFilter, setUserTypeFilter] = useState("all");

  // Função para carregar usuários com filtros e paginação
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Sempre carrega todos os usuários para aplicar filtros e calcular estatísticas
      const fetchedUsers = await User.list('', 10000);
      setAllUsers(fetchedUsers); // Salva todos os usuários para os cartões de estatísticas

      let currentFilteredUsers = fetchedUsers;

      // Aplicar filtro de busca
      if (searchTerm) {
        currentFilteredUsers = currentFilteredUsers.filter(user =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Aplicar filtro por tipo de usuário
      if (userTypeFilter !== "all") {
        currentFilteredUsers = currentFilteredUsers.filter(user => user.user_type === userTypeFilter);
      }

      setTotalUsers(currentFilteredUsers.length); // Total de usuários após aplicar todos os filtros

      // Aplicar paginação
      const startIndex = (currentPage - 1) * usersPerPage;
      const paginatedUsers = currentFilteredUsers.slice(startIndex, startIndex + usersPerPage);
      
      setUsers(paginatedUsers); // Define os usuários da página atual
      
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast({
        title: "Erro ao carregar usuários ❌",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para carregar equipes uma única vez na montagem do componente
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const allTeams = await Team.list('', 500);
        setTeams(allTeams);
      } catch (error) {
        console.error("Erro ao carregar equipes:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as equipes.",
          variant: "destructive",
        });
      }
    };
    fetchTeams();
  }, []);

  // Efeito para recarregar usuários quando a página, o termo de busca ou o filtro de tipo mudar
  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, userTypeFilter]);

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getUserTypeBadge = (userType) => {
    const types = {
      'system_admin': { color: "bg-red-500", text: translate('userTypes', userType) },
      'business_owner': { color: "bg-amber-500", text: translate('userTypes', userType) },
      'customer': { color: "bg-blue-500", text: translate('userTypes', userType) }
    };
    const config = types[userType] || types.customer; // Fallback to customer if type is not found
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getTeamStatus = (user) => {
    if (user.user_type === 'customer' || user.user_type === 'system_admin') {
      return <span className="text-gray-500">N/A</span>;
    }
    if (user.current_team_id) {
      const team = teams.find(t => t.id === user.current_team_id);
      return team ? (
        <span className="text-green-600 font-medium">{team.name}</span>
      ) : (
        <span className="text-red-600">Equipe não encontrada</span>
      );
    }
    return <span className="text-amber-600">Sem equipe</span>;
  };

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Usuários da Plataforma</h1>
        <p className="text-slate-600">Gerencie todos os usuários cadastrados no sistema</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total de Usuários
            </CardTitle>
            <Users className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="text-xs text-blue-200 mt-1">
              {allUsers.filter(u => new Date(u.created_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} novos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Empresários
            </CardTitle>
            <Building2 className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter(u => u.user_type === 'business_owner').length}
            </div>
            <p className="text-xs text-green-200 mt-1">
              Proprietários de empresa
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Clientes
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter(u => u.user_type === 'customer').length}
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Usuários consumidores
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Users className="w-5 h-5" />
              Todos os Usuários ({totalUsers})
            </CardTitle>
            {/* Informações de paginação */}
            {totalUsers > 0 && totalPages > 0 && (
                <div className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages} • Mostrando {((currentPage - 1) * usersPerPage) + 1}-{Math.min(currentPage * usersPerPage, totalUsers)} de {totalUsers}
                </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reinicia para a primeira página em nova busca
                }}
                className="pl-10"
              />
            </div>
            
            <Select value={userTypeFilter} onValueChange={(value) => { setUserTypeFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="customer">Clientes</SelectItem>
                <SelectItem value="business_owner">Empresários</SelectItem>
                <SelectItem value="system_admin">Administradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && users.length === 0 ? (
                    Array.from({ length: usersPerPage }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div><div className="h-3 bg-gray-200 rounded w-3/4 mt-1 animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div></TableCell>
                            <TableCell><div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div></TableCell>
                        </TableRow>
                    ))
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'Nome não informado'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                      <TableCell>{getTeamStatus(user)}</TableCell>
                      <TableCell>{new Date(user.created_date).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Link to={createPageUrl(`AdminUserDetails?id=${user.id}`)}>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Gerenciar
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-2">
                {/* Páginas numeradas */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  // Garante que o número da página esteja dentro dos limites válidos
                  pageNum = Math.max(1, Math.min(pageNum, totalPages));

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
