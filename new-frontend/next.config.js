/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar strict mode para melhor detecção de problemas em desenvolvimento
  reactStrictMode: true,

  // Configurações de ambiente
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  },

  // Configurações de imagens
  images: {
    domains: [
      'localhost',
      'images.pexels.com', // Para imagens do Pexels
    ],
  },

  // Configurações de redirecionamento
  async redirects() {
    return [
      {
        source: '/',
        destination: '/welcome',
        permanent: true,
      },
    ];
  },

  // Configurações de headers
  async headers() {
    return [
      {
        // Aplicar headers em todas as rotas
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configurações de webpack para otimização
  webpack(config) {
    // Otimizações personalizadas podem ser adicionadas aqui
    return config;
  },

  // Configurações de compilação
  swcMinify: true, // Usar SWC minify para melhor performance
  
  // Configurações de internacionalização
  i18n: {
    locales: ['pt-BR'],
    defaultLocale: 'pt-BR',
  },

  // Configurações de otimização de produção
  experimental: {
    // Habilitar otimizações experimentais
    optimizeCss: true, // Otimizar CSS
    scrollRestoration: true, // Melhorar restauração de scroll
  },
}

module.exports = nextConfig;
