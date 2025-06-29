
import React from 'react';
import ReactMarkdown from 'react-markdown';

const SelfHostGuideLaravel = () => {
    const markdownContent = `# **Guia Completo para Self-Hosting do Projeto Delivery Club com Laravel + PostgreSQL**

Este guia detalhado irá te orientar a portar seu projeto da plataforma Base44 para um ambiente self-hosted usando **Laravel** como backend e **PostgreSQL** como banco de dados.

---

## **Visão Geral da Arquitetura**

**Arquitetura Target:**
1.  **Frontend:** React (suas páginas e componentes existentes)
2.  **Backend:** Laravel API (PHP)
3.  **Banco de Dados:** PostgreSQL
4.  **Autenticação:** Laravel Sanctum
5.  **Deploy:** Docker + Docker Compose

---

## **Pré-requisitos**

-   **PHP 8.1+** e **Composer**
-   **Node.js** e **npm/yarn**
-   **PostgreSQL**
-   **Docker e Docker Compose** (recomendado)

---

## **Passo 1: Configuração do Backend Laravel**

### **1.1. Criando o Projeto Laravel**

\`\`\`bash
# Criar novo projeto Laravel
composer create-project laravel/laravel delivery-club-backend

cd delivery-club-backend

# Instalar dependências necessárias
composer require laravel/sanctum
composer require doctrine/dbal
\`\`\`

### **1.2. Configuração do Banco de Dados**

**\`.env\`:**
\`\`\`env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=delivery_club
DB_USERNAME=postgres
DB_PASSWORD=secret

# Configurações do Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
\`\`\`

### **1.3. Configuração do Sanctum**

\`\`\`bash
php artisan vendor:publish --provider="Laravel\\Sanctum\\SanctumServiceProvider"
php artisan migrate
\`\`\`

**\`config/sanctum.php\`:**
\`\`\`php
<?php
return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'middleware' => [
        'verify_csrf_token' => App\\Http\\Middleware\\VerifyCsrfToken::class,
        'encrypt_cookies' => App\\Http\\Middleware\\EncryptCookies::class,
    ],
];
\`\`\`

---

## **Passo 2: Criando as Migrations (Traduzindo suas Entidades)**

### **2.1. Migration para Users**

\`\`\`bash
php artisan make:migration create_users_table
\`\`\`

**\`database/migrations/xxxx_create_users_table.php\`:**
\`\`\`php
<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->string('created_by')->nullable();

            // Campos do Base44 (built-in)
            $table->string('full_name');
            $table->string('email')->unique();
            $table->enum('role', ['admin', 'user'])->default('user');

            // Campos customizados da sua entidade
            $table->string('phone')->nullable();
            $table->json('address')->nullable();
            $table->enum('user_type', ['system_admin', 'business_owner', 'customer'])->nullable();
            $table->uuid('current_team_id')->nullable();
            $table->string('profile_picture')->nullable();
            $table->string('stripe_customer_id')->nullable();

            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
\`\`\`

### **2.2. Migration para Teams**

\`\`\`bash
php artisan make:migration create_teams_table
\`\`\`

**\`database/migrations/xxxx_create_teams_table.php\`:**
\`\`\`php
<?php
use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->timestamps();
            $table->string('created_by')->nullable();

            $table->string('name');
            $table->string('cnpj_cpf');
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->enum('category', ['padaria', 'restaurante', 'mercado', 'farmacia', 'outros'])->default('outros');
            $table->uuid('owner_id');
            $table->json('contact'); // {email, whatsapp_numbers}
            $table->json('address'); // {street, number, complement, neighborhood, city, state, zip_code}
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->enum('subscription_status', ['active', 'paused', 'cancelled', 'trial', 'cancellation_pending'])->default('trial');
            $table->uuid('plan_id')->nullable();
            $table->date('cancellation_effective_date')->nullable();
            $table->json('settings')->nullable();
            $table->text('stripe_public_key')->nullable();
            $table->text('stripe_secret_key')->nullable();

            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('teams');
    }
};
\`\`\`

---

## **Passo 3: Criando os Models**

### **3.1. User Model**

\`\`\`bash
php artisan make:model User
\`\`\`

**\`app/Models/User.php\`:**
\`\`\`php
<?php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Concerns\\HasUuids;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;
use Laravel\\Sanctum\\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'full_name',
        'email',
        'role',
        'phone',
        'address',
        'user_type',
        'current_team_id',
        'profile_picture',
        'stripe_customer_id',
        'created_by'
    ];

    protected $casts = [
        'address' => 'array',
    ];

    public function ownedTeams()
    {
        return $this->hasMany(Team::class, 'owner_id');
    }
}
\`\`\`

### **3.2. Team Model**

\`\`\`bash
php artisan make:model Team
\`\`\`

**\`app/Models/Team.php\`:**
\`\`\`php
<?php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Concerns\\HasUuids;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class Team extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'cnpj_cpf',
        'description',
        'logo',
        'category',
        'owner_id',
        'contact',
        'address',
        'status',
        'subscription_status',
        'plan_id',
        'cancellation_effective_date',
        'settings',
        'stripe_public_key',
        'stripe_secret_key',
        'created_by'
    ];

    protected $casts = [
        'contact' => 'array',
        'address' => 'array',
        'settings' => 'array',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
\`\`\`

---

## **Passo 4: Implementação dos Controllers**

### **4.1. Base Controller**

\`\`\`bash
php artisan make:controller Api/BaseController
\`\`\`

**\`app/Http/Controllers/Api/BaseController.php\`:**
\`\`\`php
<?php
namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;

class BaseController extends Controller
{
    protected function sendSuccess($data, $message = 'Success', $statusCode = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    protected function sendError($message, $errors = [], $statusCode = 400)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $statusCode);
    }
}
\`\`\`

### **4.2. Team Controller**

\`\`\`bash
php artisan make:controller Api/TeamController --api
\`\`\`

**\`app/Http/Controllers/Api/TeamController.php\`:**
\`\`\`php
<?php
namespace App\\Http\\Controllers\\Api;

use App\\Models\\Team;
use Illuminate\\Http\\Request;

class TeamController extends BaseController
{
    public function index(Request $request)
    {
        // Equivalente ao list() e filter()
        $query = Team::with('owner:id,full_name,email');

        // Filtragem
        if ($request->has('owner_id')) {
            $query->where('owner_id', $request->input('owner_id'));
        }
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Ordenação
        $orderBy = $request->input('order_by', 'created_at');
        $orderDir = str_starts_with($orderBy, '-') ? 'desc' : 'asc';
        $orderBy = ltrim($orderBy, '-');
        $query->orderBy($orderBy, $orderDir);

        $teams = $query->paginate($request->input('limit', 20));

        return $this->sendSuccess($teams, 'Teams retrieved successfully.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cnpj_cpf' => 'required|string',
            'owner_id' => 'required|uuid|exists:users,id',
            // Adicione outras validações aqui
        ]);

        $validated['created_by'] = $request->user()->email;
        $team = Team::create($validated);

        return $this->sendSuccess($team, 'Team created successfully.', 201);
    }

    public function show(Team $team)
    {
        $team->load('owner:id,full_name,email', 'products');
        return $this->sendSuccess($team, 'Team retrieved successfully.');
    }

    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            // Adicione outras validações aqui
        ]);

        $team->update($validated);

        return $this->sendSuccess($team, 'Team updated successfully.');
    }

    public function destroy(Team $team)
    {
        $team->delete();
        return $this->sendSuccess(null, 'Team deleted successfully.');
    }
}
\`\`\`

---

## **Passo 5: Definindo as Rotas da API**

**\`routes/api.php\`:**
\`\`\`php
<?php
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Route;
use App\\Http\\Controllers\\Api\\TeamController;
// Importar outros controllers

Route::middleware('auth:sanctum')->group(function () {
    // Rota para obter o usuário autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rotas para Teams (equivale ao SDK Team)
    Route::apiResource('teams', TeamController::class);

    // Adicione outras rotas de recursos aqui
    // Route::apiResource('products', ProductController::class);
    // Route::apiResource('subscriptions', SubscriptionController::class);
});

// Adicione rotas de autenticação aqui (login, etc.)
// Ex: Route::post('/login', [AuthController::class, 'login']);
\`\`\`

---

## **Passo 6: Refatorando o Frontend React**

### **6.1. SDK Client Customizado para Laravel**

**\`src/api/client.js\`:**
\`\`\`javascript
import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    withCredentials: true, // Essencial para o Sanctum
});

// Função para obter o CSRF cookie
export const getCsrfToken = async () => {
    try {
        await axios.get(
            `${process.env.REACT_APP_API_URL.replace('/api', '')}/sanctum/csrf-cookie`
        );
    } catch (error) {
        console.error('Error fetching CSRF token', error);
    }
};

// Interceptor para adicionar o token (se usar tokens de API)
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
\`\`\`

### **6.2. Classes de Entidade Refatoradas**

**\`src/api/entities/Team.js\`:**
\`\`\`javascript
import apiClient from '../client';

export class Team {
  static async get(id) {
    const response = await apiClient.get(`/teams/${id}`);
    return response.data.data;
  }

  static async list(orderBy = '', limit = null) {
    const params = {};
    if (orderBy) params.order_by = orderBy;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/teams', { params });
    return response.data.data.data; // Note a estrutura da paginação do Laravel
  }

  static async filter(conditions = {}, orderBy = '', limit = null) {
    const params = { ...conditions };
    if (orderBy) params.order_by = orderBy;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/teams', { params });
    return response.data.data.data;
  }

  static async create(data) {
    const response = await apiClient.post('/teams', data);
    return response.data.data;
  }

  static async update(id, data) {
    const response = await apiClient.put(`/teams/${id}`, data);
    return response.data.data;
  }

  static async delete(id) {
    await apiClient.delete(`/teams/${id}`);
    return null;
  }
}
\`\`\`

---

## **Próximos Passos e Checklist Final**

Com a base estabelecida, o próximo passo é replicar o processo acima para todas as suas entidades.

### **1. Criar Migrations, Models, Controllers e Rotas**
-   [ ] **Product**
-   [ ] **Subscription** e **SubscriptionItem**
-   [ ] **DeliveryArea**
-   [ ] **TeamMember**
-   [ ] **Invoice**
-   [ ] **Expense**
-   [ ] **Notification**
-   [ ] **SupportTicket** e **TicketMessage**
-   [ ] **Plan**
-   [ ] **ProductCostHistory**
-   [ ] **PlatformReport**, **TeamChangeHistory**, etc.

### **2. Implementar Autenticação**
-   [ ] Criar um `AuthController` para lidar com login, registro e logout.
-   [ ] Implementar o login com Socialite para o Google OAuth, se necessário.
-   [ ] Proteger todas as rotas da API com o middleware `auth:sanctum`.

### **3. Refatorar o Frontend**
-   [ ] Criar as classes de entidade restantes no `src/api/entities/` para corresponder ao SDK customizado.
-   [ ] Atualizar todas as páginas e componentes para usar o novo `apiClient` e as novas classes.
-   [ ] Implementar um `AuthContext` no React para gerenciar o estado de login do usuário, o token e o CSRF.

### **4. Configurar o Docker**
-   [ ] Criar um `Dockerfile` para a aplicação Laravel.
-   [ ] Criar um `Dockerfile` para o frontend React.
-   [ ] Configurar um `docker-compose.yml` para orquestrar os serviços: `nginx` (web server), `app` (laravel), `db` (postgres), `node` (frontend).

### **5. Segurança e Deploy**
-   [ ] Configurar CORS corretamente em `config/cors.php`.
-   [ ] Implementar validação de requests para todas as rotas (`FormRequest`).
-   [ ] Configurar um pipeline de CI/CD (GitHub Actions) para automatizar o build e deploy.
-   [ ] Otimizar o Laravel para produção (`php artisan config:cache`, `php artisan route:cache`).
-   [ ] Configurar filas (`queues`) para tarefas assíncronas (ex: envio de notificações).
`;
    return (
        <div className="p-4 bg-gray-900 text-white font-sans">
             <ReactMarkdown
                className="prose prose-invert max-w-none"
            >{markdownContent}</ReactMarkdown>
        </div>
    );
};

export default SelfHostGuideLaravel;
