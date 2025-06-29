import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Definir rotas protegidas por tipo de usuário
const protectedRoutes = {
  system_admin: [
    '/admin-dashboard',
    '/admin-businesses',
    '/admin-users',
    '/admin-plans',
    '/admin-reports',
    '/admin-system-tests',
    '/admin-user-details'
  ],
  business_owner: [
    '/business-dashboard',
    '/products',
    '/services',
    '/delivery-areas',
    '/team-management',
    '/business-settings'
  ],
  customer: [
    '/customer-dashboard',
    '/my-subscriptions',
    '/payment-history'
  ],
  common: [
    '/support',
    '/profile'
  ]
};

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/welcome',
  '/'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso a rotas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Verificar se há token de autenticação
  const authToken = request.cookies.get('auth-token')?.value;

  if (!authToken) {
    // Redirecionar para login se não estiver autenticado
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Decodificar o token para obter informações do usuário
    // Em produção, você deve validar o token com sua API
    const userInfo = JSON.parse(atob(authToken.split('.')[1]));
    const userType = userInfo.user_type;

    // Verificar se o usuário tem permissão para acessar a rota
    const isAdminRoute = protectedRoutes.system_admin.some(route => pathname.startsWith(route));
    const isBusinessRoute = protectedRoutes.business_owner.some(route => pathname.startsWith(route));
    const isCustomerRoute = protectedRoutes.customer.some(route => pathname.startsWith(route));
    const isCommonRoute = protectedRoutes.common.some(route => pathname.startsWith(route));

    // Permitir acesso a rotas comuns para todos os usuários autenticados
    if (isCommonRoute) {
      return NextResponse.next();
    }

    // Verificar permissões específicas por tipo de usuário
    if (isAdminRoute && userType !== 'system_admin') {
      return NextResponse.redirect(new URL('/customer-dashboard', request.url));
    }

    if (isBusinessRoute && userType !== 'business_owner') {
      return NextResponse.redirect(new URL('/customer-dashboard', request.url));
    }

    if (isCustomerRoute && userType !== 'customer') {
      // Redirecionar para o dashboard apropriado baseado no tipo de usuário
      const redirectPath = userType === 'system_admin' ? '/admin-dashboard' : '/business-dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Token inválido, redirecionar para login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
