'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { InvoiceAPI, UserAPI } from '@/lib/api';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

// Utility Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface Invoice {
  id: string;
  team_id: string;
  customer_id: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  due_date: string;
  billing_period_start?: string;
  billing_period_end?: string;
}

export default function FinancialHistory() {
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState<string | null>(null);

  // Placeholder for teams data
  const teams: { [key: string]: { name: string } } = {};

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      const userData = await UserAPI.me();
      setUser(userData);

      const userInvoices = await InvoiceAPI.filter({ customer_id: userData.id });

      const validInvoices = userInvoices.filter(
        (invoice) => invoice.amount !== null && invoice.amount !== undefined && invoice.due_date
      );

      setInvoices(validInvoices);
    } catch (error) {
      console.error('Erro ao carregar histórico financeiro:', error);
      alert('Não foi possível carregar seu histórico financeiro.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async (invoice: Invoice) => {
    setIsPaying(invoice.id);
    try {
      // Implementar integração com pagamento quando disponível
      alert('Funcionalidade de pagamento em desenvolvimento');
    } catch (error) {
      alert('Erro ao criar pagamento');
    } finally {
      setIsPaying(null);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      paid: { color: 'bg-green-500', text: 'Pago' },
      pending: { color: 'bg-yellow-500', text: 'Pendente' },
      overdue: { color: 'bg-red-500', text: 'Vencido' },
      cancelled: { color: 'bg-gray-500', text: 'Cancelado' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color + ' text-white'}>{config.text}</Badge>;
  };

  const getTotalPaid = () => {
    return invoices
      .filter((invoice) => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  };

  const getTotalPending = () => {
    return invoices
      .filter((invoice) => invoice.status === 'pending')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-slate-200"></div>
          <div className="h-64 rounded-xl bg-slate-200"></div>
        </div>
      </div>
    );
  }

  const paidTotal = getTotalPaid();
  const pendingTotal = getTotalPending();

  return (
    <div className="w-full space-y-8 p-6 md:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Histórico Financeiro</h1>
        <p className="text-slate-600">Consulte o histórico de suas faturas mensais e pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidTotal)}</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Total Pendente</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingTotal)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5" />
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
                        <div className="font-medium text-slate-900">
                          {teams[invoice.team_id]?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {invoice.billing_period_start && invoice.billing_period_end ? (
                          <span className="text-sm">
                            {format(new Date(invoice.billing_period_start), 'dd/MM')} -{' '}
                            {format(new Date(invoice.billing_period_end), 'dd/MM/yyyy')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(invoice.due_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={invoice.status !== 'pending' || isPaying === invoice.id}
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
            <div className="py-12 text-center text-slate-500">
              <FileText className="mx-auto mb-4 h-12 w-12" />
              <p>Nenhuma fatura encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
