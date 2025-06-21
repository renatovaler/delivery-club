
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { TeamSubscriptionHistory } from "@/api/entities";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/components/lib";
import {
  FileText,
  Download,
  Search,
  Calendar,
  CreditCard,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PlatformInvoices() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    currentMonthCost: 0,
    averageMonthlySpent: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, yearFilter, invoices]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.user_type !== 'business_owner') {
        toast({
          title: "Acesso negado",
          description: "Apenas proprietários de empresas podem acessar esta página.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (userData.current_team_id) {
        const teamData = await Team.get(userData.current_team_id);
        if (teamData.owner_id !== userData.id) {
          toast({
            title: "Acesso negado",
            description: "Você não é o proprietário desta empresa.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        setTeam(teamData);

        // CORREÇÃO: Carregar histórico de assinaturas/faturas da empresa
        const subscriptionHistory = await TeamSubscriptionHistory.filter(
          { team_id: teamData.id },
          '-invoice_date'
        );

        // CORREÇÃO: Considerar todos os registros que têm informação de fatura
        const invoiceRecords = subscriptionHistory.filter(record => 
          record.invoice_date && record.invoice_amount !== null && record.invoice_amount !== undefined
        );

        setInvoices(invoiceRecords);
        calculateSummary(invoiceRecords);

      } else {
        toast({
          title: "Nenhuma empresa encontrada",
          description: "Você precisa estar associado a uma empresa.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as faturas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = (invoiceData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const totalPaid = invoiceData
      .filter(inv => inv.payment_status === 'paid')
      .reduce((sum, inv) => sum + (inv.invoice_amount || 0), 0);

    const totalPending = invoiceData
      .filter(inv => inv.payment_status === 'pending')
      .reduce((sum, inv) => sum + (inv.invoice_amount || 0), 0);

    const currentMonthInvoices = invoiceData.filter(inv => {
      if (!inv.invoice_date) return false;
      const invoiceDate = parseISO(inv.invoice_date);
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
    });

    const currentMonthCost = currentMonthInvoices.reduce((sum, inv) => sum + (inv.invoice_amount || 0), 0);

    const paidInvoices = invoiceData.filter(inv => inv.payment_status === 'paid');
    const averageMonthlySpent = paidInvoices.length > 0 ? totalPaid / paidInvoices.length : 0;

    setSummary({
      totalPaid,
      totalPending,
      currentMonthCost,
      averageMonthlySpent
    });
  };

  const applyFilters = () => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = 
        (invoice.plan_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.stripe_invoice_id || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || invoice.payment_status === statusFilter;
      
      let matchesYear = true;
      if (yearFilter !== "all" && invoice.invoice_date) {
        const invoiceYear = parseISO(invoice.invoice_date).getFullYear();
        matchesYear = invoiceYear.toString() === yearFilter;
      }
      
      return matchesSearch && matchesStatus && matchesYear;
    });
    
    setFilteredInvoices(filtered);
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { text: "Pago", className: "bg-green-500 hover:bg-green-600", icon: CheckCircle },
      pending: { text: "Pendente", className: "bg-yellow-500 hover:bg-yellow-600", icon: Clock },
      failed: { text: "Falhou", className: "bg-red-500 hover:bg-red-600", icon: XCircle },
      cancelled: { text: "Cancelado", className: "bg-gray-500 hover:bg-gray-600", icon: XCircle },
    };
    const config = statusMap[status] || { text: status, className: "bg-gray-500 hover:bg-gray-600", icon: AlertCircle };
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDateSafe = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Data inválida';
    } catch {
      return 'Data inválida';
    }
  };

  const exportInvoices = () => {
    const csvData = [
      ['Data da Fatura', 'Plano', 'Valor', 'Status', 'Data de Pagamento', 'Período de Cobrança'],
      ...filteredInvoices.map(inv => [
        formatDateSafe(inv.invoice_date),
        inv.plan_name,
        inv.invoice_amount?.toFixed(2).replace('.', ',') || '0,00',
        inv.payment_status,
        formatDateSafe(inv.payment_date),
        `${formatDateSafe(inv.billing_period_start)} - ${formatDateSafe(inv.billing_period_end)}`
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `faturas_plataforma_${team?.name?.replace(/\s+/g, '_') || 'empresa'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Obter anos únicos para o filtro
  const availableYears = [...new Set(
    invoices
      .filter(inv => inv.invoice_date)
      .map(inv => parseISO(inv.invoice_date).getFullYear())
  )].sort((a, b) => b - a);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-amber-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-amber-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user || user.user_type !== 'business_owner' || (team && team.owner_id !== user.id)) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
        <p className="text-gray-600">Você não tem permissão para visualizar esta página.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Faturas da Assinatura da Plataforma</h1>
        <p className="text-amber-600">
          Histórico completo de pagamentos da assinatura do Delivery Club para {team?.name}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">Histórico completo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.totalPending)}</div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mês Atual</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.currentMonthCost)}</div>
            <p className="text-xs text-muted-foreground">{format(new Date(), 'MMMM yyyy', { locale: ptBR })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.averageMonthlySpent)}</div>
            <p className="text-xs text-muted-foreground">Gasto médio por mês</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <FileText className="w-5 h-5" />
            Histórico de Faturas ({filteredInvoices.length})
          </CardTitle>
          
          {/* Filtros */}
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por plano ou ID da fatura..."
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
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="failed">Falharam</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportInvoices} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-amber-50">
                  <TableHead>Data da Fatura</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Período de Cobrança</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Pagamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-amber-25">
                      <TableCell className="font-medium">
                        {formatDateSafe(invoice.invoice_date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoice.plan_name}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateSafe(invoice.billing_period_start)} - {formatDateSafe(invoice.billing_period_end)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(invoice.invoice_amount || 0)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.payment_status)}</TableCell>
                      <TableCell>
                        {invoice.payment_date ? formatDateSafe(invoice.payment_date) : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(invoice)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Nenhuma fatura encontrada.</p>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Fatura</DialogTitle>
            <DialogDescription>
              Informações completas sobre a fatura da assinatura da plataforma.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Plano</label>
                  <p className="font-semibold">{selectedInvoice.plan_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Valor</label>
                  <p className="font-semibold text-xl">{formatCurrency(selectedInvoice.invoice_amount || 0)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.payment_status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data da Fatura</label>
                  <p>{formatDateSafe(selectedInvoice.invoice_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Pagamento</label>
                  <p>{selectedInvoice.payment_date ? formatDateSafe(selectedInvoice.payment_date) : 'Não pago'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Período de Cobrança</label>
                  <p>{formatDateSafe(selectedInvoice.billing_period_start)} - {formatDateSafe(selectedInvoice.billing_period_end)}</p>
                </div>
              </div>

              {selectedInvoice.stripe_invoice_id && (
                <div>
                  <label className="text-sm font-medium text-gray-600">ID da Fatura (Stripe)</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedInvoice.stripe_invoice_id}</p>
                </div>
              )}

              {selectedInvoice.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Observações</label>
                  <p className="text-sm bg-amber-50 p-3 rounded border border-amber-200">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
