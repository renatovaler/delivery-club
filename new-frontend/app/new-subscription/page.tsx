'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  ShoppingCart,
  MapPin,
  Loader2,
  Package,
  Trash2,
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
import { UserAPI, TeamAPI, ProductAPI, SubscriptionAPI, SubscriptionItemAPI } from "@/lib/api";
import { DeliveryAreaAPI } from "@/lib/api/plan";

// Constants
const BUSINESS_CATEGORIES = [
  { value: 'all', label: 'Todos', icon: Store },
  { value: 'padaria', label: 'Padarias', icon: Cake },
  { value: 'restaurante', label: 'Restaurantes', icon: UtensilsCrossed },
  { value: 'mercado', label: 'Mercados', icon: ShoppingCart },
  { value: 'farmacia', label: 'Farmácias', icon: Pill },
  { value: 'outros', label: 'Outros', icon: Box }
];

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

const UNIT_TYPE_LABELS: { [key: string]: string } = {
  "unidade": "unidades",
  "grama": "gramas",
  "quilograma": "quilos",
  "litro": "litros",
  "mililitro": "mililitros",
  "fatia": "fatias"
};

// Types
interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference?: string;
}

interface SubscriptionItem {
  itemId: string;
  name: string;
  type: 'product' | 'service';
  unitPrice: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  delivery_days: string[];
  biweekly_delivery_day?: string;
  monthly_delivery_day?: number;
  quantity_per_delivery: number;
  monthlySubtotal: number;
}

