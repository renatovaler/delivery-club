
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Plan } from "@/api/entities";
import { Subscription } from "@/api/entities"; // Importar Subscription
import { TeamChangeHistory } from "@/api/entities"; // Importar a nova entidade
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Info, CreditCard, Key, Save, AlertTriangle, CheckCircle, ExternalLink, PlusCircle, Trash2 } from "lucide-react";
import { formatCurrency, BRAZILIAN_STATES, createNotification } from "@/components/lib";
import { createCheckoutSession } from "@/api/functions";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

const BUSINESS_CATEGORIES = [
  { value: 'padaria', label: 'Padaria' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'mercado', label: 'Mercado/Supermercado' },
  { value: 'farmacia', label: 'Farmácia' },
  { value: 'outros', label: 'Outros' }
];

export default function BusinessSettings() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [originalTeam, setOriginalTeam] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.current_team_id) {
        const [teamData, allPlans] = await Promise.all([
          Team.get(userData.current_team_id),
          Plan.filter({ status: "active" })
        ]);
        // Initialize contact and whatsapp_numbers if they don't exist
        const initializedTeamData = {
          ...teamData,
          contact: teamData.contact || {},
          address: teamData.address || {},
        };
        if (!initializedTeamData.contact.whatsapp_numbers || initializedTeamData.contact.whatsapp_numbers.length === 0) {
            initializedTeamData.contact.whatsapp_numbers = ['']; // Ensure at least one empty field
        }
        setTeam(initializedTeamData);
        setOriginalTeam(JSON.parse(JSON.stringify(initializedTeamData)));
        setPlans(allPlans.sort((a,b) => a.price - b.price));
      }

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('payment') === 'success') {
          toast({
              title: "Pagamento bem-sucedido! 🎉",
              description: "Sua assinatura foi ativada. Obrigado por se juntar ao Delivery Club.",
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          // Recarregar dados para garantir que o status da assinatura seja atualizado
          if (userData.current_team_id) {
            const updatedTeamData = await Team.get(userData.current_team_id);
            const initializedUpdatedTeamData = {
                ...updatedTeamData,
                contact: updatedTeamData.contact || {},
                address: updatedTeamData.address || {},
            };
            if (!initializedUpdatedTeamData.contact.whatsapp_numbers || initializedUpdatedTeamData.contact.whatsapp_numbers.length === 0) {
                initializedUpdatedTeamData.contact.whatsapp_numbers = [''];
            }
            setTeam(initializedUpdatedTeamData);
            setOriginalTeam(JSON.parse(JSON.stringify(initializedUpdatedTeamData)));
          }
      }

    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTeam(prev => ({ 
        ...prev, 
        [parent]: { 
          ...(prev[parent] || {}), // Ensure parent object exists
          [child]: value 
        } 
      }));
    } else {
      setTeam(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleWhatsappChange = (index, value) => {
    const newNumbers = [...(team.contact?.whatsapp_numbers || [])];
    newNumbers[index] = value;
    setTeam(prev => ({ 
      ...prev, 
      contact: { 
        ...(prev.contact || {}), 
        whatsapp_numbers: newNumbers 
      } 
    }));
  };

  const addWhatsappNumber = () => {
    const newNumbers = [...(team.contact?.whatsapp_numbers || []), ''];
    setTeam(prev => ({ 
      ...prev, 
      contact: { 
        ...(prev.contact || {}), 
        whatsapp_numbers: newNumbers 
      } 
    }));
  };

  const removeWhatsappNumber = (index) => {
    if (team.contact?.whatsapp_numbers?.length <= 1) {
        toast({ title: "Ação não permitida", description: "É necessário ter pelo menos um número de WhatsApp.", variant: "destructive" });
        return;
    }
    const newNumbers = team.contact.whatsapp_numbers.filter((_, i) => i !== index);
    setTeam(prev => ({ 
      ...prev, 
      contact: { 
        ...(prev.contact || {}), 
        whatsapp_numbers: newNumbers 
      } 
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Comparar dados antes de salvar
      const addressChanged = JSON.stringify(team.address) !== JSON.stringify(originalTeam.address);
      const contactChanged = JSON.stringify(team.contact) !== JSON.stringify(originalTeam.contact);

      // 1. Logar alterações no histórico e notificar clientes
      if (addressChanged) {
        await TeamChangeHistory.create({
          team_id: team.id,
          change_type: 'address',
          old_data: originalTeam.address,
          new_data: team.address,
          changed_by: user.id
        });
        await notifySubscribersOfChange('address');
      }

      if (contactChanged) {
        await TeamChangeHistory.create({
          team_id: team.id,
          change_type: 'contact',
          old_data: originalTeam.contact,
          new_data: team.contact,
          changed_by: user.id
        });
        await notifySubscribersOfChange('contact');
      }

      // 2. Salvar os novos dados da empresa
      const updateData = {
        name: team.name,
        category: team.category,
        description: team.description,
        address: team.address,
        contact: {
            ...team.contact,
            whatsapp_numbers: team.contact.whatsapp_numbers.filter(n => n?.trim())
        },
        cnpj_cpf: team.cnpj_cpf
      };
      await Team.update(team.id, updateData);
      
      toast({ title: "Informações salvas com sucesso!" });
      setOriginalTeam(JSON.parse(JSON.stringify(team))); // Atualiza o estado original
    } catch (error) {
      console.error("Erro ao salvar informações:", error);
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar as informações.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const notifySubscribersOfChange = async (changeType) => {
    try {
        const activeSubscriptions = await Subscription.filter({ team_id: team.id, status: 'active' });
        // Use a Set to ensure unique customer IDs
        const customerIds = [...new Set(activeSubscriptions.map(sub => sub.customer_id))];

        if (customerIds.length === 0) return;

        const title = changeType === 'address'
            ? `Mudança de Endereço: ${team.name}`
            : `Mudança de Contato: ${team.name}`;
        
        const message = changeType === 'address'
            ? `A empresa ${team.name} atualizou seu endereço de sede. Verifique se isso afeta suas entregas.`
            : `A empresa ${team.name} atualizou suas informações de contato.`;

        for (const customerId of customerIds) {
            await createNotification({
                userId: customerId,
                title: title,
                message: message,
                linkTo: createPageUrl('MySubscriptions'),
                icon: 'Building2' // Assuming 'Building2' is a valid icon name
            });
        }
    } catch (error) {
        console.error(`Erro ao notificar assinantes sobre mudança de ${changeType}:`, error);
    }
  };
  
  const handlePlanChange = async (planId) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (!selectedPlan) return;

    setIsProcessingPayment(true);
    try {
      console.log(`[BusinessSettings] Iniciando checkout para plano:`, selectedPlan);
      console.log(`[BusinessSettings] Team ID:`, team.id);
      
      const checkoutMetadata = {
        type: 'bakery_plan_subscription',
        team_id: team.id,
        plan_id: selectedPlan.id,
      };
      
      console.log(`[BusinessSettings] Metadata do checkout:`, checkoutMetadata);

      const { data, error } = await createCheckoutSession({
        amount: Math.round(selectedPlan.price * 100),
        description: `Assinatura do Plano ${selectedPlan.name} - Delivery Club`,
        metadata: checkoutMetadata,
        success_url: window.location.origin + createPageUrl("BusinessSettings?payment=success"),
        cancel_url: window.location.href,
      });

      if (error) throw new Error(error.error || "Erro ao iniciar o checkout do plano.");
      
      console.log(`[BusinessSettings] Redirecionando para checkout:`, data.url);
      window.location.href = data.url;

    } catch (error) {
      console.error("Erro ao mudar de plano:", error);
      toast({ title: "Erro na mudança de plano", description: error.message, variant: "destructive" });
      setIsProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
      setIsProcessingPayment(true);
      try {
          const effectiveDate = new Date();
          effectiveDate.setDate(effectiveDate.getDate() + 30); // Efetivo em 30 dias

          await Team.update(team.id, {
              subscription_status: 'cancellation_pending',
              cancellation_effective_date: effectiveDate.toISOString().split('T')[0]
          });

          await createNotification({
            userId: team.owner_id,
            title: 'Cancelamento de Assinatura Agendado',
            message: `Seu plano será cancelado em ${format(effectiveDate, 'dd/MM/yyyy')}. Você pode reativá-lo a qualquer momento antes dessa data.`,
            linkTo: createPageUrl('BusinessSettings')
          });
          
          toast({
              title: "Cancelamento Agendado",
              description: `Sua assinatura será cancelada em 30 dias. Você manterá o acesso total até lá.`
          });
          await loadInitialData(); // Reload data
      } catch (error) {
          console.error("Erro ao cancelar assinatura:", error);
          toast({ title: "Erro ao cancelar", variant: "destructive" });
      } finally {
          setIsProcessingPayment(false);
      }
  };

  const hasChanges = JSON.stringify(team) !== JSON.stringify(originalTeam);

  if (isLoading) {
    return <div className="p-8">Carregando configurações...</div>;
  }

  if (!team) {
    return <div className="p-8">Nenhuma empresa encontrada. Por favor, crie uma empresa primeiro.</div>;
  }

  const currentPlan = plans.find(p => p.id === team.plan_id);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Configurações da Empresa</h1>
        <p className="text-amber-600">Gerencie as informações, plano e pagamentos da sua empresa.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            Dados da Empresa
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Plano e Assinatura
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5"/>
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Edite os dados cadastrais, de contato e endereço da sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-amber-800">Dados Gerais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Empresa *</Label>
                        <Input id="name" value={team.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Categoria do Negócio *</Label>
                        <Select value={team.category || ''} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione a categoria..." /></SelectTrigger>
                            <SelectContent>{BUSINESS_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cnpj_cpf">CNPJ / CPF *</Label>
                        <Input id="cnpj_cpf" value={team.cnpj_cpf || ''} onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Descrição da Empresa</Label>
                        <Input id="description" value={team.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Descreva brevemente seu negócio..." />
                    </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-amber-800">Contato *</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>E-mail de Contato *</Label>
                        <Input type="email" value={team.contact?.email || ''} onChange={(e) => handleInputChange('contact.email', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Números de WhatsApp *</Label>
                        {team.contact?.whatsapp_numbers?.map((number, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input type="tel" value={number} onChange={(e) => handleWhatsappChange(index, e.target.value)} />
                                <Button variant="ghost" size="icon" onClick={() => removeWhatsappNumber(index)} disabled={team.contact.whatsapp_numbers.length <= 1}>
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addWhatsappNumber} className="mt-2"><PlusCircle className="w-4 h-4 mr-2" /> Adicionar número</Button>
                    </div>
                </div>
              </div>
              
              <div className="space-y-4">
                 <h4 className="font-semibold text-amber-800">Endereço da Sede *</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Rua</Label><Input value={team.address?.street || ''} onChange={(e) => handleInputChange('address.street', e.target.value)}/></div>
                    <div className="space-y-2"><Label>Número</Label><Input value={team.address?.number || ''} onChange={(e) => handleInputChange('address.number', e.target.value)}/></div>
                    <div className="space-y-2"><Label>Bairro</Label><Input value={team.address?.neighborhood || ''} onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}/></div>
                    <div className="space-y-2"><Label>Cidade</Label><Input value={team.address?.city || ''} onChange={(e) => handleInputChange('address.city', e.target.value)}/></div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select value={team.address?.state || ''} onValueChange={(v) => handleInputChange('address.state', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent>{BRAZILIAN_STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>CEP</Label><Input value={team.address?.zip_code || ''} onChange={(e) => handleInputChange('address.zip_code', e.target.value)}/></div>
                    <div className="md:col-span-2 space-y-2"><Label>Complemento (opcional)</Label><Input value={team.address?.complement || ''} onChange={(e) => handleInputChange('address.complement', e.target.value)}/></div>
                  </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                <Save className="w-4 h-4 mr-2"/>
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card className="shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5"/>
                Plano e Assinatura
              </CardTitle>
              <CardDescription>
                Gerencie seu plano de assinatura da plataforma Delivery Club.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {team.subscription_status === 'trial' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-blue-600"/>
                  <div>
                    <h4 className="font-semibold text-blue-800">Você está em um período de teste!</h4>
                    <p className="text-sm text-blue-600">Escolha um plano abaixo para continuar usando a plataforma após o término do período de teste.</p>
                  </div>
                </div>
              )}
              {team.subscription_status === 'cancellation_pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-600"/>
                      <div>
                          <h4 className="font-semibold text-yellow-800">Cancelamento agendado</h4>
                          <p className="text-sm text-yellow-600">Sua assinatura será cancelada em {format(new Date(team.cancellation_effective_date), 'dd/MM/yyyy')}.</p>
                      </div>
                  </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <Card key={plan.id} className={`flex flex-col ${currentPlan?.id === plan.id ? "border-2 border-amber-500 shadow-xl" : ""}`}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription className="text-2xl font-bold text-amber-900">{formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-500">/mês</span></CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/>Até {plan.max_delivery_areas} áreas de entrega</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/>Até {plan.max_subscriptions} assinaturas ativas</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/>Até {plan.max_products || '∞'} produtos cadastrados</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/>Suporte Prioritário</li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {currentPlan?.id === plan.id ? (
                          <Button variant="outline" className="w-full" disabled>Plano Atual</Button>
                      ) : (
                          <Button onClick={() => handlePlanChange(plan.id)} disabled={isProcessingPayment} className="w-full bg-amber-600 hover:bg-amber-700">
                              {isProcessingPayment ? "Processando..." : "Escolher Plano"}
                          </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {(team.subscription_status === 'active' || team.subscription_status === 'cancellation_pending') && (
                <div className="text-center pt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isProcessingPayment}>
                                {isProcessingPayment ? "Processando..." : "Cancelar Assinatura"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Sua assinatura será cancelada em 30 dias. Você poderá continuar usando a plataforma até lá.
                                Você pode reativar seu plano a qualquer momento durante este período.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Voltar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">Confirmar Cancelamento</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5"/>
                Integração de Pagamentos (Stripe)
              </CardTitle>
              <CardDescription>
                Para receber pagamentos dos seus clientes, você precisa conectar sua conta Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Link to={createPageUrl("StripeConfiguration")}>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2"/>
                    Configurar Integração Stripe
                    <ExternalLink className="w-4 h-4 ml-2"/>
                  </Button>
                </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
