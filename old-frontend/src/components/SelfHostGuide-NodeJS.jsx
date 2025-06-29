
import React from 'react';
import ReactMarkdown from 'react-markdown';

const SelfHostGuideNodeJS = () => {
    const markdownContent = `# Guia Completo para Self-Hosting do Projeto Delivery Club com Node.js + Express + PostgreSQL

Este guia detalhado irá te orientar a portar seu projeto da plataforma Base44 para um ambiente self-hosted usando **Node.js + Express** como backend e **PostgreSQL** como banco de dados.

---

## Visão Geral da Arquitetura

**Arquitetura Target:**
1. **Frontend:** React (suas páginas e componentes existentes)
2. **Backend:** Node.js + Express.js + TypeScript
3. **ORM:** Prisma (para interação com banco de dados)
4. **Banco de Dados:** PostgreSQL
5. **Autenticação:** JWT + Passport.js (Google OAuth)
6. **Deploy:** Docker + Docker Compose

---

## Pré-requisitos

- **Node.js 18+** e **npm/yarn**
- **PostgreSQL**
- **Docker e Docker Compose** (recomendado)

---

## Passo 1: Configuração do Backend Node.js + Express

### 1.1. Criando o Projeto Backend

\`\`\`bash
# Criar pasta do projeto
mkdir delivery-club-backend
cd delivery-club-backend

# Inicializar projeto Node.js
npm init -y

# Instalar dependências principais
npm install express cors helmet morgan dotenv
npm install bcryptjs jsonwebtoken passport passport-google-oauth20 passport-jwt
npm install prisma @prisma/client
npm install multer express-rate-limit express-validator

# Dependências de desenvolvimento
npm install -D @types/node @types/express @types/cors @types/bcryptjs
npm install -D @types/jsonwebtoken @types/passport @types/passport-google-oauth20
npm install -D @types/passport-jwt @types/multer nodemon ts-node typescript
\`\`\`

### 1.2. Configuração do TypeScript

**\`tsconfig.json\`:**
\`\`\`json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

**\`package.json\` (scripts):**
\`\`\`json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
\`\`\`

### 1.3. Configuração do Ambiente

**\`.env\`:**
\`\`\`env
# Database
DATABASE_URL="postgresql://postgres:secret@localhost:5432/delivery_club?schema=public"

# JWT
JWT_SECRET=sua_chave_secreta_muito_forte_aqui
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# App Config
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
\`\`\`

---

## Passo 2: Configuração do Prisma e Banco de Dados

### 2.1. Inicialização do Prisma

\`\`\`bash
npx prisma init
\`\`\`

### 2.2. Schema do Prisma (traduzindo suas entidades)

**\`prisma/schema.prisma\`:**
\`\`\`prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelo User (equivale à entidade User)
model User {
  id          String   @id @default(uuid())
  createdDate DateTime @default(now()) @map("created_date")
  updatedDate DateTime @updatedAt @map("updated_date")
  createdBy   String?  @map("created_by")

  // Campos built-in do Base44
  fullName String @map("full_name")
  email    String @unique
  role     UserRole @default(USER)

  // Campos customizados da sua entidade
  phone            String?
  address          Json?
  userType         UserType? @map("user_type")
  currentTeamId    String?   @map("current_team_id")
  profilePicture   String?   @map("profile_picture")
  stripeCustomerId String?   @map("stripe_customer_id")

  // Relacionamentos
  ownedTeams      Team[]         @relation("TeamOwner")
  currentTeam     Team?          @relation("CurrentTeam", fields: [currentTeamId], references: [id])
  subscriptions   Subscription[] @relation("CustomerSubscriptions")
  teamMemberships TeamMember[]
  notifications   Notification[]
  supportTickets  SupportTicket[]
  expenses        Expense[]

  @@map("users")
}

// Modelo Team (equivale à entidade Team)
model Team {
  id          String   @id @default(uuid())
  createdDate DateTime @default(now()) @map("created_date")
  updatedDate DateTime @updatedAt @map("updated_date")
  createdBy   String?  @map("created_by")

  name                       String
  cnpjCpf                    String                @map("cnpj_cpf")
  description                String?
  logo                       String?
  category                   BusinessCategory      @default(OUTROS)
  ownerId                    String                @map("owner_id")
  contact                    Json
  address                    Json
  status                     TeamStatus            @default(ACTIVE)
  subscriptionStatus         SubscriptionStatus    @default(TRIAL) @map("subscription_status")
  planId                     String?               @map("plan_id")
  cancellationEffectiveDate  DateTime?             @map("cancellation_effective_date")
  settings                   Json?
  stripePublicKey            String?               @map("stripe_public_key")
  stripeSecretKey            String?               @map("stripe_secret_key")

  // Relacionamentos
  owner           User             @relation("TeamOwner", fields: [ownerId], references: [id])
  currentUsers    User[]           @relation("CurrentTeam")
  members         TeamMember[]
  products        Product[]
  deliveryAreas   DeliveryArea[]
  subscriptions   Subscription[]
  invoices        Invoice[]
  expenses        Expense[]
  plan            Plan?            @relation(fields: [planId], references: [id])

  @@map("teams")
}

// Modelo Product (equivale à entidade Product)
model Product {
  id               String   @id @default(uuid())
  createdDate      DateTime @default(now()) @map("created_date")
  updatedDate      DateTime @updatedAt @map("updated_date")
  createdBy        String?  @map("created_by")

  teamId           String      @map("team_id")
  name             String
  description      String?
  category         String
  unitType         UnitType    @map("unit_type")
  pricePerUnit     Decimal     @map("price_per_unit") @db.Decimal(10, 2)
  costPerUnit      Decimal     @default(0) @map("cost_per_unit") @db.Decimal(10, 2)
  minimumQuantity  Int         @default(1) @map("minimum_quantity")
  maximumQuantity  Int         @default(1000) @map("maximum_quantity")
  availableDays    String[]    @map("available_days")
  availableAreaIds String[]    @map("available_area_ids")
  imageUrl         String?     @map("image_url")
  status           ProductStatus @default(ACTIVE)
  preparationTime  Int?        @map("preparation_time")

  // Relacionamentos
  team               Team               @relation(fields: [teamId], references: [id], onDelete: Cascade)
  subscriptionItems  SubscriptionItem[]
  costHistory        ProductCostHistory[]

  @@map("products")
}

// Modelo TeamMember (equivale à entidade TeamMember)
model TeamMember {
  id          String   @id @default(uuid())
  createdDate DateTime @default(now()) @map("created_date")
  updatedDate DateTime @updatedAt @map("updated_date")
  createdBy   String?  @map("created_by")

  teamId    String     @map("team_id")
  userId    String?    @map("user_id")
  userEmail String     @map("user_email")
  role      TeamRole
  status    MemberStatus @default(PENDING)

  // Relacionamentos
  team Team  @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@unique([teamId, userEmail])
  @@map("team_members")
}

// Modelo DeliveryArea (equivale à entidade DeliveryArea)
model DeliveryArea {
  id          String   @id @default(uuid())
  createdDate DateTime @default(now()) @map("created_date")
  updatedDate DateTime @updatedAt @map("updated_date")
  createdBy   String?  @map("created_by")

  teamId      String      @map("team_id")
  state       String
  city        String
  neighborhood String
  condominium String?
  deliveryFee Decimal     @map("delivery_fee") @db.Decimal(8, 2)
  status      AreaStatus  @default(ACTIVE)
  notes       String?

  // Relacionamentos
  team          Team           @relation(fields: [teamId], references: [id], onDelete: Cascade)
  subscriptions Subscription[]

  @@map("delivery_areas")
}

// Modelo Subscription (equivale à entidade Subscription)
model Subscription {
  id                    String   @id @default(uuid())
  createdDate           DateTime @default(now()) @map("created_date")
  updatedDate           DateTime @updatedAt @map("updated_date")
  createdBy             String?  @map("created_by")

  customerId            String             @map("customer_id")
  teamId                String             @map("team_id")
  deliveryAreaId        String             @map("delivery_area_id")
  deliveryAddress       Json               @map("delivery_address")
  weeklyPrice           Decimal            @map("weekly_price") @db.Decimal(10, 2)
  status                SubscriptionStatus @default(PENDING_PAYMENT)
  startDate             DateTime           @map("start_date")
  cancellationDate      DateTime?          @map("cancellation_date")
  stripeSubscriptionId  String?            @map("stripe_subscription_id")
  specialInstructions   String?            @map("special_instructions")

  // Relacionamentos
  customer      User               @relation("CustomerSubscriptions", fields: [customerId], references: [id], onDelete: Cascade)
  team          Team               @relation(fields: [teamId], references: [id], onDelete: Cascade)
  deliveryArea  DeliveryArea       @relation(fields: [deliveryAreaId], references: [id], onDelete: Cascade)
  items         SubscriptionItem[]
  invoices      Invoice[]

  @@map("subscriptions")
}

// Modelo SubscriptionItem (equivale à entidade SubscriptionItem)
model SubscriptionItem {
  id                   String   @id @default(uuid())
  createdDate          DateTime @default(now()) @map("created_date")
  updatedDate          DateTime @updatedAt @map("updated_date")
  createdBy            String?  @map("created_by")

  subscriptionId       String      @map("subscription_id")
  productId            String      @map("product_id")
  frequency            Frequency   @default(WEEKLY)
  deliveryDays         String[]    @map("delivery_days")
  biweeklyDeliveryDay  String?     @map("biweekly_delivery_day")
  monthlyDeliveryDay   Int?        @map("monthly_delivery_day")
  quantityPerDelivery  Int         @map("quantity_per_delivery")
  unitPrice            Decimal     @map("unit_price") @db.Decimal(10, 2)
  weeklySubtotal       Decimal     @map("weekly_subtotal") @db.Decimal(10, 2)

  // Relacionamentos
  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  product      Product      @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("subscription_items")
}

// Modelos adicionais importantes
model Plan {
  id                 String   @id @default(uuid())
  createdDate        DateTime @default(now()) @map("created_date")
  updatedDate        DateTime @updatedAt @map("updated_date")
  createdBy          String?  @map("created_by")

  name               String
  description        String?
  price              Decimal  @db.Decimal(10, 2)
  maxDeliveryAreas   Int      @map("max_delivery_areas")
  maxSubscriptions   Int      @map("max_subscriptions")
  maxProducts        Int      @map("max_products")
  status             PlanStatus @default(ACTIVE)

  // Relacionamentos
  teams              Team[]

  @@map("plans")
}

model Invoice {
  id           String   @id @default(uuid())
  createdDate  DateTime @default(now()) @map("created_date")
  updatedDate  DateTime @updatedAt @map("updated_date")
  createdBy    String?  @map("created_by")

  subscriptionId String        @map("subscription_id")
  customerId     String        @map("customer_id")
  teamId         String        @map("team_id")
  amount         Decimal       @db.Decimal(10, 2)
  dueDate        DateTime      @map("due_date")
  paidDate       DateTime?     @map("paid_date")
  status         InvoiceStatus @default(PENDING)
  description    String

  // Relacionamentos
  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  customer     User         @relation("CustomerSubscriptions", fields: [customerId], references: [id], onDelete: Cascade)
  team         Team         @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@map("invoices")
}

model Expense {
  id          String   @id @default(uuid())
  createdDate DateTime @default(now()) @map("created_date")
  updatedDate DateTime @updatedAt @map("updated_date")
  createdBy   String?  @map("created_by")

  teamId      String   @map("team_id")
  description String
  amount      Decimal  @db.Decimal(10, 2)
  category    String
  date        DateTime

  // Relacionamentos
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@map("expenses")
}

model Notification {
  id          String   @id @default(uuid())
  createdDate DateTime @default(now()) @map("created_date")
  updatedDate DateTime @updatedAt @map("updated_date")
  createdBy   String?  @map("created_by")

  userId   String             @map("user_id")
  title    String
  message  String
  status   NotificationStatus @default(UNREAD)
  linkTo   String?            @map("link_to")
  icon     String?

  // Relacionamentos
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notifications")
}

model SupportTicket {
  id          String   @id @default(uuid())
  createdDate DateTime @default(now()) @map("created_date")
  updatedDate DateTime @updatedAt @map("updated_date")
  createdBy   String?  @map("created_by")

  customerId     String         @map("customer_id")
  teamId         String?        @map("team_id")
  subscriptionId String?        @map("subscription_id")
  type           TicketType
  priority       TicketPriority @default(MEDIUM)
  status         TicketStatus   @default(OPEN)
  subject        String
  description    String
  assignedTo     String?        @map("assigned_to")
  resolution     String?
  closedAt       DateTime?      @map("closed_at")
  rating         Int?
  ratingComment  String?        @map("rating_comment")

  // Relacionamentos
  customer User @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("support_tickets")
}

model ProductCostHistory {
  id            String   @id @default(uuid())
  createdDate   DateTime @default(now()) @map("created_date")
  updatedDate   DateTime @updatedAt @map("updated_date")
  createdBy     String?  @map("created_by")

  productId     String   @map("product_id")
  costPerUnit   Decimal  @map("cost_per_unit") @db.Decimal(10, 2)
  effectiveDate DateTime @map("effective_date")

  // Relacionamentos
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_cost_history")
}

// Enums
enum UserRole {
  ADMIN
  USER
}

enum UserType {
  SYSTEM_ADMIN
  BUSINESS_OWNER
  CUSTOMER
}

enum BusinessCategory {
  PADARIA
  RESTAURANTE
  MERCADO
  FARMACIA
  OUTROS
}

enum TeamStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
  PENDING_PAYMENT
  PAST_DUE
  TRIAL
  CANCELLATION_PENDING
}

enum UnitType {
  UNIDADE
  GRAMA
  QUILOGRAMA
  LITRO
  MILILITRO
  FATIA
}

enum ProductStatus {
  ACTIVE
  INACTIVE
}

enum TeamRole {
  OWNER
  MANAGER
  EMPLOYEE
  DELIVERY_PERSON
}

enum MemberStatus {
  ACTIVE
  INACTIVE
  PENDING
}

enum AreaStatus {
  ACTIVE
  INACTIVE
}

enum Frequency {
  WEEKLY
  BI_WEEKLY
  MONTHLY
}

enum PlanStatus {
  ACTIVE
  INACTIVE
}

enum InvoiceStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

enum NotificationStatus {
  UNREAD
  READ
}

enum TicketType {
  SUPPORT
  COMPLAINT
  SUGGESTION
  DELIVERY_ISSUE
  PRODUCT_ISSUE
  BILLING_ISSUE
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  WAITING_CUSTOMER
  WAITING_BUSINESS
  RESOLVED
  CLOSED
}
\`\`\`

### 2.3. Gerar e Aplicar Migrações

\`\`\`bash
# Gerar o cliente Prisma
npx prisma generate

# Criar e aplicar a migração inicial
npx prisma migrate dev --name init

# Visualizar o banco (opcional)
npx prisma studio
\`\`\`

---

## Passo 3: Estrutura do Projeto Backend

\`\`\`
src/
├── config/
│   ├── database.ts
│   ├── passport.ts
│   └── corsOptions.ts
├── controllers/
│   ├── authController.ts
│   ├── teamController.ts
│   ├── productController.ts
│   ├── subscriptionController.ts
│   └── userController.ts
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── routes/
│   ├── auth.ts
│   ├── teams.ts
│   ├── products.ts
│   ├── subscriptions.ts
│   └── users.ts
├── services/
│   ├── authService.ts
│   ├── teamService.ts
│   ├── productService.ts
│   └── subscriptionService.ts
├── types/
│   ├── express.d.ts
│   └── auth.ts
├── utils/
│   ├── logger.ts
│   ├── jwt.ts
│   └── validation.ts
├── app.ts
└── server.ts
\`\`\`

---

## Passo 4: Implementação dos Componentes Principais

### 4.1. Configuração do Banco de Dados

**\`src/config/database.ts\`:**
\`\`\`typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export default prisma;
\`\`\`

### 4.2. Configuração da Autenticação

**\`src/config/passport.ts\`:**
\`\`\`typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import prisma from './database';
import { UserType } from '@prisma/client';

// Estratégia Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({
      where: { email: profile.emails![0].value }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: profile.displayName,
          email: profile.emails![0].value,
          profilePicture: profile.photos?.[0]?.value,
          userType: UserType.CUSTOMER,
          createdBy: profile.emails![0].value
        }
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, undefined);
  }
}));

// Estratégia JWT
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!
}, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        currentTeam: true
      }
    });

    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

export default passport;
\`\`\`

### 4.3. Middleware de Autenticação

**\`src/middleware/auth.ts\`:**
\`\`\`typescript
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: User) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.userType || '')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
};
\`\`\`

### 4.4. Utilitários JWT

**\`src/utils/jwt.ts\`:**
\`\`\`typescript
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
\`\`\`

### 4.5. Controller Base

**\`src/controllers/baseController.ts\`:**
\`\`\`typescript
import { Response } from 'express';

export class BaseController {
  protected sendSuccess(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  protected sendError(res: Response, message: string, errors?: any, statusCode: number = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  protected sendNotFound(res: Response, message: string = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message
    });
  }
}
\`\`\`

---

## Passo 5: Implementação dos Controllers

### 5.1. Controller de Autenticação

**\`src/controllers/authController.ts\`:**
\`\`\`typescript
import { Request, Response } from 'express';
import passport from 'passport';
import { BaseController } from './baseController';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../utils/jwt';
import prisma from '../config/database';

export class AuthController extends BaseController {
  // Redirecionar para Google OAuth
  googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
  });

  // Callback do Google OAuth
  googleCallback = (req: Request, res: Response) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err || !user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }

      const token = generateToken(user.id);
      
      // Redirecionar para o frontend com o token
      return res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    })(req, res);
  };

  // Obter informações do usuário atual (equivale ao User.me())
  me = async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          currentTeam: true
        }
      });

      if (!user) {
        return this.sendNotFound(res, 'User not found');
      }

      return this.sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      return this.sendError(res, 'Error retrieving user', error, 500);
    }
  };

  // Atualizar dados do usuário (equivale ao User.updateMyUserData())
  updateMe = async (req: AuthRequest, res: Response) => {
    try {
      const { fullName, phone, address, currentTeamId } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(fullName && { fullName }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(currentTeamId && { currentTeamId })
        },
        include: {
          currentTeam: true
        }
      });

      return this.sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      return this.sendError(res, 'Error updating user', error, 500);
    }
  };

  // Logout (invalidar token - em implementação real, usar blacklist)
  logout = async (req: AuthRequest, res: Response) => {
    // Em uma implementação real, você adicionaria o token a uma blacklist
    return this.sendSuccess(res, null, 'Logged out successfully');
  };
}
\`\`\`

### 5.2. Controller de Teams

**\`src/controllers/teamController.ts\`:**
\`\`\`typescript
import { Response } from 'express';
import { BaseController } from './baseController';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class TeamController extends BaseController {
  // Listar teams (equivale ao Team.list())
  list = async (req: AuthRequest, res: Response) => {
    try {
      const { order_by, limit } = req.query;
      
      const orderBy: Prisma.TeamOrderByWithRelationInput = {};
      if (order_by) {
        const orderField = order_by.toString();
        if (orderField.startsWith('-')) {
          const field = orderField.substring(1);
          orderBy[field as keyof Prisma.TeamOrderByWithRelationInput] = 'desc';
        } else {
          orderBy[orderField as keyof Prisma.TeamOrderByWithRelationInput] = 'asc';
        }
      }

      const teams = await prisma.team.findMany({
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : { createdDate: 'desc' },
        take: limit ? parseInt(limit.toString()) : undefined,
        include: {
          owner: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });

      return this.sendSuccess(res, teams, 'Teams retrieved successfully');
    } catch (error) {
      return this.sendError(res, 'Error retrieving teams', error, 500);
    }
  };

  // Filtrar teams (equivale ao Team.filter())
  filter = async (req: AuthRequest, res: Response) => {
    try {
      const { order_by, limit, ...filters } = req.body;
      
      const where: Prisma.TeamWhereInput = {};
      
      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined) {
          where[key as keyof Prisma.TeamWhereInput] = filters[key];
        }
      });

      const orderBy: Prisma.TeamOrderByWithRelationInput = {};
      if (order_by) {
        const orderField = order_by.toString();
        if (orderField.startsWith('-')) {
          const field = orderField.substring(1);
          orderBy[field as keyof Prisma.TeamOrderByWithRelationInput] = 'desc';
        } else {
          orderBy[orderField as keyof Prisma.TeamOrderByWithRelationInput] = 'asc';
        }
      }

      const teams = await prisma.team.findMany({
        where,
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : { createdDate: 'desc' },
        take: limit ? parseInt(limit.toString()) : undefined,
        include: {
          owner: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });

      return this.sendSuccess(res, teams, 'Teams filtered successfully');
    } catch (error) {
      return this.sendError(res, 'Error filtering teams', error, 500);
    }
  };

  // Obter team por ID (equivale ao Team.get())
  get = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          owner: {
            select: { id: true, fullName: true, email: true }
          },
          products: true,
          deliveryAreas: true,
          members: {
            include: {
              user: {
                select: { id: true, fullName: true, email: true }
              }
            }
          }
        }
      });

      if (!team) {
        return this.sendNotFound(res, 'Team not found');
      }

      return this.sendSuccess(res, team, 'Team retrieved successfully');
    } catch (error) {
      return this.sendError(res, 'Error retrieving team', error, 500);
    }
  };

  // Criar team (equivale ao Team.create())
  create = async (req: AuthRequest, res: Response) => {
    try {
      const teamData = {
        ...req.body,
        createdBy: req.user!.email
      };

      const team = await prisma.team.create({
        data: teamData,
        include: {
          owner: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });

      return this.sendSuccess(res, team, 'Team created successfully', 201);
    } catch (error) {
      return this.sendError(res, 'Error creating team', error, 500);
    }
  };

  // Atualizar team (equivale ao Team.update())
  update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const team = await prisma.team.findUnique({
        where: { id }
      });

      if (!team) {
        return this.sendNotFound(res, 'Team not found');
      }

      const updatedTeam = await prisma.team.update({
        where: { id },
        data: req.body,
        include: {
          owner: {
            select: { id: true, fullName: true, email: true }
          }
        }
      });

      return this.sendSuccess(res, updatedTeam, 'Team updated successfully');
    } catch (error) {
      return this.sendError(res, 'Error updating team', error, 500);
    }
  };

  // Deletar team (equivale ao Team.delete())
  delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const team = await prisma.team.findUnique({
        where: { id }
      });

      if (!team) {
        return this.sendNotFound(res, 'Team not found');
      }

      await prisma.team.delete({
        where: { id }
      });

      return this.sendSuccess(res, null, 'Team deleted successfully');
    } catch (error) {
      return this.sendError(res, 'Error deleting team', error, 500);
    }
  };
}
\`\`\`

### 5.3. Controller de Products

**\`src/controllers/productController.ts\`:**
\`\`\`typescript
import { Response } from 'express';
import { BaseController } from './baseController';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export class ProductController extends BaseController {
  list = async (req: AuthRequest, res: Response) => {
    try {
      const { order_by, limit } = req.query;
      
      const orderBy: Prisma.ProductOrderByWithRelationInput = {};
      if (order_by) {
        const orderField = order_by.toString();
        if (orderField.startsWith('-')) {
          const field = orderField.substring(1);
          orderBy[field as keyof Prisma.ProductOrderByWithRelationInput] = 'desc';
        } else {
          orderBy[orderField as keyof Prisma.ProductOrderByWithRelationInput] = 'asc';
        }
      }

      const products = await prisma.product.findMany({
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : { createdDate: 'desc' },
        take: limit ? parseInt(limit.toString()) : undefined,
        include: {
          team: {
            select: { id: true, name: true }
          }
        }
      });

      return this.sendSuccess(res, products, 'Products retrieved successfully');
    } catch (error) {
      return this.sendError(res, 'Error retrieving products', error, 500);
    }
  };

  filter = async (req: AuthRequest, res: Response) => {
    try {
      const { order_by, limit, ...filters } = req.body;
      
      const where: Prisma.ProductWhereInput = {};
      
      // Aplicar filtros específicos
      if (filters.teamId) where.teamId = filters.teamId;
      if (filters.status) where.status = filters.status;
      if (filters.category) where.category = filters.category;

      const orderBy: Prisma.ProductOrderByWithRelationInput = {};
      if (order_by) {
        const orderField = order_by.toString();
        if (orderField.startsWith('-')) {
          const field = orderField.substring(1);
          orderBy[field as keyof Prisma.ProductOrderByWithRelationInput] = 'desc';
        } else {
          orderBy[orderField as keyof Prisma.ProductOrderByWithRelationInput] = 'asc';
        }
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: Object.keys(orderBy).length > 0 ? orderBy : { createdDate: 'desc' },
        take: limit ? parseInt(limit.toString()) : undefined,
        include: {
          team: {
            select: { id: true, name: true }
          }
        }
      });

      return this.sendSuccess(res, products, 'Products filtered successfully');
    } catch (error) {
      return this.sendError(res, 'Error filtering products', error, 500);
    }
  };

  get = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          team: {
            select: { id: true, name: true }
          },
          costHistory: {
            orderBy: { effectiveDate: 'desc' }
          }
        }
      });

      if (!product) {
        return this.sendNotFound(res, 'Product not found');
      }

      return this.sendSuccess(res, product, 'Product retrieved successfully');
    } catch (error) {
      return this.sendError(res, 'Error retrieving product', error, 500);
    }
  };

  create = async (req: AuthRequest, res: Response) => {
    try {
      const productData = {
        ...req.body,
        createdBy: req.user!.email
      };

      const product = await prisma.product.create({
        data: productData,
        include: {
          team: {
            select: { id: true, name: true }
          }
        }
      });

      return this.sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error) {
      return this.sendError(res, 'Error creating product', error, 500);
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        return this.sendNotFound(res, 'Product not found');
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: req.body,
        include: {
          team: {
            select: { id: true, name: true }
          }
        }
      });

      return this.sendSuccess(res, updatedProduct, 'Product updated successfully');
    } catch (error) {
      return this.sendError(res, 'Error updating product', error, 500);
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (!product) {
        return this.sendNotFound(res, 'Product not found');
      }

      await prisma.product.delete({
        where: { id }
      });

      return this.sendSuccess(res, null, 'Product deleted successfully');
    } catch (error) {
      return this.sendError(res, 'Error deleting product', error, 500);
    }
  };
}
\`\`\`

---

## Passo 6: Definindo as Rotas

### 6.1. Rotas de Autenticação

**\`src/routes/auth.ts\`:**
\`\`\`typescript
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Rotas protegidas
router.get('/me', authenticateJWT, authController.me);
router.put('/me', authenticateJWT, authController.updateMe);
router.post('/logout', authenticateJWT, authController.logout);

export default router;
\`\`\`

### 6.2. Rotas de Teams

**\`src/routes/teams.ts\`:**
\`\`\`typescript
import { Router } from 'express';
import { TeamController } from '../controllers/teamController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const teamController = new TeamController();

// Todas as rotas requerem autenticação
router.use(authenticateJWT);

router.get('/', teamController.list);           // Team.list()
router.post('/filter', teamController.filter); // Team.filter()
router.get('/:id', teamController.get);        // Team.get()
router.post('/', teamController.create);       // Team.create()
router.put('/:id', teamController.update);     // Team.update()
router.delete('/:id', teamController.delete);  // Team.delete()

export default router;
\`\`\`

### 6.3. Rotas de Products

**\`src/routes/products.ts\`:**
\`\`\`typescript
import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const productController = new ProductController();

router.use(authenticateJWT);

router.get('/', productController.list);
router.post('/filter', productController.filter);
router.get('/:id', productController.get);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

export default router;
\`\`\`

---

## Passo 7: Configuração Principal da Aplicação

### 7.1. App Principal

**\`src/app.ts\`:**
\`\`\`typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import passport from './config/passport';

// Routes
import authRoutes from './routes/auth';
import teamRoutes from './routes/teams';
import productRoutes from './routes/products';
// Import outras rotas...

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Passport middleware
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/products', productRoutes);
// Adicione outras rotas...

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

export default app;
\`\`\`

### 7.2. Servidor

**\`src/server.ts\`:**
\`\`\`typescript
import app from './app';
import prisma from './config/database';

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
\`\`\`

---

## Passo 8: Refatorando o Frontend React

### 8.1. SDK Client Customizado

**\`src/api/client.js\`:**
\`\`\`javascript
class ApiClient {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    const result = await response.json();
    return result.data; // Node.js API retorna { success: true, data: {...} }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, { method: 'POST', body });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, { method: 'PUT', body });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
\`\`\`

### 8.2. Classes de Entidade

**\`src/api/entities/Team.js\`:**
\`\`\`javascript
import { apiClient } from '../client';

export class Team {
  static async get(id) {
    return await apiClient.get(`/teams/${id}`);
  }

  static async list(orderBy = '', limit = null) {
    const params = {};
    if (orderBy) params.order_by = orderBy;
    if (limit) params.limit = limit;
    
    return await apiClient.get('/teams', params);
  }

  static async filter(conditions = {}, orderBy = '', limit = null) {
    const params = { ...conditions };
    if (orderBy) params.order_by = orderBy;
    if (limit) params.limit = limit;
    
    return await apiClient.post('/teams/filter', params);
  }

  static async create(data) {
    return await apiClient.post('/teams', data);
  }

  static async update(id, data) {
    return await apiClient.put(`/teams/${id}`, data);
  }

  static async delete(id) {
    return await apiClient.delete(`/teams/${id}`);
  }
}
\`\`\`

**\`src/api/entities/User.js\`:**
\`\`\`javascript
import { apiClient } from '../client';

export class User {
  static async me() {
    return await apiClient.get('/auth/me');
  }

  static async updateMyUserData(data) {
    return await apiClient.put('/auth/me', data);
  }

  static async login() {
    // Redireciona para o Google OAuth
    window.location.href = `${apiClient.baseURL.replace('/api', '')}/api/auth/google`;
  }

  static async logout() {
    await apiClient.post('/auth/logout');
    apiClient.setToken(null);
    window.location.reload();
  }

  // Continue implementando outros métodos conforme necessário
}
\`\`\`

---

## Passo 9: Configuração com Docker

### 9.1. Dockerfile do Backend

**\`Dockerfile\`:**
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs

EXPOSE 8000

CMD ["npm", "start"]
\`\`\`

### 9.2. Docker Compose

**\`docker-compose.yml\`:**
\`\`\`yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: delivery_club
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:secret@postgres:5432/delivery_club?schema=public
      JWT_SECRET: sua_chave_secreta_muito_forte_aqui
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      CLIENT_URL: http://localhost:3000
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000/api
    depends_on:
      - backend

volumes:
  postgres_data:
\`\`\`

### 9.3. Scripts de Desenvolvimento

**\`package.json\` (scripts adicionais):**
\`\`\`json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
\`\`\`

---

## Passo 10: Implementação das Demais Entidades

Para completar a migração, você precisará implementar controllers, routes e services para todas as outras entidades:

- \`SubscriptionController\` e \`SubscriptionItemController\`
- \`DeliveryAreaController\`
- \`InvoiceController\`
- \`ExpenseController\`
- \`NotificationController\`
- \`SupportTicketController\`
- E todas as outras entidades do seu projeto

Siga o mesmo padrão estabelecido nos exemplos anteriores.

---

## Passo 11: Deploy e Monitoramento

### 11.1. Scripts de Deploy

**\`scripts/deploy.sh\`:**
\`\`\`bash
#!/bin/bash
set -e

echo "Starting deployment..."

# Build the application
npm run build

# Run database migrations
npx prisma migrate deploy

# Start the application
npm start
\`\`\`

### 11.2. Configuração de Logs

**\`src/utils/logger.ts\`:**
\`\`\`typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'delivery-club-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
\`\`\`

---

## Checklist Final de Implementação

### ✅ Backend (Node.js + Express)
- [ ] Configuração do projeto com TypeScript
- [ ] Configuração do Prisma + PostgreSQL
- [ ] Implementação da autenticação (JWT + Google OAuth)
- [ ] Controllers para todas as entidades
- [ ] Middleware de autenticação e autorização
- [ ] Rotas da API organizadas
- [ ] Tratamento de erros
- [ ] Validação de dados
- [ ] Logs estruturados

### ✅ Frontend (React)
- [ ] SDK client customizado
- [ ] Classes de entidade que imitam o Base44
- [ ] Atualização dos imports nas páginas
- [ ] Context de autenticação
- [ ] Tratamento de estados de loading/error
- [ ] Configuração de variáveis de ambiente

### ✅ Banco de Dados
- [ ] Schema Prisma completo
- [ ] Migrações aplicadas
- [ ] Seeds de dados iniciais
- [ ] Backup e restore procedures

### ✅ DevOps
- [ ] Dockerfiles otimizados
- [ ] Docker Compose configurado
- [ ] Scripts de deploy
- [ ] Monitoramento e logs
- [ ] Configuração de CI/CD

### ✅ Segurança
- [ ] Rate limiting
- [ ] Helmet para headers de segurança
- [ ] Validação de input
- [ ] Sanitização de dados
- [ ] CORS configurado adequadamente

### ✅ Performance
- [ ] Indexação do banco otimizada
- [ ] Cache implementado (Redis)
- [ ] Compressão de responses
- [ ] Otimização de queries

---

## Estimativa de Tempo e Esforço

1. **Setup inicial e configuração (1 semana)**
2. **Implementação das entidades principais (2-3 semanas)**
3. **Refatoração do frontend (1 semana)**
4. **Testes e ajustes finais (1 semana)**

Este guia fornece uma base sólida para migrar seu projeto do Base44 para uma infraestrutura self-hosted com Node.js + Express. O processo requer conhecimento técnico significativo, mas resulta em controle total sobre sua aplicação e dados.
`;
    return (
        <div className="p-4 bg-gray-900 text-white font-sans">
             <ReactMarkdown 
                className="prose prose-invert max-w-none"
            >{markdownContent}</ReactMarkdown>
        </div>
    );
};

export default SelfHostGuideNodeJS;
