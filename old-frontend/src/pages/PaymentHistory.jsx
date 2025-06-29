
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Invoice } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  FileText,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PaymentHistory() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]); // Kept for consistency, will be identical to invoices
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

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
        
        if (teamData.owner_id !== userData.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar os dados desta empresa.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        setTeam(teamData);

        const teamInvoices = await Invoice.filter({
          team_id: userData.current_team_id
        }, '-created_date');
        setInvoices(teamInvoices);
        setFilteredInvoices(teamInvoices); // Since filters are removed, filteredInvoices is simply all invoices
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Histórico de Pagamentos</h1>
        <p className="text-slate-600">Consulte o histórico de suas faturas e pagamentos da plataforma.</p>
        {team && (
          <p className="text-sm text-slate-500 mt-1">{team.name}</p>
        )}
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5" />
            Suas Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Data da Fatura</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-slate-50">
                      <TableCell>{format(new Date(invoice.created_date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {invoice.description || 'Assinatura da plataforma'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R$ {invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => handleDownloadInvoice(invoice)}
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
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>Nenhum histórico de pagamento encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