// Utility Functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function NewSubscription() {
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [seekingType, setSeekingType] = useState<'products' | 'services' | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Step 1: Neighborhood selection
  const [allCityAreas, setAllCityAreas] = useState<any[]>([]);
  const [availableNeighborhoods, setAvailableNeighborhoods] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [allBusinessesInCity, setAllBusinessesInCity] = useState<any[]>([]);
  const [allItemsInCity, setAllItemsInCity] = useState<any[]>([]);

  // Step 2: Business selection
  const [businessCategory, setBusinessCategory] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState<any>(null);

  // Step 3: Item selection
  const [subscriptionItems, setSubscriptionItems] = useState<SubscriptionItem[]>([]);
  const [selectedItemsMap, setSelectedItemsMap] = useState<{ [key: string]: any }>({});
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configuringItem, setConfiguringItem] = useState<any>(null);

  // Step 4: Address
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zip_code: "", reference: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (step === 1 && seekingType && user?.default_location) {
      loadNeighborhoodsAndBusinesses();
    }
  }, [step, seekingType, user?.default_location]);

  const loadUser = async () => {
    try {
      const userData = await UserAPI.me();
      setUser(userData);
      if (userData?.address) {
        setDeliveryAddress({ ...userData.address, reference: "" });
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const resetStepData = (targetStep: number) => {
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

      // Simular carregamento de áreas de entrega
      const areas = await DeliveryAreaAPI.list('created_date', 100).then((areas: any[]) =>
        areas.filter((area: any) => area.state === state && area.city === city && area.status === 'active')
      );
      setAllCityAreas(areas);

      if (areas.length === 0) {
        alert(`Nenhuma área de entrega encontrada em ${city}, ${state}.`);
        return;
      }

      // Carregar empresas ativas
      const allTeams = await TeamAPI.list('created_date', 100);
      const validTeams = allTeams.filter((team: any) => {
        const allowedStatuses = ['active', 'trial'];
        if (!allowedStatuses.includes(team.subscription_status)) return false;

        const offeringType = team.offering_type || 'products';
        if (!(offeringType === 'both' || offeringType === seekingType)) return false;

        return true;
      });

      if (validTeams.length === 0) {
        alert(`Nenhuma empresa oferece ${seekingType === 'products' ? 'produtos' : 'serviços'}.`);
        return;
      }

      // Carregar produtos/serviços
      const allItems = await ProductAPI.list('created_date', 100);
      const validTeamIds = validTeams.map((t: any) => t.id);

      const itemsInCity = allItems.filter((item: any) =>
        validTeamIds.includes(item.team_id) && item.status === 'active'
      );

      if (itemsInCity.length === 0) {
        alert(`Nenhum ${seekingType === 'products' ? 'produto' : 'serviço'} cadastrado pelas empresas.`);
        return;
      }

      const teamsWithItemsInCity = validTeams.filter((team: any) =>
        itemsInCity.some((item: any) => item.team_id === team.id)
      );

      // Simular bairros disponíveis
      const neighborhoodsWithService = [...new Set(areas.map((area: any) => area.neighborhood))].sort();

      setAllItemsInCity(itemsInCity);
      setAllBusinessesInCity(teamsWithItemsInCity);
      setAvailableNeighborhoods(neighborhoodsWithService);

    } catch(error) {
      console.error("Erro ao carregar dados:", error);
      alert("Ocorreu um erro ao buscar empresas e produtos. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const businessesForNeighborhood = useMemo(() => {
    if (!selectedNeighborhood || !allBusinessesInCity.length) return [];
    return allBusinessesInCity;
  }, [selectedNeighborhood, allBusinessesInCity]);

  const availableCategories = useMemo(() => {
    if (!businessesForNeighborhood.length) return [{ value: 'all', label: 'Todos', icon: Store }];

    const categories = [...new Set(businessesForNeighborhood.map((b: any) => b.category))];
    const availableCategoryFilters = BUSINESS_CATEGORIES.filter(
      cat => cat.value === 'all' || categories.includes(cat.value)
    );

    return availableCategoryFilters;
  }, [businessesForNeighborhood]);

  const filteredBusinesses = useMemo(() => {
    if (businessCategory === 'all') return businessesForNeighborhood;
    return businessesForNeighborhood.filter((b: any) => b.category === businessCategory);
  }, [businessesForNeighborhood, businessCategory]);

  const itemsForSelectedTeam = useMemo(() => {
    if (!selectedTeam) return [];
    return allItemsInCity.filter((item: any) => item.team_id === selectedTeam.id);
  }, [selectedTeam, allItemsInCity]);

  const handleOpenConfigModal = (item: any) => {
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

  const handleConfigItemChange = (field: string, value: any) => {
    setConfiguringItem((prev: any) => ({ ...prev, [field]: value }));
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

    const newCartItem: SubscriptionItem = {
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

  const removeItemFromSubscription = (itemId: string) => {
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

  const formatFrequencyDetails = (item: SubscriptionItem) => {
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

  const calculateItemMonthlySubtotal = (item: any, config: any) => {
    const pricePerUnit = seekingType === 'products' ? item.price_per_unit : item.price_per_session;

    if (config.frequency === 'weekly') {
      return config.delivery_days.length * config.quantity_per_delivery * pricePerUnit * (52 / 12);
    } else if (config.frequency === 'bi-weekly') {
      return (config.quantity_per_delivery * pricePerUnit) * (26 / 12);
    } else if (config.frequency === 'monthly') {
      return config.quantity_per_delivery * pricePerUnit;
    }
    return 0;
  };

  const getMinQuantity = (item: any) => {
    return seekingType === 'products' ? (item.minimum_quantity || 1) : 1;
  };

  const handleCreateSubscription = async () => {
    if (subscriptionItems.length === 0) {
      alert("Adicione pelo menos um item à sua assinatura.");
      return;
    }

    const requiredFields = ['street', 'number', 'zip_code'];
    const missingFields = requiredFields.filter(field => !deliveryAddress[field as keyof DeliveryAddress]?.trim());
    if (missingFields.length > 0) {
      alert("Preencha todos os campos obrigatórios do endereço.");
      return;
    }

    setIsCreating(true);
    try {
      const monthlyTotal = calculateTotal();

      const completeAddress = {
        street: deliveryAddress.street,
        number: deliveryAddress.number,
        complement: deliveryAddress.complement || '',
        neighborhood: selectedNeighborhood,
        city: user.default_location.city,
        state: user.default_location.state,
        zip_code: deliveryAddress.zip_code,
        reference: deliveryAddress.reference || ''
      };

      const startDate = new Date();
      const nextBillingDate = new Date(startDate);
      nextBillingDate.setDate(nextBillingDate.getDate() + 30);

      const subscriptionData = {
        customer_id: user.id,
        team_id: selectedTeam.id,
        delivery_address: completeAddress,
        monthly_price: monthlyTotal,
        status: 'pending_payment',
        start_date: startDate.toISOString().split('T')[0],
        next_billing_date: nextBillingDate.toISOString().split('T')[0]
      };

      const newSubscription = await SubscriptionAPI.create(subscriptionData);

      for (const item of subscriptionItems) {
        const itemData = {
          subscription_id: newSubscription.id,
          frequency: item.frequency,
          delivery_days: item.delivery_days,
          biweekly_delivery_day: item.biweekly_delivery_day,
          monthly_delivery_day: item.monthly_delivery_day,
          quantity_per_delivery: item.quantity_per_delivery,
          unit_price: item.unitPrice,
          monthly_subtotal: item.monthlySubtotal,
          product_id: item.itemId
        };

        await SubscriptionItemAPI.create(itemData);
      }

      alert("Assinatura criada com sucesso!");
      // Redirecionar para página de pagamento ou sucesso

    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      alert("Erro ao criar assinatura. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  };

  const isNextDisabled = () => {
    if (isCreating || isLoading) return true;
    if (step === 0) return !seekingType;
    if (step === 1) return !selectedNeighborhood;
    if (step === 2) return !selectedTeam;
    if (step === 3) return subscriptionItems.length === 0;
    const requiredAddressFields = ['street', 'number', 'zip_code'];
    if (step === 4) return requiredAddressFields.some(field => !deliveryAddress[field as keyof DeliveryAddress]?.trim());
    return false;
  };

  if (!user?.default_location) {
    return (
      <div className="w-full p-6 md:p-8">
        <div className="max-w-xl mx-auto border border-blue-200 bg-blue-50 rounded-lg p-6">
          <div className="flex items-center gap-3 text-blue-800">
            <MapPin className="h-5 w-5" />
            <div>
              <h3 className="font-bold">Defina sua localização</h3>
              <p className="text-sm text-blue-700">
                Para começar, por favor, defina sua cidade padrão para encontrarmos as melhores opções para você.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/customer-dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
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
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center text-slate-900">O que você busca?</CardTitle>
            <p className="text-center text-slate-600">Selecione se deseja assinar produtos ou serviços.</p>
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
      )}

      {/* Step 1: Neighborhood Selection */}
      {step === 1 && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>1. Selecione seu Bairro</CardTitle>
            <p className="text-slate-600">Apenas bairros com cobertura de {seekingType === 'products' ? 'produtos' : 'serviços'} são exibidos.</p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
                <span className="ml-2 text-slate-600">Carregando bairros...</span>
              </div>
            ) : availableNeighborhoods.length > 0 ? (
              <select
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione um bairro...</option>
                {availableNeighborhoods.map(neighborhood => (
                  <option key={neighborhood} value={neighborhood}>
                    {neighborhood}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  Nenhuma empresa atende sua cidade para o tipo de item selecionado.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Business Selection */}
      {step === 2 && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>2. Selecione a Empresa</CardTitle>
            <p className="text-slate-600">Empresas disponíveis no bairro {selectedNeighborhood}</p>
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
              {filteredBusinesses.map((team: any) => (
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Item Selection */}
      {step === 3 && (
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>3. Monte sua Assinatura</CardTitle>
            <p className="text-slate-600">Adicione e configure os itens que deseja de {selectedTeam?.name}.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h4 className="font-semibold mb-4">Itens Disponíveis</h4>
                <div className="space-y-3">
                  {itemsForSelectedTeam.map((item: any) => (
                    <Card key={item.id} className="border border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h6 className="font-medium text-slate-900">{item.name}</h6>
                            <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                            <div className="mt-2">
                              <span className="font-bold text-green-600">
                                {formatCurrency(item.price_per_unit || 0)}
                                /{UNIT_TYPE_LABELS[item.unit_type] || item.unit_type || 'unidade'}
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
                                <p className="font-bold text-green-600 text-sm">{formatCurrency(item.month
