'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <nav className="bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/customer-dashboard"
              className="text-lg font-semibold"
            >
              Dashboard
            </Link>

            <div className="hidden md:flex space-x-4">
              <Link
                href="/customer-dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/customer-dashboard')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Visão Geral
              </Link>
              <Link
                href="/subscriptions"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/subscriptions')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Assinaturas
              </Link>
              <Link
                href="/financial"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/financial')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Financeiro
              </Link>
              <Link
                href="/support"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/support')
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Suporte
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-300">
              {user.full_name}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Menu móvel */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/customer-dashboard"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/customer-dashboard')
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Visão Geral
          </Link>
          <Link
            href="/subscriptions"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/subscriptions')
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Assinaturas
          </Link>
          <Link
            href="/financial"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/financial')
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Financeiro
          </Link>
          <Link
            href="/support"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/support')
                ? 'bg-slate-800 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Suporte
          </Link>
        </div>
      </div>
    </nav>
  );
}
