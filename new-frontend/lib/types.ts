export interface User {
  id: string;
  full_name: string;
  email: string;
  user_type: 'system_admin' | 'business_owner' | 'customer';
  created_date: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  cnpj_cpf?: string;
  subscription_status:
    | 'active'
    | 'trial'
    | 'cancelled'
    | 'cancellation_pending'
    | 'suspended'
    | 'paused';
  plan_id: string;
  created_date: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  created_date: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  team_id: string;
  status: 'active' | 'pending_payment' | 'cancelled';
  weekly_price: number;
  start_date: string;
  created_date: string;
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'cancelled';
  paid_date?: string;
  created_date: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  created_date: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_date: string;
}

export interface PlatformReport {
  id: string;
  status: 'pending' | 'resolved';
  created_date: string;
}

export interface PriceUpdate {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  created_date: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  created_date: string;
}
