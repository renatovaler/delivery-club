import apiClient from '../apiClient';
import type { BaseEntity, InvoiceStatus } from './types';

export interface Invoice extends BaseEntity {
  team_id: string;
  subscription_id: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  payment_id?: string;
  stripe_invoice_id?: string;
  stripe_payment_intent_id?: string;
  notes?: string;
}

export interface Expense extends BaseEntity {
  team_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  payment_method?: string;
  receipt_url?: string;
  notes?: string;
  is_recurring: boolean;
  recurrence_frequency?: 'weekly' | 'monthly' | 'yearly';
  recurrence_day?: number;
}

export const InvoiceAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<Invoice[]>('/invoices', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`).then((res: any) => res.data),

  create: (data: Partial<Invoice>) =>
    apiClient.post<Invoice>('/invoices', data).then((res: any) => res.data),

  update: (id: string, data: Partial<Invoice>) =>
    apiClient.put<Invoice>(`/invoices/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/invoices/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<Invoice[]>('/invoices', { params }).then((res: any) => res.data),

  markAsPaid: (id: string, paymentData: { payment_method: string; payment_id?: string }) =>
    apiClient.post<Invoice>(`/invoices/${id}/mark-paid`, paymentData).then((res: any) => res.data),

  generateStripePaymentIntent: (id: string) =>
    apiClient.post<{ client_secret: string }>(`/invoices/${id}/payment-intent`).then((res: any) => res.data),
};

export const ExpenseAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<Expense[]>('/expenses', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<Expense>(`/expenses/${id}`).then((res: any) => res.data),

  create: (data: Partial<Expense>) =>
    apiClient.post<Expense>('/expenses', data).then((res: any) => res.data),

  update: (id: string, data: Partial<Expense>) =>
    apiClient.put<Expense>(`/expenses/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/expenses/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<Expense[]>('/expenses', { params }).then((res: any) => res.data),

  uploadReceipt: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return apiClient.post<{ receipt_url: string }>(`/expenses/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res: any) => res.data);
  },
};
