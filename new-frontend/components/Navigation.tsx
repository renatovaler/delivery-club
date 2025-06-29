'use client';

import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Shield,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  roles?: string[];
}

const navigationItems: NavItem[] = [
  // Admin routes
  {
    href: '/admin-dashboard',
    label: 'Dashboard Admin',
    icon: LayoutDashboard,
    roles: ['system_admin']
  },
  {
    href: '/admin-businesses',
    label: 'Empresas',
    icon: Building2,
    roles: ['system_admin']
  },
  {
    href: '/admin-users',
    label: 'Usuários',
    icon: Users,
    roles: ['system_admin']
  },
  {
    href: '/admin-plans',
    label: 'Planos',
    icon: Package,
    roles: ['system_admin']
  },
  {
    href: '/admin-reports',
    label: 'Relatórios',
    icon: BarChart3,
    roles: ['system_admin']
  },
  {
    href: '/admin-system-tests',
    label: 'Testes do Sistema',
    icon: Shield,
    roles: ['system_admin']
  },

  // Business routes
  {
    href: '/business-dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['business_owner']
  },
  {
    href: '/products',
    label: 'Produtos',
    icon: Package,
    roles: ['business_owner']
  },
  {
    href: '/subscriptions',
    label: 'Assinaturas',
    icon: CreditCard,
    roles: ['business_owner']
  },
  {
    href: '/financial',
    label: 'Financeiro',
    icon: FileText,
    roles: ['business_owner']
  },

  // Customer routes
  {
    href: '/customer-dashboard',
    label: 'Meu Dashboard',
    icon: LayoutDashboard,
    roles: ['customer']
  },
  {
    href: '/my-subscriptions',
    label: 'Minhas Assinaturas',
    icon: CreditCard,
    roles: ['customer']
  },
  {
    href: '/payment-history',
    label: 'Histórico de Pagamentos',
    icon: FileText,
    roles: ['customer']
  },

  // Common routes
  {
    href: '/support',
    label: 'Suporte',
    icon: HelpCircle,
    roles: ['system_admin', 'business_owner', 'customer']
  },
  {
    href: '/profile',
    label: 'Perfil',
    icon: Settings,
    roles: ['system_admin', 'business_owner', 'customer']
  }
];

export function Navigation(): void {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = (): void => {
    logout();
  };

  // Don't show navigation on auth pages
  if (!user || ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname) {) {
    return null;
  }

  // Filter navigation items based on user role
  const allowedItems = navigationItems.filter(item =>
    !item.roles || item.roles.includes(user.user_type || 'customer')
  );

  const getUserTypeLabel = (): void => {
    switch (userType) {
      case 'system_admin':
        return 'Administrador';
      case 'business_owner':
        return 'Empresa';
      case 'customer':
        return 'Cliente';
      default:
        return 'Usuário';
    }
  };

  const getThemeColor = (): void => {
    switch (userType) {
      case 'system_admin':
        return 'bg-red-900';
      case 'business_owner':
        return 'bg-blue-900';
      case 'customer':
        return 'bg-slate-900';
      default:
        return 'bg-slate-900';
    }
  };

  return (
    <nav className={`${getThemeColor(user.user_type || 'customer')} text-white shadow-lg`}>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo/Brand */}
          <div className='flex items-center space-x-4'>
            <Link
              href={allowedItems[0]?.href || '/'}
              className='text-xl font-bold flex items-center space-x-2'
            >
              <LayoutDashboard className='w-6 h-6' />
              <span>Delivery Club</span>
            </Link>

            <div className='hidden md:block'>
              <span className='text-xs bg-white/20 px-2 py-1 rounded-full'>
                {getUserTypeLabel(user.user_type || 'customer')}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-1'>
            {allowedItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className='flex items-center space-x-4'>
            <div className='hidden md:block text-right'>
              <div className='text-sm font-medium'>{user.full_name}</div>
              <div className='text-xs text-white/60'>{user.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className='flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors'
            >
              <LogOut className='w-4 h-4' />
              <span className='hidden md:inline'>Sair</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='md:hidden p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white'
            >
              {isMobileMenuOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className='md:hidden border-t border-white/20'>
            <div className='px-2 pt-2 pb-3 space-y-1'>
              {/* User info on mobile */}
              <div className='px-3 py-2 text-sm'>
                <div className='font-medium'>{user.full_name}</div>
                <div className='text-xs text-white/60'>{user.email}</div>
                <div className='text-xs bg-white/20 px-2 py-1 rounded-full inline-block mt-1'>
                  {getUserTypeLabel(user.user_type || 'customer')}
                </div>
              </div>

              <div className='border-t border-white/20 pt-2'>
                {allowedItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                        isActive(item.href)
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className='w-5 h-5' />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
