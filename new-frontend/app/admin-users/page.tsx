'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { TeamAPI, UserAPI } from '@/lib/api';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Função utilitária para tradução de tipos de usuário
const translate = (category: string, key: string): string => {
  const translations: { [key: string]: { [key: string]: string } } = {
    userTypes: {
      system_admin: 'Administrador',
      business_owner: 'Empresário',
      customer: 'Cliente',
    },
  };
  return translations[category]?.[key] || key;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(20);

  // Estado para filtro por tipo de usuário
  const [userTypeFilter, setUserTypeFilter] = useState('all');

  // Função para carregar usuários com filtros e paginação
  const loadUsers = async () => {
    setIsLoading(true);
    try {
      // Sempre carrega todos os usuários para aplicar filtros e calcular estatísticas
      const fetchedUsers = await UserAPI.list('created_date', 10000);
      setAllUsers(fetchedUsers);

      let currentFilteredUsers = fetchedUsers;

      // Aplicar filtro de busca
      if (searchTerm) {
        currentFilteredUsers = currentFilteredUsers.filter(
          (user: any) =>
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Aplicar filtro por tipo de usuário
      if (userTypeFilter !== 'all') {
        currentFilteredUsers = currentFilteredUsers.filter(
          (user: any) => user.user_type === userTypeFilter
        );
      }

      setTotalUsers(currentFilteredUsers.length);

      // Aplicar paginação
      const startIndex = (currentPage - 1) * usersPerPage;
      const paginatedUsers = currentFilteredUsers.slice(startIndex, startIndex + usersPerPage);

      setUsers(paginatedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para carregar equipes uma única vez na montagem do componente
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const allTeams = await TeamAPI.list('created_date', 500);
        setTeams(allTeams);
      } catch (error) {
        console.error('Erro ao carregar equipes:', error);
      }
    };
    fetchTeams();
  }, []);

  // Efeito para recarregar usuários quando a página, o termo de busca ou o filtro de tipo mudar
  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, userTypeFilter]);

  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const types: { [key: string]: { color: string; text: string } } = {
      system_admin: { color: 'bg-red-500', text: translate('userTypes', userType) },
      business_owner: { color: 'bg-amber-500', text: translate('userTypes', userType) },
      customer: { color: 'bg-blue-500', text: translate('userTypes', userType) },
    };
    const config = types[userType] || types.customer;
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getTeamStatus = (user: any) => {
    if (user.user_type === 'customer' || user.user_type === 'system_admin') {
      return <span className="text-gray-500">N/A</span>;
    }
    if (user.current_team_id) {
      const team = teams.find((t: any) => t.id === user.current_team_id);
      return team ? (
        <span className="font-medium text-green-600">{team.name}</span>
      ) : (
        <span className="text-red-600">Equipe não encontrada</span>
      );
    }
    return <span className="text-amber-600">Sem equipe</span>;
  };

  if (isLoading && allUsers.length === 0) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-slate-200"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Usuários da Plataforma</h1>
        <p className="text-slate-600">Gerencie todos os usuários cadastrados no sistema</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
            <p className="mt-1 text-xs text-blue-200">
              {
                allUsers.filter(
                  (u: any) =>
                    new Date(u.created_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
              }{' '}
              novos últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Empresários</CardTitle>
            <Building2 className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter((u: any) => u.user_type === 'business_owner').length}
            </div>
            <p className="mt-1 text-xs text-green-200">Proprietários de empresa</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Clientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.filter((u: any) => u.user_type === 'customer').length}
            </div>
            <p className="mt-1 text-xs text-purple-200">Usuários consumidores</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Users className="h-5 w-5" />
              Todos os Usuários ({totalUsers})
            </CardTitle>
            {/* Informações de paginação */}
            {totalUsers > 0 && totalPages > 0 && (
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} • Mostrando{' '}
                {(currentPage - 1) * usersPerPage + 1}-
                {Math.min(currentPage * usersPerPage, totalUsers)} de {totalUsers}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Filtro por tipo temporariamente removido até implementação do Select */}
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
                      <TableCell>
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                        <div className="mt-1 h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-full animate-pulse rounded bg-gray-200"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
                  users.map((user: any) => (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.full_name || 'Nome não informado'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                      <TableCell>{getTeamStatus(user)}</TableCell>
                      <TableCell>
                        {new Date(user.created_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin-user-details?id=${user.id}`}>
                          <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Gerenciar
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
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

                  pageNum = Math.max(1, Math.min(pageNum, totalPages));

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        currentPage === pageNum ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                      }
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
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
