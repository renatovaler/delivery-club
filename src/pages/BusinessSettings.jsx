
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Plan } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { TeamChangeHistory } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Info, CreditCard, Key, Save, AlertTriangle, CheckCircle, ExternalLink, PlusCircle, Trash2, Building, UserCog, Link as LinkIcon, Loader2 } from "lucide-react";
import { formatCurrency, BRAZILIAN_STATES, BUSINESS_CATEGORIES, createNotification } from "@/components/lib";
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
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function BusinessSettings() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null); // Holds the full team object from backend (including subscription data)
  const [originalTeam, setOriginalTeam] = useState(null); // Deep copy of the full team object for comparison
  const [teamData, setTeamData] = useState({ // Editable fields for the general settings form
    name: '',
    description: '',
    category: '',
    cnpj_cpf: '',
    contact: { email: '', whatsapp_numbers: [''] },
    address: {},
    offering_type: 'products' // New field
  });
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingSubscription, setIsProcessingSubscription] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.current_team_id) {
        const teamDataFetched = await Team.get(userData.current_team_id);
        const allPlans = await Plan.filter({ status: "active" });

        // Initialize nested objects/arrays and new fields for the full team state
        const initializedTeamData = {
          ...teamDataFetched,
          contact: teamDataFetched.contact || {},
          address: teamDataFetched.address || {},
          offering_type: teamDataFetched.offering_type || 'products', // Ensure default for new field
        };
        if (!initializedTeamData.contact.whatsapp_numbers || initializedTeamData.contact.whatsapp_numbers.length === 0) {
            initializedTeamData.contact.whatsapp_numbers = [''];
        }

        setTeam(initializedTeamData); // Set the main team state
        setOriginalTeam(JSON.parse(JSON.stringify(initializedTeamData))); // Set original team for comparison

        // Initialize the separate teamData state for the form fields
        setTeamData({
          name: initializedTeamData.name || '',
          description: initializedTeamData.description || '',
          category: initializedTeamData.category || '',
          cnpj_cpf: initializedTeamData.cnpj_cpf || '',
          contact: initializedTeamData.contact,
          address: initializedTeamData.address,
          offering_type: initializedTeamData.offering_type,
        });
        
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
            const updatedTeamDataFetched = await Team.get(userData.current_team_id);
            const initializedUpdatedTeamData = {
                ...updatedTeamDataFetched,
                contact: updatedTeamDataFetched.contact || {},
                address: updatedTeamDataFetched.address || {},
                offering_type: updatedTeamDataFetched.offering_type || 'products',
            };
            if (!initializedUpdatedTeamData.contact.whatsapp_numbers || initializedUpdatedTeamData.contact.whatsapp_numbers.length === 0) {
                initializedUpdatedTeamData.contact.whatsapp_numbers = [''];
            }
            setTeam(initializedUpdatedTeamData);
            setOriginalTeam(JSON.parse(JSON.stringify(initializedUpdatedTeamData)));
            // Update teamData state for the form fields after payment success reload
            setTeamData({
              name: initializedUpdatedTeamData.name || '',
              description: initializedUpdatedTeamData.description || '',
              category: initializedUpdatedTeamData.category || '',
              cnpj_cpf: initializedUpdatedTeamData.cnpj_cpf || '',
              contact: initializedUpdatedTeamData.contact,
              address: initializedUpdatedTeamData.address,
              offering_type: initializedUpdatedTeamData.offering_type,
            });
          }
      }

    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamDataChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTeamData(prev => ({ 
        ...prev, 
        [parent]: { 
          ...(prev[parent] || {}), // Ensure parent object exists
          [child]: value 
        } 
      }));
    } else {
      setTeamData(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleWhatsappChange = (index, value) => {
    const newNumbers = [...(teamData.contact?.whatsapp_numbers || [])];
    newNumbers[index] = value;
    setTeamData(prev => ({ 
      ...prev, 
      contact: { 
        ...(prev.contact || {}), 
        whatsapp_numbers: newNumbers 
      } 
    }));
  };

  const addWhatsappNumber = () => {
    const newNumbers = [...(teamData.contact?.whatsapp_numbers || []), ''];
    setTeamData(prev => ({ 
      ...prev, 
      contact: { 
        ...(prev.contact || {}), 
        whatsapp_numbers: newNumbers 
      } 
    }));
  };

  const removeWhatsappNumber = (index) => {
    if (teamData.contact?.whatsapp_numbers?.length <= 1) {
        toast({ title: "Ação não permitida", description: "É necessário ter pelo menos um número de WhatsApp.", variant: "destructive" });
        return;
    }
    const newNumbers = teamData.contact.whatsapp_numbers.filter((_, i) => i !== index);
    setTeamData(prev => ({ 
      ...prev, 
      contact: { 
        ...(prev.contact || {}), 
        whatsapp_numbers: newNumbers 
      } 
    }));
  };

  const handleSaveTeamData = async () => {
    setIsSaving(true);
    try {
      // Helper to create a comparable object from teamData/originalTeam for change detection
      const getComparableTeamData = (source) => ({
          name: source.name,
          category: source.category,
          description: source.description,
          cnpj_cpf: source.cnpj_cpf,
          offering_type: source.offering_type,
          address: source.address,
          contact: {
              ...source.contact,
              whatsapp_numbers: (source.contact?.whatsapp_numbers || []).filter(n => n?.trim())
          },
      });

      const currentComparable = getComparableTeamData(teamData);
      const originalComparable = getComparableTeamData(originalTeam);

      const addressChanged = JSON.stringify(currentComparable.address) !== JSON.stringify(originalComparable.address);
      const contactChanged = JSON.stringify(currentComparable.contact) !== JSON.stringify(originalComparable.contact);

      // 1. Log alterations in history and notify clients for address and contact changes
      if (addressChanged) {
        await TeamChangeHistory.create({
          team_id: team.id,
          change_type: 'address',
          old_data: originalComparable.address,
          new_data: currentComparable.address,
          changed_by: user.id
        });
        await notifySubscribersOfChange('address');
      }

      if (contactChanged) {
        await TeamChangeHistory.create({
          team_id: team.id,
          change_type: 'contact',
          old_data: originalComparable.contact,
          new_data: currentComparable.contact,
          changed_by: user.id
        });
        await notifySubscribersOfChange('contact');
      }

      // 2. Save the new company data
      const updateData = {
        name: teamData.name,
        category: teamData.category,
        description: teamData.description,
        address: teamData.address,
        contact: {
            ...teamData.contact,
            whatsapp_numbers: teamData.contact.whatsapp_numbers.filter(n => n?.trim())
        },
        cnpj_cpf: teamData.cnpj_cpf,
        offering_type: teamData.offering_type,
      };

      await Team.update(team.id, updateData);
      
      toast({ title: "Informações salvas com sucesso!" });
      
      // Update both `team` and `originalTeam` states with the newly saved data
      setTeam(prevTeam => ({ ...prevTeam, ...updateData }));
      setOriginalTeam(prevOriginalTeam => ({ ...prevOriginalTeam, ...updateData }));

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
  
  const handleSubscribeToPlan = async (plan) => {
    setIsProcessingSubscription(true);
    try {
      console.log(`[BusinessSettings] Iniciando checkout para plano:`, plan);
      console.log(`[BusinessSettings] Team ID:`, team.id);
      
      const checkoutMetadata = {
        type: 'bakery_plan_subscription', // This name probably needs to be generic 'plan_subscription'
        team_id: team.id,
        plan_id: plan.id,
      };
      
      console.log(`[BusinessSettings] Metadata do checkout:`, checkoutMetadata);

      const { data, error } = await createCheckoutSession({
        amount: Math.round(plan.price * 100),
        description: `Assinatura do Plano ${plan.name} - Delivery Club`,
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
    } finally {
      setIsProcessingSubscription(false);
    }
  };

  const handleCancelSubscription = async () => {
      setIsProcessingSubscription(true);
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
            message: `Seu plano será cancelado em ${format(effectiveDate, 'dd/MM/yyyy', { locale: ptBR })}. Você pode reativá-lo a qualquer momento antes dessa data.`,
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
          setIsProcessingSubscription(false);
      }
  };

  const handleDisableCompany = async () => {
    setIsDisabling(true);
    try {
        await Team.update(team.id, { status: 'inactive' }); // Assuming a 'status' field or similar
        await createNotification({
            userId: team.owner_id,
            title: 'Empresa Desativada',
            message: `Sua empresa "${team.name}" foi desativada. Todas as assinaturas foram canceladas.`,
            linkTo: createPageUrl('Dashboard')
        });
        toast({ title: "Empresa desativada com sucesso!", description: "Você será redirecionado em breve." });
        setTimeout(() => {
            // Redirect or refresh to reflect changes
            window.location.reload(); 
        }, 1500);
    } catch (error) {
        console.error("Erro ao desativar empresa:", error);
        toast({ title: "Erro ao desativar empresa", description: "Não foi possível desativar sua empresa.", variant: "destructive" });
    } finally {
        setIsDisabling(false);
        setIsConfirmOpen(false);
    }
  };

  // Helper function to create a comparable object for change detection
  const getComparableTeamData = (source) => {
    // Verificação de segurança para evitar erro com null
    if (!source) {
      return {
        name: '',
        description: '',
        category: '',
        cnpj_cpf: '',
        offering_type: 'products',
        contact: { whatsapp_numbers: [] },
        address: {},
      };
    }

    return {
      name: source.name || '',
      description: source.description || '',
      category: source.category || '',
      cnpj_cpf: source.cnpj_cpf || '',
      offering_type: source.offering_type || 'products',
      contact: {
        ...(source.contact || {}),
        whatsapp_numbers: (source.contact?.whatsapp_numbers || []).filter(n => n?.trim())
      },
      address: source.address || {},
    };
  };

  // Determine if there are changes between the form state (teamData) and the original data (originalTeam)
  const hasChanges = originalTeam && teamData ? 
    JSON.stringify(getComparableTeamData(teamData)) !== JSON.stringify(getComparableTeamData(originalTeam)) :
    false;

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
        <div className="w-full p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Empresa não encontrada</h2>
            <p className="text-muted-foreground">Você precisa estar associado a uma empresa para ver esta página.</p>
        </div>
    );
  }

  const currentPlan = plans.find(p => p.id === team.plan_id);

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações da Empresa</h1>
        <p className="text-muted-foreground">Gerencie as informações e preferências do seu negócio.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted mb-6">
          <TabsTrigger value="general" className="data-[state=active]:bg-background data-[state=active]:text-foreground flex items-center gap-2">
            <Building className="w-4 h-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-background data-[state=active]:text-foreground flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Plano e Assinatura
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-background data-[state=active]:text-foreground flex items-center gap-2">
            <Key className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="danger" className="data-[state=active]:bg-background data-[state=active]:text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Zona de Perigo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-foreground">Informações Gerais</CardTitle>
              <CardDescription>Atualize os dados principais da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Dados Gerais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome da Empresa *</Label>
                        <Input id="name" value={teamData.name || ''} onChange={(e) => handleTeamDataChange('name', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Categoria do Negócio *</Label>
                        <Select value={teamData.category || ''} onValueChange={(value) => handleTeamDataChange('category', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione a categoria..." /></SelectTrigger>
                            <SelectContent>{BUSINESS_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="cnpj_cpf">CNPJ / CPF *</Label>
                        <Input id="cnpj_cpf" value={teamData.cnpj_cpf || ''} onChange={(e) => handleTeamDataChange('cnpj_cpf', e.target.value)} required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Descrição da Empresa</Label>
                        <Input id="description" value={teamData.description || ''} onChange={(e) => handleTeamDataChange('description', e.target.value)} placeholder="Descreva brevemente seu negócio..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="offeringType">Tipo de Oferta *</Label>
                        <Select id="offeringType" value={teamData.offering_type} onValueChange={(v) => handleTeamDataChange('offering_type', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="products">Apenas Produtos</SelectItem>
                                <SelectItem value="services">Apenas Serviços</SelectItem>
                                <SelectItem value="both">Ambos (Produtos e Serviços)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Define se sua empresa oferece produtos físicos, serviços ou ambos. Isso afeta quais páginas de gestão estarão disponíveis.
                        </p>
                    </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h4 className="font-semibold text-foreground">Informações de Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>E-mail de Contato *</Label>
                        <Input type="email" value={teamData.contact?.email || ''} onChange={(e) => handleTeamDataChange('contact.email', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Números de WhatsApp *</Label>
                        {teamData.contact?.whatsapp_numbers?.map((number, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input type="tel" value={number} onChange={(e) => handleWhatsappChange(index, e.target.value)} />
                                <Button variant="ghost" size="icon" onClick={() => removeWhatsappNumber(index)} disabled={teamData.contact.whatsapp_numbers.length <= 1}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addWhatsappNumber} className="mt-2"><PlusCircle className="w-4 h-4 mr-2" /> Adicionar número</Button>
                    </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                 <h4 className="font-semibold text-foreground">Endereço da Sede *</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Rua</Label><Input value={teamData.address?.street || ''} onChange={(e) => handleTeamDataChange('address.street', e.target.value)}/></div>
                    <div className="space-y-2"><Label>Número</Label><Input value={teamData.address?.number || ''} onChange={(e) => handleTeamDataChange('address.number', e.target.value)}/></div>
                    <div className="space-y-2"><Label>Bairro</Label><Input value={teamData.address?.neighborhood || ''} onChange={(e) => handleTeamDataChange('address.neighborhood', e.target.value)}/></div>
                    <div className="space-y-2"><Label>Cidade</Label><Input value={teamData.address?.city || ''} onChange={(e) => handleTeamDataChange('address.city', e.target.value)}/></div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select value={teamData.address?.state || ''} onValueChange={(v) => handleTeamDataChange('address.state', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger>
                        <SelectContent>{BRAZILIAN_STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>CEP</Label><Input value={teamData.address?.zip_code || ''} onChange={(e) => handleTeamDataChange('address.zip_code', e.target.value)}/></div>
                    <div className="md:col-span-2 space-y-2"><Label>Complemento (opcional)</Label><Input value={teamData.address?.complement || ''} onChange={(e) => handleTeamDataChange('address.complement', e.target.value)}/></div>
                  </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveTeamData} disabled={!hasChanges || isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscription" className="mt-6">
           <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-foreground">Plano e Assinatura</CardTitle>
              <CardDescription>Gerencie seu plano de assinatura da plataforma Delivery Club.</CardDescription>
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
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600"/>
                  <div>
                    <h4 className="font-semibold text-orange-800">Cancelamento agendado</h4>
                    <p className="text-sm text-orange-600">
                      Sua assinatura será cancelada em {team.cancellation_effective_date ? format(parseISO(team.cancellation_effective_date), 'dd/MM/yyyy', { locale: ptBR }) : 'data não definida'}.
                    </p>
                  </div>
                </div>
              )}

              {currentPlan && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-900">{currentPlan.name}</h3>
                      <p className="text-blue-700 mt-1">{currentPlan.description}</p>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-blue-800">
                          <strong>Assinaturas:</strong> {currentPlan.max_subscriptions === null ? 'Ilimitadas' : `até ${currentPlan.max_subscriptions}`}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Produtos:</strong> {currentPlan.max_products === null ? 'Ilimitados' : `até ${currentPlan.max_products}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">{formatCurrency(currentPlan.price)}</div>
                      <div className="text-sm text-blue-700">por mês</div>
                    </div>
                  </div>
                </div>
              )}

              {!currentPlan && team.subscription_status !== 'trial' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800">Nenhum plano ativo</h4>
                  <p className="text-sm text-red-600 mt-1">Selecione um plano para continuar usando a plataforma.</p>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Planos Disponíveis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.filter(p => p.status === 'active').map(plan => (
                    <div 
                      key={plan.id} 
                      className={`p-4 rounded-lg border-2 transition-all ${
                        plan.id === team.plan_id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h5 className="font-semibold text-foreground">{plan.name}</h5>
                        {plan.id === team.plan_id && (
                          <Badge className="bg-blue-500">Atual</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                      <div className="space-y-2 text-sm mb-4">
                        <p><strong>Assinaturas:</strong> {plan.max_subscriptions === null ? 'Ilimitadas' : plan.max_subscriptions}</p>
                        <p><strong>Produtos:</strong> {plan.max_products === null ? 'Ilimitados' : plan.max_products}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xl font-bold text-foreground">{formatCurrency(plan.price)}</div>
                          <div className="text-xs text-muted-foreground">por mês</div>
                        </div>
                        {plan.id !== team.plan_id && (
                          <Button 
                            size="sm" 
                            onClick={() => handleSubscribeToPlan(plan)}
                            disabled={isProcessingSubscription}
                            className="bg-primary hover:bg-primary/90"
                          >
                            {isProcessingSubscription ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assinar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                      <Key className="w-5 h-5"/>
                      Integração de Pagamento (Stripe)
                  </CardTitle>
                  <CardDescription>
                      Configure suas chaves do Stripe para começar a receber pagamentos dos seus clientes.
                  </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center flex-col pt-6 gap-4">
                   <p className="text-sm text-muted-foreground">Clique no botão abaixo para gerenciar sua integração com o Stripe.</p>
                  <Link to={createPageUrl("StripeConfiguration")}>
                      <Button variant="outline" className="text-base py-6 px-8">
                          <CreditCard className="w-5 h-5 mr-3"/>
                          Gerenciar Integração Stripe
                          <ExternalLink className="w-4 h-4 ml-3"/>
                      </Button>
                  </Link>
              </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="danger" className="mt-6">
            <Card className="border-destructive/20 shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5"/> Zona de Perigo
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <p className="font-medium text-destructive">Desativar Empresa</p>
                    <p className="text-sm text-destructive/90">Esta ação irá desativar sua empresa e cancelar todas as assinaturas. Esta ação não pode ser desfeita.</p>
                  </div>
                  <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isDisabling}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isDisabling ? "Desativando..." : "Desativar Empresa"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação é irreversível. Desativar sua empresa resultará na remoção de seus dados e cancelamento de todas as assinaturas associadas.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisableCompany} disabled={isDisabling} className="bg-destructive hover:bg-destructive/90">
                          {isDisabling ? "Desativando..." : "Confirmar Desativação"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
