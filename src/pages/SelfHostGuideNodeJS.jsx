import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Server, Database, Key, Clock, Webhook, Download, Code, Shield, ExternalLink, Copy, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CodeBlock = ({ children, lang = 'javascript' }) => (
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

export default function SelfHostGuideNodeJS() {
    return (
        <div className="w-full p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Guia Completo de Self-Hosting (Node.js)</h1>
                <p className="text-slate-600">
                    Instruções completas para exportar e hospedar sua própria instância do Delivery Club usando Node.js, Express e MongoDB/PostgreSQL.
                </p>
            </div>

            <Alert>
                <Download className="h-4 w-4" />
                <AlertTitle>Pré-requisitos do Sistema</AlertTitle>
                <AlertDescription>
                    <strong>Servidor:</strong> Node.js 18+, NPM/Yarn, MongoDB 6.0+/PostgreSQL 13+, Redis, PM2, Nginx<br/>
                    <strong>Conhecimento:</strong> Node.js, Express, bancos NoSQL/SQL, Docker (opcional), webhooks<br/>
                    <strong>Recursos mínimos:</strong> 2GB RAM, 20GB espaço em disco, 2 CPU cores
                </AlertDescription>
            </Alert>

            <WarningBlock>
                <strong>Aviso Importante:</strong> Este processo transfere completamente sua aplicação para sua infraestrutura. 
                Você será responsável por manutenção, backups, segurança e atualizações. Recomendamos ter experiência 
                com administração de servidores e Node.js antes de prosseguir.
            </WarningBlock>

            <GuideStep icon={<Download className="w-6 h-6 text-indigo-600"/>} title="Passo 1: Preparação e Exportação dos Dados">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">1.1 Verificação de Requisitos</h4>
                        <p className="mb-3">Antes de iniciar a exportação, certifique-se de que:</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 ml-4">
                            <li>Todos os dados importantes estão salvos e atualizados</li>
                            <li>Não há operações críticas pendentes (pagamentos, entregas)</li>
                            <li>Você tem as chaves de API do Stripe de todas as empresas</li>
                            <li>Backup de segurança foi realizado</li>
                            <li>Equipe está ciente da migração</li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold text-indigo-800 mb-3">1.2 Processo de Exportação</h4>
                        <ol className="list-decimal list-inside space-y-2 text-indigo-700">
                            <li>Acesse sua conta no Delivery Club como administrador do sistema</li>
                            <li>Navegue para <strong>Administração → Configurações → Exportar Dados</strong></li>
                            <li>Selecione <strong>"Exportação Completa para Self-Hosting"</strong></li>
                            <li>Escolha a opção <strong>"Node.js/Express"</strong> como formato de saída</li>
                            <li>Marque todas as entidades para incluir na exportação:
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li>Usuários e perfis (com senhas hasheadas)</li>
                                    <li>Empresas e equipes (com configurações Stripe)</li>
                                    <li>Produtos e serviços</li>
                                    <li>Assinaturas ativas e históricas</li>
                                    <li>Faturas e pagamentos</li>
                                    <li>Áreas de entrega</li>
                                    <li>Notificações e tickets de suporte</li>
                                    <li>Configurações do sistema</li>
                                </ul>
                            </li>
                            <li>Escolha o banco de dados de destino: <strong>MongoDB</strong> ou <strong>PostgreSQL</strong></li>
                            <li>Clique em <strong>"Gerar Exportação"</strong> e aguarde o processamento (pode levar alguns minutos)</li>
                            <li>Baixe o arquivo <code>delivery-club-export-nodejs-{'{'}data{'}'}.zip</code></li>
                        </ol>
                    </div>

                    <InfoBlock>
                        <strong>Conteúdo da exportação:</strong> O arquivo ZIP contém schemas do banco, dados em JSON, 
                        rotas Express, controllers, middlewares, configurações, package.json e scripts de inicialização 
                        prontos para produção.
                    </InfoBlock>
                </div>
            </GuideStep>

            <GuideStep icon={<Server className="w-6 h-6 text-green-600"/>} title="Passo 2: Configuração do Ambiente Servidor">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">2.1 Instalação do Node.js e Dependências</h4>
                        <CodeBlock lang="bash">{`
# Ubuntu/Debian - Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential

# Instalar ferramentas globais
sudo npm install -g pm2 npm@latest yarn

# Instalar Nginx, Redis e ferramentas do sistema
sudo apt update
sudo apt install nginx redis-server git curl wget unzip htop

# CentOS/RHEL (alternativa)
# curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
# sudo yum install -y nodejs npm redis nginx git

# Verificar instalações
node --version  # Deve ser >= 18.0.0
npm --version
pm2 --version
redis-cli ping  # Deve retornar PONG
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">2.2 Configuração do Banco de Dados</h4>
                        
                        <h5 className="font-medium text-base mb-2">Opção A: MongoDB (Recomendado)</h5>
                        <CodeBlock lang="bash">{`
# Instalar MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Configurar MongoDB
sudo nano /etc/mongod.conf

# Adicionar/modificar:
net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

# Iniciar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Criar usuário admin
mongo
> use admin
> db.createUser({
    user: "admin",
    pwd: "SenhaSeguraAdmin123!",
    roles: ["userAdminAnyDatabase", "readWriteAnyDatabase"]
  })

# Criar banco e usuário da aplicação
> use delivery_club
> db.createUser({
    user: "delivery_user",
    pwd: "SenhaSegura123!",
    roles: ["readWrite"]
  })
> exit
                        `}</CodeBlock>

                        <h5 className="font-medium text-base mb-2 mt-4">Opção B: PostgreSQL (Alternativa)</h5>
                        <CodeBlock lang="sql">{`
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Configurar PostgreSQL
sudo -u postgres psql

-- Criar banco e usuário
CREATE DATABASE delivery_club;
CREATE USER delivery_user WITH PASSWORD 'SenhaSegura123!';
GRANT ALL PRIVILEGES ON DATABASE delivery_club TO delivery_user;
ALTER USER delivery_user CREATEDB;
\\q

# Configurar acesso
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Adicionar linha:
local   delivery_club   delivery_user                   md5

sudo systemctl restart postgresql
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">2.3 Configuração do Redis</h4>
                        <CodeBlock lang="bash">{`
# Configurar Redis para produção
sudo nano /etc/redis/redis.conf

# Modificar/adicionar estas configurações:
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
requirepass SenhaRedisSegura123!

# Para produção, também configurar:
bind 127.0.0.1
protected-mode yes
tcp-backlog 511
tcp-keepalive 300

# Reiniciar Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Testar conexão
redis-cli -a SenhaRedisSegura123! ping
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Code className="w-6 h-6 text-blue-600"/>} title="Passo 3: Instalação da Aplicação Node.js">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">3.1 Preparação do Projeto</h4>
                        <CodeBlock lang="bash">{`
# Criar diretório do projeto
sudo mkdir -p /var/www/delivery-club
cd /var/www/delivery-club

# Fazer upload e extrair o arquivo de exportação
# (Use scp, rsync ou ferramenta de upload de sua preferência)
unzip delivery-club-export-nodejs-*.zip -d .

# Instalar dependências NPM
npm install

# Ou usando Yarn (alternativa)
# yarn install

# Configurar permissões
sudo chown -R $USER:$USER /var/www/delivery-club
chmod -R 755 /var/www/delivery-club

# Criar diretórios necessários
mkdir -p logs uploads temp
chmod 775 logs uploads temp
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">3.2 Configuração do Ambiente (.env)</h4>
                        <CodeBlock lang="bash">{`
# Criar arquivo de configuração
cp .env.example .env
nano .env

# Configurações principais:
NODE_ENV=production
PORT=3000
APP_URL=https://seudominio.com

# Banco de dados - MongoDB
DATABASE_TYPE=mongodb
MONGODB_URI=mongodb://delivery_user:SenhaSegura123!@localhost:27017/delivery_club

# Banco de dados - PostgreSQL (alternativa)
# DATABASE_TYPE=postgresql
# DATABASE_URL=postgresql://delivery_user:SenhaSegura123!@localhost:5432/delivery_club

# JWT
JWT_SECRET=chave_jwt_super_secreta_mude_isso_em_producao_123456789
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://:SenhaRedisSegura123!@localhost:6379

# Stripe - Configurações globais da plataforma
STRIPE_PUBLISHABLE_KEY=pk_live_ou_test_sua_chave_aqui
STRIPE_SECRET_KEY=sk_live_ou_test_sua_chave_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_webhook_aqui

# Email - SendGrid (recomendado)
SENDGRID_API_KEY=SG.sua_chave_sendgrid_aqui
FROM_EMAIL=noreply@seudominio.com

# Email - SMTP alternativo
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=seu-email@gmail.com
# SMTP_PASS=sua-senha-app
# SMTP_SECURE=false

# Upload de arquivos
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=uploads/

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100

# Configurações de sessão
SESSION_SECRET=chave_sessao_super_secreta_mude_isso_123456789
SESSION_MAX_AGE=86400000  # 24 horas

# Logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Configurações de segurança
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://seudominio.com

# Monitoramento (opcional)
ENABLE_METRICS=true
METRICS_PORT=9090
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">3.3 Inicialização e Importação de Dados</h4>
                        <CodeBlock lang="bash">{`
# Executar migração/setup do banco de dados
npm run setup

# Importar dados exportados
npm run import-data

# Ou comandos individuais se disponíveis:
# node scripts/migrate.js
# node scripts/seed.js

# Testar a aplicação em modo desenvolvimento
npm run dev

# Verificar se tudo está funcionando
curl http://localhost:3000/health

# Exemplo de resposta esperada:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z","database":"connected","redis":"connected"}
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">3.4 Estrutura de Arquivos Exportados</h4>
                        <CodeBlock lang="bash">{`
delivery-club/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── subscriptionController.js
│   │   ├── webhookController.js
│   │   └── ...
│   ├── models/
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── Subscription.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── api.js
│   │   ├── webhooks.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimiting.js
│   │   └── ...
│   ├── services/
│   │   ├── stripeService.js
│   │   ├── emailService.js
│   │   ├── notificationService.js
│   │   └── ...
│   └── utils/
│       ├── database.js
│       ├── logger.js
│       └── ...
├── scripts/
│   ├── migrate.js
│   ├── seed.js
│   ├── backup.js
│   └── ...
├── data/
│   ├── users.json
│   ├── teams.json
│   ├── subscriptions.json
│   └── ...
├── config/
│   ├── database.js
│   ├── redis.js
│   └── ...
├── server.js
├── package.json
├── ecosystem.config.js  # Configuração PM2
└── .env.example
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Webhook className="w-6 h-6 text-purple-600"/>} title="Passo 4: Configuração de Webhooks e Pagamentos">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">4.1 Servidor Principal com Webhooks</h4>
                        <CodeBlock>{`
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
require('dotenv').config();

const connectDB = require('./config/database');
const logger = require('./src/utils/logger');

// Rotas
const authRoutes = require('./src/routes/auth');
const apiRoutes = require('./src/routes/api');
const webhookRoutes = require('./src/routes/webhooks');

const app = express();

// Conectar banco de dados
connectDB();

// Configurar Redis para sessões
const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

// Middlewares de segurança
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "js.stripe.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "api.stripe.com"]
        }
    }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(compression());

// Rate limiting global
const globalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { error: 'Muitas requisições, tente novamente em alguns minutos' }
});
app.use(globalLimiter);

// Sessões
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000
    }
}));

