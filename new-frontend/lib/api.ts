import type {
  Expense,
  Invoice,
  PlatformReport,
  PriceUpdate,
  Product,
  SupportTicket,
} from './api-extended';
import apiClient from './apiClient';

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
  me: () => apiClient.get<User>('/users/me').then((res) => res.data),
  list: (orderBy: string, limit: number) =>
    apiClient.get<User[]>('/users', { params: { orderBy, limit } }).then((res) => res.data),
  get: (id: string) => apiClient.get<User>(`/users/${id}`).then((res) => res.data),
  create: (data: Partial<User>) => apiClient.post<User>('/users', data).then((res) => res.data),
  update: (id: string, data: Partial<User>) =>
    apiClient.put<User>(`/users/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/users/${id}`).then((res) => res.data),
};

export const SubscriptionAPI = {
  filter: (params: any) =>
    apiClient.get<Subscription[]>('/subscriptions', { params }).then((res) => res.data),
  list: (orderBy: string, limit: number) =>
    apiClient
      .get<Subscription[]>('/subscriptions', { params: { orderBy, limit } })
      .then((res) => res.data),
  get: (id: string) => apiClient.get<Subscription>(`/subscriptions/${id}`).then((res) => res.data),
  create: (data: Partial<Subscription>) =>
    apiClient.post<Subscription>('/subscriptions', data).then((res) => res.data),
  update: (id: string, data: Partial<Subscription>) =>
    apiClient.put<Subscription>(`/subscriptions/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/subscriptions/${id}`).then((res) => res.data),
};

export const SubscriptionItemAPI = {
  filter: (params: any) =>
    apiClient.get<SubscriptionItem[]>('/subscription-items', { params }).then((res) => res.data),
  list: (orderBy: string, limit: number) =>
    apiClient
      .get<SubscriptionItem[]>('/subscription-items', { params: { orderBy, limit } })
      .then((res) => res.data),
  get: (id: string) =>
    apiClient.get<SubscriptionItem>(`/subscription-items/${id}`).then((res) => res.data),
  create: (data: Partial<SubscriptionItem>) =>
    apiClient.post<SubscriptionItem>('/subscription-items', data).then((res) => res.data),
  update: (id: string, data: Partial<SubscriptionItem>) =>
    apiClient.put<SubscriptionItem>(`/subscription-items/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/subscription-items/${id}`).then((res) => res.data),
};

export const TeamAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<Team[]>('/teams', { params: { orderBy, limit } }).then((res) => res.data),
  get: (id: string) => apiClient.get<Team>(`/teams/${id}`).then((res) => res.data),
  create: (data: Partial<Team>) => apiClient.post<Team>('/teams', data).then((res) => res.data),
  update: (id: string, data: Partial<Team>) =>
    apiClient.put<Team>(`/teams/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/teams/${id}`).then((res) => res.data),
};

export const InvoiceAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<Invoice[]>('/invoices', { params: { orderBy, limit } }).then((res) => res.data),
  get: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`).then((res) => res.data),
  create: (data: Partial<Invoice>) =>
    apiClient.post<Invoice>('/invoices', data).then((res) => res.data),
  update: (id: string, data: Partial<Invoice>) =>
    apiClient.put<Invoice>(`/invoices/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/invoices/${id}`).then((res) => res.data),
};

export const ProductAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<Product[]>('/products', { params: { orderBy, limit } }).then((res) => res.data),
  get: (id: string) => apiClient.get<Product>(`/products/${id}`).then((res) => res.data),
  create: (data: Partial<Product>) =>
    apiClient.post<Product>('/products', data).then((res) => res.data),
  update: (id: string, data: Partial<Product>) =>
    apiClient.put<Product>(`/products/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/products/${id}`).then((res) => res.data),
};

export const SupportTicketAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient
      .get<SupportTicket[]>('/support-tickets', { params: { orderBy, limit } })
      .then((res) => res.data),
  get: (id: string) =>
    apiClient.get<SupportTicket>(`/support-tickets/${id}`).then((res) => res.data),
  create: (data: Partial<SupportTicket>) =>
    apiClient.post<SupportTicket>('/support-tickets', data).then((res) => res.data),
  update: (id: string, data: Partial<SupportTicket>) =>
    apiClient.put<SupportTicket>(`/support-tickets/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/support-tickets/${id}`).then((res) => res.data),
};

export const PlatformReportAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient
      .get<PlatformReport[]>('/platform-reports', { params: { orderBy, limit } })
      .then((res) => res.data),
  get: (id: string) =>
    apiClient.get<PlatformReport>(`/platform-reports/${id}`).then((res) => res.data),
  create: (data: Partial<PlatformReport>) =>
    apiClient.post<PlatformReport>('/platform-reports', data).then((res) => res.data),
  update: (id: string, data: Partial<PlatformReport>) =>
    apiClient.put<PlatformReport>(`/platform-reports/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/platform-reports/${id}`).then((res) => res.data),
};

export const PriceUpdateAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient
      .get<PriceUpdate[]>('/price-updates', { params: { orderBy, limit } })
      .then((res) => res.data),
  get: (id: string) => apiClient.get<PriceUpdate>(`/price-updates/${id}`).then((res) => res.data),
  create: (data: Partial<PriceUpdate>) =>
    apiClient.post<PriceUpdate>('/price-updates', data).then((res) => res.data),
  update: (id: string, data: Partial<PriceUpdate>) =>
    apiClient.put<PriceUpdate>(`/price-updates/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/price-updates/${id}`).then((res) => res.data),
};

export const ExpenseAPI = {
  list: (orderBy: string, limit: number) =>
    apiClient.get<Expense[]>('/expenses', { params: { orderBy, limit } }).then((res) => res.data),
  get: (id: string) => apiClient.get<Expense>(`/expenses/${id}`).then((res) => res.data),
  create: (data: Partial<Expense>) =>
    apiClient.post<Expense>('/expenses', data).then((res) => res.data),
  update: (id: string, data: Partial<Expense>) =>
    apiClient.put<Expense>(`/expenses/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/expenses/${id}`).then((res) => res.data),
};
