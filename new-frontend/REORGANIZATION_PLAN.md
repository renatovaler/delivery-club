# Plano de Reorganização - Estrutura de Domínios

## Nova Estrutura de Diretórios

```
app/
├── (domains)/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── businesses/
│   │   ├── users/
│   │   ├── user-details/
│   │   ├── reports/
│   │   ├── plans/
│   │   ├── subscriptions/
│   │   └── system-tests/
│   ├── business/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── services/
│   │   ├── delivery/
│   │   ├── customers/
│   │   ├── financial/
│   │   ├── price-history/
│   │   ├── platform-invoices/
│   │   ├── payment-history/
│   │   ├── delivery-areas/
│   │   ├── settings/
│   │   ├── stripe-config/
│   │   └── team/
│   └── customer/
│       ├── dashboard/
│       ├── subscriptions/
│       ├── financial-history/
│       ├── new-subscription/
│       ├── support/
│       └── platform-reports/
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── reset-password/
├── (public)/
│   ├── welcome/
│   ├── faq/
│   ├── profile/
│   └── onboarding/
└── page.tsx (home)
```

## Mapeamento de Páginas

### Admin Pages
- `admin-dashboard/` → `(domains)/admin/dashboard/`
- `admin-businesses/` → `(domains)/admin/businesses/`
- `admin-users/` → `(domains)/admin/users/`
- `admin-user-details/` → `(domains)/admin/user-details/`
- `admin-reports/` → `(domains)/admin/reports/`
- `admin-plans/` → `(domains)/admin/plans/`
- `admin-subscriptions/` → `(domains)/admin/subscriptions/`
- `admin-system-tests/` → `(domains)/admin/system-tests/`

### Business Pages (Novas)
- `BusinessDashboard` → `(domains)/business/dashboard/`
- `ProductManagement` → `(domains)/business/products/`
- `ServiceManagement` → `(domains)/business/services/`
- `DeliveryManagement` → `(domains)/business/delivery/`
- `Customers` → `(domains)/business/customers/`
- `FinancialManagement` → `(domains)/business/financial/`
- `PriceHistory` → `(domains)/business/price-history/`
- `PlatformInvoices` → `(domains)/business/platform-invoices/`
- `PaymentHistory` → `(domains)/business/payment-history/`
- `DeliveryAreas` → `(domains)/business/delivery-areas/`
- `BusinessSettings` → `(domains)/business/settings/`
- `StripeConfiguration` → `(domains)/business/stripe-config/`
- `TeamManagement` → `(domains)/business/team/`

### Customer Pages
- `customer-dashboard/` → `(domains)/customer/dashboard/`
- `my-subscriptions/` → `(domains)/customer/subscriptions/`
- `financial-history/` → `(domains)/customer/financial-history/`
- `new-subscription/` → `(domains)/customer/new-subscription/`
- `CustomerSupport` → `(domains)/customer/support/`
- `PlatformReports` → `(domains)/customer/platform-reports/`

### Auth Pages
- `login/` → `(auth)/login/`
- `register/` → `(auth)/register/`
- `forgot-password/` → `(auth)/forgot-password/`
- `reset-password/` → `(auth)/reset-password/`

### Public Pages
- `welcome/` → `(public)/welcome/`
- `faq/` → `(public)/faq/`
- `profile/` → `(public)/profile/`
- `Onboarding` → `(public)/onboarding/`

## Benefícios da Nova Estrutura

1. **Organização por Domínio**: Páginas agrupadas por contexto de uso
2. **Roteamento Claro**: URLs mais intuitivas (/admin/dashboard, /business/products)
3. **Manutenção Facilitada**: Código relacionado agrupado
4. **Escalabilidade**: Fácil adição de novas funcionalidades por domínio
5. **Proteção de Rotas**: Middleware pode ser aplicado por grupo

## Próximos Passos

1. ✅ Criar estrutura de diretórios
2. ⏳ Mover páginas existentes
3. ⏳ Criar páginas Business faltantes
4. ⏳ Atualizar Navigation.tsx
5. ⏳ Atualizar middleware.ts
6. ⏳ Testar todas as rotas
7. ⏳ Remover páginas antigas
8. ⏳ Atualizar documentação
