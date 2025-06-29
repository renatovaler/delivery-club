'use client';

import { useState, useEffect } from 'react';
import { UserAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Select, SelectItem } from '../../components/ui/Select';
import { Users, Search, Filter, Eye } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    user_type: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await UserAPI.list('-created_date', 500);
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users.filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = filters.user_type === 'all' || user.user_type === filters.user_type;

      return matchesSearch && matchesType;
    });

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getUserTypeBadge = (type) => {
    const types = {
      'customer': 'bg-green-500 hover:bg-green-600',
      'business_owner': 'bg-blue-500 hover:bg-blue-600',
      'admin': 'bg-purple-500 hover:bg-purple-600',
    };
    const labels = {
      'customer': 'Cliente',
      'business_owner': 'Proprietário',
      'admin': 'Administrador',
    };
    return <Badge className={types[type] || 'bg-gray-400'}>{labels[type] || type}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Usuários</h1>
        <p className="text-slate-600">Gerencie os usuários da plataforma.</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Usuário</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome ou Email"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Usuário</label>
              <Select value={filters.user_type} onValueChange={(value) => handleFilterChange('user_type', value)}>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="business_owner">Proprietário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="w-5 h-5" />
            Usuários ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-slate-600">
                Tente ajustar os filtros para ver mais resultados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-medium text-slate-900">{user.full_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        {getUserTypeBadge(user.user_type)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`Visualizar ${user.full_name}`)}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
}</assistant
