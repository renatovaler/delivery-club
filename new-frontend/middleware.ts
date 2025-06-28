import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/welcome',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-storage');
  const { pathname } = request.nextUrl;

  // Redirecionar a raiz para welcome ou dashboard
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/customer-dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  // Permitir acesso a rotas públicas
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // Se já estiver autenticado, redirecionar para o dashboard
    // Exceto para a página de welcome que pode ser vista mesmo autenticado
    if (token && pathname !== '/welcome') {
      return NextResponse.redirect(new URL('/customer-dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Verificar autenticação para rotas protegidas
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /_vercel (Vercel internals)
     * 5. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
};
