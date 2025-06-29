
import apiClient from './apiClient';
import type {
  Invoice,
  Product,
  SupportTicket,
  PlatformReport,
  PriceUpdate,
  Expense
} from './api-extended';

// Interfaces
export interface User {
  id: string;
  full_name: string;
  email: string;
}

export interface Subscription {
  id: string;
  customer_id: string;
  team_id: string;
  status: 'active' | 'pending_payment' | 'cancelled';
  weekly_price: number;
  start_date: string;
  delivery_address: {
    street: string;
    number: string;
    neighborhood: string;
  };
}

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  quantity_per_delivery: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  delivery_days: string[];
  biweekly_delivery_day?: string;
  monthly_delivery_day?: number;
}

export interface Team {
  id: string;
  name: string;
  subscription_status?: string;
  created_date?: string;
}

// API Functions
export const UserAPI = {
  me: () => apiClient.get<User>('/users/me').then(res => res.data),
  list: (orderBy: string, limit: number) =>
    apiClient.get<User[]>('/users', { params: { orderBy, limit } }).then(res => res.data),
};

export const SubscriptionAPI = {
  filter: (params: any) => apiClient.get<Subscription[]>('/subscriptions', { params }).then(res => res.data),
  list: (orderBy: string, limit: number) =>
    apiClient.get<Subscription[]>('/subscriptions', { params: { orderBy, limit } }).then(res => res.data),
};

export const SubscriptionItemAPI = {
  filter: (params: any) => apiClient.get<SubscriptionItem[]>('/subscription-items', { params }).then(res => res.data),
};

export const TeamAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<Team[]>('/teams', { params: { orderBy, limit } }).then(res => res.data),
  get: (id: string) => apiClient.get<Team>(`/teams/${id}`).then(res => res.data),
};

export const InvoiceAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<Invoice[]>('/invoices', { params: { orderBy, limit } }).then(res => res.data),
};

export const ProductAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<Product[]>('/products', { params: { orderBy, limit } }).then(res => res.data),
};

export const SupportTicketAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<SupportTicket[]>('/support-tickets', { params: { orderBy, limit } }).then(res => res.data),
};

export const PlatformReportAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<PlatformReport[]>('/platform-reports', { params: { orderBy, limit } }).then(res => res.data),
};

export const PriceUpdateAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<PriceUpdate[]>('/price-updates', { params: { orderBy, limit } }).then(res => res.data),
};

export const ExpenseAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<Expense[]>('/expenses', { params: { orderBy, limit } }).then(res => res.data),
};
