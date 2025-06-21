
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { SubscriptionItem } from "@/api/entities";
import { Product } from "@/api/entities";
import { Team } from "@/api/entities";
import { TeamMember } from "@/api/entities"; // Added for notifying team members
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  ShoppingCart,
  MoreVertical,
  Pause,
  Play,
  X,
  MapPin,
  Package,
  Calendar,
  Loader2,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { formatCurrency, translate, DAYS_OF_WEEK } from "@/components/lib";
import { createNotification } from "@/components/lib"; // Added for notifications
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function MySubscriptions() {
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState({});
  const [teams, setTeams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "", reference: ""
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const userSubscriptions = await Subscription.filter({ customer_id: userData.id }, '-created_date');
      setSubscriptions(userSubscriptions);
      
      if (userSubscriptions.length === 0) {
        setIsLoading(false);
        return;
      }

      // Step 1: Fetch all teams and map them by ID
      const teamIds = [...new Set(userSubscriptions.map(s => s.team_id))];
      const teamsData = await Promise.all(
          teamIds.map(id => Team.get(id).catch(() => null))
      );
      const teamsMap = teamsData.filter(Boolean).reduce((acc, team) => {
        acc[team.id] = team;
        return acc;
      }, {});
      setTeams(teamsMap);

      // Step 2: Fetch all subscription items for all user's subscriptions
      const subscriptionIds = userSubscriptions.map(s => s.id);
      const itemPromises = subscriptionIds.map(id => SubscriptionItem.filter({ subscription_id: id }));
      const allItemsArrays = await Promise.all(itemPromises);
      const allItems = allItemsArrays.flat();
      
      const detailsMap = {};

      if (allItems.length > 0) {
        // Step 3: Get all unique, valid product IDs
        const productIds = [...new Set(allItems.map(item => item.product_id).filter(Boolean))];

        // Step 4: Fetch all products in a single batch using a more robust filter query
        const productsData = productIds.length > 0 
            ? await Product.filter({ id: { "$in": productIds } })
            : [];
        
        // Step 5: Create a map of products for efficient O(1) lookup
        const productsMap = productsData.reduce((acc, p) => {
          if (p) acc[p.id] = p;
          return acc;
        }, {});

        // Step 6: Group items by subscription and attach full product details
        for (const item of allItems) {
            if (!detailsMap[item.subscription_id]) {
                detailsMap[item.subscription_id] = [];
            }
            
            const product = productsMap[item.product_id];
            
            const detailedItem = {
                ...item,
                product: product ? product : { // Use product from map if it exists
                    id: item.product_id,
                    name: 'Produto Indisponível',
                    description: 'Este produto não pôde ser carregado ou não está mais disponível no catálogo.',
                    price_per_unit: item.unit_price || 0,
                    status: 'inactive'
                }
            };
            detailsMap[item.subscription_id].push(detailedItem);
        }
      }
      
      setSubscriptionDetails(detailsMap);

    } catch (error) {
      console.error("Erro ao carregar assinaturas:", error);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível carregar suas assinaturas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const translateStatus = (status) => translate('subscriptionStatuses', status);

  const formatFrequencyForItem = (item) => {
    const weekDaysShort = { 'monday': 'Seg', 'tuesday': 'Ter', 'wednesday': 'Qua', 'thursday': 'Qui', 'friday': 'Sex', 'saturday': 'Sáb', 'sunday': 'Dom' };
    const dayLabel = DAYS_OF_WEEK.find(d => d.value === item.biweekly_delivery_day)?.label || item.biweekly_delivery_day;

    switch (item.frequency) {
        case 'weekly':
            return `Semanal (${item.delivery_days.map(d => weekDaysShort[d]).join(', ') || 'Nenhum dia'})`;
        case 'bi-weekly':
            return `Quinzenal (${dayLabel})`;
        case 'monthly':
            return `Mensal (Todo dia ${item.monthly_delivery_day})`;
        default:
            return 'Não definido';
    }
  };

  const handlePauseSubscription = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    try {
      await Subscription.update(subscriptionId, { status: 'paused' });
      toast({ title: "Assinatura pausada com sucesso! ⏸️" });
      await loadSubscriptions();
    } catch (error) {
      toast({ title: "Erro ao pausar", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId) => {
    setActionLoading(subscriptionId);
    try {
      await Subscription.update(subscriptionId, { status: 'active' });
      toast({ title: "Assinatura reativada! ✅" });
      await loadSubscriptions();
    } catch (error) {
      toast({ title: "Erro ao reativar", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm("Tem certeza que deseja cancelar esta assinatura? Esta ação não pode ser desfeita.")) return;
    setActionLoading(subscriptionId);
    try {
      await Subscription.update(subscriptionId, { status: 'cancelled' });
      toast({ title: "Assinatura cancelada." });
      await loadSubscriptions();
    } catch (error) {
      toast({ title: "Erro ao cancelar", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenAddressModal = (subscription) => {
    setEditingSubscription(subscription);
    setAddressFormData(subscription.delivery_address || {
      street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "", reference: ""
    });
    setIsAddressModalOpen(true);
  };

  const handleAddressInputChange = (field, value) => {
    setAddressFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateAddress = async () => {
    const requiredFields = { street: "Rua", number: "Número", neighborhood: "Bairro", city: "Cidade", state: "Estado", zip_code: "CEP" };
    const missingFields = Object.keys(requiredFields).filter(field => !addressFormData[field]?.trim());
    if (missingFields.length > 0) {
      toast({ title: "Endereço incompleto", description: `Preencha: ${missingFields.map(f => requiredFields[f]).join(', ')}.`, variant: "destructive" });
      return;
    }
    
    setIsSavingAddress(true);
    try {
      // Atualizar o endereço da assinatura
      await Subscription.update(editingSubscription.id, { delivery_address: addressFormData });
      
      // Notificar a empresa sobre a alteração de endereço
      await notifyBusinessAboutAddressChange(editingSubscription, addressFormData);
      
      toast({ title: "Endereço atualizado! ✅", description: "A empresa foi notificada sobre a alteração." });
      await loadSubscriptions();
      setIsAddressModalOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error("Erro ao atualizar endereço:", error); // Added error logging
      toast({ title: "Erro ao atualizar endereço", variant: "destructive" });
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Nova função para notificar a empresa sobre alteração de endereço
  const notifyBusinessAboutAddressChange = async (subscription, newAddress) => {
    try {
      const team = teams[subscription.team_id];
      if (!team) return;

      // Buscar o proprietário da empresa
      const businessOwner = await User.get(team.owner_id);
      if (!businessOwner) return;

      // Formatar o novo endereço para exibição
      const formattedAddress = `${newAddress.street}, ${newAddress.number}${newAddress.complement ? `, ${newAddress.complement}` : ''} - ${newAddress.neighborhood}, ${newAddress.city}/${newAddress.state} - CEP: ${newAddress.zip_code}`;
      
      // Adicionar referência se existir
      const addressWithReference = newAddress.reference 
        ? `${formattedAddress}\nReferência: ${newAddress.reference}`
        : formattedAddress;

      // Criar notificação para o proprietário da empresa
      await createNotification({
        userId: businessOwner.id,
        title: "🏠 Endereço de Entrega Alterado",
        message: `O cliente ${user?.full_name || 'Desconhecido'} alterou o endereço de entrega da assinatura #${subscription.id.slice(-8)}.\n\nNovo endereço:\n${addressWithReference}`,
        linkTo: createPageUrl("Customers"),
        icon: 'MapPin'
      });

      // Se a empresa tiver outros membros da equipe, notificar também (opcional)
      const teamMembers = await TeamMember.filter({ team_id: subscription.team_id, status: 'active' });
      for (const member of teamMembers) {
        if (member.user_id && member.user_id !== team.owner_id) {
          try {
            await createNotification({
              userId: member.user_id,
              title: "🏠 Endereço de Entrega Alterado",
              message: `O cliente ${user?.full_name || 'Desconhecido'} alterou o endereço de entrega da assinatura #${subscription.id.slice(-8)}.\n\nNovo endereço:\n${addressWithReference}`,
              linkTo: createPageUrl("Customers"),
              icon: 'MapPin'
            });
          } catch (error) {
            console.log(`Não foi possível notificar o membro da equipe ${member.user_id}:`, error);
          }
        }
      }

    } catch (error) {
      console.error("Erro ao notificar empresa sobre alteração de endereço:", error);
      // Não interrompe o fluxo principal, apenas loga o erro
    }
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
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Minhas Assinaturas</h1>
        <p className="text-amber-600">Gerencie suas assinaturas, pause, cancele ou altere detalhes.</p>
      </div>

      <div className="space-y-6">
        {subscriptions.map(sub => (
          <Card key={sub.id} className="shadow-lg border-amber-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-amber-900">
                    {teams[sub.team_id]?.name || 'Empresa não encontrada'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Assinatura #{sub.id.slice(-8)} • Criada em {new Date(sub.created_date).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={sub.status === 'active' ? 'default' : 'secondary'} 
                    className={`${
                      sub.status === 'active' ? 'bg-green-500 text-white' : 
                      sub.status === 'paused' ? 'bg-amber-500 text-white' : 
                      'bg-red-500 text-white'
                    }`}
                  >
                    {translateStatus(sub.status)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={actionLoading === sub.id}>
                        {actionLoading === sub.id ? 
                          <Loader2 className="w-4 h-4 animate-spin"/> : 
                          <MoreVertical className="w-4 h-4" />
                        }
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {sub.status === 'active' && (
                        <DropdownMenuItem onClick={() => handlePauseSubscription(sub.id)}>
                          <Pause className="mr-2 h-4 w-4"/>Pausar
                        </DropdownMenuItem>
                      )}
                      {sub.status === 'paused' && (
                        <DropdownMenuItem onClick={() => handleResumeSubscription(sub.id)}>
                          <Play className="mr-2 h-4 w-4"/>Reativar
                        </DropdownMenuItem>
                      )}
                      {sub.status !== 'cancelled' && (
                        <DropdownMenuItem onClick={() => handleOpenAddressModal(sub)}>
                          <MapPin className="mr-2 h-4 w-4"/>Alterar Endereço
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {sub.status !== 'cancelled' && (
                        <DropdownMenuItem 
                          onClick={() => handleCancelSubscription(sub.id)} 
                          className="text-red-600"
                        >
                          <X className="mr-2 h-4 w-4"/>Cancelar Assinatura
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Resumo Financeiro */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">Valor Semanal Total</span>
                  <span className="text-2xl font-bold text-green-800">
                    {formatCurrency(sub.weekly_price || 0)}
                  </span>
                </div>
              </div>

              {/* Produtos da Assinatura */}
              <div>
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-amber-800">
                  <Package className="w-5 h-5"/>
                  Produtos Inclusos ({(subscriptionDetails[sub.id] || []).length})
                </h4>
                
                {(subscriptionDetails[sub.id] || []).length > 0 ? (
                  <div className="space-y-3">
                    {subscriptionDetails[sub.id].map(item => {
                      const product = item.product;
                      const isUnavailable = !product || product.status === 'inactive';
                      
                      return (
                        <div key={item.id} className={`p-4 rounded-lg border transition-colors ${
                          isUnavailable ? 'border-red-200 bg-red-50' : 'border-amber-100 bg-amber-50'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className={`font-bold text-base ${
                                  isUnavailable ? 'text-red-700' : 'text-amber-900'
                                }`}>
                                  {product?.name || 'Produto não identificado'}
                                </h5>
                                {isUnavailable && (
                                  <Badge variant="outline" className="text-red-600 border-red-300">
                                    Indisponível
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-amber-700">Quantidade:</span>
                                  <p className="text-amber-800">
                                    {item.quantity_per_delivery} {product?.unit_type === 'unidade' ? 'unidades' : product?.unit_type || 'unidades'}
                                  </p>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-amber-700">Frequência:</span>
                                  <p className="text-amber-800">{formatFrequencyForItem(item)}</p>
                                </div>
                                
                                <div>
                                  <span className="font-medium text-amber-700">Preço Unitário:</span>
                                  <p className="text-amber-800">{formatCurrency(item.unit_price || 0)}</p>
                                </div>
                              </div>
                              
                              {product?.description && (
                                <p className="text-xs text-amber-600 mt-2 italic">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-amber-600">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum produto encontrado nesta assinatura</p>
                  </div>
                )}
              </div>

              {/* Endereço de Entrega */}
              <div>
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2 text-amber-800">
                  <MapPin className="w-5 h-5"/>
                  Endereço de Entrega
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {sub.delivery_address ? (
                    <div className="space-y-1 text-blue-800">
                      <p className="font-medium">
                        {sub.delivery_address.street}, {sub.delivery_address.number}
                        {sub.delivery_address.complement ? ` - ${sub.delivery_address.complement}` : ''}
                      </p>
                      <p>
                        {sub.delivery_address.neighborhood}, {sub.delivery_address.city} - {sub.delivery_address.state}
                      </p>
                      <p className="font-mono text-sm">{sub.delivery_address.zip_code}</p>
                      {sub.delivery_address.reference && (
                        <p className="text-sm italic mt-2">
                          <strong>Referência:</strong> {sub.delivery_address.reference}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-blue-600 italic">Endereço não informado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {subscriptions.length === 0 && (
          <Card>
            <CardContent className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-amber-400 mx-auto mb-4"/>
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Nenhuma assinatura encontrada
              </h3>
              <p className="text-amber-600 mb-6">
                Parece que você ainda não tem nenhuma assinatura ativa.
              </p>
              <Link to={createPageUrl("NewSubscription")}>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-4 h-4 mr-2"/>
                  Criar Primeira Assinatura
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Endereço de Entrega</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2"><Label>Rua*</Label><Input value={addressFormData.street} onChange={(e) => handleAddressInputChange('street', e.target.value)}/></div>
            <div className="space-y-2"><Label>Número*</Label><Input value={addressFormData.number} onChange={(e) => handleAddressInputChange('number', e.target.value)}/></div>
            <div className="space-y-2"><Label>CEP*</Label><Input value={addressFormData.zip_code} onChange={(e) => handleAddressInputChange('zip_code', e.target.value)}/></div>
            <div className="col-span-2 space-y-2"><Label>Bairro*</Label><Input value={addressFormData.neighborhood} onChange={(e) => handleAddressInputChange('neighborhood', e.target.value)}/></div>
            <div className="space-y-2"><Label>Cidade*</Label><Input value={addressFormData.city} onChange={(e) => handleAddressInputChange('city', e.target.value)}/></div>
            <div className="space-y-2"><Label>Estado*</Label><Input value={addressFormData.state} onChange={(e) => handleAddressInputChange('state', e.target.value)}/></div>
            <div className="col-span-2 space-y-2"><Label>Complemento</Label><Input value={addressFormData.complement} onChange={(e) => handleAddressInputChange('complement', e.target.value)}/></div>
            <div className="col-span-2 space-y-2"><Label>Referência</Label><Input value={addressFormData.reference} onChange={(e) => handleAddressInputChange('reference', e.target.value)}/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddressModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateAddress} disabled={isSavingAddress}>
              {isSavingAddress ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null} Salvar Endereço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
