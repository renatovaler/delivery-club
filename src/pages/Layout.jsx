import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { TeamMember } from "@/api/entities";
import { DeliveryArea } from "@/api/entities"; // New import for DeliveryArea
import { Product } from "@/api/entities"; // New import for Product
import Onboarding from "@/pages/Onboarding"; // Importar a nova página
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter, // Importar CardFooter
} from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  MapPin,
  ChefHat,
  UserPlus,
  Settings,
  LogOut,
  ShoppingBasket, // NOVO ÍCONE
  Crown,
  ShoppingCart,
  BarChart3,
  Calendar,
  UserCog,
  ShieldOff, // Importar ícone para acesso restrito
  DollarSign, // Importar o ícone DollarSign
  Package, // Importar o ícone Package
  Building2, // NOVO ÍCONO: Adicionado para representar empresas/negócios
  Truck, // Ícone adicionado
  ArrowRight, // NOVO ÍCONE: Adicionado para o botão do BusinessSetupForm
  Key, // NOVO ÍCONE: Para as chaves do Stripe
  AlertTriangle, // NOVO ÍCONE: Para o aviso de segurança
  ExternalLink, // NOVO ÍCONE: Para link externo
  MessageCircle, // NOVO ÍCONE: Para Suporte
  Shield, // NOVO ÍCONE: Para Denúncias
  HelpCircle, // NOVO ÍCONE: Para FAQ
  TrendingUp, // NOVO ÍCONE: Adicionado para Histórico de Preços
  Phone, // NOVO: Ícone de Telefone
} from "lucide-react";
import { motion } from "framer-motion"; // Importar motion
import NotificationBell from "@/components/notifications/NotificationBell"; // Importar o novo componente

// Novas importações para o BusinessSetupForm
import { useToast } from "@/components/ui/use-toast"; // Para exibir toasts
import { Input } from "@/components/ui/input"; // Componente Input
import { Label } from "@/components/ui/label"; // Componente Label
import { Textarea } from "@/components/ui/textarea"; // New import for Textarea
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Componentes Select
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Importar Alert
import { Checkbox } from "@/components/ui/checkbox"; // NOVO: Importar Checkbox
import {
  createNotification,
  BRAZILIAN_STATES,
  DAYS_OF_WEEK, // NOVO: Importar dias da semana
} from "@/components/lib";

