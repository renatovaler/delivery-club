
import React, { useState, useEffect, useMemo } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { DeliveryArea } from "@/api/entities";
import { Product } from "@/api/entities";
import { Service } from "@/api/entities";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShoppingCart,
  MapPin,
  Loader2,
  Package,
  Trash2,
  Building2,
  Store,
  Cake,
  UtensilsCrossed,
  Pill,
  Box,
  Edit,
  CheckCircle,
  Wrench,
  ArrowLeft,
  Plus,
  Minus,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/layout";
import { formatCurrency, createNotification, DAYS_OF_WEEK, PRODUCT_CATEGORIES } from "@/components/lib";
import { createCheckoutSession } from "@/api/functions";
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
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [seekingType, setSeekingType] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Step 1: Neighborhood selection
  const [allCityAreas, setAllCityAreas] = useState([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [allBusinessesInCity, setAllBusinessesInCity] = useState([]);
  const [allItemsInCity, setAllItemsInCity] = useState([]);
  
  // Step 2: Business selection
  const [businessCategory, setBusinessCategory] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Step 3: Item selection
  const [subscriptionItems, setSubscriptionItems] = useState([]);
  const [selectedItemsMap, setSelectedItemsMap] = useState({});
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configuringItem, setConfiguringItem] = useState(null);

  // Step 4: Address
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "", reference: ""
  });

  useEffect(() => {
    if (user?.address) {
      setDeliveryAddress({ ...user.address, reference: "" });
    }
  }, [user]);

  useEffect(() => {
    if (step === 1 && seekingType && user?.default_location) {
      loadNeighborhoodsAndBusinesses();
    }
  }, [step, seekingType, user?.default_location]);

  const resetStepData = (targetStep) => {
    switch(targetStep) {
        case 0:
            setSeekingType(null);
            // fallthrough
        case 1:
            setAllCityAreas([]);
            setAvailableNeighborhoods([]);
            setAllBusinessesInCity([]);
            setAllItemsInCity([]);
            setSelectedNeighborhood('');
            // fallthrough
        case 2:
            setBusinessCategory('all');
            setSelectedTeam(null);
            // fallthrough
        case 3:
            setSubscriptionItems([]);
            setSelectedItemsMap({});
            setConfiguringItem(null);
            setIsConfigModalOpen(false);
            break;
    }
  };

  const handleNextStep = () => {
    const nextStep = step + 1;
    if (nextStep > 1) {
      resetStepData(nextStep);
    }
    setStep(nextStep);
  };
  
  const handlePrevStep = () => {
    resetStepData(step);
    setStep(prev => prev - 1);
  };
  
  const loadNeighborhoodsAndBusinesses = async () => {
    setIsLoading(true);
    try {
        const { state, city } = user.default_location;
        console.log("🔍 Buscando em:", { state, city, seekingType });
        
        const areas = await DeliveryArea.filter({ state, city, status: 'active' });
        setAllCityAreas(areas);
        console.log("📍 Áreas encontradas:", areas.length, areas);
        
        if (areas.length === 0) {
            toast({ 
                title: "Sem cobertura", 
                description: `Nenhuma área de entrega encontrada em ${city}, ${state}.`, 
                variant: "destructive" 
            });
            return;
        }

        const areaIds = areas.map(a => a.id);
        console.log("🗺️ IDs das áreas:", areaIds);
        
        const allTeams = await Team.filter({ status: 'active' });
        console.log("🏢 Empresas ativas encontradas:", allTeams.length);
        
        const validTeams = allTeams.filter(team => {
            console.log(`🔍 Verificando empresa ${team.name}:`, {
                id: team.id,
                offering_type: team.offering_type,
                subscription_status: team.subscription_status,
                has_stripe_keys: !!(team.stripe_public_key && team.stripe_secret_key)
            });

            const allowedStatuses = ['active', 'trial'];
            if (!allowedStatuses.includes(team.subscription_status)) {
                console.log(`❌ ${team.name} - Status inválido:`, team.subscription_status);
                return false;
            }

            const offeringType = team.offering_type || 'products';
            if (!(offeringType === 'both' || offeringType === seekingType)) {
                console.log(`❌ ${team.name} - Tipo de oferta incompatível:`, offeringType, 'vs', seekingType);
                return false;
            }

            if (!team.stripe_public_key?.trim() || !team.stripe_secret_key?.trim()) {
                console.log(`❌ ${team.name} - Sem chaves do Stripe`);
                return false;
            }

            console.log(`✅ ${team.name} - Empresa válida`);
            return true;
        });

        console.log("✅ Empresas válidas:", validTeams.length, validTeams.map(t => t.name));

        if (validTeams.length === 0) {
            toast({ 
                title: "Sem empresas", 
                description: `Nenhuma empresa oferece ${seekingType === 'products' ? 'produtos' : 'serviços'}.`, 
                variant: "destructive" 
            });
            return;
        }

        const itemModel = seekingType === 'products' ? Product : Service;
        const validTeamIds = validTeams.map(t => t.id);
        
        console.log("🔍 Buscando itens para empresas:", validTeamIds);
        
        const allItems = await itemModel.filter({ 
            team_id: { "$in": validTeamIds }, 
            status: 'active' 
        });

        console.log("📦 Itens encontrados:", allItems.length);
        allItems.forEach(item => {
            console.log(`📦 ${item.name} (${item.team_id}) - Áreas:`, item.available_area_ids);
        });

        if (allItems.length === 0) {
            toast({ 
                title: "Sem itens", 
                description: `Nenhum ${seekingType === 'products' ? 'produto' : 'serviço'} cadastrado pelas empresas.`, 
                variant: "destructive" 
            });
            return;
        }

        const itemsInCity = allItems.filter(item => {
            const hasAreasInCity = item.available_area_ids && 
                item.available_area_ids.some(areaId => areaIds.includes(areaId));
            
            if (hasAreasInCity) {
                console.log(`✅ ${item.name} atende a cidade`);
            } else {
                console.log(`❌ ${item.name} não atende a cidade. Áreas do item:`, item.available_area_ids, 'vs áreas da cidade:', areaIds);
            }
            
            return hasAreasInCity;
        });

        console.log("🎯 Itens que atendem a cidade:", itemsInCity.length);

        if (itemsInCity.length === 0) {
            toast({ 
                title: "Sem cobertura", 
                description: `Nenhum ${seekingType === 'products' ? 'produto' : 'serviço'} disponível em ${city}, ${state}.`, 
                variant: "destructive" 
            });
            return;
        }

        const teamsWithItemsInCity = validTeams.filter(team => {
            const hasItems = itemsInCity.some(item => item.team_id === team.id);
            console.log(`${team.name} tem itens na cidade:`, hasItems);
            return hasItems;
        });

        console.log("🏪 Empresas com itens na cidade:", teamsWithItemsInCity.length, teamsWithItemsInCity.map(t => t.name));

        const areaMap = areas.reduce((acc, area) => {
            if (!acc[area.neighborhood]) acc[area.neighborhood] = [];
            acc[area.neighborhood].push(area.id);
            return acc;
        }, {});

        console.log("🗺️ Mapa de áreas por bairro:", areaMap);

        const neighborhoodsWithService = Object.keys(areaMap).filter(neighborhood => {
            const neighborhoodAreaIds = new Set(areaMap[neighborhood]);
            return itemsInCity.some(item => 
                item.available_area_ids?.some(areaId => neighborhoodAreaIds.has(areaId))
            );
        }).sort();

        console.log("🏘️ Bairros com serviço:", neighborhoodsWithService);

        setAllItemsInCity(itemsInCity);
        setAllBusinessesInCity(teamsWithItemsInCity);
        setAvailableNeighborhoods(neighborhoodsWithService);

        console.log("💾 Dados salvos no estado:", {
            items: itemsInCity.length,
            businesses: teamsWithItemsInCity.length,
            neighborhoods: neighborhoodsWithService.length
        });

        if (neighborhoodsWithService.length === 0) {
            toast({ 
                title: "Sem cobertura por bairro", 
                description: `Nenhum bairro em ${city} tem ${seekingType === 'products' ? 'produtos' : 'serviços'} disponíveis.`, 
                variant: "destructive" 
            });
        } else {
            console.log("✅ Sucesso! Dados carregados:", {
                neighborhoods: neighborhoodsWithService.length,
                businesses: teamsWithItemsInCity.length,
                items: itemsInCity.length
            });
        }

    } catch(error) {
        console.error("❌ Erro ao carregar dados:", error);
        toast({ 
            title: "Erro ao carregar dados", 
            description: "Ocorreu um erro ao buscar empresas e produtos. Tente novamente.", 
            variant: "destructive" 
        });
    } finally {
        setIsLoading(false);
    }
  };

  const businessesForNeighborhood = useMemo(() => {
    if (!selectedNeighborhood || !allCityAreas.length || !allItemsInCity.length) return [];
  
    const neighborhoodAreaIds = new Set(
      allCityAreas
        .filter(a => a.neighborhood === selectedNeighborhood)
        .map(a => a.id)
    );
  
    const itemsInNeighborhood = allItemsInCity.filter(item =>
      item.available_area_ids?.some(id => neighborhoodAreaIds.has(id))
    );
  
    const teamIdsInNeighborhood = new Set(
      itemsInNeighborhood.map(item => item.team_id)
    );
  
    return allBusinessesInCity.filter(team => teamIdsInNeighborhood.has(team.id));
  }, [selectedNeighborhood, allCityAreas, allItemsInCity, allBusinessesInCity]);

  const availableCategories = useMemo(() => {
    if (!businessesForNeighborhood.length) return [{ value: 'all', label: 'Todos', icon: Store }];
    
    const categories = [...new Set(businessesForNeighborhood.map(b => b.category))];
    const availableCategoryFilters = BUSINESS_CATEGORIES.filter(
      cat => cat.value === 'all' || categories.includes(cat.value)
    );
    
    return availableCategoryFilters;
  }, [businessesForNeighborhood]);

  const filteredBusinesses = useMemo(() => {
    if (businessCategory === 'all') return businessesForNeighborhood;
    return businessesForNeighborhood.filter(b => b.category === businessCategory);
  }, [businessesForNeighborhood, businessCategory]);

  const itemsForSelectedTeam = useMemo(() => {
    if (!selectedTeam) return [];
    return allItemsInCity.filter(item => item.team_id === selectedTeam.id);
  }, [selectedTeam, allItemsInCity]);

  const handleOpenConfigModal = (item) => {
    const existingConfig = selectedItemsMap[item.id];
    setConfiguringItem({
      ...item,
      frequency: existingConfig?.frequency || 'weekly',
      delivery_days: existingConfig?.delivery_days || [],
      biweekly_delivery_day: existingConfig?.biweekly_delivery_day || 'monday',
      monthly_delivery_day: existingConfig?.monthly_delivery_day || 1,
      quantity_per_delivery: existingConfig?.quantity_per_delivery || getMinQuantity(item)
    });
    setIsConfigModalOpen(true);
  };

  const handleEditItemInCart = (cartItem) => {
    const originalItem = allItemsInCity.find(item => item.itemId === cartItem.itemId || item.id === cartItem.itemId);
    if (originalItem) {
      setConfiguringItem({
        ...originalItem,
        frequency: cartItem.frequency,
        delivery_days: cartItem.delivery_days,
        biweekly_delivery_day: cartItem.biweekly_delivery_day,
        monthly_delivery_day: cartItem.monthly_delivery_day,
        quantity_per_delivery: cartItem.quantity_per_delivery
      });
      setIsConfigModalOpen(true);
    }
  };

  const handleConfigItemChange = (field, value) => {
    setConfiguringItem(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirmConfiguredItem = () => {
    if (!configuringItem) return;

    const newConfig = {
      frequency: configuringItem.frequency,
      delivery_days: configuringItem.delivery_days,
      biweekly_delivery_day: configuringItem.biweekly_delivery_day,
      monthly_delivery_day: configuringItem.monthly_delivery_day,
      quantity_per_delivery: configuringItem.quantity_per_delivery
    };

    setSelectedItemsMap(prev => ({
      ...prev,
      [configuringItem.id]: newConfig
    }));

    const monthlySubtotal = calculateItemMonthlySubtotal(configuringItem, newConfig);
    const pricePerUnit = seekingType === 'products' ? configuringItem.price_per_unit : configuringItem.price_per_session;

    const newCartItem = {
      itemId: configuringItem.id,
      name: configuringItem.name,
      type: seekingType === 'products' ? 'product' : 'service',
      unitPrice: pricePerUnit,
      ...newConfig,
      monthlySubtotal
    };

    setSubscriptionItems(prev => {
      const existing = prev.find(item => item.itemId === configuringItem.id);
      if (existing) {
        return prev.map(item => item.itemId === configuringItem.id ? newCartItem : item);
      } else {
        return [...prev, newCartItem];
      }
    });

    setIsConfigModalOpen(false);
    setConfiguringItem(null);
  };

  const removeItemFromSubscription = (itemId) => {
    setSubscriptionItems(prev => prev.filter(item => item.itemId !== itemId));
    setSelectedItemsMap(prev => {
      const newMap = { ...prev };
      delete newMap[itemId];
      return newMap;
    });
  };

  const calculateTotal = () => {
    return subscriptionItems.reduce((sum, item) => sum + item.monthlySubtotal, 0);
  };

  const formatFrequencyDetails = (item) => {
    if (item.frequency === 'weekly') {
      const dayLabels = item.delivery_days.map(day => 
        DAYS_OF_WEEK.find(d => d.value === day)?.label || day
      );
      return `Toda semana (${dayLabels.join(', ')})`;
    } else if (item.frequency === 'bi-weekly') {
      const dayLabel = DAYS_OF_WEEK.find(d => d.value === item.biweekly_delivery_day)?.label || item.biweekly_delivery_day;
      return `A cada 2 semanas (${dayLabel})`;
    } else if (item.frequency === 'monthly') {
      return `Todo mês (dia ${item.monthly_delivery_day})`;
    }
    return '';
  };

  const calculateItemMonthlySubtotal = (item, config) => {
    const pricePerUnit = seekingType === 'products' ? item.price_per_unit : item.price_per_session;
    
    // Average weeks per month: 52 weeks / 12 months = 4.333
    // Average bi-weeks per month: 26 bi-weeks / 12 months = 2.166
    if (config.frequency === 'weekly') {
      return config.delivery_days.length * config.quantity_per_delivery * pricePerUnit * (52 / 12);
    } else if (config.frequency === 'bi-weekly') {
      return (config.quantity_per_delivery * pricePerUnit) * (26 / 12);
    } else if (config.frequency === 'monthly') {
      return config.quantity_per_delivery * pricePerUnit;
    }
    return 0;
  };

  const getMinQuantity = (item) => {
    return seekingType === 'products' ? (item.minimum_quantity || 1) : 1;
  };

  const getQuantityStep = (item) => {
    return seekingType === 'products' ? 1 : 1;
  };

  const handleCreateSubscription = async () => {
    if (subscriptionItems.length === 0) {
      toast({ title: "Nenhum item selecionado", description: "Adicione pelo menos um item à sua assinatura.", variant: "destructive" });
      return;
    }

    const requiredFields = ['street', 'number', 'zip_code'];
    const missingFields = requiredFields.filter(field => !deliveryAddress[field]?.trim());
    if (missingFields.length > 0) {
      toast({ title: "Endereço incompleto", description: "Preencha todos os campos obrigatórios do endereço.", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const monthlyTotal = calculateTotal();
      
      // Find the delivery area ID that matches the selected neighborhood AND the selected team serves
      // 1. Get all area IDs for the selected neighborhood
      const neighborhoodAreaIds = allCityAreas
        .filter(area => area.neighborhood === selectedNeighborhood)
        .map(area => area.id);

      // 2. Get all unique area IDs that the selected team's items are available in
      const teamAvailableAreaIds = new Set();
      itemsForSelectedTeam.forEach(item => {
        item.available_area_ids?.forEach(areaId => teamAvailableAreaIds.add(areaId));
      });

      // 3. Find an area ID that is common to both the neighborhood and the team's service areas
      const selectedDeliveryAreaId = neighborhoodAreaIds.find(areaId => teamAvailableAreaIds.has(areaId));

      if (!selectedDeliveryAreaId) {
        toast({ 
          title: "Erro na área de entrega", 
          description: "Não foi possível encontrar uma área de entrega válida para este bairro e empresa.", 
          variant: "destructive" 
        });
        setIsCreating(false);
        return;
      }
      
      // Construct the full address using the correct data
      const completeAddress = {
        street: deliveryAddress.street,
        number: deliveryAddress.number,
        complement: deliveryAddress.complement || '',
        neighborhood: selectedNeighborhood, // Use the selected neighborhood
        city: user.default_location.city,   // Use the city from default location
        state: user.default_location.state, // Use the state from default location
        zip_code: deliveryAddress.zip_code,
        reference: deliveryAddress.reference || ''
      };

      // Calculate next billing date (30 days from start date)
      const startDate = new Date();
      const nextBillingDate = new Date(startDate);
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);

      const subscriptionData = {
        customer_id: user.id,
        team_id: selectedTeam.id,
        delivery_area_id: selectedDeliveryAreaId, // Add the delivery area ID
        delivery_address: completeAddress,
        monthly_price: monthlyTotal, // Changed from weekly_price to monthly_price
        status: 'pending_payment',
        start_date: startDate.toISOString().split('T')[0],
        next_billing_date: nextBillingDate.toISOString().split('T')[0] // Added next_billing_date
      };

      const newSubscription = await Subscription.create(subscriptionData);

      for (const item of subscriptionItems) {
        const itemData = {
          subscription_id: newSubscription.id,
          frequency: item.frequency,
          delivery_days: item.delivery_days,
          biweekly_delivery_day: item.biweekly_delivery_day,
          monthly_delivery_day: item.monthly_delivery_day,
          quantity_per_delivery: item.quantity_per_delivery,
          unit_price: item.unitPrice,
          monthly_subtotal: item.monthlySubtotal // Changed from weekly_subtotal to monthly_subtotal
        };

        if (seekingType === 'products') {
          itemData.product_id = item.itemId;
        } else {
          itemData.service_id = item.itemId;
        }

        await SubscriptionItem.create(itemData);
      }

      const { data } = await createCheckoutSession({
        amount: Math.round(monthlyTotal * 100), // Use monthlyTotal
        description: `Assinatura mensal - ${selectedTeam.name}`, // Updated description
        success_url: window.location.origin + createPageUrl("MySubscriptions?payment=success"),
        cancel_url: window.location.href,
        metadata: {
          type: 'subscription_payment',
          subscription_id: newSubscription.id,
          customer_id: user.id,
          team_id: selectedTeam.id
        }
      });

      if (data.url) {
        window.location.href = data.url;
      }

    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      toast({ title: "Erro ao criar assinatura", description: "Tente novamente em alguns instantes.", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };
  
  const getItemsByCategory = (items) => {
    return items.reduce((acc, item) => {
      const category = item.category || (seekingType === 'services' ? 'serviço' : 'outros');
      (acc[category] = acc[category] || []).push(item);
      return acc;
    }, {});
  };

  const getItemCategoryLabel = (category) => {
    if (seekingType === 'products') {
      return PRODUCT_CATEGORIES.find(c => c.value === category)?.label || category;
    }
    return category;
  };
  
  const getItemCategoryIcon = (category) => {
    if (seekingType === 'products') {
      const categoryData = PRODUCT_CATEGORIES.find(c => c.value === category);
      return categoryData?.icon || '📦';
    }
    return '🔧';
  };

  const isNextDisabled = () => {
    if (isCreating || isLoading) return true;
    if (step === 0) return !seekingType;
    if (step === 1) return !selectedNeighborhood;
    if (step === 2) return !selectedTeam;
    if (step === 3) return subscriptionItems.length === 0;
    const requiredAddressFields = ['street', 'number', 'zip_code'];
    if (step === 4) return requiredAddressFields.some(field => !deliveryAddress[field]?.trim());
    return false;
  };

  // DEBUG: Log do estado atual (removed from final output per instructions)
  // console.log("🔍 Estado atual:", {
  //   step,
  //   seekingType,
  //   isLoading,
  //   availableNeighborhoods: availableNeighborhoods.length,
  //   allBusinessesInCity: allBusinessesInCity.length,
  //   allItemsInCity: allItemsInCity.length
  // });

  if (!user?.default_location) {
    return (
      <div className="w-full p-6 md:p-8">
        <Alert variant="default" className="max-w-xl mx-auto border-blue-200 bg-blue-50">
          <MapPin className="h-5 w-5 text-blue-600" />
          <AlertTitle className="font-bold text-blue-800">Defina sua localização</AlertTitle>
          <AlertDescription className="text-blue-700">
            Para começar, por favor, clique no ícone de localização no topo da página e defina sua cidade padrão para encontrarmos as melhores opções para você.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("CustomerDashboard")}>
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Nova Assinatura</h1>
          <p className="text-gray-600">Configure sua entrega personalizada em {user.default_location.city}</p>
          <div className="flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">Cobrança mensal • Entregas conforme configurado</span>
          </div>
        </div>
      </div>
      
      {/* Step 0: Type Selection */}
      {step === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-center text-slate-900">O que você busca?</CardTitle>
                <CardDescription className="text-center">Selecione se deseja assinar produtos ou serviços.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${seekingType === 'products' ? 'border-blue-500 border-2 shadow-xl' : 'border-slate-200'}`}
                  onClick={() => setSeekingType('products')}
                >
                  <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold">Produtos</h4>
                    <p className="text-sm text-gray-600">Receba itens físicos em casa periodicamente.</p>
                  </CardContent>
                </Card>
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${seekingType === 'services' ? 'border-blue-500 border-2 shadow-xl' : 'border-slate-200'}`}
                  onClick={() => setSeekingType('services')}
                >
                  <CardContent className="p-6 text-center">
                    <Wrench className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold">Serviços</h4>
                    <p className="text-sm text-gray-600">Agende serviços recorrentes para sua casa ou empresa.</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </motion.div>
      )}

      {/* Step 1: Neighborhood Selection */}
      {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>1. Selecione seu Bairro</CardTitle>
                <CardDescription>Apenas bairros com cobertura de {seekingType === 'products' ? 'produtos' : 'serviços'} são exibidos.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                    <span className="ml-2 text-slate-600">Carregando bairros...</span>
                  </div>
                ) : availableNeighborhoods.length > 0 ? (
                      <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um bairro..." />
                          </SelectTrigger>
                          <SelectContent>
                              {availableNeighborhoods.map(neighborhood => (
                                <SelectItem key={neighborhood} value={neighborhood}>
                                  {neighborhood}
                                </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">
                          Nenhuma empresa atende sua cidade para o tipo de item selecionado.
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                          Tente alterar sua localização padrão ou escolher outro tipo de item.
                        </p>
                      </div>
                    )}
              </CardContent>
            </Card>
          </motion.div>
      )}
      
      {/* Step 2: Business Selection */}
      {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>2. Selecione a Empresa</CardTitle>
                <CardDescription>Empresas disponíveis no bairro {selectedNeighborhood}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {businessesForNeighborhood.length > 0 && (
                    <div>
                        <Label>Filtrar por Categoria de Negócio</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                           {availableCategories.map(category => (
                             <Button
                               key={category.value}
                               variant={businessCategory === category.value ? "default" : "outline"}
                               size="sm"
                               onClick={() => setBusinessCategory(category.value)}
                               className="flex items-center gap-1"
                             >
                               <category.icon className="w-4 h-4" />
                               {category.label}
                             </Button>
                           ))}
                        </div>
                    </div>
                )}
                
                <div className="max-h-96 overflow-y-auto border rounded-lg bg-gray-50/50 p-3 space-y-3">
                    {filteredBusinesses.map(team => (
                        <div key={team.id} onClick={() => setSelectedTeam(team)}
                             className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedTeam?.id === team.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-slate-900">{team.name}</h4>
                                <p className="text-sm text-gray-600">{team.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{BUSINESS_CATEGORIES.find(c => c.value === team.category)?.label || team.category}</Badge>
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    {team.address?.neighborhood}, {team.address?.city}
                                  </div>
                                </div>
                              </div>
                              {selectedTeam?.id === team.id && <CheckCircle className="w-6 h-6 text-blue-500" />}
                            </div>
                        </div>
                    ))}
                    {filteredBusinesses.length === 0 && businessesForNeighborhood.length > 0 && (
                      <div className="text-center text-slate-500 py-4">
                        Nenhuma empresa encontrada para esta categoria.
                        <br />
                        <Button 
                          variant="link" 
                          onClick={() => setBusinessCategory('all')} 
                          className="text-blue-600 p-0 h-auto mt-2"
                        >
                          Ver todas as empresas
                        </Button>
                      </div>
                    )}
                    {businessesForNeighborhood.length === 0 && (
                      <div className="text-center text-slate-500 py-4">
                        Nenhuma empresa encontrada neste bairro.
                      </div>
                    )}
                </div>

              </CardContent>
            </Card>
          </motion.div>
      )}

      {/* Step 3: Item Selection */}
      {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="shadow-lg border-0">
                <CardHeader>
                    <CardTitle>3. Monte sua Assinatura</CardTitle>
                    <CardDescription>Adicione e configure os itens que deseja de {selectedTeam.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <h4 className="font-semibold mb-4">Itens Disponíveis</h4>
                            {Object.entries(getItemsByCategory(itemsForSelectedTeam)).map(([category, items]) => (
                                <div key={category} className="mb-6">
                                    <h5 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                                        <span className="text-lg">{getItemCategoryIcon(category)}</span>
                                        {getItemCategoryLabel(category)}
                                    </h5>
                                    <div className="grid gap-3">
                                        {items.map(item => (
                                            <Card key={item.id} className="border border-slate-200">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h6 className="font-medium text-slate-900">{item.name}</h6>
                                                            <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                                                            <div className="mt-2">
                                                                <span className="font-bold text-green-600">
                                                                    {formatCurrency(seekingType === 'products' ? item.price_per_unit : item.price_per_session)}
                                                                    {seekingType === 'products' && `/${UNIT_TYPE_LABELS[item.unit_type] || item.unit_type}`}
                                                                    {seekingType === 'services' && '/sessão'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            {selectedItemsMap[item.id] ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleOpenConfigModal(item)}
                                                                    className="border-blue-500 text-blue-600"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleOpenConfigModal(item)}
                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {itemsForSelectedTeam.length === 0 && (
                                <p className="text-center text-slate-500 py-8">Nenhum item disponível para esta empresa.</p>
                            )}
                        </div>
                        
                        <div>
                            <h4 className="font-semibold mb-4">Sua Assinatura</h4>
                            <Card className="border border-slate-200">
                                <CardContent className="p-4">
                                    {subscriptionItems.length === 0 ? (
                                        <p className="text-center text-slate-500 py-4">Nenhum item adicionado</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {subscriptionItems.map(item => (
                                                <div key={item.itemId} className="border-b border-slate-100 pb-3 last:border-b-0">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <h6 className="font-medium text-sm">{item.name}</h6>
                                                            <p className="text-xs text-slate-600">{formatFrequencyDetails(item)}</p>
                                                            <p className="text-xs text-slate-600">Qtd: {item.quantity_per_delivery}</p>
                                                            <p className="font-bold text-green-600 text-sm">{formatCurrency(item.monthlySubtotal)}/mês</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEditItemInCart(item)}
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => removeItemFromSubscription(item.itemId)}
                                                            >
                                                                <Trash2 className="w-3 h-3 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="pt-3 border-t border-slate-200">
                                                <div className="flex justify-between items-center font-bold">
                                                    <span>Total Mensal:</span>
                                                    <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </motion.div>
      )}
      
      {/* Step 4: Address */}
      {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>4. Endereço de Entrega</CardTitle>
                <CardDescription>Confirme ou atualize seu endereço para entrega. O bairro deve estar dentro da área selecionada ({selectedNeighborhood}).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={deliveryAddress.number}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, number: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={selectedNeighborhood}
                      readOnly
                      className="bg-slate-50 text-slate-700"
                      title="O bairro é definido pela área de cobertura selecionada"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      value={user?.default_location?.city || ''}
                      readOnly
                      className="bg-slate-50 text-slate-700"
                      title="A cidade é baseada na sua localização padrão"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado *</Label>
                    <Input
                      id="state"
                      value={user?.default_location?.state || ''}
                      readOnly
                      className="bg-slate-50 text-slate-700"
                      title="O estado é baseado na sua localização padrão"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip_code">CEP *</Label>
                    <Input
                      id="zip_code"
                      value={deliveryAddress.zip_code}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, zip_code: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={deliveryAddress.complement}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, complement: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="reference">Ponto de Referência</Label>
                    <Textarea
                      id="reference"
                      value={deliveryAddress.reference}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder="Ex: Portão azul, próximo ao mercado..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
      )}
      
      {/* Step 5: Summary */}
      {step === 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>5. Resumo da Assinatura</CardTitle>
                <CardDescription>Revise todos os detalhes antes de finalizar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Empresa:</h4>
                  <p>{selectedTeam?.name}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Itens da Assinatura:</h4>
                  <div className="space-y-2">
                    {subscriptionItems.map(item => (
                      <div key={item.itemId} className="flex justify-between">
                        <span>{item.name} - {formatFrequencyDetails(item)} (Qtd: {item.quantity_per_delivery})</span>
                        <span>{formatCurrency(item.monthlySubtotal)}/mês</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 font-bold flex justify-between">
                      <span>Total Mensal:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Endereço de Entrega:</h4>
                  <p>{deliveryAddress.street}, {deliveryAddress.number}</p>
                  {deliveryAddress.complement && <p>{deliveryAddress.complement}</p>}
                  <p>{selectedNeighborhood}, {user.default_location.city} - {user.default_location.state}</p>
                  <p>CEP: {deliveryAddress.zip_code}</p>
                  {deliveryAddress.reference && <p>Referência: {deliveryAddress.reference}</p>}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Calendar className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Cobrança Mensal</p>
                      <p className="text-sm">Sua primeira cobrança será processada hoje. As próximas cobranças acontecerão mensalmente na mesma data.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleCreateSubscription}
                  disabled={isCreating}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isCreating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...</>
                  ) : (
                    <>Finalizar Assinatura - {formatCurrency(calculateTotal())}/mês</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 0 || isCreating}
          className="border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Voltar
        </Button>
        {step < 5 && (
          <Button
            onClick={handleNextStep}
            disabled={isNextDisabled()}
            className="bg-slate-800 hover:bg-slate-900 text-white"
          >
            Próximo
          </Button>
        )}
      </div>

      {/* Item Configuration Modal */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar {configuringItem?.name}</DialogTitle>
          </DialogHeader>
          {configuringItem && (
            <div className="space-y-4">
              <div>
                <Label>Frequência de Entrega</Label>
                <Select
                  value={configuringItem.frequency}
                  onValueChange={(value) => handleConfigItemChange('frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="bi-weekly">Quinzenal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {configuringItem.frequency === 'weekly' && (
                <div>
                  <Label>Dias da Semana</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {DAYS_OF_WEEK.map(day => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.value}
                          checked={configuringItem.delivery_days.includes(day.value)}
                          onCheckedChange={(checked) => {
                            const newDays = checked
                              ? [...configuringItem.delivery_days, day.value]
                              : configuringItem.delivery_days.filter(d => d !== day.value);
                            handleConfigItemChange('delivery_days', newDays);
                          }}
                        />
                        <Label htmlFor={day.value} className="text-sm">{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {configuringItem.frequency === 'bi-weekly' && (
                <div>
                  <Label>Dia da Semana</Label>
                  <Select
                    value={configuringItem.biweekly_delivery_day}
                    onValueChange={(value) => handleConfigItemChange('biweekly_delivery_day', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {configuringItem.frequency === 'monthly' && (
                <div>
                  <Label>Dia do Mês</Label>
                  <Select
                    value={configuringItem.monthly_delivery_day.toString()}
                    onValueChange={(value) => handleConfigItemChange('monthly_delivery_day', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                        <SelectItem key={day} value={day.toString()}>Dia {day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Quantidade por Entrega</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newQty = Math.max(
                        getMinQuantity(configuringItem),
                        configuringItem.quantity_per_delivery - getQuantityStep(configuringItem)
                      );
                      handleConfigItemChange('quantity_per_delivery', newQty);
                    }}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={configuringItem.quantity_per_delivery}
                    onChange={(e) => handleConfigItemChange('quantity_per_delivery', parseInt(e.target.value) || getMinQuantity(configuringItem))}
                    min={getMinQuantity(configuringItem)}
                    step={getQuantityStep(configuringItem)}
                    className="w-20 text-center"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newQty = configuringItem.quantity_per_delivery + getQuantityStep(configuringItem);
                      handleConfigItemChange('quantity_per_delivery', newQty);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Subtotal mensal:</strong> {formatCurrency(calculateItemMonthlySubtotal(configuringItem, configuringItem))}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmConfiguredItem}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
