
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
  Filter // Added Filter icon
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
  const [customersData, setCustomersData] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]); // Keep subscriptions state if needed for other calculations later
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadCustomersData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customersData, searchTerm, statusFilter]);

  const loadCustomersData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      
      // VALIDAÇÃO DE PERMISSÃO CORRIGIDA
      if (userData.user_type !== 'business_owner') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        setIsLoading(false);
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
          setIsLoading(false);
          return;
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
          if (customer) { 
            const customerSubs = teamSubscriptions.filter(s => s.customer_id === customerId);
            
            // Determine customer status based on their subscriptions
            let customerOverallStatus = 'cancelled'; // Default if no active/paused
            if (customerSubs.some(s => s.status === 'active')) {
              customerOverallStatus = 'active';
            } else if (customerSubs.some(s => s.status === 'paused')) {
              customerOverallStatus = 'paused';
            }

            loadedCustomersData.push({
              ...customer,
              subscriptionCount: customerSubs.length,
              status: customerOverallStatus // Added for filtering/display
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
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'paused':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'cancelled':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-secondary';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'paused':
        return 'Pausada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  const handleViewDetails = (customerId) => {
    // Placeholder for viewing customer details, e.g., navigating to a customer detail page
    console.log("Viewing details for customer ID:", customerId);
    toast({
      title: "Funcionalidade Futura",
      description: `Detalhes do cliente ${customerId} seriam exibidos aqui.`,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Clientes</h1>
        <p className="text-slate-600">Gerencie todos os clientes com assinaturas ativas.</p>
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
              <label className="text-sm font-medium">Buscar Cliente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nome ou Email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status da Assinatura</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="w-5 h-5" />
            Lista de Clientes ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Assinaturas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">{customer.full_name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.subscriptionCount}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(customer.status)}>
                          {translateStatus(customer.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => handleViewDetails(customer.id)}
                        >
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <p>Nenhum cliente encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