// Webhook routes (ANTES do JSON parser)
app.use('/webhooks', webhookRoutes);

// JSON parser para outras rotas
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static('uploads'));

// Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/health', async (req, res) => {
    try {
        // Verificar banco de dados
        const dbStatus = await require('./src/utils/database').checkConnection();
        
        // Verificar Redis
        const redisStatus = await redisClient.ping().then(() => 'connected').catch(() => 'disconnected');
        
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            redis: redisStatus,
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime()
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'error',
            message: 'Service unavailable'
        });
    }
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
    });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(\`🚀 Servidor Delivery Club rodando na porta \${PORT}\`);
    logger.info(\`🌐 Ambiente: \${process.env.NODE_ENV}\`);
});

// Tratamento de sinais do sistema
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    redisClient.quit();
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    redisClient.quit();
    process.exit(0);
});
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">4.2 Controller de Webhook do Stripe</h4>
                        <CodeBlock>{`
// src/controllers/webhookController.js
const stripe = require('stripe');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const ProcessedEvent = require('../models/ProcessedEvent');
const Team = require('../models/Team');
const logger = require('../utils/logger');

class WebhookController {
    async handleStripeWebhook(req, res) {
        const sig = req.headers['stripe-signature'];
        const payload = req.body;
        
        let event;
        
        try {
            // Usar chave webhook global ou específica da empresa
            const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
            event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
        } catch (err) {
            logger.error(\`⚠️  Webhook signature verification failed: \${err.message}\`);
            return res.status(400).send(\`Webhook Error: \${err.message}\`);
        }

        logger.info(\`📨 Webhook recebido: \${event.type} | ID: \${event.id}\`);

        // Verificar se já processamos este evento
        try {
            const existingEvent = await ProcessedEvent.findOne({ 
                stripe_event_id: event.id 
            });
            
            if (existingEvent) {
                logger.info(\`✅ Evento \${event.id} já processado anteriormente\`);
                return res.json({ received: true, message: 'Already processed' });
            }

            // Processar evento baseado no tipo
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutCompleted(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                default:
                    logger.info(\`Tipo de evento não tratado: \${event.type}\`);
            }

            // Marcar evento como processado
            await ProcessedEvent.create({
                stripe_event_id: event.id,
                event_type: event.type,
                processed_at: new Date()
            });

            logger.info(\`✅ Evento \${event.type} processado com sucesso\`);
            res.json({ received: true });

        } catch (error) {
            logger.error(\`❌ Erro ao processar webhook \${event.type}:\`, error);
            res.status(500).json({ error: 'Processing failed' });
        }
    }

    async handleCheckoutCompleted(session) {
        logger.info(\`Processando checkout.session.completed: \${session.id}\`);
        
        const metadata = session.metadata || {};
        
        try {
            if (metadata.type === 'subscription_payment' && metadata.subscription_id) {
                const subscription = await Subscription.findById(metadata.subscription_id);
                
                if (subscription) {
                    // Calcular próxima data de cobrança (30 dias)
                    const nextBillingDate = new Date();
                    nextBillingDate.setDate(nextBillingDate.getDate() + 30);
                    
                    await Subscription.findByIdAndUpdate(subscription._id, {
                        status: 'active',
                        stripe_subscription_id: session.subscription,
                        next_billing_date: nextBillingDate
                    });
                    
                    // Criar primeira fatura
                    await Invoice.create({
                        subscription_id: subscription._id,
                        customer_id: subscription.customer_id,
                        team_id: subscription.team_id,
                        amount: subscription.monthly_price,
                        billing_period_start: new Date(),
                        billing_period_end: new Date(nextBillingDate.getTime() - 86400000), // Um dia antes
                        due_date: new Date(),
                        paid_date: new Date(),
                        status: 'paid',
                        stripe_invoice_id: session.invoice || '',
                        description: 'Primeira cobrança da assinatura'
                    });
                    
                    logger.info(\`✅ Assinatura \${subscription._id} ativada com sucesso\`);
                }
            }
            
            if (metadata.type === 'invoice_payment' && metadata.invoice_id) {
                await Invoice.findByIdAndUpdate(metadata.invoice_id, {
                    status: 'paid',
                    paid_date: new Date()
                });
                logger.info(\`✅ Fatura \${metadata.invoice_id} marcada como paga\`);
            }
        } catch (error) {
            logger.error('Erro ao processar checkout completed:', error);
            throw error;
        }
    }

    async handlePaymentSucceeded(invoice) {
        logger.info(\`Processando invoice.payment_succeeded: \${invoice.id}\`);
        
        try {
            if (invoice.subscription) {
                const subscription = await Subscription.findOne({
                    stripe_subscription_id: invoice.subscription
                });
                
                if (subscription) {
                    const paidDate = new Date(invoice.status_transitions.paid_at * 1000);
                    const periodStart = new Date(invoice.period_start * 1000);
                    const periodEnd = new Date(invoice.period_end * 1000);
                    
                    // Criar/atualizar fatura no nosso sistema
                    await Invoice.create({
                        subscription_id: subscription._id,
                        customer_id: subscription.customer_id,
                        team_id: subscription.team_id,
                        amount: invoice.amount_paid / 100,
                        billing_period_start: periodStart,
                        billing_period_end: periodEnd,
                        due_date: paidDate,
                        paid_date: paidDate,
                        status: 'paid',
                        stripe_invoice_id: invoice.id,
                        description: \`Cobrança mensal - \${periodStart.toLocaleDateString('pt-BR')}\`
                    });
                    
                    // Atualizar próxima data de cobrança
                    const nextBillingDate = new Date(periodEnd);
                    nextBillingDate.setDate(nextBillingDate.getDate() + 1);
                    
                    await Subscription.findByIdAndUpdate(subscription._id, {
                        next_billing_date: nextBillingDate,
                        status: 'active'
                    });
                    
                    logger.info(\`✅ Fatura processada para assinatura \${subscription._id}\`);
                }
            }
        } catch (error) {
            logger.error('Erro ao processar pagamento de fatura:', error);
            throw error;
        }
    }

    async handlePaymentFailed(invoice) {
        logger.info(\`Processando invoice.payment_failed: \${invoice.id}\`);
        
        try {
            if (invoice.subscription) {
                const subscription = await Subscription.findOne({
                    stripe_subscription_id: invoice.subscription
                });
                
                if (subscription) {
                    await Subscription.findByIdAndUpdate(subscription._id, {
                        status: 'past_due'
                    });
                    
                    // Aqui você pode adicionar lógica para notificar o cliente
                    // await this.notifyPaymentFailed(subscription);
                    
                    logger.info(\`✅ Assinatura \${subscription._id} marcada como vencida\`);
                }
            }
        } catch (error) {
            logger.error('Erro ao processar falha no pagamento:', error);
            throw error;
        }
    }

    async handleSubscriptionUpdated(stripeSubscription) {
        logger.info(\`Processando subscription.updated: \${stripeSubscription.id}\`);
        
        try {
            const subscription = await Subscription.findOne({
                stripe_subscription_id: stripeSubscription.id
            });
            
            if (subscription) {
                let status = 'active';
                switch (stripeSubscription.status) {
                    case 'canceled':
                        status = 'cancelled';
                        break;
                    case 'past_due':
                        status = 'past_due';
                        break;
                    case 'paused':
                        status = 'paused';
                        break;
                }
                
                await Subscription.findByIdAndUpdate(subscription._id, { status });
                logger.info(\`✅ Status da assinatura \${subscription._id} atualizado para \${status}\`);
            }
        } catch (error) {
            logger.error('Erro ao atualizar assinatura:', error);
            throw error;
        }
    }

    async handleSubscriptionDeleted(stripeSubscription) {
        logger.info(\`Processando subscription.deleted: \${stripeSubscription.id}\`);
        
        try {
            const subscription = await Subscription.findOne({
                stripe_subscription_id: stripeSubscription.id
            });
            
            if (subscription) {
                await Subscription.findByIdAndUpdate(subscription._id, {
                    status: 'cancelled',
                    cancellation_date: new Date()
                });
                
                logger.info(\`✅ Assinatura \${subscription._id} cancelada\`);
            }
        } catch (error) {
            logger.error('Erro ao cancelar assinatura:', error);
            throw error;
        }
    }
}

module.exports = new WebhookController();
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">4.3 Rotas de Webhook</h4>
                        <CodeBlock>{`
// src/routes/webhooks.js
const express = require('express');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

// Middleware para webhook do Stripe (raw body)
router.use('/stripe', express.raw({ type: 'application/json' }));

// Rota do webhook do Stripe
router.post('/stripe', webhookController.handleStripeWebhook);

// Health check específico para webhooks
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        webhook_service: 'running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
                        `}</CodeBlock>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-2">Configuração no Stripe Dashboard:</h4>
                        <ul className="space-y-1 text-purple-700">
                            <li><strong>URL do Endpoint:</strong> <code>https://seudominio.com/webhooks/stripe</code></li>
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
                        <h4 className="font-semibold text-lg mb-3">5.1 Serviço de Jobs Agendados</h4>
                        <CodeBlock>{`
// src/services/schedulerService.js
const cron = require('node-cron');
const PriceUpdate = require('../models/PriceUpdate');
const Product = require('../models/Product');
const Subscription = require('../models/Subscription');
const SubscriptionItem = require('../models/SubscriptionItem');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

class SchedulerService {
    start() {
        logger.info('🕐 Iniciando scheduler de jobs...');

        // Processar atualizações de preço diariamente às 6h
        cron.schedule('0 6 * * *', async () => {
            logger.info('📈 Processando atualizações de preço...');
            await this.processPriceUpdates();
        }, {
            timezone: "America/Sao_Paulo"
        });

        // Gerar faturas mensais todo dia 1 às 8h
        cron.schedule('0 8 1 * *', async () => {
            logger.info('📄 Gerando faturas mensais...');
            await this.generateMonthlyInvoices();
        }, {
            timezone: "America/Sao_Paulo"
        });

        // Limpeza de dados antigos semanalmente
        cron.schedule('0 2 * * 0', async () => {
            logger.info('🧹 Executando limpeza de dados...');
            await this.cleanupOldData();
        }, {
            timezone: "America/Sao_Paulo"
        });

        // Verificação de saúde do sistema a cada hora
        cron.schedule('0 * * * *', async () => {
            await this.healthCheck();
        });

        // Backup incremental diário às 3h
        cron.schedule('0 3 * * *', async () => {
            logger.info('💾 Executando backup incremental...');
            await this.performIncrementalBackup();
        }, {
            timezone: "America/Sao_Paulo"
        });

        logger.info('✅ Scheduler configurado com sucesso');
    }

    async processPriceUpdates() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const pendingUpdates = await PriceUpdate.find({
                status: 'pending',
                effective_date: today
            }).populate('product_id team_id');

            for (const update of pendingUpdates) {
                try {
                    // Atualizar preço do produto
                    await Product.findByIdAndUpdate(update.product_id, {
                        price_per_unit: update.new_price
                    });

                    // Buscar itens de assinatura afetados
                    const subscriptionItems = await SubscriptionItem.find({
                        product_id: update.product_id
                    }).populate({
                        path: 'subscription_id',
                        match: { status: 'active' }
                    });

                    const affectedCustomers = new Set();

                    for (const item of subscriptionItems) {
                        if (item.subscription_id) {
                            // Atualizar preço unitário no item
                            const oldPrice = item.unit_price;
                            await SubscriptionItem.findByIdAndUpdate(item._id, {
                                unit_price: update.new_price
                            });

                            // Recalcular preço mensal da assinatura
                            await this.recalculateSubscriptionPrice(item.subscription_id._id);
                            
                            // Adicionar cliente à lista de afetados
                            affectedCustomers.add(item.subscription_id.customer_id.toString());
                        }
                    }

                    // Enviar notificações para clientes afetados
                    await this.sendPriceChangeNotifications(update, affectedCustomers);
                    
                    // Marcar como aplicado
                    await PriceUpdate.findByIdAndUpdate(update._id, {
                        status: 'applied',
                        notifications_sent: true
                    });

                    logger.info(\`✅ Atualização de preço processada: \${update.product_id.name}\`);

                } catch (itemError) {
                    logger.error(\`Erro ao processar atualização \${update._id}:\`, itemError);
                }
            }

            logger.info(\`✅ \${pendingUpdates.length} atualizações de preço processadas\`);
        } catch (error) {
            logger.error('❌ Erro ao processar atualizações de preço:', error);
        }
    }

    async recalculateSubscriptionPrice(subscriptionId) {
        try {
            const items = await SubscriptionItem.find({ subscription_id: subscriptionId });
            let monthlyTotal = 0;

            for (const item of items) {
                // Calcular entregas por mês baseado na frequência
                let deliveriesPerMonth = 1;
                
                switch (item.frequency) {
                    case 'weekly':
                        deliveriesPerMonth = (item.delivery_days?.length || 1) * 4.33; // ~4.33 semanas por mês
                        break;
                    case 'bi-weekly':
                        deliveriesPerMonth = 2.17; // ~2.17 entregas por mês
                        break;
                    case 'monthly':
                        deliveriesPerMonth = 1;
                        break;
                }

                const itemMonthlyTotal = (item.quantity_per_delivery || 0) * 
                                       (item.unit_price || 0) * 
                                       deliveriesPerMonth;
                
                // Atualizar subtotal mensal do item
                await SubscriptionItem.findByIdAndUpdate(item._id, {
                    monthly_subtotal: itemMonthlyTotal
                });

                monthlyTotal += itemMonthlyTotal;
            }

            // Atualizar preço mensal da assinatura
            await Subscription.findByIdAndUpdate(subscriptionId, {
                monthly_price: monthlyTotal
            });

        } catch (error) {
            logger.error(\`Erro ao recalcular preço da assinatura \${subscriptionId}:\`, error);
        }
    }

    async sendPriceChangeNotifications(priceUpdate, affectedCustomerIds) {
        try {
            const product = await Product.findById(priceUpdate.product_id);
            const team = await Team.findById(priceUpdate.team_id);
            
            const priceChangePercent = ((priceUpdate.new_price - priceUpdate.old_price) / priceUpdate.old_price * 100).toFixed(1);
            const isIncrease = priceUpdate.new_price > priceUpdate.old_price;

            for (const customerId of affectedCustomerIds) {
                await Notification.create({
                    user_id: customerId,
                    title: \`\${isIncrease ? 'Aumento' : 'Redução'} de Preço - \${team.name}\`,
                    message: \`O preço do produto "\${product.name}" foi \${isIncrease ? 'aumentado' : 'reduzido'} em \${Math.abs(priceChangePercent)}% (de R$ \${priceUpdate.old_price.toFixed(2)} para R$ \${priceUpdate.new_price.toFixed(2)}). \${priceUpdate.reason ? \`Motivo: \${priceUpdate.reason}\` : ''} A mudança já está em vigor.\`,
                    link_to: '/subscriptions',
                    icon: isIncrease ? 'AlertTriangle' : 'TrendingDown'
                });
            }

            logger.info(\`📧 Notificações enviadas para \${affectedCustomerIds.size} clientes\`);
        } catch (error) {
            logger.error('Erro ao enviar notificações de mudança de preço:', error);
        }
    }

    async generateMonthlyInvoices() {
        // Implementar geração automática de faturas mensais
        logger.info('💰 Geração de faturas mensais em desenvolvimento...');
    }

    async cleanupOldData() {
        try {
            // Remover notificações lidas antigas (mais de 90 dias)
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const deletedNotifications = await Notification.deleteMany({
                status: 'read',
                created_date: { $lt: ninetyDaysAgo }
            });

            // Remover eventos processados antigos (mais de 180 dias)
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

            const deletedEvents = await ProcessedEvent.deleteMany({
                processed_at: { $lt: sixMonthsAgo }
            });

            logger.info(\`🧹 Limpeza concluída: \${deletedNotifications.deletedCount} notificações e \${deletedEvents.deletedCount} eventos removidos\`);
        } catch (error) {
            logger.error('Erro na limpeza de dados:', error);
        }
    }

    async healthCheck() {
        try {
            // Verificar conexões essenciais
            const dbConnection = await require('../utils/database').checkConnection();
            const redisConnection = await require('../utils/redis').checkConnection();
            
            if (dbConnection !== 'connected' || redisConnection !== 'connected') {
                logger.warn(\`⚠️  Problemas de conectividade - DB: \${dbConnection}, Redis: \${redisConnection}\`);
                // Aqui você pode implementar alertas (email, Slack, etc.)
            }
        } catch (error) {
            logger.error('Erro no health check:', error);
        }
    }

    async performIncrementalBackup() {
        try {
            // Executar script de backup
            const { exec } = require('child_process');
            exec('/usr/local/bin/delivery-club-backup.sh incremental', (error, stdout, stderr) => {
                if (error) {
                    logger.error('Erro no backup incremental:', error);
                } else {
                    logger.info('✅ Backup incremental concluído');
                }
            });
        } catch (error) {
            logger.error('Erro ao executar backup:', error);
        }
    }
}

module.exports = new SchedulerService();
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">5.2 Configuração PM2 para Produção</h4>
                        <CodeBlock>{`
// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'delivery-club-api',
            script: 'server.js',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            error_file: './logs/pm2-err.log',
            out_file: './logs/pm2-out.log',
            log_file: './logs/pm2-combined.log',
            time: true,
            max_memory_restart: '1G',
            restart_delay: 5000,
            max_restarts: 10,
            min_uptime: '10s',
            watch: false,
            ignore_watch: ['node_modules', 'logs', 'uploads'],
            merge_logs: true,
            cron_restart: '0 4 * * *', // Restart diário às 4h
            autorestart: true,
            kill_timeout: 5000
        },
        {
            name: 'delivery-club-scheduler',
            script: 'src/schedulerRunner.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production'
            },
            error_file: './logs/scheduler-err.log',
            out_file: './logs/scheduler-out.log',
            restart_delay: 10000,
            max_restarts: 5,
            min_uptime: '30s',
            autorestart: true
        },
        {
            name: 'delivery-club-worker',
            script: 'src/queueWorker.js',
            instances: 2,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production'
            },
            error_file: './logs/worker-err.log',
            out_file: './logs/worker-out.log',
            restart_delay: 5000,
            max_restarts: 10,
            min_uptime: '10s',
            autorestart: true
        }
    ]
};
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">5.3 Scripts Auxiliares</h4>
                        <CodeBlock>{`
// src/schedulerRunner.js - Runner separado para o scheduler
require('dotenv').config();
const connectDB = require('../config/database');
const schedulerService = require('./services/schedulerService');
const logger = require('./utils/logger');

async function startScheduler() {
    try {
        // Conectar ao banco de dados
        await connectDB();
        
        // Iniciar scheduler
        schedulerService.start();
        
        logger.info('📅 Scheduler iniciado com sucesso');
        
        // Manter o processo ativo
        process.on('SIGTERM', () => {
            logger.info('Scheduler recebeu SIGTERM, finalizando...');
            process.exit(0);
        });
        
        process.on('SIGINT', () => {
            logger.info('Scheduler recebeu SIGINT, finalizando...');
            process.exit(0);
        });
        
    } catch (error) {
        logger.error('Erro ao iniciar scheduler:', error);
        process.exit(1);
    }
}

startScheduler();

// src/queueWorker.js - Worker para processamento de filas
require('dotenv').config();
const connectDB = require('../config/database');
const logger = require('./utils/logger');

// Aqui você implementaria o processamento de filas
// Por exemplo, usando Bull Queue ou similar

async function startWorker() {
    try {
        await connectDB();
        logger.info('🔄 Queue Worker iniciado');
        
        // Implementar processamento de filas aqui
        
    } catch (error) {
        logger.error('Erro ao iniciar worker:', error);
        process.exit(1);
    }
}

startWorker();
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
upstream delivery_club_backend {
    least_conn;
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s backup;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' api.stripe.com; frame-src js.stripe.com;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Client settings
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;

    # Main application
    location / {
        limit_req zone=general burst=20 nodelay;
        
        proxy_pass http://delivery_club_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://delivery_club_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Authentication routes with stricter rate limiting
    location /api/auth/ {
        limit_req zone=auth burst=3 nodelay;
        
        proxy_pass http://delivery_club_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Webhooks (sem rate limiting para não perder eventos)
    location /webhooks/ {
        proxy_pass http://delivery_club_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout específico para webhooks
        proxy_read_timeout 30s;
    }

    # Static file serving with caching
    location /uploads/ {
        alias /var/www/delivery-club/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options "nosniff";
        
        # Prevent execution of scripts
        location ~* \\.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # Health check
    location /health {
        access_log off;
        proxy_pass http://delivery_club_backend;
    }

    # Security: deny access to sensitive files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~* \\.(env|log|md|json)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Block common exploits
    location ~* (wp-admin|wp-login|xmlrpc) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">6.2 Configuração SSL e Certificados</h4>
                        <CodeBlock lang="bash">{`
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar:
0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"

# Testar renovação
sudo certbot renew --dry-run

# Configurar HSTS preload (opcional)
# Vá para https://hstspreload.org/ e submeta seu domínio

# Melhorar configuração SSL
sudo nano /etc/letsencrypt/options-ssl-nginx.conf

# Adicionar configurações mais seguras:
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">6.3 Configuração de Firewall e Fail2Ban</h4>
                        <CodeBlock lang="bash">{`
# Configurar UFW (Firewall)
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir serviços essenciais
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Configurar fail2ban
sudo apt install fail2ban

# Criar configuração customizada
sudo nano /etc/fail2ban/jail.local

[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 600

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 3600

# Criar filtro customizado para API abuse
sudo nano /etc/fail2ban/filter.d/delivery-club-api.conf

[Definition]
failregex = ^<HOST> - .* ".*" 429 .*$
            ^<HOST> - .* ".*" 401 .*$

# Adicionar ao jail.local
[delivery-club-api]
enabled = true
filter = delivery-club-api
logpath = /var/log/nginx/access.log
maxretry = 10
bantime = 1800

# Iniciar fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">6.4 Configuração de Segurança Node.js</h4>
                        <CodeBlock>{`
// src/middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const validator = require('validator');

// Rate limiting configs
const createRateLimiter = (windowMs, max, message) => rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ 
            error: message,
            retryAfter: Math.round(windowMs / 1000)
        });
    }
});

// Limiters específicos
const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutos
    5, // 5 tentativas
    'Muitas tentativas de login. Tente novamente em 15 minutos.'
);

const apiLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutos
    100, // 100 requests
    'Muitas requisições. Tente novamente em alguns minutos.'
);

const strictLimiter = createRateLimiter(
    60 * 1000, // 1 minuto
    10, // 10 requests
    'Limite de requisições excedido. Aguarde um momento.'
);

// Middleware de validação de entrada
const sanitizeInput = (req, res, next) => {
    // Sanitizar strings em body
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = validator.escape(req.body[key].trim());
            }
        }
    }
    
    // Sanitizar query parameters
    if (req.query) {
        for (const key in req.query) {
            if (typeof req.query[key] === 'string') {
                req.query[key] = validator.escape(req.query[key].trim());
            }
        }
    }
    
    next();
};

// Middleware de validação de arquivos
const validateFileUpload = (req, res, next) => {
    if (!req.file) return next();
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
            error: 'Tipo de arquivo não permitido' 
        });
    }
    
    if (req.file.size > maxSize) {
        return res.status(400).json({ 
            error: 'Arquivo muito grande (máximo 10MB)' 
        });
    }
    
    next();
};

// Helmet configuration
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "js.stripe.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "api.stripe.com"],
            frameSrc: ["js.stripe.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    frameguard: { action: 'sameorigin' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
};

// CORS configuration
const corsConfig = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido pelo CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = {
    authLimiter,
    apiLimiter,
    strictLimiter,
    sanitizeInput,
    validateFileUpload,
    helmetConfig,
    corsConfig
};
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Database className="w-6 h-6 text-emerald-600"/>} title="Passo 7: Backup e Monitoramento">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">7.1 Script de Backup Avançado</h4>
                        <CodeBlock lang="bash">{`
#!/bin/bash
# /usr/local/bin/delivery-club-backup.sh

set -euo pipefail

# Parâmetro de tipo de backup (full ou incremental)
BACKUP_TYPE="\${1:-full}"

# Configurações
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/delivery-club"
PROJECT_DIR="/var/www/delivery-club"

# MongoDB Config
MONGO_USER="admin"
MONGO_PASS="SenhaSeguraAdmin123!"
MONGO_HOST="localhost"
MONGO_DB="delivery_club"
MONGO_PORT="27017"

# S3 Config (opcional)
S3_BUCKET="seu-bucket-de-backup"
S3_PATH="delivery-club/\${BACKUP_TYPE}"

# Retention
RETENTION_DAYS_FULL=30
RETENTION_DAYS_INCREMENTAL=7

# Criar diretório de backup
TEMP_DIR="\$BACKUP_DIR/tmp_\${DATE}"
mkdir -p \$TEMP_DIR

echo "🗄️  Iniciando backup \${BACKUP_TYPE} - \$DATE"

# Função de limpeza
cleanup() {
    rm -rf \$TEMP_DIR
}
trap cleanup EXIT

# 1. Backup do MongoDB
echo "📊 Fazendo backup do MongoDB..."
if [ "\$BACKUP_TYPE" == "full" ]; then
    mongodump --host \$MONGO_HOST --port \$MONGO_PORT --username \$MONGO_USER --password \$MONGO_PASS \\
              --authenticationDatabase admin --db \$MONGO_DB --out \$TEMP_DIR/mongodb/
else
    # Lógica de backup incremental (usando oplog) - complexo, simplificado aqui como dump
    mongodump --host \$MONGO_HOST --port \$MONGO_PORT --username \$MONGO_USER --password \$MONGO_PASS \\
              --authenticationDatabase admin --db \$MONGO_DB --out \$TEMP_DIR/mongodb/
fi
echo "✅ Backup do MongoDB concluído"

# 2. Backup dos uploads
echo "📁 Fazendo backup dos uploads..."
if [ -d "\$PROJECT_DIR/uploads" ]; then
    rsync -a --delete \$PROJECT_DIR/uploads/ \$TEMP_DIR/uploads/
    echo "✅ Backup dos uploads concluído"
fi

# 3. Backup das configurações
echo "⚙️  Fazendo backup das configurações..."
cp \$PROJECT_DIR/.env \$TEMP_DIR/
cp \$PROJECT_DIR/ecosystem.config.js \$TEMP_DIR/

# 4. Backup dos logs importantes
echo "📋 Fazendo backup dos logs..."
cp -r \$PROJECT_DIR/logs \$TEMP_DIR/

# 5. Criar arquivo de informações
echo "ℹ️  Criando arquivo de informações..."
cat > \$TEMP_DIR/backup_info.json << EOF
{
  "backup_date": "\$(date)",
  "backup_type": "\$BACKUP_TYPE",
  "app_version": "\$(cat \$PROJECT_DIR/package.json | grep version | awk '{print $2}' | sed 's/[",]//g')",
  "database_size": "\$(du -sh \$TEMP_DIR/mongodb/ | cut -f1)",
  "uploads_size": "\$(du -sh \$TEMP_DIR/uploads/ | cut -f1)",
  "hostname": "\$(hostname)"
}
EOF

# 6. Compactar backup
FINAL_FILENAME="delivery-club-backup-\${BACKUP_TYPE}-\${DATE}.tar.gz"
echo "🗜️  Compactando backup para \$FINAL_FILENAME..."
tar -czf \$BACKUP_DIR/\$FINAL_FILENAME -C \$BACKUP_DIR tmp_\${DATE}

# 7. Upload para S3 (opcional)
if command -v aws &> /dev/null; then
    echo "☁️  Enviando para S3..."
    aws s3 cp \$BACKUP_DIR/\$FINAL_FILENAME s3://\$S3_BUCKET/\$S3_PATH/
    echo "✅ Upload para S3 concluído"
fi

# 8. Remover backups antigos
echo "🧹 Removendo backups antigos..."
find \$BACKUP_DIR -name "*full*.tar.gz" -mtime +\$RETENTION_DAYS_FULL -delete
find \$BACKUP_DIR -name "*incremental*.tar.gz" -mtime +\$RETENTION_DAYS_INCREMENTAL -delete

echo "🎉 Backup concluído com sucesso: \$FINAL_FILENAME"

# Tornar executável
chmod +x /usr/local/bin/delivery-club-backup.sh

# Adicionar ao crontab:
# 0 2 * * * /usr/local/bin/delivery-club-backup.sh full >> /var/log/backup.log 2>&1
# 0 3-23/6 * * * /usr/local/bin/delivery-club-backup.sh incremental >> /var/log/backup.log 2>&1
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">7.2 Monitoramento com Prometheus e Grafana</h4>
                        <CodeBlock>{`
// src/services/metricsService.js - Exportador de métricas
const client = require('prom-client');
const express = require('express');
const logger = require('../utils/logger');

const Registry = client.Registry;
const register = new Registry();

// Métricas padrão
client.collectDefaultMetrics({ register });

// Métricas customizadas
const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duração dos requests HTTP em ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
});
register.registerMetric(httpRequestDurationMicroseconds);

