
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Product } from "@/api/entities";
import { DeliveryArea } from "@/api/entities";
import { Plan } from "@/api/entities"; // Added Plan entity import
import { Subscription } from "@/api/entities"; // Import Subscription entity
import { SubscriptionItem } from "@/api/entities"; // Import SubscriptionItem entity
import { PriceUpdate } from "@/api/entities"; // Import PriceUpdate entity for scheduling deletions
import { ProductCostHistory } from "@/api/entities"; // NOVO: Importar histórico de custos
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Upload,
  X,
  Image as ImageIcon,
  AlertTriangle,
  DollarSign,
  Users // Adicionar Users para mostrar produtos em uso
} from "lucide-react";
import { formatCurrency, DAYS_OF_WEEK, PRODUCT_CATEGORIES, createNotification } from "@/components/lib";
import { UploadFile } from "@/api/integrations";
import PriceUpdateModal from "@/components/products/PriceUpdateModal"; // Importar novo componente
import { format } from 'date-fns'; // Import date-fns format

const UNIT_TYPES = [
  { value: "unidade", label: "Unidade" },
  { value: "grama", label: "Grama (g)" },
  { value: "quilograma", label: "Quilograma (kg)" },
  { value: "litro", label: "Litro (L)" },
  { value: "mililitro", label: "Mililitro (mL)" },
  { value: "fatia", label: "Fatia" }
];

