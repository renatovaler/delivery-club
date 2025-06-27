
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
  CreditCard,
  CheckCircle,
  AlertCircle
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
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(null);
  const { toast } = useToast();

  // Placeholder for teams data. In a real application, this would be fetched from an API.
  // Assuming 'teams' is an object mapping team_id to team details including 'name'.
  // For this implementation, we'll keep it empty, so 'N/A' will be displayed.
  const teams = {}; 

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userInvoices = await Invoice.filter({ customer_id: userData.id }, '-due_date');
      
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
  
  const handlePayNow = async (invoice) => {
    setIsPaying(invoice.id);
    try {
      const { data } = await createCheckoutSession({
        amount: invoice.amount * 100,
        description: `Pagamento da Fatura #${invoice.id.slice(-6)}`,
        success_url: window.location.origin + createPageUrl("CustomerDashboard?payment=success"),
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
      <div className="w-full p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const paidTotal = getTotalPaid();
  const pendingTotal = getTotalPending();

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Histórico Financeiro</h1>
        <p className="text-slate-600">Consulte o histórico de suas faturas mensais e pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Total Pago
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidTotal)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">
              Total Pendente
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5" />
            Suas Faturas Mensais
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Empresa</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-medium text-slate-900">{teams[invoice.team_id]?.name || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        {invoice.billing_period_start && invoice.billing_period_end ? (
                          <span className="text-sm">
                            {format(new Date(invoice.billing_period_start), "dd/MM")} - {format(new Date(invoice.billing_period_end), "dd/MM/yyyy")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(invoice.due_date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={invoice.status !== "pending" || isPaying === invoice.id}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => handlePayNow(invoice)}
                        >
                          {isPaying === invoice.id ? 'Processando...' : 'Pagar'}
                        </Button>
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
    </div>
  );
}
