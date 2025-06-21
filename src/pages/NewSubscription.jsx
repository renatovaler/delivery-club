
import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { DeliveryArea } from "@/api/entities";
import { Product } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { SubscriptionItem } from "@/api/entities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingCart,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Minus,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Package,
  Trash2,
  Building2,
  Store,
  Cake,
  UtensilsCrossed,
  Pill,
  Box,
  Settings,
  Edit,
} from "lucide-react";
import { differenceInCalendarWeeks, format } from "date-fns";

import { createCheckoutSession } from "@/api/functions";
import { formatCurrency, createNotification, DAYS_OF_WEEK, BRAZILIAN_STATES, PRODUCT_CATEGORIES } from "@/components/lib";
import { Textarea } from "@/components/ui/textarea";

const BUSINESS_CATEGORIES = [
  { value: 'all', label: 'Todos', icon: Store },
  { value: 'padaria', label: 'Padarias', icon: Cake },
  { value: 'restaurante', label: 'Restaurantes', icon: UtensilsCrossed },
  { value: 'mercado', label: 'Mercados', icon: ShoppingCart },
  { value: 'farmacia', label: 'Farmácias', icon: Pill },
  { value: 'outros', label: 'Outros', icon: Box }
];

const UNIT_TYPE_LABELS = {
  "unidade": "unidades",
  "grama": "gramas", 
  "quilograma": "quilos",
  "litro": "litros",
  "mililitro": "mililitros",
  "fatia": "fatias"
};