export default function ProductManagement() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [products, setProducts] = useState([]);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null); // Novo estado para plano atual

  // Novos estados para modal de atualização de preço
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(null);
  const [productUsageInfo, setProductUsageInfo] = useState({}); // Novo estado para rastrear uso dos produtos

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    unit_type: "",
    price_per_unit: "",
    cost_per_unit: "", // NOVO CAMPO
    minimum_quantity: 1,
    maximum_quantity: 1000,
    available_days: [],
    available_area_ids: [],
    image_url: "",
    status: "active",
    preparation_time: 0
  });

  useEffect(() => {
    loadProductsData();
  }, []);

  const loadProductsData = async () => { // Renamed from loadInitialData
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // VALIDAÇÃO DE PERMISSÃO CORRIGIDA
      if (userData.user_type !== 'business_owner') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        // Optionally redirect or show a restricted view
        setIsLoading(false); // Ensure loading state is false on error/redirect
        return; // Stop execution if unauthorized
      }

      if (userData.current_team_id) {
        const [teamData, teamProducts, teamAreas] = await Promise.all([ // Destructured promise.all
          Team.get(userData.current_team_id),
          Product.filter({ team_id: userData.current_team_id }, '-created_date'), // Sorted by created_date
          DeliveryArea.filter({ team_id: userData.current_team_id, status: 'active' })
        ]);
        
        // VALIDAÇÃO: Verificar se o usuário é realmente o dono desta empresa
        if (teamData.owner_id !== userData.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar os dados desta empresa.",
            variant: "destructive"
          });
          // Optionally redirect or show a restricted view
          setIsLoading(false); // Ensure loading state is false on error/redirect
          return; // Stop execution if not the owner
        }
        
        setTeam(teamData);
        setProducts(teamProducts); // Removed client-side sort
        setDeliveryAreas(teamAreas);

        // Carregar informações de uso dos produtos
        await loadProductUsageInfo(teamProducts);

        // Carregar plano atual se existir
        if (teamData.plan_id) {
          try {
            const planData = await Plan.get(teamData.plan_id);
            setCurrentPlan(planData);
          } catch (error) {
            console.error("Erro ao carregar plano:", error);
            setCurrentPlan(null);
          }
        } else {
          setCurrentPlan(null);
        }

      } else {
        toast({
          title: "Nenhuma empresa associada",
          description: "Sua conta de proprietário de empresa não está associada a nenhuma empresa.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da padaria.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Nova função para carregar informações de uso dos produtos
  const loadProductUsageInfo = async (products) => {
    try {
      const usageInfo = {};
      
      for (const product of products) {
        const subscriptionItems = await SubscriptionItem.filter({ product_id: product.id });
        const activeSubscriptions = [];
        
        for (const item of subscriptionItems) {
          try {
            const subscription = await Subscription.get(item.subscription_id);
            if (subscription && subscription.status === 'active') {
              activeSubscriptions.push({
                id: subscription.id,
                customer_id: subscription.customer_id
              });
            }
          } catch (error) {
            console.error(`Erro ao carregar assinatura ${item.subscription_id}:`, error);
          }
        }
        
        usageInfo[product.id] = {
          activeSubscriptions: activeSubscriptions.length,
          subscriptionDetails: activeSubscriptions
        };
      }
      
      setProductUsageInfo(usageInfo);
    } catch (error) {
      console.error("Erro ao carregar informações de uso dos produtos:", error);
    }
  };

  const loadProducts = async () => {
     try {
      if (team) {
        // Updated to include '-created_date' sort for consistency
        const teamProducts = await Product.filter({ team_id: team.id }, '-created_date'); 
        setProducts(teamProducts); // Removed client-side sort
        await loadProductUsageInfo(teamProducts); // Reload usage info when products are reloaded
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (day, checked) => {
    setFormData(prev => ({
      ...prev,
      available_days: checked
        ? [...prev.available_days, day]
        : prev.available_days.filter(d => d !== day)
    }));
  };

  const handleAreaToggle = (areaId, checked) => {
    setFormData(prev => ({
      ...prev,
      available_area_ids: checked
        ? [...prev.available_area_ids, areaId]
        : prev.available_area_ids.filter(id => id !== areaId)
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      toast({
        title: "Imagem carregada! ✅",
        description: "A foto do produto foi carregada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      unit_type: "",
      price_per_unit: "",
      cost_per_unit: "", // NOVO CAMPO
      minimum_quantity: 1,
      maximum_quantity: 1000,
      available_days: [],
      available_area_ids: [],
      image_url: "",
      status: "active",
      preparation_time: 0
    });
    setEditingProduct(null);
  };

  // Nova função para verificar se pode adicionar mais produtos
  const canAddNewProduct = () => {
    if (!currentPlan) return true; // Se não há plano definido, permite
    if (currentPlan.max_products === null || currentPlan.max_products === undefined) return true; // Se max_products é null/undefined, permite ilimitado
    return products.length < currentPlan.max_products;
  };

  // Modificar handleOpenModal para não bloquear edições de preço em produtos com assinaturas ativas
  const handleOpenModal = (product = null) => {
    if (!product && !canAddNewProduct()) {
      toast({
        title: "Limite atingido",
        description: `Seu plano permite apenas ${currentPlan?.max_products || 0} produtos. Atualize seu plano para adicionar mais produtos.`,
        variant: "destructive",
      });
      return;
    }

    if (product) {
      // NÃO BLOQUEAR MAIS - permitir edição. A lógica de preço será tratada pelo readOnly no input.
      // const usage = productUsageInfo[product.id];
      // if (usage && usage.activeSubscriptions > 0) {
      //   toast({
      //     title: "Produto em Assinaturas Ativas! ⚠️",
      //     description: `Este produto está em ${usage.activeSubscriptions} assinatura(s) ativa(s). Use o botão de atualização de preço para agendar mudanças.`,
      //     variant: "destructive"
      //   });
      //   return; // Bloquear edição direta
      // }

      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        unit_type: product.unit_type || "",
        price_per_unit: product.price_per_unit || "",
        cost_per_unit: product.cost_per_unit || "", // NOVO CAMPO
        minimum_quantity: product.minimum_quantity || 1,
        maximum_quantity: product.maximum_quantity || 1000,
        available_days: product.available_days || [],
        available_area_ids: product.available_area_ids || [],
        image_url: product.image_url || "",
        status: product.status || "active",
        preparation_time: product.preparation_time || 0
      });
      setEditingProduct(product);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do produto.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category || !formData.unit_type) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione a categoria e o tipo de unidade.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.price_per_unit || parseFloat(formData.price_per_unit) <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, informe um preço válido.",
        variant: "destructive"
      });
      return;
    }

    if (formData.available_area_ids.length === 0) {
      toast({
        title: "Nenhuma área de entrega",
        description: "Selecione pelo menos uma área onde este produto será entregue.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const productData = {
        ...formData,
        team_id: team.id,
        price_per_unit: parseFloat(formData.price_per_unit),
        cost_per_unit: parseFloat(formData.cost_per_unit) || 0, // NOVO CAMPO
        minimum_quantity: parseInt(formData.minimum_quantity) || 1,
        maximum_quantity: parseInt(formData.maximum_quantity) || 1000,
        preparation_time: parseInt(formData.preparation_time) || 0
      };

      if (editingProduct) {
        // NOVO: Verificar se o custo mudou para criar um histórico
        const newCost = parseFloat(formData.cost_per_unit) || 0;
        const oldCost = editingProduct.cost_per_unit || 0;

        if (newCost !== oldCost) {
          await ProductCostHistory.create({
            product_id: editingProduct.id,
            cost_per_unit: newCost,
            effective_date: format(new Date(), 'yyyy-MM-dd')
          });
        }
        
        await Product.update(editingProduct.id, productData);
        toast({
          title: "Produto atualizado! ✅",
          description: "As alterações foram salvas com sucesso."
        });
      } else {
        const newProduct = await Product.create(productData);
        // NOVO: Criar o primeiro registro de custo histórico para novos produtos
        await ProductCostHistory.create({
          product_id: newProduct.id,
          cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
          effective_date: format(new Date(), 'yyyy-MM-dd')
        });
        toast({
          title: "Produto criado! ✅",
          description: "O novo produto foi adicionado ao catálogo."
        });
      }

      setIsModalOpen(false);
      resetForm();
      await loadProductsData(); // Re-fetch all data including plan and products to update count correctly and usage info
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o produto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await Product.update(product.id, { status: newStatus });
      
      toast({
        title: newStatus === 'active' ? "Produto ativado! ✅" : "Produto desativado! ⏸️",
        description: `${product.name} foi ${newStatus === 'active' ? 'ativado' : 'desativado'}.`
      });
      
      await loadProducts(); // Refresh products and usage info
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do produto.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (product) => {
    const usage = productUsageInfo[product.id];
    
    if (usage && usage.activeSubscriptions > 0) {
      // Produto está sendo usado em assinaturas ativas - AGENDAR exclusão
      const confirmMessage = `ATENÇÃO: Este produto está sendo usado em ${usage.activeSubscriptions} assinatura(s) ativa(s).\n\nA exclusão será AGENDADA para o final do ciclo de faturamento atual de cada assinatura.\nOs clientes serão notificados sobre a descontinuação.\n\nTem certeza que deseja agendar a exclusão?`;
      
      if (!confirm(confirmMessage)) {
        return;
      }

      try {
        // Calcular a data mais distante de término de ciclo
        const subscriptionItems = await SubscriptionItem.filter({ product_id: product.id });
        let latestEndDate = new Date(); // Initialize with current date

        for (const item of subscriptionItems) {
          const subscription = await Subscription.get(item.subscription_id);
          if (subscription && subscription.status === 'active') {
            // Calcular próximo fim de ciclo (assumindo ciclos semanais)
            // This is a simplification; a more robust solution would consider actual billing cycles (weekly, bi-weekly, monthly)
            // and the specific delivery days configured in the subscription item.
            // For now, let's assume weekly cycles from subscription start date.
            const startDate = new Date(subscription.start_date);
            const today = new Date();
            const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const weeksCompleted = Math.floor(daysSinceStart / 7);
            
            // Calculate end of the *next* full cycle. If today is within a cycle, it ends at the end of this one.
            // If it's precisely the start of a cycle, the product is still delivered for this cycle, so consider the end of it.
            let nextCycleEnd = new Date(startDate);
            nextCycleEnd.setDate(startDate.getDate() + ((weeksCompleted + 1) * 7)); // End of next full weekly cycle

            if (nextCycleEnd > latestEndDate) {
              latestEndDate = nextCycleEnd;
            }
          }
        }
        
        // Ensure latestEndDate is at least tomorrow if no active subscriptions pushed it further
        if (latestEndDate <= new Date()) {
          latestEndDate.setDate(new Date().getDate() + 1);
        }

        // Agendar exclusão na tabela PriceUpdate (reutilizando estrutura)
        await PriceUpdate.create({
          product_id: product.id,
          team_id: team.id,
          old_price: product.price_per_unit,
          new_price: 0, // Indicador de exclusão
          effective_date: latestEndDate.toISOString().split('T')[0],
          reason: 'Produto descontinuado - exclusão agendada',
          status: 'pending'
        });

        // Marcar produto como descontinuado
        await Product.update(product.id, { 
          status: 'inactive',
          description: (product.description || '') + `\n\n[PRODUTO DESCONTINUADO - Exclusão agendada para ${latestEndDate.toLocaleDateString('pt-BR')}]`
        });

        // Notificar clientes sobre descontinuação
        await handleProductDiscontinuationNotification(product, latestEndDate);
        
        toast({
          title: "Exclusão agendada! ⏰",
          description: `${product.name} será removido em ${latestEndDate.toLocaleDateString('pt-BR')}. Clientes foram notificados.`
        });
        
        await loadProductsData();
      } catch (error) {
        console.error("Erro ao agendar exclusão:", error);
        toast({
          title: "Erro ao agendar exclusão",
          description: "Não foi possível agendar a exclusão. Tente novamente.",
          variant: "destructive"
        });
      }
    } else {
      // Produto não está sendo usado, exclusão imediata
      if (!confirm(`Tem certeza que deseja excluir "${product.name}"? Esta ação não pode ser desfeita.`)) {
        return;
      }

      try {
        await Product.delete(product.id);
        toast({
          title: "Produto excluído! ✅",
          description: `${product.name} foi removido do catálogo.`
        });
        await loadProductsData();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o produto. Tente novamente.",
          variant: "destructive"
      });
    }
  }
};

  // Nova função para notificar sobre descontinuação
  const handleProductDiscontinuationNotification = async (product, endDate) => {
    try {
      const subscriptionItems = await SubscriptionItem.filter({ product_id: product.id });
      const notifiedCustomers = new Set();
      
      for (const item of subscriptionItems) {
        const subscription = await Subscription.get(item.subscription_id);
        if (subscription && subscription.status === 'active' && !notifiedCustomers.has(subscription.customer_id)) {
          await createNotification({
            userId: subscription.customer_id,
            title: `Produto Descontinuado - ${team.name}`,
            message: `O produto "${product.name}" da sua assinatura será descontinuado. Ele continuará sendo entregue até ${endDate.toLocaleDateString('pt-BR')}, quando sua assinatura será ajustada automaticamente.`,
            linkTo: '/my-subscriptions',
            icon: 'AlertTriangle'
          });
          notifiedCustomers.add(subscription.customer_id);
        }
      }
    } catch (error) {
      console.error("Erro ao enviar notificações de descontinuação:", error);
    }
  };

  const getCategoryLabel = (category) => {
    return PRODUCT_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const getUnitTypeLabel = (unitType) => {
    return UNIT_TYPES.find(u => u.value === unitType)?.label || unitType;
  };
  
  const getAreaNames = (areaIds) => {
    if (!areaIds || areaIds.length === 0) return "Nenhuma";
    const names = areaIds.map(id => {
      const area = deliveryAreas.find(area => area.id === id);
      return area ? (area.condominium ? `${area.neighborhood} (${area.condominium})` : area.neighborhood) : 'Desconhecida';
    }).join(', ');
    return names;
  }

  const handleOpenPriceModal = (product) => {
    setUpdatingProduct(product);
    setIsPriceModalOpen(true);
  };

  const handleClosePriceModal = () => {
    setIsPriceModalOpen(false);
    setUpdatingProduct(null);
  };

  const handlePriceUpdateSuccess = async () => {
    await loadProducts(); // Recarregar produtos para refletir mudanças (and usage info)
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
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Gestão de Produtos</h1>
          <p className="text-amber-600">Gerencie o catálogo de produtos da sua empresa</p> {/* Changed from padaria to empresa */}
          {currentPlan && (
            <p className="text-sm text-amber-500 mt-1">
              Plano {currentPlan.name}: {products.length}/{currentPlan.max_products || '∞'} produtos utilizados
            </p>
          )}
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          disabled={!canAddNewProduct()}
          className={`${canAddNewProduct() ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
          {!canAddNewProduct() && " (Limite atingido)"}
        </Button>
      </div>

      {/* Alerta de limite de produtos */}
      {currentPlan && currentPlan.max_products !== null && currentPlan.max_products !== undefined && products.length >= currentPlan.max_products && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Limite de produtos atingido</p>
                <p className="text-sm text-amber-700">
                  Você está usando {products.length} de {currentPlan.max_products} produtos permitidos pelo seu plano {currentPlan.name}.
                  Para adicionar mais produtos, considere fazer upgrade do seu plano.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Package className="w-5 h-5" />
            Catálogo de Produtos ({products.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-amber-600 mb-6">
                Comece criando produtos para sua padaria
              </p>
              <Button 
                onClick={() => handleOpenModal()} 
                disabled={!canAddNewProduct()}
                className={`${canAddNewProduct() ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Produto
                {!canAddNewProduct() && " (Limite atingido)"}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Áreas Atendidas</TableHead>
                    <TableHead>Em Uso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const usage = productUsageInfo[product.id] || { activeSubscriptions: 0 };
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {product.image_url ? (
                                <img 
                                  src={product.image_url} 
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <Badge variant="outline" className="font-normal mt-1">
                                {getCategoryLabel(product.category)}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(product.price_per_unit)} / {getUnitTypeLabel(product.unit_type)}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-600 max-w-xs truncate" title={getAreaNames(product.available_area_ids)}>
                             {getAreaNames(product.available_area_ids)}
                          </p>
                        </TableCell>
                        <TableCell>
                          {usage.activeSubscriptions > 0 ? (
                            <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {usage.activeSubscriptions} assinatura{usage.activeSubscriptions > 1 ? 's' : ''}
                            </Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Não usado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            product.status === 'active' 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-gray-500 hover:bg-gray-600'
                          }>
                            {product.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPriceModal(product)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(product)}
                            >
                              {product.status === 'active' ? 
                                <EyeOff className="w-4 h-4" /> : 
                                <Eye className="w-4 h-4" />
                              }
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              className={`${usage.activeSubscriptions > 0 ? 'text-orange-600 hover:text-orange-700' : 'text-red-600 hover:text-red-700'}`}
                              title={usage.activeSubscriptions > 0 ? `⚠️ Produto usado em ${usage.activeSubscriptions} assinatura(s)` : 'Excluir produto'}
                            >
                              {usage.activeSubscriptions > 0 ? <AlertTriangle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 
                'Atualize as informações do produto.' : 
                'Adicione um novo produto ao seu catálogo.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Pão Francês"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição do produto..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Foto do Produto</Label>
              <div className="space-y-4">
                {formData.image_url ? (
                  <div className="relative w-fit">
                    <img 
                      src={formData.image_url} 
                      alt="Produto" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-image"
                    disabled={isUploadingImage}
                  />
                  <Label 
                    htmlFor="product-image" 
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors"
                  >
                    {isUploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent"></div>
                        Carregando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {formData.image_url ? 'Alterar Foto' : 'Adicionar Foto'}
                      </>
                    )}
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceitos: JPG, PNG, GIF. Máximo: 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria*</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unidade*</Label>
                <Select
                    value={formData.unit_type}
                    onValueChange={(value) => handleInputChange('unit_type', value)}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Tipo de unidade" />
                    </SelectTrigger>
                    <SelectContent>
                    {UNIT_TYPES.map(unit => (
                        <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço por Unidade*</Label>
                <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) => handleInputChange('price_per_unit', e.target.value)}
                    placeholder="0,00"
                    readOnly={editingProduct && productUsageInfo[editingProduct.id]?.activeSubscriptions > 0}
                />
                {editingProduct && productUsageInfo[editingProduct.id]?.activeSubscriptions > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Para alterar o preço, use o botão <strong className="text-blue-600">'$' (Atualizar Preço)</strong> na tabela principal.
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="cost">Custo por Unidade</Label>
                <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_per_unit}
                    onChange={(e) => handleInputChange('cost_per_unit', e.target.value)}
                    placeholder="0,00"
                />
                 <p className="text-xs text-gray-500 text-center">
                  Informe o custo de produção para uma análise financeira precisa.
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              O preço final para o cliente será: (Preço × Quantidade).
            </p>

            <div className="space-y-2">
              <Label>Áreas de Entrega*</Label>
              <div className="space-y-2 border p-4 rounded-md max-h-40 overflow-y-auto">
                {deliveryAreas.length > 0 ? deliveryAreas.map((area) => (
                  <div key={area.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${area.id}`}
                      checked={formData.available_area_ids.includes(area.id)}
                      onCheckedChange={(checked) => handleAreaToggle(area.id, checked)}
                    />
                    <Label htmlFor={`area-${area.id}`} className="cursor-pointer text-sm font-normal">
                      {area.neighborhood} {area.condominium && `(${area.condominium})`}
                    </Label>
                  </div>
                )) : <p className="text-sm text-gray-500">Nenhuma área de entrega ativa cadastrada.</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dias Disponíveis</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={formData.available_days.includes(day.value)}
                      onCheckedChange={(checked) => handleDayToggle(day.value, checked)}
                    />
                    <Label htmlFor={day.value} className="cursor-pointer text-sm font-normal">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct} disabled={isSaving || isUploadingImage}>
              {isSaving ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Atualização de Preço */}
      <PriceUpdateModal
        product={updatingProduct}
        team={team}
        isOpen={isPriceModalOpen}
        onClose={handleClosePriceModal}
        onSuccess={handlePriceUpdateSuccess}
      />
    </div>
  );
}
