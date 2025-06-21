
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
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
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CreditCard
} from "lucide-react";
import { format, getYear, getMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/components/lib";
import { useToast } from "@/components/ui/use-toast";
import { createCheckoutSession } from "@/api/functions";
import { createPageUrl } from "@/utils";

export default function FinancialHistory() {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    month: "all"
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFinancialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, filters]);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      // CORREÇÃO: Carregar faturas do cliente mais robustamente
      const userInvoices = await Invoice.filter({ customer_id: userData.id }, '-due_date');
      
      // CORREÇÃO: Verificar se há faturas válidas
      const validInvoices = userInvoices.filter(invoice => 
        invoice.amount !== null && 
        invoice.amount !== undefined && 
        invoice.due_date
      );
      
      setInvoices(validInvoices);
    } catch (error) {
      console.error("Erro ao carregar histórico financeiro:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar seu histórico financeiro.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];
    if (filters.status !== "all") {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }
    if (filters.search) {
      filtered = filtered.filter(invoice => 
        (invoice.description || '').toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.month !== "all") {
      const [year, month] = filters.month.split('-');
      filtered = filtered.filter(invoice => 
        getYear(new Date(invoice.due_date)) === parseInt(year) &&
        getMonth(new Date(invoice.due_date)) === parseInt(month) - 1
      );
    }
    setFilteredInvoices(filtered);
  };
  
  const handlePayNow = async (invoice) => {
    setIsPaying(invoice.id);
    try {
      const { data } = await createCheckoutSession({
        amount: invoice.amount * 100,
        description: `Pagamento da Fatura #${invoice.id.slice(-6)}`,
        success_url: window.location.origin + createPageUrl(`CustomerDashboard?payment=success`),
        cancel_url: window.location.href,
        metadata: {
          type: 'invoice_payment',
          invoice_id: invoice.id,
          customer_id: user.id,
        },
      });

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Erro ao criar pagamento",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPaying(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: "bg-green-500", text: "Pago" },
      pending: { color: "bg-yellow-500", text: "Pendente" },
      overdue: { color: "bg-red-500", text: "Vencido" },
      cancelled: { color: "bg-gray-500", text: "Cancelado" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color + " text-white"}>{config.text}</Badge>;
  };

  const getTotalPaid = () => {
    return invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  };

  const getTotalPending = () => {
    return invoices
      .filter(invoice => invoice.status === 'pending')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
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
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Histórico Financeiro</h1>
        <p className="text-amber-600">Acompanhe suas faturas e pagamentos de assinaturas</p>
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
            <div className="text-2xl font-bold">{formatCurrency(getTotalPaid())}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(getTotalPending())}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Descrição da fatura"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
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
          </div>
        </CardContent>
      </Card>

      {/* Tabela de faturas */}
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <FileText className="w-5 h-5" />
            Faturas ({filteredInvoices.length})
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
                    <TableHead>Descrição</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-amber-25">
                      <TableCell className="font-medium">
                        {invoice.description || `Fatura #${invoice.id.slice(-6)}`}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.due_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        {invoice.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handlePayNow(invoice)}
                            disabled={isPaying === invoice.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {isPaying === invoice.id ? 'Processando...' : 'Pagar Agora'}
                          </Button>
                        )}
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