const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total de requests HTTP',
    labelNames: ['method', 'route', 'code']
});
register.registerMetric(httpRequestCounter);

// ... outras métricas como jobs processados, erros, etc.

const startMetricsServer = () => {
    const app = express();
    app.get('/metrics', async (req, res) => {
        try {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
        } catch (ex) {
            res.status(500).end(ex);
        }
    });

    const port = process.env.METRICS_PORT || 9090;
    app.listen(port, () => {
        logger.info(\`📈 Servidor de métricas rodando na porta \${port}\`);
    });
};

module.exports = {
    startMetricsServer,
    httpRequestDurationMicroseconds,
    httpRequestCounter
};
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">7.3 Logging Estruturado com Winston</h4>
                        <CodeBlock>{`
// src/utils/logger.js
const winston = require('winston');
const path = require('path');

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

const transports = [
    // Console para desenvolvimento
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        ),
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }),
    
    // Arquivo de log combinado
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/app.log'),
        level: 'info',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        tailable: true,
    }),
    
    // Arquivo de log de erros
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
        tailable: true,
    }),
    
    // Arquivo de log de webhooks
    new winston.transports.File({
        filename: path.join(__dirname, '../../logs/webhooks.log'),
        level: 'http',
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        tailable: true,
    }),
];

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    exitOnError: false,
});

