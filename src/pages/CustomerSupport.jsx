import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SupportTicket } from "@/api/entities";
import { TicketMessage } from "@/api/entities";
import { Team } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Star,
  Upload
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UploadFile } from "@/api/integrations";

export default function CustomerSupport() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [teams, setTeams] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newTicketData, setNewTicketData] = useState({
    team_id: "",
    subscription_id: "",
    type: "",
    priority: "medium",
    subject: "",
    description: ""
  });

  const { toast } = useToast();

  const TICKET_TYPES = [
    { value: "support", label: "Suporte Geral" },
    { value: "delivery_issue", label: "Problema com Entrega" },
    { value: "product_issue", label: "Problema com Produto" },
    { value: "billing_issue", label: "Problema de Cobrança" },
    { value: "complaint", label: "Reclamação" },
    { value: "suggestion", label: "Sugestão" }
  ];

  const PRIORITY_OPTIONS = [
    { value: "low", label: "Baixa", color: "bg-gray-500" },
    { value: "medium", label: "Média", color: "bg-blue-500" },
    { value: "high", label: "Alta", color: "bg-orange-500" },
    { value: "urgent", label: "Urgente", color: "bg-red-500" }
  ];

  const STATUS_OPTIONS = [
    { value: "open", label: "Aberto", color: "bg-green-500" },
    { value: "in_progress", label: "Em Andamento", color: "bg-blue-500" },
    { value: "waiting_customer", label: "Aguardando Cliente", color: "bg-yellow-500" },
    { value: "waiting_business", label: "Aguardando Empresa", color: "bg-orange-500" },
    { value: "resolved", label: "Resolvido", color: "bg-emerald-500" },
    { value: "closed", label: "Fechado", color: "bg-gray-500" }
  ];

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // Carregar tickets do usuário
      const userTickets = await SupportTicket.filter(
        { customer_id: userData.id },
        '-created_date'
      );
      setTickets(userTickets);

      // Carregar assinaturas para seleção
      const userSubscriptions = await Subscription.filter(
        { customer_id: userData.id },
        '-created_date'
      );
      setSubscriptions(userSubscriptions);

      // Carregar empresas relacionadas
      const teamIds = [...new Set([
        ...userTickets.map(t => t.team_id).filter(Boolean),
        ...userSubscriptions.map(s => s.team_id)
      ])];
      
      const teamsData = await Promise.all(
        teamIds.map(id => Team.get(id).catch(() => null))
      );
      const teamsMap = teamsData.reduce((acc, team) => {
        if (team) acc[team.id] = team;
        return acc;
      }, {});
      setTeams(teamsMap);

    } catch (error) {
      console.error("Erro ao carregar dados de suporte:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketData.subject.trim() || !newTicketData.description.trim()) {
      toast({ title: "Campos obrigatórios", description: "Preencha assunto e descrição.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const ticketData = {
        ...newTicketData,
        customer_id: user.id,
        team_id: newTicketData.team_id || null,
        subscription_id: newTicketData.subscription_id || null
      };

      const newTicket = await SupportTicket.create(ticketData);
      
      toast({ title: "Ticket criado! ✅", description: "Sua solicitação foi registrada. Você receberá uma resposta em breve." });
      
      setIsNewTicketModalOpen(false);
      setNewTicketData({
        team_id: "",
        subscription_id: "",
        type: "",
        priority: "medium",
        subject: "",
        description: ""
      });
      
      await loadSupportData();
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      toast({ title: "Erro ao criar ticket", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const messages = await TicketMessage.filter(
        { ticket_id: ticket.id },
        'created_date'
      );
      setTicketMessages(messages);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await TicketMessage.create({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        sender_type: "customer",
        message: newMessage.trim()
      });

      // Atualizar status do ticket se necessário
      if (selectedTicket.status === 'waiting_customer') {
        await SupportTicket.update(selectedTicket.id, { status: 'waiting_business' });
      }

      setNewMessage("");
      await handleSelectTicket(selectedTicket);
      await loadSupportData();
      
      toast({ title: "Mensagem enviada! ✅" });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={`${statusInfo?.color || 'bg-gray-500'} text-white`}>
        {statusInfo?.label || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityInfo = PRIORITY_OPTIONS.find(p => p.value === priority);
    return (
      <Badge variant="outline" className={`border-current`}>
        {priorityInfo?.label || priority}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="h-64 bg-amber-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Central de Suporte</h1>
          <p className="text-amber-600">Entre em contato com as empresas ou solicite ajuda.</p>
        </div>
        
        <Dialog open={isNewTicketModalOpen} onOpenChange={setIsNewTicketModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Chamado
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Chamado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Empresa (Opcional)</Label>
                  <Select value={newTicketData.team_id} onValueChange={(value) => setNewTicketData(prev => ({ ...prev, team_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nenhuma empresa específica</SelectItem>
                      {Object.values(teams).map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assinatura (Opcional)</Label>
                  <Select 
                    value={newTicketData.subscription_id} 
                    onValueChange={(value) => setNewTicketData(prev => ({ ...prev, subscription_id: value }))}
                    disabled={!newTicketData.team_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma assinatura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nenhuma assinatura específica</SelectItem>
                      {subscriptions
                        .filter(sub => !newTicketData.team_id || sub.team_id === newTicketData.team_id)
                        .map(sub => (
                          <SelectItem key={sub.id} value={sub.id}>
                            Assinatura #{sub.id.slice(-6)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo do Chamado *</Label>
                  <Select value={newTicketData.type} onValueChange={(value) => setNewTicketData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select value={newTicketData.priority} onValueChange={(value) => setNewTicketData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>{priority.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assunto *</Label>
                <Input
                  value={newTicketData.subject}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Descreva brevemente o problema"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição *</Label>
                <Textarea
                  value={newTicketData.description}
                  onChange={(e) => setNewTicketData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva detalhadamente o problema ou solicitação"
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewTicketModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTicket} disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar Chamado"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista de Tickets */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Meus Chamados ({tickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectTicket(ticket)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm truncate">{ticket.subject}</h4>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{teams[ticket.team_id]?.name || 'Suporte Geral'}</span>
                        <span>{formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true, locale: ptBR })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum chamado aberto</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Ticket */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                      <Badge variant="outline">
                        {TICKET_TYPES.find(t => t.value === selectedTicket.type)?.label || selectedTicket.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Descrição inicial */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Descrição inicial:</p>
                  <p className="text-gray-800">{selectedTicket.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Criado em {new Date(selectedTicket.created_date).toLocaleDateString('pt-BR')} às {new Date(selectedTicket.created_date).toLocaleTimeString('pt-BR')}
                  </p>
                </div>

                {/* Mensagens */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {ticketMessages.map(message => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender_type === 'customer' 
                          ? 'bg-blue-50 border-l-4 border-blue-500 ml-8' 
                          : 'bg-green-50 border-l-4 border-green-500 mr-8'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">
                          {message.sender_type === 'customer' ? 'Você' : 'Empresa'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.created_date), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-gray-800">{message.message}</p>
                    </div>
                  ))}
                </div>

                {/* Nova mensagem */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        rows={3}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isSubmitting || !newMessage.trim()}
                        className="bg-amber-600 hover:bg-amber-700 h-fit"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Selecione um chamado
                  </h3>
                  <p className="text-gray-500">
                    Escolha um chamado da lista para ver os detalhes e conversar
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}