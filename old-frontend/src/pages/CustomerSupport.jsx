
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SupportTicket } from "@/api/entities";
import { TicketMessage } from "@/api/entities";
import { Team } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription, // Added from outline
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription, // Added from outline
  DialogFooter, // Added from outline
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Added from outline
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  MessageCircle,
  Plus, // New import
  ArrowRight, // New import
  Send, // New import
  Building2, // New import
  AlertCircle, // New import
} from "lucide-react";

// Replaced TICKET_TYPES, PRIORITY_OPTIONS, STATUS_OPTIONS, faqItems
const ticketTypes = [
  { value: "delivery_issue", label: "Problema na Entrega" },
  { value: "product_issue", label: "Problema com Produto" },
  { value: "billing_issue", label: "Dúvida sobre Cobrança" },
  { value: "suggestion", label: "Sugestão" },
  { value: "complaint", label: "Reclamação" },
  { value: "support", label: "Suporte Geral" },
];

export default function CustomerSupport() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [teams, setTeams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New state variables for modal and selected ticket
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    team_id: "",
    type: "support",
    subject: "",
    description: "",
  });

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userTickets = await SupportTicket.filter({ customer_id: userData.id }, '-updated_date');
      setTickets(userTickets);
      
      // Carregar dados das empresas (teams) relacionadas aos tickets do usuário
      if (userTickets.length > 0) {
        const teamIds = [...new Set(userTickets.map(t => t.team_id).filter(Boolean))];
        const teamsData = await Promise.all(
          teamIds.map(id => Team.get(id).catch(() => null))
        );
        const teamsMap = teamsData
          .filter(Boolean)
          .reduce((acc, team) => {
            acc[team.id] = team;
            return acc;
          }, {});
        setTeams(teamsMap);
      }
    } catch (error) {
      console.error("Erro ao carregar dados de suporte:", error);
      toast({ title: "Erro ao carregar tickets", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const ticketMessages = await TicketMessage.filter({ ticket_id: ticket.id }, 'created_date');
      setMessages(ticketMessages);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      toast({ title: "Erro ao carregar mensagens do ticket", variant: "destructive" });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setIsSending(true);
    try {
      const messageData = {
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        sender_type: "customer",
        message: newMessage,
      };
      const createdMessage = await TicketMessage.create(messageData);
      setMessages([...messages, createdMessage]);
      setNewMessage("");
      
      // Atualiza o ticket para refletir a nova mensagem
      // Mark ticket as 'waiting_business' if customer sends a message
      await SupportTicket.update(selectedTicket.id, { status: "waiting_business" });
      setSelectedTicket(prev => ({...prev, status: "waiting_business"}));
      
      // Optionally reload all tickets to update status in the list
      await loadInitialData();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateTicket = async () => {
    // Validação
    if (!newTicket.team_id || !newTicket.subject.trim() || !newTicket.description.trim()) {
        toast({ title: "Preencha todos os campos", description: "Empresa, assunto e descrição são obrigatórios.", variant: "destructive" });
        return;
    }

    setIsCreating(true);
    try {
        const ticketData = {
            ...newTicket,
            customer_id: user.id,
            priority: "medium", // default priority
            status: "open"
        };
        const createdTicket = await SupportTicket.create(ticketData);
        setTickets([createdTicket, ...tickets]); // Add new ticket to the top of the list
        setIsNewTicketModalOpen(false); // Close the modal
        setNewTicket({ team_id: "", type: "support", subject: "", description: "" }); // Reset form
        toast({ title: "Ticket aberto com sucesso!", description: "Sua solicitação foi enviada para a empresa." });
    } catch (error) {
        console.error("Erro ao abrir ticket:", error);
        toast({ title: "Erro ao abrir ticket", variant: "destructive" });
    } finally {
        setIsCreating(false);
    }
  };
  
  // Updated getStatusBadge with new color palette
  const getStatusBadge = (status) => {
    const statusMap = {
      open: { text: "Aberto", color: "bg-blue-500 text-white" },
      in_progress: { text: "Em Progresso", color: "bg-yellow-500 text-white" },
      waiting_customer: { text: "Aguardando Você", color: "bg-orange-500 text-white" },
      waiting_business: { text: "Aguardando Empresa", color: "bg-indigo-500 text-white" },
      resolved: { text: "Resolvido", color: "bg-green-500 text-white" },
      closed: { text: "Fechado", color: "bg-gray-500 text-white" },
    };
    const { text, color } = statusMap[status] || { text: status, color: "bg-gray-400 text-white" };
    return <Badge className={color}>{text}</Badge>;
  };
  
  // Filter unique teams from existing tickets to populate the new ticket form's team selection
  const uniqueTeams = Array.from(new Set(tickets.map(t => t.team_id).filter(Boolean)))
    .map(id => teams[id])
    .filter(Boolean);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Central de Suporte</h1>
          <p className="text-slate-600">Converse com as empresas e resolva seus problemas.</p>
        </div>
        <Dialog open={isNewTicketModalOpen} onOpenChange={setIsNewTicketModalOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Abrir Novo Ticket
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Novo Ticket de Suporte</DialogTitle>
                    <DialogDescription>
                        Envie uma nova solicitação para uma das empresas que você já possui tickets.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="team">Empresa</Label>
                        <Select 
                            value={newTicket.team_id}
                            onValueChange={(value) => setNewTicket(p => ({...p, team_id: value}))}
                        >
                            <SelectTrigger id="team">
                                <SelectValue placeholder="Selecione a empresa..." />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueTeams.length > 0 ? (
                                    uniqueTeams.map(team => (
                                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-gray-500">Nenhuma empresa encontrada.</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Tipo do Chamado *</Label>
                        <Select 
                            value={newTicket.type}
                            onValueChange={(value) => setNewTicket(p => ({...p, type: value}))}
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {ticketTypes.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Assunto *</Label>
                        <Input
                            id="subject"
                            value={newTicket.subject}
                            onChange={(e) => setNewTicket(p => ({...p, subject: e.target.value}))}
                            placeholder="Descreva brevemente o problema"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição *</Label>
                        <Textarea
                            id="description"
                            value={newTicket.description}
                            onChange={(e) => setNewTicket(p => ({...p, description: e.target.value}))}
                            placeholder="Descreva detalhadamente o problema ou solicitação"
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewTicketModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateTicket} disabled={isCreating} className="bg-slate-800 hover:bg-slate-900 text-white">
                        {isCreating ? "Enviando..." : "Abrir Ticket"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista de Tickets */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 h-full">
            <CardHeader>
              <CardTitle className="text-slate-900">Seus Tickets ({tickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`p-4 rounded-lg cursor-pointer border ${
                        selectedTicket?.id === ticket.id
                          ? "bg-slate-100 border-slate-300"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-slate-800 flex-1 truncate pr-2">
                          {ticket.subject}
                        </p>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Para: {teams[ticket.team_id]?.name || 'Empresa desconhecida'}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Última atualização: {formatDistanceToNow(new Date(ticket.updated_date), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Você ainda não abriu nenhum ticket.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Ticket Selecionado */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 h-full">
            <CardHeader>
              <CardTitle className="text-slate-900">
                {selectedTicket ? selectedTicket.subject : "Detalhes da Conversa"}
              </CardTitle>
              {selectedTicket && (
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {teams[selectedTicket.team_id]?.name || 'Empresa desconhecida'}
                  <AlertCircle className="w-4 h-4 text-slate-500 ml-4" />
                  {ticketTypes.find(type => type.value === selectedTicket.type)?.label || 'Tipo desconhecido'}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col h-[60vh]">
              {selectedTicket ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-lg space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender_id === user.id ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-md p-3 rounded-xl ${
                            msg.sender_id === user.id
                              ? "bg-blue-500 text-white"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          <p>{msg.message}</p>
                        </div>
                        <span className="text-xs text-slate-500 mt-1">
                          {msg.sender_type === 'customer' ? user?.full_name?.split(' ')[0] : teams[selectedTicket.team_id]?.name}
                          {' - '}
                          {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 resize-none"
                      rows={1}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()} className="bg-slate-800 hover:bg-slate-900 text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                  <ArrowRight className="w-12 h-12 mx-auto mb-4" />
                  <p>Selecione um ticket para ver a conversa.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
