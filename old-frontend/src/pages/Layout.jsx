

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { TeamMember } from "@/api/entities";
import Onboarding from "@/pages/Onboarding";
import {
  Sidebar,
  SidebarContent,
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
} from "@/components/ui/card"; // Added Card imports
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  MapPin,
  Settings,
  LogOut,
  ShoppingCart,
  BarChart3,
  UserCog,
  DollarSign,
  Package,
  Building2,
  Truck,
  MessageCircle,
  Shield,
  HelpCircle,
  TrendingUp,
  Server,
  Code,
  Bell,
  Menu,
  Wrench,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import LocationSelector from "@/components/location/LocationSelector";

const getNavigationItems = (userType, team) => {
  const offeringType = team?.offering_type || 'products';

  const productItem = { title: "Produtos", url: createPageUrl("ProductManagement"), icon: Package };
  const serviceItem = { title: "Serviços", url: createPageUrl("ServiceManagement"), icon: Wrench };
  
  let businessSpecificItems = [];
  if (offeringType === 'products') {
    businessSpecificItems.push(productItem);
  } else if (offeringType === 'services') {
    businessSpecificItems.push(serviceItem);
  } else { // 'both'
    businessSpecificItems.push(productItem, serviceItem);
  }

  const adminItems = [
    { title: "Dashboard", url: createPageUrl("AdminDashboard"), icon: LayoutDashboard },
    { title: "Empresas", url: createPageUrl("AdminBusinesses"), icon: Building2 },
    { title: "Usuários", url: createPageUrl("AdminUsers"), icon: Users },
    { title: "Relatórios", url: createPageUrl("AdminReports"), icon: BarChart3 },
    { title: "Assinaturas", url: createPageUrl("AdminSubscriptions"), icon: CreditCard },
    { title: "Planos", url: createPageUrl("AdminPlans"), icon: CreditCard },
    { title: "Testes do Sistema", url: createPageUrl("AdminSystemTests"), icon: Settings },
    { title: "Self-Host Laravel", url: createPageUrl("SelfHostGuideLaravel"), icon: Server },
    { title: "Self-Host Node.js", url: createPageUrl("SelfHostGuideNodeJS"), icon: Code },
    { title: "FAQ", url: createPageUrl("FAQ"), icon: HelpCircle },
  ];

  const businessOwnerItems = [
    { title: "Dashboard", url: createPageUrl("BusinessDashboard"), icon: LayoutDashboard },
    ...businessSpecificItems,
    { title: "Gestão de Entregas", url: createPageUrl("DeliveryManagement"), icon: Truck },
    { title: "Clientes", url: createPageUrl("Customers"), icon: Users },
    { title: "Financeiro", url: createPageUrl("FinancialManagement"), icon: DollarSign },
    { title: "Histórico de Preços", url: createPageUrl("PriceHistory"), icon: TrendingUp },
    { title: "Faturas da Plataforma", url: createPageUrl("PlatformInvoices"), icon: FileText },
    { title: "Áreas de Cobertura", url: createPageUrl("DeliveryAreas"), icon: MapPin },
    { title: "Configurações", url: createPageUrl("BusinessSettings"), icon: Settings },
    { title: "Equipe", url: createPageUrl("TeamManagement"), icon: UserCog },
    { title: "FAQ", url: createPageUrl("FAQ"), icon: HelpCircle },
  ];
  
  const customerItems = [
    { title: "Dashboard Pessoal", url: createPageUrl("CustomerDashboard"), icon: LayoutDashboard },
    { title: "Minhas Assinaturas", url: createPageUrl("MySubscriptions"), icon: CreditCard },
    { title: "Histórico Financeiro", url: createPageUrl("FinancialHistory"), icon: FileText },
    { title: "Nova Assinatura", url: createPageUrl("NewSubscription"), icon: ShoppingCart },
    { title: "Suporte", url: createPageUrl("CustomerSupport"), icon: MessageCircle },
    { title: "Denúncias", url: createPageUrl("PlatformReports"), icon: Shield },
    { title: "FAQ", url: createPageUrl("FAQ"), icon: HelpCircle },
  ];

  if (userType === 'business_owner') {
    return {
      'Gestão da Empresa': businessOwnerItems,
      'Minha Conta de Cliente': customerItems,
    };
  }

  if (userType === 'system_admin') {
    return { 'Administração': adminItems };
  }

  return { 'Menu Principal': customerItems };
};

