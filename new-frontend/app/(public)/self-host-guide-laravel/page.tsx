'use client';

export default function SelfHostGuideLaravelPage(): void {
  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <div className='space-y-8'>
        <div className='text-center'>
          <h1 className='mb-4 text-4xl font-bold text-gray-900'>Guia de Self-Hosting - Laravel</h1>
          <p className='text-xl text-gray-600'>
            Como configurar e hospedar sua própria instância usando Laravel
          </p>
        </div>

        <div className='card'>
          <div className='card-header'>
            <h2 className='text-2xl font-semibold'>Pré-requisitos</h2>
          </div>
          <div className='card-content'>
            <ul className='list-inside list-disc space-y-2'>
              <li>PHP 8.1 ou superior</li>
              <li>Composer</li>
              <li>MySQL 8.0 ou PostgreSQL 13+</li>
              <li>Redis (opcional, para cache)</li>
              <li>Servidor web (Apache/Nginx)</li>
            </ul>
          </div>
        </div>

        <div className='card'>
          <div className='card-header'>
            <h2 className='text-2xl font-semibold'>Passo 1: Instalação</h2>
          </div>
          <div className='card-content'>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 text-lg font-medium'>Clone o repositório:</h3>
                <div className='rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400'>
                  git clone https://github.com/seu-usuario/delivery-club-laravel.git
                  <br />
                  cd delivery-club-laravel
                </div>
              </div>

              <div>
                <h3 className='mb-2 text-lg font-medium'>Instale as dependências:</h3>
                <div className='rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400'>
                  composer install
                  <br />
                  npm install
                  <br />
                  npm run build
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-header'>
            <h2 className='text-2xl font-semibold'>Passo 2: Configuração</h2>
          </div>
          <div className='card-content'>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 text-lg font-medium'>Configure o arquivo .env:</h3>
                <div className='rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400'>
                  cp .env.example .env
                  <br />
                  php artisan key:generate
                </div>
              </div>

              <div>
                <h3 className='mb-2 text-lg font-medium'>Variáveis de ambiente essenciais:</h3>
                <div className='rounded-lg bg-gray-100 p-4 font-mono text-sm'>
                  APP_NAME='Delivery Club'
                  <br />
                  APP_ENV=production
                  <br />
                  APP_KEY=base64:...
                  <br />
                  APP_DEBUG=false
                  <br />
                  APP_URL=https://seu-dominio.com
                  <br />
                  <br />
                  DB_CONNECTION=mysql
                  <br />
                  DB_HOST=127.0.0.1
                  <br />
                  DB_PORT=3306
                  <br />
                  DB_DATABASE=delivery_club
                  <br />
                  DB_USERNAME=seu_usuario
                  <br />
                  DB_PASSWORD=sua_senha
                  <br />
                  <br />
                  STRIPE_KEY=pk_live_...
                  <br />
                  STRIPE_SECRET=sk_live_...
                  <br />
                  STRIPE_WEBHOOK_SECRET=whsec_...
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-header'>
            <h2 className='text-2xl font-semibold'>Passo 3: Banco de Dados</h2>
          </div>
          <div className='card-content'>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 text-lg font-medium'>Execute as migrações:</h3>
                <div className='rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400'>
                  php artisan migrate
                  <br />
                  php artisan db:seed
                </div>
              </div>

              <div>
                <h3 className='mb-2 text-lg font-medium'>Crie um usuário administrador:</h3>
                <div className='rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400'>
                  php artisan make:admin admin@exemplo.com
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-header'>
            <h2 className='text-2xl font-semibold'>Passo 4: Configuração do Servidor</h2>
          </div>
          <div className='card-content'>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 text-lg font-medium'>Nginx (recomendado):</h3>
                <div className='rounded-lg bg-gray-100 p-4 font-mono text-sm'>
                  server &#123;
                  <br />
                  &nbsp;&nbsp;listen 80;
                  <br />
                  &nbsp;&nbsp;server_name seu-dominio.com;
                  <br />
                  &nbsp;&nbsp;root /var/www/delivery-club/public;
                  <br />
                  <br />
                  &nbsp;&nbsp;add_header X-Frame-Options 'SAMEORIGIN';
                  <br />
                  &nbsp;&nbsp;add_header X-Content-Type-Options 'nosniff';
                  <br />
                  <br />
                  &nbsp;&nbsp;index index.php;
                  <br />
                  <br />
                  &nbsp;&nbsp;charset utf-8;
                  <br />
                  <br />
                  &nbsp;&nbsp;location / &#123;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;try_files $uri $uri/ /index.php?$query_string;
                  <br />
                  &nbsp;&nbsp;&#125;
                  <br />
                  <br />
                  &nbsp;&nbsp;location = /favicon.ico &#123; access_log off; log_not_found off;
                  &#125;
                  <br />
                  &nbsp;&nbsp;location = /robots.txt &#123; access_log off; log_not_found off;
                  &#125;
                  <br />
                  <br />
                  &nbsp;&nbsp;error_page 404 /index.php;
                  <br />
                  <br />
                  &nbsp;&nbsp;location ~ \.php$ &#123;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;fastcgi_param SCRIPT_FILENAME
                  $realpath_root$fastcgi_script_name;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;include fastcgi_params;
                  <br />
                  &nbsp;&nbsp;&#125;
                  <br />
                  <br />
                  &nbsp;&nbsp;location ~ /\.(?!well-known).* &#123;
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;deny all;
                  <br />
                  &nbsp;&nbsp;&#125;
                  <br />
                  &#125;
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-header'>
            <h2 className='text-2xl font-semibold'>Passo 5: SSL e Segurança</h2>
          </div>
          <div className='card-content'>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 text-lg font-medium'>Instale o Certbot para SSL gratuito:</h3>
                <div className='rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400'>
                  sudo apt install certbot python3-certbot-nginx
                  <br />
                  sudo certbot --nginx -d seu-dominio.com
                </div>
              </div>

              <div>
                <h3 className='mb-2 text-lg font-medium'>Configure permissões:</h3>
                <div className='rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400'>
                  sudo chown -R www-data:www-data /var/www/delivery-club
                  <br />
                  sudo chmod -R 755 /var/www/delivery-club
                  <br />
                  sudo chmod -R 775 /var/www/delivery-club/storage
                  <br />
                  sudo chmod -R 775 /var/www/delivery-club/bootstrap/cache
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-header'>
            <h2 className='text-2xl font-semibold'>Passo 6: Configuração de Produção</h2>
          </div>
          <div className='card-content'>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 text-lg font-medium'>Otimize para produção:</h3>
                <div className='rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400'>
                  php artisan config:cache
                  <br />
                  php artisan route:cache
                  <br />
                  php artisan view:cache
                  <br />
                  php artisan optimize
                </div>
              </div>

              <div>
                <h3 className='mb-2 text-lg font-medium'>Configure o supervisor para filas:</h3>
                <div className='rounded-lg bg-gray-100 p-4 font-mono text-sm'>
                  [program:delivery-club-worker]
                  <br />
                  process_name=%(program_name)s_%(process_num)02d
                  <br />
                  command=php /var/www/delivery-club/artisan queue:work
                  <br />
                  autostart=true
                  <br />
                  autorestart=true
                  <br />
                  user=www-data
                  <br />
                  numprocs=8
                  <br />
                  redirect_stderr=true
                  <br />
                  stdout_logfile=/var/www/delivery-club/storage/logs/worker.log
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card'>
          <div className='card-header'>
            <h2 className='text-2xl font-semibold'>Suporte e Documentação</h2>
          </div>
          <div className='card-content'>
            <div className='space-y-4'>
              <p>Para mais informações e suporte:</p>
              <ul className='list-inside list-disc space-y-2'>
                <li>
                  <a href='https://laravel.com/docs' className='text-blue-600 hover:underline'>
                    Documentação do Laravel
                  </a>
                </li>
                <li>
                  <a
                    href='https://github.com/seu-usuario/delivery-club-laravel'
                    className='text-blue-600 hover:underline'
                  >
                    Repositório no GitHub
                  </a>
                </li>
                <li>
                  <a
                    href='mailto:suporte@delivery-club.com'
                    className='text-blue-600 hover:underline'
                  >
                    Suporte Técnico
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='text-center'>
          <button onClick={() => window.history.back()} className='btn btn-outline'>
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