// Middleware para logs HTTP
logger.stream = {
    write: (message) => logger.http(message.trim()),
};

// Integração com morgan
const morgan = require('morgan');
const httpLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream: logger.stream }
);

module.exports = {
    logger,
    httpLogger
};
                        `}</CodeBlock>
                    </div>
                </div>
            </GuideStep>

            <GuideStep icon={<Code className="w-6 h-6 text-indigo-600"/>} title="Passo 8: Deploy e Manutenção">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-3">8.1 Script de Deploy Avançado</h4>
                        <CodeBlock lang="bash">{`
#!/bin/bash
# /usr/local/bin/delivery-club-deploy.sh

set -euo pipefail

echo "🚀 Iniciando deploy do Delivery Club..."

# Configurações
PROJECT_DIR="/var/www/delivery-club"
GIT_REPO="https://github.com/yourusername/delivery-club-selfhost.git"
BRANCH="main"

cd $PROJECT_DIR

# 1. Fazer backup antes do deploy
echo "📦 Criando backup pré-deploy..."
/usr/local/bin/delivery-club-backup.sh incremental

# 2. Colocar aplicação em modo de manutenção (opcional)
# (Seu frontend deve lidar com isso gracefully)

# 3. Atualizar código
echo "📥 Atualizando código..."
git fetch origin
git reset --hard origin/\$BRANCH