const AuthContext = React.createContext(null);
export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTeam, setHasTeam] = useState(false);

  const fetchUserAndTeam = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      if (currentUser.current_team_id) {
        const currentTeam = await Team.get(currentUser.current_team_id);
        setTeam(currentTeam);
        setHasTeam(true);
      } else {
        const userTeams = await Team.filter({ owner_id: currentUser.id });
        if (userTeams.length > 0) {
          await User.updateMyUserData({ current_team_id: userTeams[0].id });
          setTeam(userTeams[0]);
          setHasTeam(true);
        } else {
          const memberOf = await TeamMember.filter({ user_email: currentUser.email, status: 'active' });
          if (memberOf.length > 0) {
            const teamToSet = await Team.get(memberOf[0].team_id);
            await User.updateMyUserData({ current_team_id: teamToSet.id });
            setTeam(teamToSet);
            setHasTeam(true);
          } else {
            setHasTeam(false);
            setTeam(null);
          }
        }
      }
    } catch (error) {
      setUser(null);
      setTeam(null);
      setHasTeam(false);
    }
  };

  useEffect(() => {
    const initialLoad = async () => {
      setIsLoading(true);
      await fetchUserAndTeam();
      setIsLoading(false);
    };
    initialLoad();
  }, []);

  const reloadUserAndTeam = async () => {
    setIsLoading(true);
    await fetchUserAndTeam();
    setIsLoading(false);
  };

  const value = { user, team, isLoading, hasTeam, setTeam, setUser, setHasTeam, reloadUserAndTeam };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const AppLayout = ({ children, currentPageName }) => {
  const { user, team, isLoading, hasTeam, reloadUserAndTeam } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-600 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentPageName === 'Onboarding') {
      return children;
    }
    return <Onboarding />;
  }

  if (user.user_type === 'business_owner' && !hasTeam) {
    return <Onboarding isBusinessSetup={true} />;
  }

  // NOVO: Verificar se o usuário tem localização padrão definida
  if (!user.default_location?.state || !user.default_location?.city) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Defina sua Localização</CardTitle>
            <CardDescription className="text-slate-600">
              Para usar a plataforma, você precisa definir sua localização padrão.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationSelector 
              user={user} 
              reloadUser={reloadUserAndTeam} 
              triggerClassName="w-full justify-center h-12 text-base bg-blue-600 hover:bg-blue-700 text-white"
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const navigationItems = getNavigationItems(user.user_type, team);
  
  // Flatten all navigation items to find the current page title easily
  const allNavItems = Object.values(navigationItems).flat();
  const currentPageTitle = allNavItems.find(item => item.url === location.pathname)?.title || 'Dashboard';
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50/30">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200/60 bg-white/95 backdrop-blur-sm shadow-lg flex-shrink-0">
          <SidebarHeader className="p-6 border-b border-slate-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={team?.logo} alt="Team Logo" />
                  <AvatarFallback className="bg-transparent text-white text-sm font-bold">
                    {team?.name?.charAt(0) || 'D'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm">
                  {team?.name || "Delivery Club"}
                </h2>
                <p className="text-xs text-slate-500">
                  {user.user_type === 'system_admin' && 'Administrador'}
                  {user.user_type === 'business_owner' && 'Empresário'}
                  {user.user_type === 'customer' && 'Cliente'}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarMenu className="space-y-1">
              {Object.entries(navigationItems).map(([sectionTitle, items], index) => (
                <div key={sectionTitle}>
                  {index > 0 && <hr className="my-3 border-slate-200/60" />}
                  <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {sectionTitle}
                  </h3>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Link to={item.url} className="block">
                        <SidebarMenuButton
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                            location.pathname === item.url
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.title}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </div>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t border-slate-200/60 lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto hover:bg-slate-100 rounded-lg"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.profile_picture} alt={user.full_name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm">
                        {user.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm text-slate-900 truncate">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end">
                <DropdownMenuLabel className="text-slate-600">Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Profile")} className="flex items-center">
                    <UserCog className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => User.logout()}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-sm w-full flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-4 w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </SidebarTrigger>
                <div>
                  <h1 className="font-semibold text-slate-900 text-lg">
                    {currentPageTitle}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <LocationSelector user={user} reloadUser={reloadUserAndTeam} triggerClassName="text-slate-700 hover:bg-slate-100" />
                <NotificationBell user={user} />
                <div className="hidden lg:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                          <Avatar className="h-9 w-9">
                              <AvatarImage src={user.profile_picture} alt={user.full_name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                  {user.full_name?.charAt(0)}
                              </AvatarFallback>
                          </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                       <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.full_name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Profile")} className="flex items-center">
                          <UserCog className="mr-2 h-4 w-4" />
                          <span>Perfil</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => User.logout()}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto w-full">
            <div className="w-full min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default function Layout({ children, currentPageName }) {
  return (
    <AuthProvider>
      <AppLayout currentPageName={currentPageName}>{children}</AppLayout>
    </AuthProvider>
  );
}

