'use client';

import { useState, useEffect } from 'react';
import { TeamAPI, UserAPI, PlanAPI } from '../../lib/api-extended';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Building2, Search, Eye, Filter } from 'lucide-react';

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [owners, setOwners] = useState({});
  const [plans, setPlans] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    plan_id: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, businesses, owners, plans]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allBusinesses = await TeamAPI.list('', 500);
      setBusinesses(allBusinesses);

      const ownerIds = [...new Set(allBusinesses.map(t => t.owner_id))];
      const ownerData = await Promise.all(
        ownerIds.map(id => UserAPI.get(id).catch(() => null))
      );

      const ownersMap = {};
      ownerData.filter(Boolean).forEach(owner => {
        ownersMap[owner.id] = owner;
      });
      setOwners(ownersMap);

      const allPlans = await PlanAPI.list();
      setPlans(allPlans);

    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = businesses.filter(business => {
      const matchesSearch = business.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (business.cnpj_cpf && business.cnpj_cpf.includes(filters.search)) ||
        (owners[business.owner_id] && owners[business.owner_id].full_name.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesStatus = filters.status === "all" || business.subscription_status === filters.status;

      const matchesPlan = filters.plan_id === "all" || business.plan_id === filters.plan_id;

      return matchesSearch && matchesStatus && matchesPlan;
    });

    setFilteredBusinesses(filtered);
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Empresas Cadastradas</h1>
        <p className="text-slate-600">Gerencie todas as empresas que utilizam a plataforma.</p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Empresa</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome ou CNPJ/CPF"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status da Assinatura</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Plano</label>
              <Select value={filters.plan_id} onValueChange={(value) => handleFilterChange('plan_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Planos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Planos</SelectItem>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Building2 className="w-5 h-5" />
            Empresas ({filteredBusinesses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Nenhuma empresa encontrada
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
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => (
                    <TableRow key={business.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-medium text-slate-900">{business.name}</div>
                        <div className="text-sm text-gray-500">{business.cnpj_cpf}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">{owners[business.owner_id]?.full_name || '...'}</div>
                        <div className="text-sm text-gray-500">{owners[business.owner_id]?.email || '...'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-300 text-blue-700">
                            {plans.find(p => p.id === business.plan_id)?.name || 'Sem plano'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(business.subscription_status)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert(`Visualizar ${business.name}`)}
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
}