# 4. Instalar/atualizar dependências
echo "📦 Instalando dependências..."
npm ci --production --ignore-scripts

# 5. Executar migrações do banco de dados
echo "🗄️  Executando migrações..."
npm run migrate

# 6. Limpar caches
echo "🧹 Limpando caches..."
# (Se você usar cache, adicione o comando aqui, ex: redis-cli flushall)

# 7. Construir frontend (se aplicável)
# npm run build-frontend

# 8. Reiniciar aplicação com zero downtime
echo "🔄 Reiniciando aplicação (zero downtime)..."
pm2 reload ecosystem.config.js

# 9. Verificar saúde da aplicação
echo "🔍 Verificando saúde da aplicação..."
sleep 10

HEALTH_CHECK_URL="http://localhost:3000/health"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \$HEALTH_CHECK_URL)

if [ "\$HEALTH_STATUS" = "200" ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Aplicação disponível em: https://seudominio.com"
else
    echo "❌ Falha no health check - HTTP \$HEALTH_STATUS"
    echo "🔄 Tentando rollback..."
    
    # Lógica de rollback (ex: git checkout ao commit anterior e pm2 restart)
    LAST_COMMIT=$(git rev-parse HEAD~1)
    git checkout \$LAST_COMMIT
    npm install --production --ignore-scripts
    pm2 restart ecosystem.config.js
    
    echo "🚨 ROLLBACK CONCLUÍDO. Verifique os logs para investigar a falha."
    exit 1
fi
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">8.2 Comandos CLI customizados</h4>
                        <CodeBlock lang="bash">{`
# package.json
"scripts": {
    "start": "pm2 start ecosystem.config.js",
    "stop": "pm2 stop ecosystem.config.js",
    "restart": "pm2 restart ecosystem.config.js",
    "reload": "pm2 reload ecosystem.config.js",
    "dev": "NODE_ENV=development nodemon server.js",
    "test": "jest --runInBand",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "backup:full": "/usr/local/bin/delivery-club-backup.sh full",
    "backup:incremental": "/usr/local/bin/delivery-club-backup.sh incremental",
    "deploy": "/usr/local/bin/delivery-club-deploy.sh",
    "status": "pm2 status",
    "logs": "pm2 logs",
    "cli": "node scripts/cli.js"
}
                        `}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3">8.3 Manutenção e Monitoramento Contínuo</h4>
                        <ul className="list-disc list-inside space-y-2 text-slate-600">
                            <li><strong>Atualizações de segurança:</strong> Use <code>npm audit</code> regularmente.</li>
                            <li><strong>Monitoramento de logs:</strong> Configure um sistema centralizado como ELK Stack ou Graylog.</li>
                            <li><strong>Rotação de logs:</strong> Use <code>logrotate</code> para gerenciar arquivos de log.</li>
                            <li><strong>Rotação de certificados SSL:</strong> Garanta que o Certbot está renovando automaticamente.</li>
                            <li><strong>Testes de backup:</strong> Realize testes de restore de backup periodicamente.</li>
                        </ul>
                    </div>
                </div>
            </GuideStep>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    🎉 Parabéns! Self-Hosting Concluído
                </h3>
                <p className="text-green-700 mb-4">
                    Sua instância do Delivery Club está agora rodando em Node.js em sua própria infraestrutura. 
                    Para garantir a operação adequada:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-green-800 mb-2">✅ Checklist Pós-Deploy:</h4>
                        <ul className="list-disc list-inside space-y-1 text-green-600 text-sm">
                            <li>Configure backups automáticos diários e semanais</li>
                            <li>Monitore logs de webhook e pagamentos</li>
                            <li>Teste o fluxo completo de assinatura</li>
                            <li>Configure alertas para falhas críticas (CPU, memória, erros)</li>
                            <li>Documente suas customizações e configurações</li>
                            <li>Configure CI/CD para deploys automáticos (GitHub Actions, Jenkins)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-green-800 mb-2">🔧 Manutenção Contínua:</h4>
                        <ul className="list-disc list-inside space-y-1 text-green-600 text-sm">
                            <li>Atualizações de segurança do sistema e dependências</li>
                            <li>Monitoramento de performance com Prometheus/Grafana</li>
                            <li>Rotação de certificados SSL e chaves de API</li>
                            <li>Limpeza de logs e dados antigos</li>
                            <li>Testes de restore de backup trimestrais</li>
                            <li>Revisão de segurança da infraestrutura</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button 
                    onClick={() => window.open('https://nodejs.org/en/docs/', '_blank')}
                    variant="outline" 
                    className="flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Documentação Node.js
                </Button>
                <Button 
                    onClick={() => window.open('https://expressjs.com/en/guide/routing.html', '_blank')}
                    variant="outline" 
                    className="flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Guia do Express
                </Button>
                <Button 
                    onClick={() => window.open('https://pm2.keymetrics.io/docs/usage/quick-start/', '_blank')}
                    variant="outline" 
                    className="flex items-center gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Documentação PM2
                </Button>
            </div>
        </div>
    );
}