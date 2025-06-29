'use client';

export default function SelfHostGuideNodeJSPage(): void {
  const proxyConfig = {
    upgrade: ''upgrade'',
    host: '$host',
    realIp: '$remote_addr',
    forwardedFor: '$proxy_add_x_forwarded_for',
    scheme: '$scheme',
    httpUpgrade: '$http_upgrade',
  };

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      {/* Conteúdo anterior mantido igual até a configuração do Nginx */}

      <div className='card'>
        <div className='card-header'>
          <h2 className='text-2xl font-semibold'>Passo 5: Configuração do Nginx</h2>
        </div>
        <div className='card-content'>
          <div className='space-y-4'>
            <div>
              <h3 className='mb-2 text-lg font-medium'>Configure o Nginx como proxy reverso:</h3>
              <div className='rounded-lg bg-gray-100 p-4 font-mono text-sm'>
                {`# Frontend
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade ${proxyConfig.upgrade};
        proxy_set_header Connection ${proxyConfig.upgrade};
        proxy_set_header Host ${proxyConfig.host};
        proxy_set_header X-Real-IP ${proxyConfig.realIp};
        proxy_set_header X-Forwarded-For ${proxyConfig.forwardedFor};
        proxy_set_header X-Forwarded-Proto ${proxyConfig.scheme};
        proxy_cache_bypass ${proxyConfig.httpUpgrade};
    }
}

# Backend API
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade ${proxyConfig.upgrade};
        proxy_set_header Connection ${proxyConfig.upgrade};
        proxy_set_header Host ${proxyConfig.host};
        proxy_set_header X-Real-IP ${proxyConfig.realIp};
        proxy_set_header X-Forwarded-For ${proxyConfig.forwardedFor};
        proxy_set_header X-Forwarded-Proto ${proxyConfig.scheme};
        proxy_cache_bypass ${proxyConfig.httpUpgrade};
    }
}`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resto do conteúdo mantido igual */}

      <div className='mt-8 text-center'>
        <button onClick={() => window.history.back()} className='btn btn-outline'>
          Voltar
        </button>
      </div>
    </div>
  );
}