const getNavigationItems = (userType, permissions = []) => {
  const baseItems = {
    system_admin: [
      { title: "Dashboard", url: createPageUrl("AdminDashboard"), icon: LayoutDashboard },
      { title: "Empresas", url: createPageUrl("AdminBusinesses"), icon: Building2 },
      { title: "Usuários", url: createPageUrl("AdminUsers"), icon: Users },
      { title: "Relatórios", url: createPageUrl("AdminReports"), icon: BarChart3 },
      { title: "Assinaturas", url: createPageUrl("AdminSubscriptions"), icon: CreditCard },
      { title: "Planos", url: createPageUrl("AdminPlans"), icon: CreditCard },
      { title: "FAQ", url: createPageUrl("FAQ"), icon: HelpCircle },
    ],
    business_owner: [
      { title: "Dashboard", url: createPageUrl("BusinessDashboard"), icon: LayoutDashboard },
      { title: "Produtos", url: createPageUrl("ProductManagement"), icon: Package },
      { title: "Gestão de Entregas", url: createPageUrl("DeliveryManagement"), icon: Truck },
      { title: "Clientes", url: createPageUrl("Customers"), icon: Users },
      { title: "Financeiro", url: createPageUrl("FinancialManagement"), icon: DollarSign },
      { title: "Histórico de Preços", url: createPageUrl("PriceHistory"), icon: TrendingUp },
      { title: "Faturas da Plataforma", url: createPageUrl("PlatformInvoices"), icon: FileText }, // NOVO ITEM
      { title: "Áreas de Cobertura", url: createPageUrl("DeliveryAreas"), icon: MapPin },
      { title: "Configurações", url: createPageUrl("BusinessSettings"), icon: Settings },
      { title: "Equipe", url: createPageUrl("TeamManagement"), icon: UserCog },
      { title: "FAQ", url: createPageUrl("FAQ"), icon: HelpCircle },
    ],
    customer: [
      { title: "Dashboard", url: createPageUrl("CustomerDashboard"), icon: LayoutDashboard },
      { title: "Minhas Assinaturas", url: createPageUrl("MySubscriptions"), icon: CreditCard },
      { title: "Histórico Financeiro", url: createPageUrl("FinancialHistory"), icon: FileText },
      { title: "Nova Assinatura", url: createPageUrl("NewSubscription"), icon: ShoppingCart },
      { title: "Suporte", url: createPageUrl("CustomerSupport"), icon: MessageCircle },
      { title: "Denúncias", url: createPageUrl("PlatformReports"), icon: Shield },
      { title: "FAQ", url: createPageUrl("FAQ"), icon: HelpCircle },
    ],
  };

  return baseItems[userType] || baseItems.customer;
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsAddressUpdate, setNeedsAddressUpdate] = useState(false);
  const [needsPhoneUpdate, setNeedsPhoneUpdate] = useState(false); // NOVO
  const [needsBusinessSetup, setNeedsBusinessSetup] = useState(false); // Novo estado

  useEffect(() => {
    loadUserData();
  }, []);

  // Processar cancelamentos agendados E atualizações de preço
  useEffect(() => {
    if (user && user.user_type === 'system_admin') {
      processScheduledCancellations();
      processPriceUpdates(); // Nova função
    }
  }, [user]);
  
  const processScheduledCancellations = async () => {
    try {
      // Importar dinamicamente para evitar dependências circulares ou carregamento desnecessário
      const { Team } = await import('@/api/entities');
      const { Subscription } = await import('@/api/entities');
      
      const allTeams = await Team.list('', 500); // Buscar um número razoável de padarias/empresas
      const today = new Date().toISOString().split('T')[0]; // Data de hoje no formato YYYY-MM-DD
      let processedCount = 0;
      let processedSubscriptions = 0;

      for (const team of allTeams) { // Alterado de `bakery` para `team`
        if (team.subscription_status === 'cancellation_pending' && 
            team.cancellation_effective_date && 
            team.cancellation_effective_date <= today) {
          
          // 1. Mudar status da empresa para cancelada
          await Team.update(team.id, { subscription_status: 'cancelled' });

          // 2. Cancelar todas as assinaturas ativas dos clientes dessa empresa
          const customerSubscriptions = await Subscription.filter({ team_id: team.id });
          const subscriptionsToCancel = customerSubscriptions.filter(s => 
            s.status === 'active' || s.status === 'paused'
          );

          for (const sub of subscriptionsToCancel) {
            await Subscription.update(sub.id, { 
              status: 'cancelled',
              cancellation_date: today // Registrar a data do cancelamento efetivo
            });
            processedSubscriptions++;
          }
          
          processedCount++;
        }
      }

      // Log silencioso para monitoramento (só aparece no console do desenvolvedor)
      if (processedCount > 0) {
        console.log(`[Delivery Club] Processamento automático: ${processedCount} empresa(s) e ${processedSubscriptions} assinatura(s) canceladas.`); // Alterado de 'padaria(s)' para 'empresa(s)'
      }

    } catch (error) {
      console.error('[Delivery Club] Erro no processamento automático de cancelamentos:', error);
    }
  };

  // Nova função para processar atualizações de preço
  const processPriceUpdates = async () => {
    try {
      const { processPriceUpdates } = await import('@/api/functions');
      await processPriceUpdates();
    } catch (error) {
      console.error('[Delivery Club] Erro no processamento de atualizações de preço:', error);
    }
  };

  const loadUserData = async () => {
    setIsLoading(true);
    setNeedsOnboarding(false);
    setNeedsAddressUpdate(false); // Reset do estado
    setNeedsPhoneUpdate(false); // NOVO: Resetar estado
    setNeedsBusinessSetup(false); // Reset do estado
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Checagem para onboarding
      if (!userData.user_type) {
        setNeedsOnboarding(true);
        setIsLoading(false);
        return; 
      }

      // Nova checagem para business_owner sem empresa
      if (userData.user_type === 'business_owner' && !userData.current_team_id) {
        setNeedsBusinessSetup(true);
        setIsLoading(false);
        return;
      }

      // Checagens para clientes
      if (userData.user_type === 'customer') {
        // Endereço Completo
        const requiredAddressFields = ['street', 'number', 'neighborhood', 'city', 'state', 'zip_code'];
        const hasCompleteAddress = userData.address && requiredAddressFields.every(field => 
          userData.address[field] && String(userData.address[field]).trim() !== ''
        );

        if (!hasCompleteAddress) {
          setNeedsAddressUpdate(true);
          setIsLoading(false);
          return;
        }

        // NOVO: Telefone
        if (!userData.phone || String(userData.phone).trim() === '') {
            setNeedsPhoneUpdate(true);
            setIsLoading(false);
            return;
        }
      }
      
      if (userData.current_team_id) {
        const teamData = await Team.get(userData.current_team_id);
        setCurrentTeam(teamData);
      }
    } catch (error) {
      console.error("Usuário não autenticado ou erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload(); // Recarregar para limpar todo o estado
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-amber-600">Carregando...</div>
      </div>
    );
  }

  // Se o usuário não estiver logado, mostrar a tela de login.
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-amber-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <ShoppingBasket className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-amber-900">Bem-vindo de volta!</CardTitle>
              <CardDescription className="text-lg text-amber-600">Acesse sua conta para continuar</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Button onClick={() => User.login()} className="w-full h-12 text-lg bg-amber-600 hover:bg-amber-700">
                Login com Google
              </Button>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-amber-600">
                Não tem uma conta? Crie uma ao fazer login.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Se o usuário precisar de onboarding, mostrar a página de Onboarding.
  if (needsOnboarding) {
    return <Onboarding />;
  }

  // Se o business_owner precisar criar uma empresa, mostrar o formulário
  if (needsBusinessSetup) {
    return <BusinessSetupForm onComplete={loadUserData} />;
  }

  // Se o usuário precisar completar o endereço, mostrar aviso na página de perfil
  if (needsAddressUpdate && currentPageName !== 'Profile' && currentPageName !== 'NewSubscription') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-amber-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-amber-900">Endereço Obrigatório</CardTitle>
              <CardDescription className="text-amber-600">
                Para continuar usando o Delivery Club, você precisa completar seu endereço.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-amber-700 mb-6">
                Essas informações são necessárias para que as empresas possam fazer entregas na sua região.
              </p>
              <Button 
                onClick={() => window.location.href = createPageUrl("Profile")}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                Completar Endereço
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // NOVO: Bloco de verificação de telefone
  if (needsPhoneUpdate && currentPageName !== 'Profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-amber-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-amber-900">Telefone Obrigatório</CardTitle>
              <CardDescription className="text-amber-600">
                Você precisa cadastrar um telefone para contato.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-amber-700 mb-6">
                As empresas precisam do seu telefone para entrar em contato caso haja algum problema com sua entrega.
              </p>
              <Button 
                onClick={() => window.location.href = createPageUrl("Profile")}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                Cadastrar Telefone
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Define os papéis necessários para acessar cada página
  const pageRoles = {
    'AdminDashboard': 'system_admin',
    'AdminBusinesses': 'system_admin',
    'AdminUsers': 'system_admin',
    'AdminReports': 'system_admin',
    'AdminSubscriptions': 'system_admin',
    'AdminPlans': 'system_admin',
    'AdminUserDetails': 'system_admin',
    'BusinessDashboard': 'business_owner',
    'ProductManagement': 'business_owner',
    'DeliveryManagement': 'business_owner',
    'Customers': 'business_owner',
    'FinancialManagement': 'business_owner',
    'PriceHistory': 'business_owner', // Adicionado: Histórico de Preços
    'PlatformInvoices': 'business_owner', // Adicionado: Faturas da Plataforma
    'DeliveryAreas': 'business_owner',
    'BusinessSettings': 'business_owner',
    'TeamManagement': 'business_owner',
    'PaymentHistory': 'business_owner',
    'StripeConfiguration': 'business_owner',
    'CustomerDashboard': 'customer',
    'MySubscriptions': 'customer',
    'FinancialHistory': 'customer',
    'NewSubscription': 'customer',
    'CustomerSupport': 'customer', // Nova rota
    'PlatformReports': 'customer', // Nova rota
  };

  const requiredRole = pageRoles[currentPageName];
  const userType = user.user_type;

  // Se a página tem um papel requerido e o usuário não tem esse papel
  if (requiredRole && userType !== requiredRole) {
    const dashboardMap = {
      system_admin: 'AdminDashboard',
      business_owner: 'BusinessDashboard',
      customer: 'CustomerDashboard'
    };
    const userDashboardUrl = createPageUrl(dashboardMap[userType]);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <ShieldOff className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900">Acesso Restrito</CardTitle>
              <CardDescription className="text-red-600">
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-red-700 mb-6">
                Esta área é exclusiva para outro tipo de perfil de usuário.
              </p>
              <Link to={userDashboardUrl}>
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Voltar para meu Painel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const navigationItems = getNavigationItems(user.user_type);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-amber-50 to-orange-50">
        <style>
          {`
            :root {
              --primary: 45 54% 47%;
              --primary-foreground: 0 0% 98%;
              --secondary: 39 77% 91%;
              --secondary-foreground: 39 85% 20%;
              --accent: 39 77% 91%;
              --accent-foreground: 39 85% 20%;
              --background: 39 100% 97%;
              --foreground: 39 85% 15%;
              --card: 0 0% 100%;
              --card-foreground: 39 85% 15%;
            }
          `}
        </style>
        
        <Sidebar className="border-r border-amber-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-amber-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingBasket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-amber-900 text-lg">Delivery Club</h2>
                <p className="text-xs text-amber-600">
                  {user.user_type === 'system_admin' && 'Administrador'}
                  {user.user_type === 'business_owner' && currentTeam?.name}
                  {user.user_type === 'customer' && 'Cliente'}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-amber-600 uppercase tracking-wider px-2 py-2">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-amber-100 hover:text-amber-800 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-amber-100 text-amber-800 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user.user_type === 'business_owner' && currentTeam && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-amber-600 uppercase tracking-wider px-2 py-2">
                  {currentTeam.name}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="text-amber-700">Status: {currentTeam.subscription_status === 'active' ? 'Ativo' : 'Trial'}</span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-amber-200 p-4">
            <div className="flex items-center justify-between w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="justify-start p-2 h-auto hover:bg-amber-100 flex-1 min-w-0">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.profile_picture} />
                        <AvatarFallback className="bg-amber-200 text-amber-800">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium text-amber-900 text-sm truncate">{user.full_name}</p>
                        <p className="text-xs text-amber-600 truncate">{user.email}</p>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Profile")} className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <NotificationBell user={user} />
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 px-6 py-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-amber-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-amber-900">Delivery Club</h1>
            </div>
            <NotificationBell user={user} />
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

// Novo componente para configuração de empresa com wizard
function BusinessSetupForm({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState({
    name: '',
    category: '',
    description: '',
    cnpj_cpf: '', // NOVO
  });
  const [contactData, setContactData] = useState({ // NOVO
    email: '',
    whatsapp_numbers: [''],
  });
  const [addressData, setAddressData] = useState({ // NOVO (para sede)
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [areaData, setAreaData] = useState({
    state: '',
    city: '',
    neighborhood: '',
    condominium: '',
    delivery_fee: '',
    notes: ''
  });
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    unit_type: 'unidade',
    price_per_unit: '',
    cost_per_unit: '', // NOVO: Custo do produto
    available_days: [], // NOVO: Dias de entrega
  });
  const [stripeKeys, setStripeKeys] = useState({
    public_key: '',
    secret_key: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const BUSINESS_CATEGORIES = [
    { value: 'padaria', label: 'Padaria' },
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'mercado', label: 'Mercado/Supermercado' },
    { value: 'farmacia', label: 'Farmácia' },
    { value: 'outros', label: 'Outros' }
  ];

  const PRODUCT_CATEGORIES = [
    { value: "paes", label: "Pães" },
    { value: "bolos", label: "Bolos e Tortas" },
    { value: "doces", label: "Doces" },
    { value: "salgados", label: "Salgados" },
    { value: "carnes", label: "Carnes Vermelhas" },
    { value: "aves", label: "Aves" },
    { value: "peixes", label: "Peixes e Frutos do Mar" },
    { value: "frios", label: "Frios e Embutidos" },
    { value: "queijos", label: "Queijos" },
    { value: "frutas", label: "Frutas" },
    { value: "verduras", label: "Verduras e Folhas" },
    { value: "legumes", label: "Legumes" },
    { value: "laticinios", label: "Laticínios" },
    { value: "refrigerantes", label: "Refrigerantes" },
    { value: "sucos", label: "Sucos Naturais" },
    { value: "medicamentos", label: "Medicamentos" },
    { value: "higiene_pessoal", label: "Higiene Pessoal" },
    { value: "cosmeticos", label: "Cosméticos" },
    { value: "limpeza", label: "Produtos de Limpeza" },
    { value: "outros", label: "Outros" }
  ];

  const UNIT_TYPES = [
    { value: "unidade", label: "Unidade", price_label: "Preço por Unidade" },
    { value: "grama", label: "Grama (g)", price_label: "Preço por Grama" },
    { value: "quilograma", label: "Quilograma (kg)", price_label: "Preço por Quilo" },
    { value: "litro", label: "Litro (L)", price_label: "Preço por Litro" },
    { value: "mililitro", label: "Mililitro (mL)", price_label: "Preço por Mililitro" },
    { value: "fatia", label: "Fatia", price_label: "Preço por Fatia" }
  ];

  const handleBusinessDataChange = (field, value) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactDataChange = (field, value) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  const handleWhatsappChange = (index, value) => {
    const newNumbers = [...contactData.whatsapp_numbers];
    newNumbers[index] = value;
    setContactData(prev => ({ ...prev, whatsapp_numbers: newNumbers }));
  };
  
  const handleAddressDataChange = (field, value) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  };

  const handleAreaDataChange = (field, value) => {
    setAreaData(prev => ({ ...prev, [field]: value }));
  };

  const handleProductDataChange = (field, value) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const handleDayChange = (dayValue) => { // NOVO: Handler para os dias da semana
    setProductData(prev => {
        const currentDays = prev.available_days;
        const newDays = currentDays.includes(dayValue)
            ? currentDays.filter(d => d !== dayValue)
            : [...currentDays, dayValue];
        return { ...prev, available_days: newDays };
    });
  };

  const handleStripeKeysChange = (field, value) => {
    setStripeKeys(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validar dados da empresa
      if (!businessData.name?.trim()) {
        toast({ title: 'Nome obrigatório', description: 'Por favor, insira o nome da sua empresa.', variant: 'destructive' });
        return;
      }
      if (!businessData.category) {
        toast({ title: 'Categoria obrigatória', description: 'Por favor, selecione a categoria do seu negócio.', variant: 'destructive' });
        return;
      }
      if (!businessData.cnpj_cpf?.trim()) { // NOVO
        toast({ title: 'CNPJ/CPF obrigatório', description: 'Por favor, insira o CNPJ ou CPF da sua empresa.', variant: 'destructive' });
        return;
      }
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 2) { // NOVO PASSO
        // Validar endereço e contato
        const requiredAddress = ['street', 'number', 'neighborhood', 'city', 'state', 'zip_code'];
        if (requiredAddress.some(field => !addressData[field]?.trim())) {
            toast({ title: 'Endereço incompleto', description: 'Todos os campos do endereço da sede são obrigatórios.', variant: 'destructive' });
            return;
        }
        if (!contactData.email?.trim() || !contactData.whatsapp_numbers[0]?.trim()) {
            toast({ title: 'Contato incompleto', description: 'E-mail e ao menos um número de WhatsApp são obrigatórios.', variant: 'destructive' });
            return;
        }
        setCurrentStep(prev => prev + 1);
    } else if (currentStep === 3) {
      // Validar área de entrega
      if (!areaData.state || !areaData.city || !areaData.neighborhood) {
        toast({ title: 'Dados incompletos', description: 'Preencha pelo menos Estado, Cidade e Bairro da área de entrega.', variant: 'destructive' });
        return;
      }
      const fee = parseFloat(areaData.delivery_fee);
      if (isNaN(fee) || fee < 0) {
        toast({ title: 'Taxa de Entrega Inválida', description: 'A taxa de entrega deve ser um número igual ou maior que zero.', variant: 'destructive' });
        return;
      }
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 4) {
      // Validar dados do produto
      if (!productData.name.trim()) {
          toast({ title: 'Nome do produto obrigatório', description: 'Por favor, informe o nome do produto.', variant: 'destructive' });
          return;
      }
      if (!productData.category || !productData.unit_type) {
          toast({ title: 'Campos obrigatórios', description: 'Por favor, selecione a categoria e o tipo de unidade do produto.', variant: 'destructive' });
          return;
      }
      if (!productData.price_per_unit || parseFloat(productData.price_per_unit) <= 0) {
          toast({ title: 'Preço inválido', description: 'Por favor, informe um preço válido para o produto.', variant: 'destructive' });
          return;
      }
      if (productData.available_days.length === 0) { // NOVO: Validação dos dias
          toast({ title: 'Dias de entrega', description: 'Selecione pelo menos um dia para a entrega do produto.', variant: 'destructive' });
          return;
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    // Validação final (Stripe) - REMOVIDA OBRIGATORIEDADE
    if (stripeKeys.public_key.trim() && stripeKeys.secret_key.trim()) {
      if (!stripeKeys.public_key.startsWith('pk_') || !stripeKeys.secret_key.startsWith('sk_')) {
        toast({ title: 'Formato de Chave Inválido', description: 'Verifique se suas chaves do Stripe estão no formato correto (pk_... e sk_...).', variant: 'destructive' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const user = await User.me();
      
      // 1. Criar a empresa com as chaves Stripe (se fornecidas) e novos dados
      const teamData = {
        name: businessData.name.trim(),
        category: businessData.category,
        cnpj_cpf: businessData.cnpj_cpf.trim(),
        description: businessData.description?.trim() || '',
        owner_id: user.id,
        subscription_status: 'trial',
        address: {
            street: addressData.street.trim(),
            number: addressData.number.trim(),
            complement: addressData.complement?.trim() || null,
            neighborhood: addressData.neighborhood.trim(),
            city: addressData.city.trim(),
            state: addressData.state,
            zip_code: addressData.zip_code.trim(),
        },
        contact: {
            email: contactData.email.trim(),
            whatsapp_numbers: contactData.whatsapp_numbers.map(n => n.trim()).filter(n => n),
        }
      };

      // Adicionar chaves do Stripe apenas se fornecidas
      if (stripeKeys.public_key.trim() && stripeKeys.secret_key.trim()) {
        teamData.stripe_public_key = stripeKeys.public_key.trim();
        teamData.stripe_secret_key = stripeKeys.secret_key.trim();
      }

      const newTeam = await Team.create(teamData);

      // 2. Criar membro da equipe
      await TeamMember.create({
        team_id: newTeam.id,
        user_id: user.id,
        user_email: user.email,
        role: 'owner',
        status: 'active'
      });

      // 3. Criar área de entrega
      const newArea = await DeliveryArea.create({
        team_id: newTeam.id,
        state: areaData.state,
        city: areaData.city,
        neighborhood: areaData.neighborhood,
        condominium: areaData.condominium?.trim() || null,
        delivery_fee: parseFloat(areaData.delivery_fee),
        status: 'active',
        notes: areaData.notes?.trim() || null
      });
      
      // 4. Criar o primeiro produto
      await Product.create({
          team_id: newTeam.id,
          name: productData.name.trim(),
          description: productData.description?.trim() || '',
          category: productData.category,
          unit_type: productData.unit_type,
          price_per_unit: parseFloat(productData.price_per_unit),
          cost_per_unit: parseFloat(productData.cost_per_unit) || 0, // NOVO
          available_area_ids: [newArea.id],
          available_days: productData.available_days, // NOVO
          status: 'active',
          minimum_quantity: 1,
          maximum_quantity: 1000,
          preparation_time: 0
      });

      // 5. Notificar admins do sistema
      const systemAdmins = await User.filter({ user_type: 'system_admin' });
      for (const admin of systemAdmins) {
        await createNotification({
          userId: admin.id,
          title: "Nova Empresa Cadastrada",
          message: `A empresa "${newTeam.name}" (${BUSINESS_CATEGORIES.find(c => c.value === businessData.category)?.label}) acaba de se cadastrar na plataforma.`,
          linkTo: createPageUrl("AdminBusinesses"),
          icon: 'Building2'
        });
      }

      // 6. Atualizar usuário
      await User.updateMyUserData({
        current_team_id: newTeam.id
      });

      const hasStripeKeys = stripeKeys.public_key.trim() && stripeKeys.secret_key.trim();
      toast({ 
        title: 'Empresa criada com sucesso!', 
        description: hasStripeKeys 
          ? 'Sua empresa foi configurada. Agora você pode adicionar mais produtos e começar a vender!' 
          : 'Sua empresa foi criada! Configure o Stripe para começar a vender.'
      });
      
      // Redirecionar diretamente para o dashboard de negócios
      window.location.href = createPageUrl("BusinessDashboard");

    } catch (error) {
      console.error("Erro ao criar empresa:", error);
      toast({ title: 'Erro', description: 'Não foi possível criar sua empresa. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipStripe = async () => {
    // Limpar as chaves e continuar
    setStripeKeys({ public_key: '', secret_key: '' });
    await handleSubmit();
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Informações da Empresa';
      case 2: return 'Endereço da Sede e Contato';
      case 3: return 'Primeira Área de Entrega';
      case 4: return 'Cadastre seu Primeiro Produto';
      case 5: return 'Configuração de Pagamentos';
      default: return 'Configuração';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Vamos começar com as informações básicas e fiscais da sua empresa.';
      case 2: return 'Informe o endereço da sua sede e os dados de contato.';
      case 3: return 'Defina sua primeira área de cobertura para entregas.';
      case 4: return 'Para começar, adicione pelo menos um produto ao seu catálogo.';
      case 5: return 'Conecte sua conta Stripe para receber pagamentos dos seus clientes.';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="shadow-2xl border-amber-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-amber-900">{getStepTitle()}</CardTitle>
            <CardDescription className="text-lg text-amber-600">{getStepDescription()}</CardDescription>
            
            {/* Indicador de passos */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                <div className={`w-2 sm:w-4 h-1 ${currentStep >= 2 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
                <div className={`w-2 sm:w-4 h-1 ${currentStep >= 3 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>3</div>
                <div className={`w-2 sm:w-4 h-1 ${currentStep >= 4 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 4 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>4</div>
                <div className={`w-2 sm:w-4 h-1 ${currentStep >= 5 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 5 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'}`}>5</div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName" className="text-lg font-semibold text-amber-800">
                    Nome da sua empresa *
                  </Label>
                  <Input 
                    id="businessName"
                    placeholder="Ex: Padaria do João, Restaurante Sabor, Mercado Central..."
                    value={businessData.name}
                    onChange={(e) => handleBusinessDataChange('name', e.target.value)}
                    className="h-12 text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-amber-800">
                    Categoria do negócio *
                  </Label>
                  <Select 
                    value={businessData.category} 
                    onValueChange={(value) => handleBusinessDataChange('category', value)}
                  >
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="Selecione a categoria do seu negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cnpj_cpf" className="text-lg font-semibold text-amber-800">
                        CNPJ ou CPF *
                    </Label>
                    <Input
                        id="cnpj_cpf"
                        placeholder="00.000.000/0000-00 ou 000.000.000-00"
                        value={businessData.cnpj_cpf}
                        onChange={(e) => handleBusinessDataChange('cnpj_cpf', e.target.value)}
                        className="h-12 text-lg"
                        required
                    />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessDescription" className="text-lg font-semibold text-amber-800">
                    Descrição (opcional)
                  </Label>
                  <Textarea
                    id="businessDescription"
                    placeholder="Descreva brevemente seu negócio..."
                    value={businessData.description}
                    onChange={(e) => handleBusinessDataChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  * Campos obrigatórios. Essas informações ajudarão os clientes a encontrar seu negócio.
                </p>
              </div>
            )}

            {currentStep === 2 && ( // NOVO PASSO
                <div className="space-y-8">
                    <div>
                        <h4 className="font-semibold text-xl text-amber-900 mb-4">Endereço da Sede *</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="street" className="text-lg font-semibold text-amber-800">Rua</Label>
                                <Input id="street" value={addressData.street} onChange={(e) => handleAddressDataChange('street', e.target.value)} placeholder="Av. Paulista" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="number" className="text-lg font-semibold text-amber-800">Número</Label>
                                <Input id="number" value={addressData.number} onChange={(e) => handleAddressDataChange('number', e.target.value)} placeholder="1000" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="neighborhood" className="text-lg font-semibold text-amber-800">Bairro</Label>
                                <Input id="neighborhood" value={addressData.neighborhood} onChange={(e) => handleAddressDataChange('neighborhood', e.target.value)} placeholder="Bela Vista" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-lg font-semibold text-amber-800">Cidade</Label>
                                <Input id="city" value={addressData.city} onChange={(e) => handleAddressDataChange('city', e.target.value)} placeholder="São Paulo" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state" className="text-lg font-semibold text-amber-800">Estado</Label>
                                <Select value={addressData.state} onValueChange={(v) => handleAddressDataChange('state', v)}>
                                    <SelectTrigger id="state">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BRAZILIAN_STATES.map(s => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zip_code" className="text-lg font-semibold text-amber-800">CEP</Label>
                                <Input id="zip_code" value={addressData.zip_code} onChange={(e) => handleAddressDataChange('zip_code', e.target.value)} placeholder="01310-100" required />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="complement" className="text-lg font-semibold text-amber-800">Complemento (opcional)</Label>
                                <Input id="complement" value={addressData.complement} onChange={(e) => handleAddressDataChange('complement', e.target.value)} placeholder="Andar, Bloco, Sala..." />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-xl text-amber-900 mb-4">Dados de Contato *</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contactEmail" className="text-lg font-semibold text-amber-800">E-mail de Contato</Label>
                                <Input id="contactEmail" type="email" value={contactData.email} onChange={(e) => handleContactDataChange('email', e.target.value)} placeholder="contato@suaempresa.com.br" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="text-lg font-semibold text-amber-800">WhatsApp (apenas números)</Label>
                                <Input id="whatsapp" type="tel" value={contactData.whatsapp_numbers[0]} onChange={(e) => handleWhatsappChange(0, e.target.value)} placeholder="DDD + Número (ex: 11987654321)" required />
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                        * Campos obrigatórios. O endereço da sede é para registro interno, e os contatos serão usados para comunicação essencial.
                    </p>
                </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-amber-700 bg-amber-50 p-3 rounded-lg">
                  Defina sua <strong>primeira área de entrega</strong>. Você poderá adicionar mais áreas depois nas configurações.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Estado *</Label>
                    <Select value={areaData.state} onValueChange={(value) => handleAreaDataChange('state', value)}>
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map(state => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Cidade *</Label>
                    <Input
                      value={areaData.city}
                      onChange={(e) => handleAreaDataChange('city', e.target.value)}
                      placeholder="Nome da cidade"
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Bairro *</Label>
                    <Input
                      value={areaData.neighborhood}
                      onChange={(e) => handleAreaDataChange('neighborhood', e.target.value)}
                      placeholder="Nome do bairro"
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Condomínio (opcional)</Label>
                    <Input
                      value={areaData.condominium}
                      onChange={(e) => handleAreaDataChange('condominium', e.target.value)}
                      placeholder="Nome do condomínio"
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Taxa de Entrega *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={areaData.delivery_fee}
                      onChange={(e) => handleAreaDataChange('delivery_fee', e.target.value)}
                      placeholder="Ex: 5.00"
                      className="h-12 text-lg"
                    />
                    <p className="text-xs text-amber-600">
                      Valor cobrado por cada entrega nesta área.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-lg font-semibold text-amber-800">Observações (opcional)</Label>
                  <Textarea
                    value={areaData.notes}
                    onChange={(e) => handleAreaDataChange('notes', e.target.value)}
                    placeholder="Observações sobre esta área de entrega"
                    rows={2}
                  />
                </div>
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Nome do Produto *</Label>
                    <Input
                      value={productData.name}
                      onChange={(e) => handleProductDataChange('name', e.target.value)}
                      placeholder="Ex: Pão Francês"
                      className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Categoria *</Label>
                     <Select
                        value={productData.category}
                        onValueChange={(value) => handleProductDataChange('category', value)}
                      >
                        <SelectTrigger className="h-12 text-lg">
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

                   <div className="space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Forma de Venda *</Label>
                    <Select
                        value={productData.unit_type}
                        onValueChange={(value) => handleProductDataChange('unit_type', value)}
                    >
                        <SelectTrigger className="h-12 text-lg">
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
                    <Label className="text-lg font-semibold text-amber-800">{UNIT_TYPES.find(u => u.value === productData.unit_type)?.price_label || 'Preço'} *</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={productData.price_per_unit}
                        onChange={(e) => handleProductDataChange('price_per_unit', e.target.value)}
                        placeholder="0,00"
                        className="h-12 text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Custo por {UNIT_TYPES.find(u => u.value === productData.unit_type)?.label.toLowerCase() || 'unidade'} (opcional)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productData.cost_per_unit}
                        onChange={(e) => handleProductDataChange('cost_per_unit', e.target.value)}
                        placeholder="0,00"
                        className="h-12 text-lg"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-lg font-semibold text-amber-800">Descrição (opcional)</Label>
                    <Textarea
                      value={productData.description}
                      onChange={(e) => handleProductDataChange('description', e.target.value)}
                      placeholder="Descreva seu produto..."
                      rows={2}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-lg font-semibold text-amber-800">Dias de Entrega Disponíveis *</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day.value} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                                <Checkbox
                                    id={`day-${day.value}`}
                                    checked={productData.available_days.includes(day.value)}
                                    onCheckedChange={() => handleDayChange(day.value)}
                                />
                                <Label htmlFor={`day-${day.value}`} className="cursor-pointer font-normal">
                                    {day.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                  </div>
                 </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                  <AlertTriangle className="h-4 w-4 !text-blue-500" />
                  <AlertTitle>Configuração Opcional</AlertTitle>
                  <AlertDescription>
                    Você pode pular esta etapa e configurar o Stripe depois. Sua empresa será criada, mas não ficará disponível para vendas até que as chaves sejam configuradas.
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                  <AlertTriangle className="h-4 w-4 !text-red-500" />
                  <AlertTitle>Aviso de Segurança</AlertTitle>
                  <AlertDescription>
                    Sua chave secreta do Stripe é uma informação sensível. Nunca a compartilhe publicamente ou em locais inseguros.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="public_key" className="flex items-center gap-2 text-lg font-semibold text-amber-800">
                    <Key className="w-4 h-4" /> Chave Publicável (Publishable Key)
                  </Label>
                  <Input
                    id="public_key"
                    value={stripeKeys.public_key}
                    onChange={(e) => handleStripeKeysChange('public_key', e.target.value)}
                    placeholder="pk_live_... (opcional por enquanto)"
                    className="h-12 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secret_key" className="flex items-center gap-2 text-lg font-semibold text-amber-800">
                    <Key className="w-4 h-4" /> Chave Secreta (Secret Key)
                  </Label>
                  <Input
                    id="secret_key"
                    type="password"
                    value={stripeKeys.secret_key}
                    onChange={(e) => handleStripeKeysChange('secret_key', e.target.value)}
                    placeholder="sk_live_... (opcional por enquanto)"
                    className="h-12 text-lg"
                  />
                </div>
                
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  Você pode encontrar suas chaves no seu{' '}
                  <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-amber-800 hover:underline font-medium">
                    Dashboard do Stripe <ExternalLink className="inline-block w-3 h-3" />
                  </a>.
                </p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevStep} disabled={isSaving}>
                  Voltar
                </Button>
              )}
              
              <div className="ml-auto flex gap-2">
                {currentStep < 5 ? (
                  <Button onClick={handleNextStep} className="bg-amber-600 hover:bg-amber-700">
                    Próximo
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleSkipStripe} disabled={isSaving} className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      {isSaving ? 'Criando...' : 'Pular por Agora'}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSaving} className="bg-amber-600 hover:bg-amber-700">
                      {isSaving ? 'Criando empresa...' : 'Finalizar com Stripe'}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}