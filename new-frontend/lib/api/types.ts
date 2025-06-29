// Tipos base para todas as entidades
export interface BaseEntity {
  id: string;
  created_date?: string;
  updated_date?: string;
}

// Tipos de usuário
export type UserType = 'customer' | 'business_owner' | 'system_admin';

// Status de assinatura
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'trial' | 'cancellation_pending';

// Status de team
export type TeamStatus = 'active' | 'inactive' | 'suspended';

// Tipos de ofertas
export type OfferingType = 'products' | 'services' | 'both';

// Categorias de negócio
export type BusinessCategory = 'padaria' | 'restaurante' | 'mercado' | 'farmacia' | 'outros';

// Frequência de entrega
export type DeliveryFrequency = 'weekly' | 'bi-weekly' | 'monthly';

// Status de invoice
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

// Status de ticket de suporte
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// Status de plano
export type PlanStatus = 'active' | 'inactive';

// Interface para endereço
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference?: string;
}

// Interface para contato
export interface Contact {
  whatsapp_numbers: string[];
  email: string;
}

// Interface para localização padrão
export interface DefaultLocation {
  state: string;
  city: string;
}
