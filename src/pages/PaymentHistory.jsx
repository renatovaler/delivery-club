
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Invoice } from "@/api/entities";
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
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PaymentHistory() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    year: new Date().getFullYear().toString()
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);

  const loadPaymentHistory = async () => {
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
        setIsLoading(false); // Ensure loading state is reset
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
          setIsLoading(false); // Ensure loading state is reset
          return;
        }
        
        setTeam(teamData);

        // Carregar faturas da equipe
        const teamInvoices = await Invoice.filter({
          team_id: userData.current_team_id
        }, '-created_date');
        setInvoices(teamInvoices);
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de pagamentos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de pagamentos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Filtro por status
    if (filters.status !== "all") {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }

    // Filtro por ano
    if (filters.year !== "all") {
      filtered = filtered.filter(invoice => 
        new Date(invoice.due_date).getFullYear().toString() === filters.year
      );
    }

    // Filtro por busca
    if (filters.search) {
      filtered = filtered.filter(invoice => 
        invoice.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        invoice.id.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: "bg-green-500 hover:bg-green-600", text: "Pago" },
      pending: { color: "bg-amber-500 hover:bg-amber-600", text: "Pendente" },
      overdue: { color: "bg-red-500 hover:bg-red-600", text: "Vencido" },
      cancelled: { color: "bg-gray-500 hover:bg-gray-600", text: "Cancelado" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  const handleDownloadInvoice = (invoice) => {
    // Simular download da fatura (implementar integração com sistema de faturas)
    toast({
      title: "Download iniciado",
      description: `Download da fatura ${invoice.id} foi iniciado.`,
    });
  };

  const exportToCSV = () => {
    const csvData = filteredInvoices.map(invoice => ({
      'ID': invoice.id.slice(-8),
      'Descrição': invoice.description || 'Assinatura de plataforma',
      'Valor': invoice.amount.toFixed(2),
      'Status': invoice.status,
      'Vencimento': invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : '',
      'Pagamento': invoice.paid_date ? format(new Date(invoice.paid_date), 'dd/MM/yyyy') : '',
      'Criação': format(new Date(invoice.created_date), 'dd/MM/yyyy')
    }));

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_pagamentos_${team?.name || 'padaria'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTotalPaid = () => {
    return filteredInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  };

  const getPendingAmount = () => {
    return filteredInvoices
      .filter(invoice => invoice.status === 'pending')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  };

  const getAvailableYears = () => {
    const years = [...new Set(invoices.map(invoice => 
      new Date(invoice.due_date).getFullYear()
    ))].sort((a, b) => b - a);
    return years;
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
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("TeamManagement")}>
          <Button variant="outline" size="icon" className="border-amber-300 text-amber-700 hover:bg-amber-50">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Histórico de Pagamentos</h1>
          <p className="text-amber-600">Acompanhe todas as faturas e pagamentos da sua assinatura</p>
          {team && (
            <p className="text-sm text-amber-500 mt-1">{team.name}</p>
          )}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Total Pago
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {getTotalPaid().toFixed(2)}</div>
            <p className="text-xs text-green-200 mt-1">
              {invoices.filter(i => i.status === 'paid').length} faturas pagas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">
              Pendente
            </CardTitle>
            <Calendar className="h-4 w-4 text-amber-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {getPendingAmount().toFixed(2)}</div>
            <p className="text-xs text-amber-200 mt-1">
              {invoices.filter(i => i.status === 'pending').length} faturas pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total de Faturas
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
            <p className="text-xs text-blue-200 mt-1">
              Histórico completo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ID ou descrição da fatura"
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
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {getAvailableYears().map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ações</label>
              <Button 
                onClick={exportToCSV}
                variant="outline" 
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                disabled={filteredInvoices.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de faturas */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <FileText className="w-5 h-5" />
            Histórico de Faturas ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Nenhuma fatura encontrada
              </h3>
              <p className="text-amber-600">
                {invoices.length === 0 
                  ? "Você ainda não possui faturas geradas"
                  : "Tente ajustar os filtros para ver mais resultados"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50">
                    <TableHead>Fatura</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-amber-25">
                      <TableCell className="font-medium">
                        #{invoice.id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        {invoice.description || 'Assinatura da plataforma'}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        R$ {invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.due_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {invoice.paid_date 
                          ? format(new Date(invoice.paid_date), "dd/MM/yyyy")
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          <Download className="w-4 h-4" />
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