export default function NewSubscription() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  
  const [allAreas, setAllAreas] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filteredDeliveryAreas, setFilteredDeliveryAreas] = useState([]);
  const [availableBusinesses, setAvailableBusinesses] = useState([]);
  const [areaFilter, setAreaFilter] = useState({ state: "", city: "", neighborhood: "" });
  const [businessCategory, setBusinessCategory] = useState("all");

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);

  // Estados principais da Assinatura e do Modal de Configuração
  const [subscriptionItems, setSubscriptionItems] = useState([]);
  const [selectedProductsMap, setSelectedProductsMap] = useState({});
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configuringItem, setConfiguringItem] = useState(null);

  const [formData, setFormData] = useState({
    delivery_area_id: "",
    team_id: "",
    delivery_address: {
      street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "", reference: ""
    }
  });

  const [currentStep, setCurrentStep] = useState(1);

  // Define os passos do fluxo
  const STEP_AREA = 1;
  const STEP_BUSINESS = 2;
  const STEP_PRODUCTS = 3;
  const STEP_ADDRESS = 4;
  const STEP_SUMMARY = 5;

  const filteredBusinesses = useMemo(() => {
    if (!availableBusinesses) return [];
    if (businessCategory === 'all') {
        return availableBusinesses;
    }
    return availableBusinesses.filter(business => business.category === businessCategory);
  }, [availableBusinesses, businessCategory]);

  const activeBusinessCategories = useMemo(() => {
    if (!availableBusinesses.length) return [];
    
    const uniqueCategoryValues = [...new Set(availableBusinesses.map(business => business.category))];
    
    // Filtra as categorias principais para incluir apenas as presentes nas empresas disponíveis
    const activeCategories = BUSINESS_CATEGORIES.filter(cat => cat.value !== 'all' && uniqueCategoryValues.includes(cat.value));

    // Só mostra os filtros se houver mais de uma categoria para filtrar
    if (activeCategories.length > 1) {
      const allCategory = BUSINESS_CATEGORIES.find(cat => cat.value === 'all');
      return allCategory ? [allCategory, ...activeCategories] : activeCategories;
    }
    
    return []; // Retorna vazio se não houver diversidade de categorias
  }, [availableBusinesses]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (areaFilter.state) {
      const citiesForState = [...new Set(allAreas.filter(area => area.state === areaFilter.state).map(area => area.city))].sort();
      setCities(citiesForState);
      handleAreaFilterChange('city', '');
    }
  }, [areaFilter.state, allAreas]);

  useEffect(() => {
    if (areaFilter.city) {
      const neighborhoodsForCity = [...new Set(allAreas.filter(area => area.state === areaFilter.state && area.city === areaFilter.city).map(area => area.neighborhood))].sort();
      setNeighborhoods(neighborhoodsForCity);
      handleAreaFilterChange('neighborhood', '');
    }
  }, [areaFilter.city, areaFilter.state, allAreas]);
  
  useEffect(() => {
    if (areaFilter.state && areaFilter.city && areaFilter.neighborhood) {
        const finalAreas = allAreas.filter(area => 
            area.state === areaFilter.state &&
            area.city === areaFilter.city &&
            area.neighborhood === areaFilter.neighborhood
        );
        setFilteredDeliveryAreas(finalAreas);
    } else {
        setFilteredDeliveryAreas([]);
    }
    
    handleInputChange('delivery_area_id', '');
  }, [areaFilter.state, areaFilter.city, areaFilter.neighborhood, allAreas]);

  useEffect(() => {
    if (formData.delivery_area_id) {
      loadAvailableBusinesses();
    } else {
      setAvailableBusinesses([]);
      setSelectedArea(null);
      setSelectedTeam(null);
      setProducts([]);
      setSubscriptionItems([]);
      setSelectedProductsMap({});
      handleInputChange('team_id', '');
    }
  }, [formData.delivery_area_id]);

  useEffect(() => {
    if (formData.team_id) {
      loadBusinessAndProducts();
    } else {
      setSelectedTeam(null);
      setProducts([]);
      setSubscriptionItems([]);
      setSelectedProductsMap({});
    }
  }, [formData.team_id, formData.delivery_area_id, availableBusinesses]);

  useEffect(() => {
    if (formData.team_id && !filteredBusinesses.some(b => b.id === formData.team_id)) {
      handleInputChange('team_id', '');
    }
  }, [filteredBusinesses, formData.team_id]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [userData, allActiveAreas] = await Promise.all([
          User.me(),
          DeliveryArea.filter({ status: "active" })
      ]);
      setUser(userData);
      setAllAreas(allActiveAreas);
      
      // Filtra os estados para exibir apenas os que têm áreas de entrega cadastradas
      const uniqueStateValues = [...new Set(allActiveAreas.map(area => area.state))];
      const statesWithData = BRAZILIAN_STATES.filter(state => uniqueStateValues.includes(state.value));
      setAvailableStates(statesWithData);
      
      if (userData.address) {
        setFormData(prev => ({
          ...prev,
          delivery_address: { ...userData.address, reference: "" }
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableBusinesses = async () => {
    if (!formData.delivery_area_id) return;

    setLoadingBusinesses(true);
    try {
      const area = allAreas.find(a => a.id === formData.delivery_area_id);
      setSelectedArea(area);
      
      if (!area) {
        toast({ title: "Área não encontrada.", variant: "destructive" });
        return;
      }

      const areasInSameLocation = allAreas.filter(a => 
        a.state === area.state &&
        a.city === area.city &&
        a.neighborhood === area.neighborhood &&
        a.status === 'active'
      );

      const teamIds = [...new Set(areasInSameLocation.map(a => a.team_id))];
      
      const teams = await Promise.all(
        teamIds.map(async (teamId) => {
          try {
            const team = await Team.get(teamId);
            const allowedStatuses = ['active', 'trial'];
            if (!allowedStatuses.includes(team.subscription_status)) {
              return null;
            }

            // NOVA VALIDAÇÃO: Verificar se a empresa tem produtos ativos
            const teamProducts = await Product.filter({ 
              team_id: teamId, 
              status: "active" 
            });

            // Filtrar produtos disponíveis na área selecionada
            const availableProducts = teamProducts.filter(p => 
              p.available_area_ids?.includes(formData.delivery_area_id)
            );

            // Só incluir empresas que tenham pelo menos 1 produto disponível na área
            return availableProducts.length > 0 ? team : null;

          } catch (error) {
            console.error(`Erro ao carregar empresa ${teamId}:`, error);
            return null;
          }
        })
      );

      const validTeams = teams.filter(team => team !== null);
      
      // NOVO FILTRO: Apenas empresas com Stripe configurado
      const readyForSaleTeams = validTeams.filter(team => 
        team.stripe_public_key && team.stripe_public_key.trim() !== '' &&
        team.stripe_secret_key && team.stripe_secret_key.trim() !== ''
      );

      setAvailableBusinesses(readyForSaleTeams);

      if (readyForSaleTeams.length === 0) {
        toast({ 
          title: "Nenhuma empresa encontrada", 
          description: "Não há empresas com configuração de pagamento completa atendendo esta região.",
          variant: "destructive" 
        });
      }

    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast({ title: "Erro ao carregar empresas", variant: "destructive" });
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const loadBusinessAndProducts = async () => {
    if (!formData.team_id || !formData.delivery_area_id) return;

    setLoadingProducts(true);
    try {
      const team = availableBusinesses.find(t => t.id === formData.team_id);
      setSelectedTeam(team);
      
      if (!team) {
        toast({ title: "Empresa não encontrada.", variant: "destructive" });
        return;
      }
      
      const teamProducts = await Product.filter({ team_id: team.id, status: "active" });

      const availableProducts = teamProducts.filter(p => 
        p.available_area_ids?.includes(formData.delivery_area_id)
      );
      setProducts(availableProducts.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)));

    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({ title: "Erro ao carregar produtos", variant: "destructive" });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAreaFilterChange = (field, value) => {
    setAreaFilter(prev => ({ ...prev, [field]: value }));
  };
  
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const getMinQuantity = (product) => {
    if (product.minimum_quantity) return product.minimum_quantity;
    
    switch (product.unit_type) {
      case 'quilograma':
      case 'litro':
        return 0.1;
      case 'grama':
      case 'mililitro':
        return 10;
      default:
        return 1;
    }
  };

  const getQuantityStep = (unitType) => {
    switch (unitType) {
      case 'quilograma':
      case 'litro':
        return 0.1;
      case 'grama':
      case 'mililitro':
        return 10;
      default:
        return 1;
    }
  };

  // Funções do Novo Fluxo de Configuração
  const handleOpenConfigModal = (product) => {
    const newItem = {
      product_id: product.id,
      product: product,
      frequency: 'weekly',
      delivery_days: [],
      biweekly_delivery_day: null,
      monthly_delivery_day: null,
      quantity_per_delivery: getMinQuantity(product),
      unit_price: product.price_per_unit,
      // Usar um ID temporário para a chave no React
      temp_id: Date.now() 
    };
    setConfiguringItem(newItem);
    setIsConfigModalOpen(true);
  };

  // Nova função para editar produto existente na cesta
  const handleEditProductInCart = (productId) => {
    const existingItem = subscriptionItems.find(item => item.product_id === productId);
    if (!existingItem) return;

    // Configurar o modal com os dados do item existente
    setConfiguringItem({ ...existingItem });
    setIsConfigModalOpen(true);
  };

  const handleConfigItemChange = (field, value) => {
    if (!configuringItem) return;

    let validValue = value;
    if (field === 'quantity_per_delivery') {
      const product = configuringItem.product;
      const minQuantity = getMinQuantity(product);
      const maxQuantity = product.maximum_quantity || 1000;
      let parsedQuantity = parseFloat(value);
      if (isNaN(parsedQuantity)) parsedQuantity = minQuantity;

      validValue = Math.max(minQuantity, Math.min(maxQuantity, parsedQuantity));

      // Arredondamentos
      if (['quilograma', 'litro'].includes(product.unit_type)) validValue = Math.round(validValue * 10) / 10;
      else if (['unidade', 'fatia', 'grama', 'mililitro'].includes(product.unit_type)) validValue = Math.round(validValue);
      else validValue = Math.round(validValue * 10) / 10;
    }

    if (field === 'delivery_days') {
      const day = value;
      const currentDays = configuringItem.delivery_days || [];
      const isChecked = currentDays.includes(day);
      validValue = isChecked ? currentDays.filter(d => d !== day) : [...currentDays, day];
    }
    
    setConfiguringItem(prev => ({ ...prev, [field]: validValue }));
  };

  const handleConfirmConfiguredItem = () => {
    if (!configuringItem) return;

    // Validação
    if (configuringItem.frequency === 'weekly' && configuringItem.delivery_days.length === 0) {
      toast({ title: "Seleção necessária", description: "Escolha pelo menos um dia para entrega semanal.", variant: "destructive" });
      return;
    }
    if (configuringItem.frequency === 'bi-weekly' && !configuringItem.biweekly_delivery_day) {
      toast({ title: "Seleção necessária", description: "Escolha o dia da semana para entrega quinzenal.", variant: "destructive" });
      return;
    }
    if (configuringItem.frequency === 'monthly' && !configuringItem.monthly_delivery_day) {
      toast({ title: "Seleção necessária", description: "Escolha o dia do mês para entrega mensal.", variant: "destructive" });
      return;
    }

    // Verificar se é edição de um item existente
    const existingItemIndex = subscriptionItems.findIndex(item => item.product_id === configuringItem.product_id);
    
    if (existingItemIndex >= 0) {
      // Atualizar item existente
      setSubscriptionItems(prev => prev.map((item, index) => 
        index === existingItemIndex ? configuringItem : item
      ));
      toast({ title: "Produto atualizado!", description: `As configurações de ${configuringItem.product.name} foram atualizadas.` });
    } else {
      // Adicionar novo item
      setSubscriptionItems(prev => [...prev, configuringItem]);
      setSelectedProductsMap(prev => ({ ...prev, [configuringItem.product_id]: true }));
      toast({ title: "Produto adicionado!", description: `${configuringItem.product.name} foi adicionado à sua assinatura.` });
    }

    // Limpar e fechar modal
    setIsConfigModalOpen(false);
    setConfiguringItem(null);
  };
  
  const removeProductFromSubscription = (productIdToRemove) => {
    setSubscriptionItems(prev => prev.filter(item => item.product_id !== productIdToRemove));
    setSelectedProductsMap(prev => {
      const newMap = { ...prev };
      delete newMap[productIdToRemove];
      return newMap;
    });
    toast({ title: "Produto removido", description: "O item foi removido da sua assinatura." });
  };

  // CÁLCULOS
  const calculateTotal = () => {
    let total = 0;
    subscriptionItems.forEach(item => {
      let deliveriesPerWeekAvg = 0;
      if (item.frequency === 'weekly') {
        deliveriesPerWeekAvg = item.delivery_days.length;
      } else if (item.frequency === 'bi-weekly' && item.biweekly_delivery_day) {
        deliveriesPerWeekAvg = 0.5;
      } else if (item.frequency === 'monthly' && item.monthly_delivery_day) {
        deliveriesPerWeekAvg = 1 / 4.333;
      }
      total += item.quantity_per_delivery * item.unit_price * deliveriesPerWeekAvg;
    });

    if (selectedArea?.delivery_fee > 0) {
        let uniqueDeliveryDays = new Set();
        let hasMonthly = false;
        subscriptionItems.forEach(item => {
            if (item.frequency === 'weekly') item.delivery_days.forEach(d => uniqueDeliveryDays.add(d));
            else if (item.frequency === 'bi-weekly') uniqueDeliveryDays.add(item.biweekly_delivery_day);
            else if (item.frequency === 'monthly') hasMonthly = true;
        });

        let deliveryFeeWeekly = uniqueDeliveryDays.size * selectedArea.delivery_fee;
        if (hasMonthly) deliveryFeeWeekly += selectedArea.delivery_fee / 4.333; // Add a fraction of monthly fee to weekly total
        total += deliveryFeeWeekly;
    }
    return total;
  };

  // --- Funções Auxiliares de Formatação para Resumo Detalhado ---
  const formatFrequencyDetails = (item) => {
    const { frequency, delivery_days, biweekly_delivery_day, monthly_delivery_day } = item;
    const weekDaysShort = {
        monday: 'Seg', tuesday: 'Ter', wednesday: 'Qua', thursday: 'Qui', friday: 'Sex', saturday: 'Sáb', sunday: 'Dom'
    };
    const weekDaysLong = {
        monday: 'Segunda-feira', tuesday: 'Terça-feira', wednesday: 'Quarta-feira', thursday: 'Quinta-feira', friday: 'Sexta-feira', saturday: 'Sábado', sunday: 'Domingo'
    };

    if (frequency === 'weekly') {
        const days = delivery_days.map(d => weekDaysShort[d]).join(', ');
        return `Semanal (${days || 'Nenhum dia'})`;
    }
    if (frequency === 'bi-weekly' && biweekly_delivery_day) {
        return `Quinzenal (${weekDaysLong[biweekly_delivery_day]})`;
    }
    if (frequency === 'monthly' && monthly_delivery_day) {
        return `Mensal (Todo dia ${monthly_delivery_day})`;
    }
    return 'Frequência não definida';
  };

  const calculateItemWeeklySubtotal = (item) => {
    let deliveriesPerWeekAvg = 0;
    if (item.frequency === 'weekly') {
        deliveriesPerWeekAvg = item.delivery_days.length;
    } else if (item.frequency === 'bi-weekly' && item.biweekly_delivery_day) {
        deliveriesPerWeekAvg = 0.5;
    } else if (item.frequency === 'monthly' && item.monthly_delivery_day) {
        deliveriesPerWeekAvg = 1 / 4.333; // Aproximação
    }
    return item.quantity_per_delivery * item.unit_price * deliveriesPerWeekAvg;
  };
  
  const handleCreateSubscription = async () => {
    if (!formData.delivery_area_id || !formData.team_id || !selectedTeam) {
      toast({ title: "Selecione uma área e uma empresa", variant: "destructive" });
      return;
    }
    if (subscriptionItems.length === 0) {
      toast({ title: "Adicione produtos à sua assinatura", variant: "destructive" });
      return;
    }
    const requiredAddressFields = ['street', 'number', 'zip_code'];
    if (requiredAddressFields.some(field => !formData.delivery_address[field]?.trim())) {
      toast({ title: "Endereço de entrega incompleto", variant: "destructive" });
      return;
    }

    const weeklyTotal = calculateTotal();
    if (weeklyTotal <= 0) {
      toast({ title: "Valor inválido", description: "O valor da assinatura deve ser maior que zero.", variant: "destructive" });
      return;
    }

    setIsCreating(true);

    try {
      const subscriptionData = {
        customer_id: user.id,
        team_id: selectedTeam.id,
        delivery_area_id: formData.delivery_area_id,
        start_date: new Date().toISOString().split('T')[0],
        status: "pending_payment",
        weekly_price: weeklyTotal,
        delivery_address: {
          ...formData.delivery_address,
          neighborhood: formData.delivery_address.neighborhood || selectedArea?.neighborhood || '',
          city: formData.delivery_address.city || selectedArea?.city || '',
          state: formData.delivery_address.state || selectedArea?.state || '',
        }
      };
      const newSubscription = await Subscription.create(subscriptionData);

      for (const item of subscriptionItems) {
        let itemWeeklySubtotal = 0;
        if (item.frequency === 'weekly') {
            itemWeeklySubtotal = item.quantity_per_delivery * item.unit_price * item.delivery_days.length;
        } else if (item.frequency === 'bi-weekly') {
            itemWeeklySubtotal = item.quantity_per_delivery * item.unit_price * 0.5;
        } else if (item.frequency === 'monthly') {
            itemWeeklySubtotal = item.quantity_per_delivery * item.unit_price * (1 / 4.333);
        }

        await SubscriptionItem.create({
          subscription_id: newSubscription.id,
          product_id: item.product_id,
          frequency: item.frequency,
          delivery_days: item.frequency === 'weekly' ? item.delivery_days : [],
          biweekly_delivery_day: item.frequency === 'bi-weekly' ? item.biweekly_delivery_day : null,
          monthly_delivery_day: item.frequency === 'monthly' ? item.monthly_delivery_day : null,
          quantity_per_delivery: item.quantity_per_delivery,
          unit_price: item.unit_price,
          weekly_subtotal: itemWeeklySubtotal
        });
      }

      if (selectedTeam.owner_id) {
        await createNotification({
          userId: selectedTeam.owner_id,
          title: "Nova Assinatura Recebida!",
          message: `O cliente ${user.full_name} criou uma nova assinatura.`,
          linkTo: createPageUrl("Customers"),
          icon: 'UserPlus'
        });
      }

      toast({ title: "Redirecionando para o pagamento...", description: "Você será levado para um ambiente seguro." });

      const { data, error } = await createCheckoutSession({
        amount: Math.round(weeklyTotal * 100),
        description: `Assinatura semanal - ${selectedTeam.name}`,
        metadata: { 
          type: 'customer_product_subscription',
          subscription_id: newSubscription.id,
          customer_id: user.id,
          team_id: selectedTeam.id
        },
        success_url: window.location.origin + createPageUrl("CustomerDashboard?payment=success"),
        cancel_url: window.location.href,
      });

      if (error) throw new Error(error.error || "Erro ao iniciar pagamento");
      window.location.href = data.url;

    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      toast({ title: "Erro ao iniciar pagamento", description: error.message, variant: "destructive" });
      setIsCreating(false);
    }
  };

  const getProductsByCategory = () => {
    return products.reduce((acc, product) => {
      (acc[product.category] = acc[product.category] || []).push(product);
      return acc;
    }, {});
  };

  const getCategoryLabel = (category) => PRODUCT_CATEGORIES.find(c => c.value === category)?.label || category;
  const getCategoryIcon = (category) => PRODUCT_CATEGORIES.find(c => c.value === category)?.icon || "📦";
  
  const goToNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (isLoading) {
    return (
      <div className="p-8"><div className="animate-pulse h-8 bg-amber-200 rounded w-1/3"></div></div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("CustomerDashboard")}>
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-amber-900">Nova Assinatura</h1>
          <p className="text-amber-600">Configure sua entrega personalizada de produtos</p>
        </div>
      </div>

      <div className="space-y-6">
          {currentStep === STEP_AREA && (
            <Card className="shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <MapPin className="w-5 h-5" />1. Encontre sua Área de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={areaFilter.state} onValueChange={(value) => handleAreaFilterChange('state', value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {availableStates.length > 0 ? (
                          availableStates.map(state => <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>)
                        ) : (
                          <div className="p-2 text-sm text-gray-500">Nenhum estado com áreas de entrega.</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Select value={areaFilter.city} onValueChange={(value) => handleAreaFilterChange('city', value)} disabled={!areaFilter.state}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro</Label>
                    <Select value={areaFilter.neighborhood} onValueChange={(value) => handleAreaFilterChange('neighborhood', value)} disabled={!areaFilter.city}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>{neighborhoods.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                
                {areaFilter.state && areaFilter.city && areaFilter.neighborhood && (
                  <div className="space-y-2 mt-4">
                    <Label>Área Específica</Label>
                    <Select value={formData.delivery_area_id} onValueChange={(value) => handleInputChange('delivery_area_id', value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione uma área de cobertura" /></SelectTrigger>
                      <SelectContent>
                        {filteredDeliveryAreas.length > 0 ? filteredDeliveryAreas.map((area) => (
                          <SelectItem key={area.id} value={area.id}>{area.condominium ? `${area.neighborhood} (${area.condominium})` : area.neighborhood}</SelectItem>
                        )) : <p className="p-2 text-sm text-gray-500">Nenhuma área específica neste bairro.</p>}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.delivery_area_id && (
                  <div className="mt-6 flex justify-end">
                    <Button onClick={goToNextStep}>Próximo</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_BUSINESS && (
            <Card className="shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Building2 className="w-5 h-5" />2. Escolha sua Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBusinesses ? (
                  <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-amber-500" />
                ) : availableBusinesses.length > 0 ? (
                  <div className="space-y-4">
                    {activeBusinessCategories.length > 0 && (
                      <div>
                        <Label>Filtrar por Categoria</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activeBusinessCategories.map(cat => {
                            const Icon = cat.icon;
                            return (
                              <Button
                                key={cat.value}
                                variant={businessCategory === cat.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setBusinessCategory(cat.value)}
                                className="flex items-center gap-2"
                              >
                                <Icon className="w-4 h-4" />
                                {cat.label}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Empresas Disponíveis</Label>
                      <Select
                        value={formData.team_id}
                        onValueChange={(value) => handleInputChange('team_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione ou pesquise uma empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredBusinesses.map(team => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.team_id && (
                      <div className="mt-6 flex justify-between">
                        <Button variant="outline" onClick={goToPrevStep}>Voltar</Button>
                        <Button onClick={goToNextStep}>Próximo</Button>
                      </div>
                    )}
                  </div>
                ) : formData.delivery_area_id ? (
                  <div className="text-center text-gray-600 py-8">
                    <p>Nenhuma empresa ativa atende esta região. 😥</p>
                    <Button variant="link" onClick={goToPrevStep}>Mudar área</Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_PRODUCTS && selectedTeam && (
            <Card className="shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Package className="w-5 h-5" /> 3. Monte sua Assinatura
                </CardTitle>
                <CardDescription>
                  Adicione e configure os produtos que deseja receber de {selectedTeam.name}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProducts ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin text-amber-500" /> :
                products.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(getProductsByCategory()).map(([category, categoryProducts]) => (
                    <div key={category}>
                      <h4 className="font-medium text-amber-900 mb-3 flex items-center gap-2">
                        <span className="text-lg">{getCategoryIcon(category)}</span>
                        {getCategoryLabel(category)}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryProducts.map((product) => (
                          <div 
                            key={product.id} 
                            className={`p-4 rounded-lg border transition-all ${
                              selectedProductsMap[product.id] 
                                ? 'border-green-400 bg-green-50/50' 
                                : 'hover:border-amber-200 hover:shadow-md'
                            }`} 
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                {product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 truncate">{product.name}</h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  {formatCurrency(product.price_per_unit)} / {UNIT_TYPE_LABELS[product.unit_type] || product.unit_type}
                                </p>
                                {product.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {product.description}
                                  </p>
                                )}
                                <div className="mt-3 flex gap-2">
                                  {selectedProductsMap[product.id] ? (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleEditProductInCart(product.id)}
                                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => removeProductFromSubscription(product.id)}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remover
                                      </Button>
                                    </>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleOpenConfigModal(product)}
                                      className="bg-amber-600 hover:bg-amber-700"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      Adicionar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center mt-8 pt-4 border-t">
                    <Button variant="outline" onClick={goToPrevStep}>Voltar</Button>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-amber-900">
                        {subscriptionItems.length} {subscriptionItems.length === 1 ? 'item' : 'itens'} na assinatura
                      </p>
                      {subscriptionItems.length > 0 && (
                        <Button onClick={goToNextStep} className="mt-2 bg-green-600 hover:bg-green-700">
                          Prosseguir para Endereço
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="text-center text-gray-600 py-8">
                    <p>Nenhum produto disponível para esta área. 😥</p>
                    <Button variant="link" onClick={goToPrevStep}>Mudar empresa</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_ADDRESS && (
             <Card className="shadow-lg border-amber-200">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                      <MapPin className="w-5 h-5" /> 4. Endereço de Entrega
                  </CardTitle>
                  <CardDescription>Confirme ou preencha o endereço para receber seus produtos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Rua *</Label><Input value={formData.delivery_address.street} onChange={(e) => handleInputChange('delivery_address.street', e.target.value)} required/></div>
                    <div className="space-y-2"><Label>Número *</Label><Input value={formData.delivery_address.number} onChange={(e) => handleInputChange('delivery_address.number', e.target.value)} required/></div>
                    <div className="space-y-2"><Label>Complemento</Label><Input value={formData.delivery_address.complement} onChange={(e) => handleInputChange('delivery_address.complement', e.target.value)}/></div>
                    <div className="space-y-2"><Label>CEP *</Label><Input value={formData.delivery_address.zip_code} onChange={(e) => handleInputChange('delivery_address.zip_code', e.target.value)} required/></div>
                    <div className="space-y-2 md:col-span-2"><Label>Ponto de Referência</Label><Input value={formData.delivery_address.reference} onChange={(e) => handleInputChange('delivery_address.reference', e.target.value)}/></div>
                </div>
                <div className="mt-6 flex justify-between col-span-full">
                  <Button variant="outline" onClick={goToPrevStep}>Voltar para Produtos</Button>
                  <Button onClick={goToNextStep} className="bg-green-600 hover:bg-green-700">
                    Ir para Resumo e Pagamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === STEP_SUMMARY && (
            <Card className="shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                    <ShoppingCart className="w-5 h-5" />
                    5. Resumo da Assinatura
                </CardTitle>
                <CardDescription>Confira os detalhes e prossiga para o pagamento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscriptionItems.length > 0 ? (
                  <div className="space-y-4">
                    {subscriptionItems.map(item => {
                      const itemWeeklySubtotal = calculateItemWeeklySubtotal(item);
                      return (
                        <div key={item.temp_id || item.product_id} className="text-sm p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                          <div className="font-bold text-base text-amber-900 flex justify-between items-start">
                            <span>{item.product.name}</span>
                            <span className="text-green-600">{formatCurrency(itemWeeklySubtotal)}/semana</span>
                          </div>
                          <div className="mt-2 space-y-1 text-amber-800">
                            <p>
                              <span className="font-medium">Quantidade:</span> {item.quantity_per_delivery} {UNIT_TYPE_LABELS[item.product.unit_type] || item.product.unit_type}
                            </p>
                            <p>
                              <span className="font-medium">Frequência:</span> {formatFrequencyDetails(item)}
                            </p>
                            <p className="text-xs text-amber-600">
                              (Preço unitário: {formatCurrency(item.unit_price)})
                            </p>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => { handleEditProductInCart(item.product_id); setCurrentStep(STEP_PRODUCTS); }} // Navigate back to products to edit
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeProductFromSubscription(item.product_id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">
                        <p>Sua assinatura está vazia.</p>
                        <Button variant="link" onClick={() => setCurrentStep(STEP_PRODUCTS)}>Adicionar produtos</Button>
                    </div>
                )}
                
                {subscriptionItems.length > 0 && (
                    <div className="pt-4 border-t-2 border-amber-200 space-y-3">
                      <div className="flex justify-between items-center text-lg">
                        <h4 className="font-medium text-amber-900">Total Semanal (Aprox.)</h4>
                        <p className="font-bold text-green-700">{formatCurrency(calculateTotal())}</p>
                      </div>
                      {selectedArea?.delivery_fee > 0 && (
                        <p className="text-sm text-amber-600 text-right">
                          + {formatCurrency(selectedArea.delivery_fee)} de taxa por entrega.
                        </p>
                      )}
                    </div>
                )}
              </CardContent>
              <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4">
                 <Button variant="outline" onClick={goToPrevStep}>Voltar para Endereço</Button>
                 <Button 
                  onClick={handleCreateSubscription} 
                  disabled={isCreating || subscriptionItems.length === 0} 
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700"
                  size="lg"
                >
                  {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : `Assinar e Pagar ${formatCurrency(calculateTotal())}/semana`}
                </Button>
              </CardFooter>
            </Card>
          )}
      </div>

      {/* --- Modal de Configuração de Produto --- */}
      {configuringItem && (
        <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>
                      {subscriptionItems.some(item => item.product_id === configuringItem.product_id) 
                        ? `Editar ${configuringItem.product.name}` 
                        : `Configurar ${configuringItem.product.name}`}
                    </DialogTitle>
                    <DialogDescription>
                        Defina a frequência e a quantidade para este produto.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-2">
                        <Label>Frequência da Entrega</Label>
                        <Select 
                            value={configuringItem.frequency} 
                            onValueChange={(value) => handleConfigItemChange('frequency', value)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="bi-weekly">Quinzenal</SelectItem>
                                <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Dias de entrega</Label>
                        {configuringItem.frequency === 'weekly' && (
                            <div className="grid grid-cols-4 gap-2">
                              {DAYS_OF_WEEK.map((day) => (
                                <div key={day.value} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={`config-${day.value}`} 
                                    checked={configuringItem.delivery_days.includes(day.value)} 
                                    onCheckedChange={() => handleConfigItemChange('delivery_days', day.value)} 
                                    disabled={!configuringItem.product.available_days?.includes(day.value)}
                                  />
                                  <Label 
                                    htmlFor={`config-${day.value}`} 
                                    className={`cursor-pointer text-sm ${!configuringItem.product.available_days?.includes(day.value) ? 'text-gray-400' : ''}`}
                                  >
                                    {day.label.substring(0, 3)}
                                  </Label>
                                </div>
                              ))}
                            </div>
                        )}
                        {configuringItem.frequency === 'bi-weekly' && (
                             <Select value={configuringItem.biweekly_delivery_day || ""} onValueChange={(value) => handleConfigItemChange('biweekly_delivery_day', value)}>
                                <SelectTrigger><SelectValue placeholder="Escolha o dia da semana..." /></SelectTrigger>
                                <SelectContent>
                                    {DAYS_OF_WEEK.filter(d => configuringItem.product.available_days?.includes(d.value)).map(day => (
                                        <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {configuringItem.frequency === 'monthly' && (
                            <Select value={configuringItem.monthly_delivery_day || ""} onValueChange={(value) => handleConfigItemChange('monthly_delivery_day', parseInt(value))}>
                                <SelectTrigger><SelectValue placeholder="Escolha o dia do mês..." /></SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                                        <SelectItem key={day} value={day}>{`Dia ${day}`}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Quantidade por entrega ({UNIT_TYPE_LABELS[configuringItem.product.unit_type] || configuringItem.product.unit_type})</Label>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleConfigItemChange('quantity_per_delivery', configuringItem.quantity_per_delivery - (getQuantityStep(configuringItem.product.unit_type)))}>
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            step={getQuantityStep(configuringItem.product.unit_type)}
                            min={getMinQuantity(configuringItem.product)}
                            max={configuringItem.product.maximum_quantity || 1000}
                            value={configuringItem.quantity_per_delivery}
                            onChange={(e) => handleConfigItemChange('quantity_per_delivery', e.target.value)}
                            className="w-24 text-center"
                          />
                          <Button variant="outline" size="sm" onClick={() => handleConfigItemChange('quantity_per_delivery', configuringItem.quantity_per_delivery + (getQuantityStep(configuringItem.product.unit_type)))}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleConfirmConfiguredItem}>
                      {subscriptionItems.some(item => item.product_id === configuringItem.product_id) 
                        ? 'Salvar Alterações' 
                        : 'Adicionar à Assinatura'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
