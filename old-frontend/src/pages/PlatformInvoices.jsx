import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { TeamSubscriptionHistory } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  TrendingUp,
  Loader2
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
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
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

        const subscriptionHistory = await TeamSubscriptionHistory.filter(
          { team_id: teamData.id },
          '-invoice_date'
        );

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
    const total = invoiceData.length;
    const paid = invoiceData.filter(i => i.payment_status === 'paid').length;
    const pending = invoiceData.filter(i => i.payment_status === 'pending').length;
    const failed = invoiceData.filter(i => i.payment_status === 'failed').length;
    
    setSummary({ total, paid, pending, overdue: failed });
  };

  const applyFilters = () => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || invoice.payment_status === statusFilter;
      const matchesYear = yearFilter === "all" || 
        (invoice.invoice_date && new Date(invoice.invoice_date).getFullYear().toString() === yearFilter);
      
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
    const csvContent = [
      ['Data da Fatura', 'Valor', 'Status', 'Data de Pagamento', 'Notas'],
      ...filteredInvoices.map(invoice => [
        formatDateSafe(invoice.invoice_date),
        invoice.invoice_amount || 0,
        invoice.payment_status,
        invoice.payment_date ? formatDateSafe(invoice.payment_date) : 'N/A',
        invoice.notes || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faturas_plataforma.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const availableYears = [...new Set(invoices
    .filter(i => i.invoice_date)
    .map(i => new Date(i.invoice_date).getFullYear())
  )].sort((a, b) => b - a);

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
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Faturas da Plataforma</h1>
        <p className="text-slate-600">Gerencie suas faturas de assinatura dos planos da plataforma.</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total de Faturas</CardTitle>
            <FileText className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.paid}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Com Problemas</CardTitle>
            <XCircle className="h-4 w-4 text-red-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.overdue}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5" />
            Suas Faturas ({filteredInvoices.length})
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por ID da fatura..."
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
                <SelectItem value="paid">Pagas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="failed">Falharam</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
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

            <Button onClick={exportInvoices} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Fatura ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-xs">{invoice.id}</TableCell>
                      <TableCell>{formatDateSafe(invoice.invoice_date)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(invoice.invoice_amount || 0)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.payment_status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(invoice)}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={invoice.payment_status !== 'pending'}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          >
                            Pagar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>Nenhuma fatura encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Fatura</DialogTitle>
            <DialogDescription>
              Informações completas sobre esta fatura da plataforma.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID da Fatura</label>
                  <p className="font-mono text-sm">{selectedInvoice.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedInvoice.payment_status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Data da Fatura</label>
                  <p>{formatDateSafe(selectedInvoice.invoice_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Valor</label>
                  <p className="font-semibold text-lg">{formatCurrency(selectedInvoice.invoice_amount || 0)}</p>
                </div>
              </div>

              {selectedInvoice.payment_date && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Data de Pagamento</label>
                  <p>{formatDateSafe(selectedInvoice.payment_date)}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Plano</label>
                  <p>{selectedInvoice.plan_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Período de Cobrança</label>
                  <p className="text-sm">
                    {selectedInvoice.billing_period_start && selectedInvoice.billing_period_end
                      ? `${formatDateSafe(selectedInvoice.billing_period_start)} - ${formatDateSafe(selectedInvoice.billing_period_end)}`
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Observações</label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}