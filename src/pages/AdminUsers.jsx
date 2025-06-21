
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
  Users,
  Search,
  Settings,
  ChevronLeft, // Adicionar ícones de paginação
  ChevronRight, // Adicionar ícones de paginação
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { formatCurrency, translate } from "@/components/lib"; // Adicionar translate

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  // const [filteredUsers, setFilteredUsers] = useState([]); // Removido, a paginação e filtro agora são gerenciados em loadUsers
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Novos estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(20); // 20 usuários por página

  // Função para carregar dados iniciais (equipes)
  const initialLoad = async () => {
    setIsLoading(true);
    try {
      const allTeams = await Team.list('', 500);
      setTeams(allTeams);
      // Após carregar equipes, chama loadUsers para carregar os usuários na primeira página
      await loadUsers();
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as equipes.",
        variant: "destructive",
      });
      setIsLoading(false); // Garante que o estado de carregamento seja desativado
    }
  };

  // Função para carregar usuários com filtros e paginação
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Carregar todos os usuários (ou um número grande o suficiente) para aplicar filtros e paginação localmente
      const allUsers = await User.list('', 10000); // Assume um limite alto para buscar todos os usuários
      
      // Aplicar filtro de busca
      let filtered = allUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Se houvesse outros filtros (e.g., por tipo de usuário), eles seriam aplicados aqui:
      // if (filters.userType && filters.userType !== "all") {
      //   filtered = filtered.filter(user => user.user_type === filters.userType);
      // }
      
      setTotalUsers(filtered.length); // Total de usuários após aplicar filtros

      // Aplicar paginação
      const startIndex = (currentPage - 1) * usersPerPage;
      const paginatedUsers = filtered.slice(startIndex, startIndex + usersPerPage);
      
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

  // Efeito para carregar dados iniciais (equipes e a primeira página de usuários)
  useEffect(() => {
    initialLoad();
  }, []);

  // Efeito para recarregar usuários quando a página ou o termo de busca mudar
  useEffect(() => {
    // Evita carregar duas vezes na montagem inicial se initialLoad já chamou loadUsers
    if (!isLoading) { 
      loadUsers();
    }
  }, [currentPage, searchTerm]);

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getUserTypeBadge = (userType) => {
    const types = {
      'system_admin': { color: "bg-red-500", text: translate('userTypes', userType) },
      'business_owner': { color: "bg-amber-500", text: translate('userTypes', userType) }, // Corrigido de 'bakery_owner' para 'business_owner'
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

  if (isLoading && users.length === 0) {
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
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Gerenciar Usuários</h1>
        <p className="text-amber-600">Visualize todos os usuários e gerencie suas equipes.</p>
      </div>

      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Users className="w-5 h-5" />
              Usuários ({totalUsers} total)
            </CardTitle>
            {/* Informações de paginação */}
            {totalUsers > 0 && totalPages > 0 && (
                <div className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages} • Mostrando {((currentPage - 1) * usersPerPage) + 1}-{Math.min(currentPage * usersPerPage, totalUsers)} de {totalUsers}
                </div>
            )}
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reinicia para a primeira página em nova busca
              }}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-50">
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && users.length === 0 ? ( // Esqueleto de carregamento para linhas da tabela
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
                    <TableRow key={user.id} className="hover:bg-amber-25">
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
                      className={currentPage === pageNum ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
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
