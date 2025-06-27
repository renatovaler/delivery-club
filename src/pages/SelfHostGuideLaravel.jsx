import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Server, Database, Key, Clock, Webhook, Download, Code, Shield, ExternalLink, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CodeBlock = ({ children, lang = 'php' }) => (
  <pre className="bg-slate-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
    <code className={`language-${lang}`}>{children.trim()}</code>
  </pre>
);

const InfoBlock = ({ children }) => (
    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
        {children}
    </div>
);

const WarningBlock = ({ children }) => (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg text-sm">
        <Shield className="w-4 h-4 inline mr-2" />
        {children}
    </div>
);

const SuccessBlock = ({ children }) => (
    <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-sm">
        <CheckCircle className="w-4 h-4 inline mr-2" />
        {children}
    </div>
);

const GuideStep = ({ icon, title, children }) => (
    <Card className="shadow-lg border-0">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-900">
                {icon}
                <span className="text-xl font-semibold">{title}</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);

export default function SelfHostGuideLaravel() {
    return (
        <div className="w-full p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Guia Completo de Self-Hosting (Laravel)</h1>
                <p className="text-slate-600">
                    Instruções completas para exportar e hospedar sua própria instância do Delivery Club usando Laravel e PHP.
                </p>
            </div>

            <Alert>
                <Download className="h-4 w-4" />
                <AlertTitle>Pré-requisitos do Sistema</AlertTitle>
                <AlertDescription>
                    <strong>Servidor:</strong> PHP 8.1+, Composer, MySQL 8.0+/PostgreSQL 13+, Redis, Nginx/Apache<br/>
                    <strong>Conhecimento:</strong> Laravel, PHP, administração de servidor, webhooks, configuração SSL<br/>
                    <strong>Recursos mínimos:</strong> 2GB RAM, 20GB espaço em disco, 2 CPU cores
                </AlertDescription>
            </Alert>

            <WarningBlock>
                <strong>Aviso Importante:</strong> Este processo transfere completamente sua aplicação para sua infraestrutura. 
                Você será responsável por manutenção, backups, segurança e atualizações. Recomendamos ter experiência 
                com administração de servidores antes de prosseguir.
            </WarningBlock>

            <GuideStep icon={<Download className="w-6 h-6 text-indigo-600"/>} title="Passo 1: Preparação e Exportação dos Dados">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">1.1 Verificação de Requisitos</h4>
                        <p className="mb-3">Antes de iniciar a exportação, certifique-se de que:</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 ml-4">
                            <li>Todos os dados importantes estão salvos e atualizados</li>
                            <li>Não há operações críticas pendentes</li>
                            <li>Você tem as chaves de API do Stripe configuradas</li>
                            <li>Backup de segurança foi realizado</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-3">1.2 Processo de Exportação</h4>
                        <ol className="list-decimal list-inside space-y-2 text-indigo-700">
                            <li>Acesse sua conta no Delivery Club como administrador</li>
                            <li>Navegue para <strong>Administração → Configurações → Exportar Dados</strong></li>
                            <li>Selecione <strong>"Exportação Completa para Self-Hosting"</strong></li>
                            <li>Escolha a opção <strong>"Laravel/PHP"</strong> como formato de saída</li>
                            <li>Marque todas as entidades para incluir na exportação:
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li>Usuários e perfis</li>
                                    <li>Empresas e equipes</li>
                                    <li>Produtos e serviços</li>
                                    <li>Assinaturas e faturas</li>
                                    <li>Áreas de entrega</li>
                                    <li>Configurações do sistema</li>
                                </ul>
                            </li>
                            <li>Clique em <strong>"Gerar Exportação"</strong> e aguarde o processamento</li>
                            <li>Baixe o arquivo <code>delivery-club-export-{'{'}data{'}'}.zip</code></li>
                        </ol>
                    </div>

                    <InfoBlock>
                        <strong>Conteúdo da exportação:</strong> O arquivo ZIP contém migrations, models, seeders, 
                        controllers, rotas, configurações e todos os dados em formato compatível com Laravel.
                    </InfoBlock>
                </div>
            </GuideStep>

            <GuideStep icon={<Server className="w-6 h-6 text-green-600"/>} title="Passo 2: Configuração do Ambiente Servidor">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">2.1 Instalação do PHP e Dependências</h4>
                        <CodeBlock lang="bash">{`
# Ubuntu/Debian
sudo apt update
sudo apt install php8.1-fpm php8.1-mysql php8.1-pgsql php8.1-redis \\
    php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip php8.1-gd \\
    php8.1-bcmath php8.1-intl composer nginx mysql-server redis-server

# CentOS/RHEL
sudo yum install php81-php-fpm php81-php-mysql php81-php-pgsql \\
    php81-php-redis php81-php-mbstring php81-php-xml \\
    php81-php-curl php81-php-zip php81-php-gd composer nginx mysql-server redis

# Verificar instalação
php --version
composer --version
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">2.2 Configuração do Banco de Dados</h4>
                        <CodeBlock lang="sql">{`
-- MySQL
CREATE DATABASE delivery_club CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'delivery_user'@'localhost' IDENTIFIED BY 'SenhaSegura123!';
GRANT ALL PRIVILEGES ON delivery_club.* TO 'delivery_user'@'localhost';
FLUSH PRIVILEGES;

-- PostgreSQL (alternativa)
createdb delivery_club
createuser delivery_user --password
psql -c "GRANT ALL PRIVILEGES ON DATABASE delivery_club TO delivery_user;"
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">2.3 Configuração do Redis</h4>
                        <CodeBlock lang="bash">{`
# Configurar Redis para produção
sudo nano /etc/redis/redis.conf

# Adicionar/modificar estas linhas:
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000

# Reiniciar Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Code className="w-6 h-6 text-blue-600"/>} title="Passo 3: Instalação da Aplicação Laravel">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">3.1 Preparação do Projeto</h4>
                        <CodeBlock lang="bash">{`
# Criar diretório do projeto
sudo mkdir -p /var/www/delivery-club
cd /var/www/delivery-club

# Criar projeto Laravel base
composer create-project laravel/laravel . --prefer-dist

# Instalar dependências específicas do Delivery Club
composer require stripe/stripe-php laravel/sanctum intervention/image \\
    barryvdh/laravel-cors pusher/pusher-php-server \\
    league/flysystem-aws-s3-v3 maatwebsite/excel

# Instalar dependências de desenvolvimento
composer require --dev laravel/telescope barryvdh/laravel-debugbar
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">3.2 Extração e Integração dos Dados Exportados</h4>
                        <CodeBlock lang="bash">{`
# Fazer upload e extrair o arquivo de exportação
cd /var/www/delivery-club
unzip delivery-club-export-*.zip -d temp-export/

# Integrar arquivos do sistema
cp -r temp-export/app/* app/
cp -r temp-export/database/* database/
cp -r temp-export/routes/* routes/
cp -r temp-export/config/* config/
cp -r temp-export/resources/* resources/
cp -r temp-export/public/* public/

# Configurar permissões
sudo chown -R www-data:www-data /var/www/delivery-club
sudo chmod -R 755 /var/www/delivery-club
sudo chmod -R 775 storage bootstrap/cache
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">3.3 Configuração do Ambiente (.env)</h4>
                        <CodeBlock lang="bash">{`
# Configurar arquivo .env
cp .env.example .env
nano .env

# Configurações principais:
APP_NAME="Delivery Club"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://seudominio.com

# Banco de dados
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=delivery_club
DB_USERNAME=delivery_user
DB_PASSWORD=SenhaSegura123!

# Cache e sessões
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Email (exemplo com Gmail)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@seudominio.com

# Stripe (será configurado pelas empresas individualmente)
STRIPE_PUBLIC_KEY=pk_live_ou_test_...
STRIPE_SECRET_KEY=sk_live_ou_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Configurações de upload
FILESYSTEM_DISK=local
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=

# Configurações de performance
OCTANE_SERVER=swoole
TELESCOPE_ENABLED=false
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">3.4 Inicialização da Aplicação</h4>
                        <CodeBlock lang="bash">{`
# Gerar chave da aplicação
php artisan key:generate

# Executar migrações
php artisan migrate

# Executar seeders com dados exportados
php artisan db:seed --class=DatabaseSeeder

# Otimizações para produção
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Instalar Telescope (opcional para monitoramento)
php artisan telescope:install
php artisan migrate

# Criar link simbólico para storage
php artisan storage:link
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Webhook className="w-6 h-6 text-purple-600"/>} title="Passo 4: Configuração de Webhooks e Pagamentos">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">4.1 Controller de Webhook do Stripe</h4>
                        <CodeBlock>{`
<?php
// app/Http/Controllers/StripeWebhookController.php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Stripe\\Stripe;
use Stripe\\Webhook;
use App\\Models\\Subscription;
use App\\Models\\Invoice;
use App\\Models\\ProcessedEvent;
use Illuminate\\Support\\Facades\\Log;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));
        
        $payload = $request->getContent();
        $sig_header = $request->server('HTTP_STRIPE_SIGNATURE');
        
        try {
            $event = Webhook::constructEvent(
                $payload, $sig_header, config('services.stripe.webhook_secret')
            );
        } catch (\\Exception $e) {
            Log::error('Webhook signature verification failed: ' . $e->getMessage());
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Verificar se já processamos este evento
        if (ProcessedEvent::where('stripe_event_id', $event->id)->exists()) {
            return response()->json(['status' => 'already_processed']);
        }

        try {
            switch ($event->type) {
                case 'checkout.session.completed':
                    $this->handleCheckoutCompleted($event->data->object);
                    break;
                case 'invoice.payment_succeeded':
                    $this->handlePaymentSucceeded($event->data->object);
                    break;
                case 'invoice.payment_failed':
                    $this->handlePaymentFailed($event->data->object);
                    break;
                case 'customer.subscription.updated':
                    $this->handleSubscriptionUpdated($event->data->object);
                    break;
                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event->data->object);
                    break;
            }

            // Marcar como processado
            ProcessedEvent::create([
                'stripe_event_id' => $event->id,
                'event_type' => $event->type,
                'processed_at' => now()
            ]);

            return response()->json(['status' => 'success']);
            
        } catch (\\Exception $e) {
            Log::error('Error processing webhook: ' . $e->getMessage());
            return response()->json(['error' => 'Processing failed'], 500);
        }
    }

    private function handleCheckoutCompleted($session)
    {
        $metadata = $session->metadata ?? [];
        
        if ($metadata['type'] === 'subscription_payment' && $metadata['subscription_id']) {
            $subscription = Subscription::find($metadata['subscription_id']);
            if ($subscription) {
                $subscription->update([
                    'status' => 'active',
                    'stripe_subscription_id' => $session->subscription,
                    'next_billing_date' => now()->addMonth()
                ]);
                
                // Criar primeira fatura
                Invoice::create([
                    'subscription_id' => $subscription->id,
                    'customer_id' => $subscription->customer_id,
                    'team_id' => $subscription->team_id,
                    'amount' => $subscription->monthly_price,
                    'billing_period_start' => now(),
                    'billing_period_end' => now()->addMonth()->subDay(),
                    'due_date' => now(),
                    'paid_date' => now(),
                    'status' => 'paid',
                    'stripe_invoice_id' => $session->invoice ?? '',
                    'description' => 'Primeira cobrança da assinatura'
                ]);
            }
        }
    }

    private function handlePaymentSucceeded($invoice)
    {
        if ($invoice->subscription) {
            $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();
            if ($subscription) {
                Invoice::create([
                    'subscription_id' => $subscription->id,
                    'customer_id' => $subscription->customer_id,
                    'team_id' => $subscription->team_id,
                    'amount' => $invoice->amount_paid / 100,
                    'billing_period_start' => date('Y-m-d', $invoice->period_start),
                    'billing_period_end' => date('Y-m-d', $invoice->period_end),
                    'due_date' => date('Y-m-d', $invoice->due_date),
                    'paid_date' => now(),
                    'status' => 'paid',
                    'stripe_invoice_id' => $invoice->id,
                    'description' => 'Cobrança mensal automática'
                ]);
                
                $subscription->update([
                    'next_billing_date' => date('Y-m-d', $invoice->period_end + 86400)
                ]);
            }
        }
    }

    private function handlePaymentFailed($invoice)
    {
        if ($invoice->subscription) {
            $subscription = Subscription::where('stripe_subscription_id', $invoice->subscription)->first();
            if ($subscription) {
                $subscription->update(['status' => 'past_due']);
                
                // Criar notificação para o cliente
                // Implementar sistema de notificações
            }
        }
    }

    private function handleSubscriptionUpdated($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        if ($subscription) {
            $status = match($stripeSubscription->status) {
                'canceled' => 'cancelled',
                'past_due' => 'past_due',
                'paused' => 'paused',
                default => 'active'
            };
            
            $subscription->update(['status' => $status]);
        }
    }

    private function handleSubscriptionDeleted($stripeSubscription)
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();
        if ($subscription) {
            $subscription->update([
                'status' => 'cancelled',
                'cancellation_date' => now()
            ]);
        }
    }
}
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">4.2 Rotas e Middleware</h4>
                        <CodeBlock>{`
// routes/api.php
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])
    ->middleware('api')
    ->name('stripe.webhook');

// app/Http/Middleware/VerifyStripeWebhook.php (opcional)
namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;
use Stripe\\Webhook;

class VerifyStripeWebhook
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $payload = $request->getContent();
            $sig = $request->header('Stripe-Signature');
            
            Webhook::constructEvent(
                $payload, $sig, config('services.stripe.webhook_secret')
            );
            
            return $next($request);
        } catch (\\Exception $e) {
            return response()->json(['error' => 'Invalid webhook'], 400);
        }
    }
}
                        `}</CodeBlock>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">Configuração no Stripe Dashboard:</h4>
                        <ul className="space-y-1 text-purple-700">
                            <li><strong>URL do Endpoint:</strong> <code>https://seudominio.com/api/stripe/webhook</code></li>
                            <li><strong>Eventos para escutar:</strong></li>
                            <li className="ml-4">• checkout.session.completed</li>
                            <li className="ml-4">• invoice.payment_succeeded</li>
                            <li className="ml-4">• invoice.payment_failed</li>
                            <li className="ml-4">• customer.subscription.updated</li>
                            <li className="ml-4">• customer.subscription.deleted</li>
                        </ul>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Clock className="w-6 h-6 text-orange-600"/>} title="Passo 5: Jobs Agendados e Automação">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">5.1 Job de Processamento de Atualizações de Preço</h4>
                        <CodeBlock>{`
<?php
// app/Jobs/ProcessPriceUpdatesJob.php

namespace App\\Jobs;

use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Bus\\Dispatchable;
use Illuminate\\Queue\\InteractsWithQueue;
use Illuminate\\Queue\\SerializesModels;
use App\\Models\\PriceUpdate;
use App\\Models\\Product;
use App\\Models\\Subscription;
use App\\Models\\SubscriptionItem;
use App\\Models\\Notification;

class ProcessPriceUpdatesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $today = now()->format('Y-m-d');
        
        $pendingUpdates = PriceUpdate::where('status', 'pending')
            ->where('effective_date', $today)
            ->get();

        foreach ($pendingUpdates as $update) {
            \\DB::transaction(function () use ($update) {
                // 1. Atualizar preço do produto
                Product::where('id', $update->product_id)
                    ->update(['price_per_unit' => $update->new_price]);

                // 2. Atualizar itens de assinatura ativa
                $subscriptionItems = SubscriptionItem::where('product_id', $update->product_id)
                    ->whereHas('subscription', function ($query) {
                        $query->where('status', 'active');
                    })->get();

                foreach ($subscriptionItems as $item) {
                    $oldItemPrice = $item->unit_price;
                    $item->update(['unit_price' => $update->new_price]);
                    
                    // Recalcular preço mensal da assinatura
                    $this->recalculateSubscriptionPrice($item->subscription_id);
                    
                    // Criar notificação para o cliente
                    $this->createPriceChangeNotification(
                        $item->subscription->customer_id,
                        $update,
                        $oldItemPrice
                    );
                }

                // 3. Marcar atualização como aplicada
                $update->update([
                    'status' => 'applied',
                    'notifications_sent' => true
                ]);
            });
        }
    }

    private function recalculateSubscriptionPrice($subscriptionId)
    {
        $subscription = Subscription::with('items')->find($subscriptionId);
        $monthlyTotal = 0;

        foreach ($subscription->items as $item) {
            // Calcular quantas entregas por mês baseado na frequência
            $deliveriesPerMonth = match($item->frequency) {
                'weekly' => count($item->delivery_days ?? []) * 4.33, // ~4.33 semanas por mês
                'bi-weekly' => 2.17, // ~2.17 entregas por mês
                'monthly' => 1,
                default => 1
            };

            $monthlyTotal += ($item->quantity_per_delivery * $item->unit_price * $deliveriesPerMonth);
        }

        $subscription->update(['monthly_price' => $monthlyTotal]);
    }

    private function createPriceChangeNotification($customerId, $priceUpdate, $oldItemPrice)
    {
        $product = Product::find($priceUpdate->product_id);
        $changePercent = (($priceUpdate->new_price - $oldItemPrice) / $oldItemPrice) * 100;
        $isIncrease = $priceUpdate->new_price > $oldItemPrice;

        Notification::create([
            'user_id' => $customerId,
            'title' => ($isIncrease ? 'Aumento' : 'Redução') . ' de Preço',
            'message' => sprintf(
                'O preço do produto "%s" foi %s em %.1f%% (de R$ %.2f para R$ %.2f). %s',
                $product->name,
                $isIncrease ? 'aumentado' : 'reduzido',
                abs($changePercent),
                $oldItemPrice,
                $priceUpdate->new_price,
                $priceUpdate->reason ? "Motivo: {$priceUpdate->reason}" : ''
            ),
            'link_to' => '/subscriptions',
            'icon' => $isIncrease ? 'AlertTriangle' : 'TrendingDown'
        ]);
    }
}
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">5.2 Configuração do Agendador (Kernel)</h4>
                        <CodeBlock>{`
<?php
// app/Console/Kernel.php

namespace App\\Console;

use Illuminate\\Console\\Scheduling\\Schedule;
use Illuminate\\Foundation\\Console\\Kernel as ConsoleKernel;
use App\\Jobs\\ProcessPriceUpdatesJob;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Processar atualizações de preço diariamente às 6h
        $schedule->job(new ProcessPriceUpdatesJob)
            ->dailyAt('06:00')
            ->withoutOverlapping()
            ->runInBackground();

        // Limpeza de notificações antigas (mensalmente)
        $schedule->command('notifications:cleanup')
            ->monthlyOn(1, '02:00');

        // Backup do banco de dados (diariamente às 3h)
        $schedule->command('backup:database')
            ->dailyAt('03:00')
            ->runInBackground();

        // Limpeza de logs antigos (semanalmente)
        $schedule->command('logs:clear')
            ->weekly()
            ->sundays()
            ->at('04:00');

        // Otimização de cache (diariamente às 2h)
        $schedule->command('cache:prune-stale-tags')
            ->dailyAt('02:00');

        // Relatórios automáticos (primeiro dia do mês às 8h)
        $schedule->command('reports:generate-monthly')
            ->monthlyOn(1, '08:00');
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">5.3 Configuração do Crontab</h4>
                        <CodeBlock lang="bash">{`
# Adicionar ao crontab do servidor (crontab -e como www-data)
* * * * * cd /var/www/delivery-club && php artisan schedule:run >> /dev/null 2>&1

# Configurar supervisor para queues (opcional mas recomendado)
sudo apt install supervisor

# Criar arquivo /etc/supervisor/conf.d/delivery-club-worker.conf
[program:delivery-club-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/delivery-club/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/delivery-club/storage/logs/worker.log
stopwaitsecs=3600

# Ativar e iniciar
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start delivery-club-worker:*
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Shield className="w-6 h-6 text-red-600"/>} title="Passo 6: Configuração de Produção e Segurança">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">6.1 Configuração do Nginx</h4>
                        <CodeBlock lang="nginx">{`
# /etc/nginx/sites-available/delivery-club
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    root /var/www/delivery-club/public;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' api.stripe.com;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    index index.php;

    charset utf-8;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    # PHP Processing
    location ~ \\.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # API Rate Limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Login Rate Limiting
    location /login {
        limit_req zone=login burst=5 nodelay;
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Stripe Webhook (sem rate limiting)
    location /api/stripe/webhook {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Static Assets Caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Deny access to hidden files
    location ~ /\\. {
        deny all;
    }

    # Deny access to sensitive files
    location ~* \\.(env|log|htaccess)$ {
        deny all;
    }
}
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">6.2 Configuração SSL com Let's Encrypt</h4>
                        <CodeBlock lang="bash">{`
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet

# Testar configuração SSL
sudo nginx -t
sudo systemctl reload nginx
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">6.3 Configuração de Segurança PHP</h4>
                        <CodeBlock lang="bash">{`
# Editar configuração PHP
sudo nano /etc/php/8.1/fpm/php.ini

# Configurações de segurança recomendadas:
expose_php = Off
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
max_execution_time = 60
max_input_time = 60
memory_limit = 256M
post_max_size = 64M
upload_max_filesize = 32M
max_file_uploads = 20
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1

# Reiniciar PHP-FPM
sudo systemctl restart php8.1-fpm
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">6.4 Firewall e Segurança do Servidor</h4>
                        <CodeBlock lang="bash">{`
# Configurar UFW (Firewall)
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3306  # MySQL (apenas se necessário externamente)

# Configurar fail2ban
sudo apt install fail2ban
sudo nano /etc/fail2ban/jail.local

[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Database className="w-6 h-6 text-emerald-600"/>} title="Passo 7: Backup e Monitoramento">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">7.1 Script de Backup Automático</h4>
                        <CodeBlock lang="bash">{`
#!/bin/bash
# /usr/local/bin/delivery-club-backup.sh

set -e

# Configurações
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/delivery-club"
PROJECT_DIR="/var/www/delivery-club"
DB_NAME="delivery_club"
DB_USER="delivery_user"
DB_PASS="SenhaSegura123!"
RETENTION_DAYS=30

# Criar diretório de backup
mkdir -p $BACKUP_DIR/$DATE

echo "🗄️  Iniciando backup completo - $DATE"

# 1. Backup do banco de dados
echo "📊 Fazendo backup do banco de dados..."
mysqldump -u$DB_USER -p$DB_PASS --single-transaction --routines --triggers $DB_NAME > $BACKUP_DIR/$DATE/database.sql

# 2. Backup dos arquivos de upload
echo "📁 Fazendo backup dos uploads..."
if [ -d "$PROJECT_DIR/storage/app/public" ]; then
    tar -czf $BACKUP_DIR/$DATE/uploads.tar.gz -C $PROJECT_DIR/storage/app public/
fi

# 3. Backup das configurações
echo "⚙️  Fazendo backup das configurações..."
cp $PROJECT_DIR/.env $BACKUP_DIR/$DATE/
cp -r $PROJECT_DIR/config $BACKUP_DIR/$DATE/

# 4. Backup dos logs importantes
echo "📋 Fazendo backup dos logs..."
tar -czf $BACKUP_DIR/$DATE/logs.tar.gz -C $PROJECT_DIR/storage logs/

# 5. Criar arquivo de informações do backup
echo "ℹ️  Criando arquivo de informações..."
cat > $BACKUP_DIR/$DATE/backup_info.txt << EOF
Backup criado em: $(date)
Versão da aplicação: $(cd $PROJECT_DIR && php artisan --version)
Tamanho do banco: $(du -h $BACKUP_DIR/$DATE/database.sql | cut -f1)
Servidor: $(hostname)
EOF

# 6. Compactar backup completo
echo "🗜️  Compactando backup..."
tar -czf $BACKUP_DIR/delivery-club-backup-$DATE.tar.gz -C $BACKUP_DIR $DATE/
rm -rf $BACKUP_DIR/$DATE

# 7. Remover backups antigos
echo "🧹 Removendo backups antigos..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 8. Upload para cloud (opcional)
# aws s3 cp $BACKUP_DIR/delivery-club-backup-$DATE.tar.gz s3://seu-bucket/backups/

echo "✅ Backup concluído: delivery-club-backup-$DATE.tar.gz"

# Tornar executável
chmod +x /usr/local/bin/delivery-club-backup.sh

# Adicionar ao crontab para execução diária às 2h
# 0 2 * * * /usr/local/bin/delivery-club-backup.sh >> /var/log/backup.log 2>&1
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">7.2 Monitoramento com Laravel Telescope</h4>
                        <CodeBlock>{`
// config/telescope.php
'enabled' => env('TELESCOPE_ENABLED', false),

'path' => 'admin/telescope',

'driver' => env('TELESCOPE_DRIVER', 'database'),

'storage' => [
    'database' => [
        'connection' => env('DB_CONNECTION', 'mysql'),
        'chunk' => 1000,
    ],
],

'watchers' => [
    Watchers\\CacheWatcher::class => env('TELESCOPE_CACHE_WATCHER', true),
    Watchers\\CommandWatcher::class => env('TELESCOPE_COMMAND_WATCHER', true),
    Watchers\\DumpWatcher::class => env('TELESCOPE_DUMP_WATCHER', true),
    Watchers\\EventWatcher::class => env('TELESCOPE_EVENT_WATCHER', true),
    Watchers\\ExceptionWatcher::class => env('TELESCOPE_EXCEPTION_WATCHER', true),
    Watchers\\JobWatcher::class => env('TELESCOPE_JOB_WATCHER', true),
    Watchers\\LogWatcher::class => env('TELESCOPE_LOG_WATCHER', true),
    Watchers\\MailWatcher::class => env('TELESCOPE_MAIL_WATCHER', true),
    Watchers\\ModelWatcher::class => env('TELESCOPE_MODEL_WATCHER', true),
    Watchers\\NotificationWatcher::class => env('TELESCOPE_NOTIFICATION_WATCHER', true),
    Watchers\\QueryWatcher::class => [
        'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
        'slow' => 100,
    ],
    Watchers\\RedisWatcher::class => env('TELESCOPE_REDIS_WATCHER', true),
    Watchers\\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
        'size_limit' => env('TELESCOPE_RESPONSE_SIZE_LIMIT', 64),
    ],
    Watchers\\ScheduleWatcher::class => env('TELESCOPE_SCHEDULE_WATCHER', true),
    Watchers\\ViewWatcher::class => env('TELESCOPE_VIEW_WATCHER', true),
],
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">7.3 Health Check e Monitoramento</h4>
                        <CodeBlock>{`
<?php
// routes/web.php - Health check endpoint

Route::get('/health', function () {
    $checks = [];
    
    // Database check
    try {
        \\DB::connection()->getPdo();
        $checks['database'] = 'ok';
    } catch (\\Exception $e) {
        $checks['database'] = 'error: ' . $e->getMessage();
    }
    
    // Redis check
    try {
        \\Redis::ping();
        $checks['redis'] = 'ok';
    } catch (\\Exception $e) {
        $checks['redis'] = 'error: ' . $e->getMessage();
    }
    
    // Storage check
    $checks['storage_writable'] = is_writable(storage_path()) ? 'ok' : 'error';
    
    // Queue check
    $failedJobs = \\DB::table('failed_jobs')->count();
    $checks['failed_jobs'] = $failedJobs;
    
    $allHealthy = collect($checks)->every(function ($status, $key) {
        return $key === 'failed_jobs' ? $status < 10 : $status === 'ok';
    });
    
    return response()->json([
        'status' => $allHealthy ? 'healthy' : 'unhealthy',
        'timestamp' => now()->toISOString(),
        'checks' => $checks,
        'version' => config('app.version', '1.0.0')
    ], $allHealthy ? 200 : 503);
});

// Script de monitoramento externo
// /usr/local/bin/health-check.sh
#!/bin/bash
HEALTH_URL="https://seudominio.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE != "200" ]; then
    echo "⚠️  Aplicação não está saudável - HTTP $RESPONSE"
    # Enviar alerta (email, Slack, etc.)
    # curl -X POST -H 'Content-type: application/json' --data '{"text":"🚨 Delivery Club está com problemas!"}' YOUR_SLACK_WEBHOOK
else
    echo "✅ Aplicação está saudável"
fi
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Code className="w-6 h-6 text-indigo-600"/>} title="Passo 8: Deploy e Manutenção">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">8.1 Script de Deploy Automatizado</h4>
                        <CodeBlock lang="bash">{`
#!/bin/bash
# /usr/local/bin/delivery-club-deploy.sh

set -e

echo "🚀 Iniciando deploy do Delivery Club..."

# Configurações
PROJECT_DIR="/var/www/delivery-club"
BACKUP_DIR="/backups/delivery-club"
GIT_REPO="https://github.com/yourusername/delivery-club-selfhost.git"
BRANCH="main"

cd $PROJECT_DIR

# 1. Fazer backup antes do deploy
echo "📦 Criando backup pré-deploy..."
/usr/local/bin/delivery-club-backup.sh

# 2. Colocar aplicação em modo de manutenção
echo "🔧 Ativando modo de manutenção..."
php artisan down --message="Atualizando sistema..." --retry=60

# 3. Atualizar código
echo "📥 Atualizando código..."
git fetch origin
git reset --hard origin/$BRANCH

# 4. Instalar/atualizar dependências
echo "📦 Instalando dependências..."
composer install --no-dev --optimize-autoloader

# 5. Executar migrações
echo "🗄️  Executando migrações..."
php artisan migrate --force

# 6. Otimizar aplicação
echo "⚡ Otimizando aplicação..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 7. Limpar caches antigos
php artisan cache:clear
php artisan queue:restart

# 8. Verificar permissões
echo "🔐 Verificando permissões..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR
chmod -R 775 storage bootstrap/cache

# 9. Reativar aplicação
echo "✅ Reativando aplicação..."
php artisan up

# 10. Verificar se a aplicação está funcionando
echo "🔍 Verificando saúde da aplicação..."
sleep 5

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://seudominio.com/health)
if [ $HEALTH_CHECK = "200" ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Aplicação disponível em: https://seudominio.com"
else
    echo "❌ Falha no health check - HTTP $HEALTH_CHECK"
    echo "🔄 Verificando logs..."
    tail -n 50 storage/logs/laravel.log
    exit 1
fi

# Tornar executável
chmod +x /usr/local/bin/delivery-club-deploy.sh
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">8.2 Comandos Artisan Customizados</h4>
                        <CodeBlock>{`
<?php
// app/Console/Commands/SystemStatus.php

namespace App\\Console\\Commands;

use Illuminate\\Console\\Command;

class SystemStatus extends Command
{
    protected $signature = 'system:status';
    protected $description = 'Exibe status completo do sistema';

    public function handle()
    {
        $this->info('📊 Status do Sistema Delivery Club');
        $this->line('');

        // Status do banco
        try {
            \\DB::connection()->getPdo();
            $this->line('✅ Banco de dados: Conectado');
        } catch (\\Exception $e) {
            $this->error('❌ Banco de dados: Erro - ' . $e->getMessage());
        }

        // Status do Redis
        try {
            \\Redis::ping();
            $this->line('✅ Redis: Conectado');
        } catch (\\Exception $e) {
            $this->error('❌ Redis: Erro - ' . $e->getMessage());
        }

        // Estatísticas do sistema
        $userCount = \\App\\Models\\User::count();
        $teamCount = \\App\\Models\\Team::count();
        $activeSubscriptions = \\App\\Models\\Subscription::where('status', 'active')->count();
        $pendingInvoices = \\App\\Models\\Invoice::where('status', 'pending')->count();

        $this->line('');
        $this->info('📈 Estatísticas:');
        $this->line("👥 Usuários: {$userCount}");
        $this->line("🏢 Empresas: {$teamCount}");
        $this->line("📋 Assinaturas ativas: {$activeSubscriptions}");
        $this->line("💰 Faturas pendentes: {$pendingInvoices}");

        // Jobs com falha
        $failedJobs = \\DB::table('failed_jobs')->count();
        if ($failedJobs > 0) {
            $this->warn("⚠️  Jobs com falha: {$failedJobs}");
        } else {
            $this->line('✅ Nenhum job com falha');
        }

        // Storage
        $storageUsed = $this->formatBytes($this->getDirectorySize(storage_path()));
        $this->line("💾 Uso do storage: {$storageUsed}");

        return 0;
    }

    private function getDirectorySize($directory)
    {
        $size = 0;
        foreach (new \\RecursiveIteratorIterator(new \\RecursiveDirectoryIterator($directory)) as $file) {
            $size += $file->getSize();
        }
        return $size;
    }

    private function formatBytes($size, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
            $size /= 1024;
        }
        return round($size, $precision) . ' ' . $units[$i];
    }
}
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">8.3 Monitoramento de Performance</h4>
                        <CodeBlock lang="bash">{`
#!/bin/bash
# /usr/local/bin/performance-monitor.sh

# Monitoramento de recursos do sistema
echo "📊 Monitoramento de Performance - $(date)"
echo "=================================="

# CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
echo "🖥️  CPU: \${CPU_USAGE}%"

# Memória
MEMORY_INFO=$(free -h | grep '^Mem')
MEMORY_USED=$(echo $MEMORY_INFO | awk '{print $3}')
MEMORY_TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
echo "💾 Memória: \${MEMORY_USED}/\${MEMORY_TOTAL}"

# Disco
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}')
echo "💿 Disco: \${DISK_USAGE}"

# MySQL
MYSQL_PROCESSES=$(mysql -u delivery_user -pSenhaSegura123! -e "SHOW PROCESSLIST;" | wc -l)
echo "🗄️  MySQL Connections: \${MYSQL_PROCESSES}"

# Nginx
NGINX_CONNECTIONS=$(curl -s http://localhost/nginx_status | grep "Active connections" | awk '{print $3}')
echo "🌐 Nginx Connections: \${NGINX_CONNECTIONS}"

# PHP-FPM
PHP_PROCESSES=$(ps aux | grep php-fpm | grep -v grep | wc -l)
echo "🐘 PHP-FPM Processes: \${PHP_PROCESSES}"

# Laravel Queue
QUEUE_SIZE=$(cd /var/www/delivery-club && php artisan queue:size)
echo "📋 Queue Size: \${QUEUE_SIZE}"

# Logs de erro recentes
ERROR_COUNT=$(tail -n 1000 /var/www/delivery-club/storage/logs/laravel.log | grep ERROR | wc -l)
echo "❌ Erros recentes (últimas 1000 linhas): \${ERROR_COUNT}"

echo ""

# Alertas
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "🚨 ALERTA: CPU usage alto (\${CPU_USAGE}%)"
fi

if [[ "$DISK_USAGE" == *9[0-9]%* ]] || [[ "$DISK_USAGE" == *100%* ]]; then
    echo "🚨 ALERTA: Disco quase cheio (\${DISK_USAGE})"
fi

if [ $ERROR_COUNT -gt 50 ]; then
    echo "🚨 ALERTA: Muitos erros recentes (\$ERROR_COUNT)"
fi

# Adicionar ao crontab para executar a cada 5 minutos:
# */5 * * * * /usr/local/bin/performance-monitor.sh >> /var/log/performance.log
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    🎉 Parabéns! Self-Hosting Concluído
                </h3>
                <p className="text-green-700 mb-4">
                    Sua instância do Delivery Club está agora rodando em Laravel em sua própria infraestrutura. 
                    Para garantir a operação adequada:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-green-800 mb-2">✅ Checklist Pós-Deploy:</h4>
                        <ul className="list-disc list-inside space-y-1 text-green-600 text-sm">
                            <li>Configure backups automáticos diários</li>
                            <li>Monitore logs de webhook e pagamentos</li>
                            <li>Teste o fluxo completo de assinatura</li>
                            <li>Configure alertas para falhas críticas</li>
                            <li>Documente suas customizações</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-green-800 mb-2">🔧 Manutenção Contínua:</h4>
                        <ul className="list-disc list-inside space-y-1 text-green-600 text-sm">
                            <li>Atualizações de segurança mensais</li>
                            <li>Monitoramento de performance</li>
                            <li>Rotação de certificados SSL</li>
                            <li>Limpeza de logs antigos</li>
                            <li>Testes de backup e restore</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button 
                    onClick={() => window.open('https://laravel.com/docs', '_blank')}
                    variant="outline" 
                    className="flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Documentação Laravel
                </Button>
                <Button 
                    onClick={() => window.open('https://stripe.com/docs/webhooks', '_blank')}
                    variant="outline" 
                    className="flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Webhooks Stripe
                </Button>
                <Button 
                    onClick={() => window.open('https://laravel.com/docs/deployment', '_blank')}
                    variant="outline" 
                    className="flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Deploy Laravel
                </Button>
            </div>
        </div>
    );
}