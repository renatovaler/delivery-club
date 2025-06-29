import apiClient from './apiClient';

export interface Invoice {
  id: string;
  amount: number;
  status: string;
  paid_date?: string;
  created_date?: string;
}

export interface Product {
  id: string;
  name: string;
  created_date?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  created_date?: string;
}

export interface PlatformReport {
  id: string;
  status: string;
  created_date?: string;
}

export interface PriceUpdate {
  id: string;
  created_date?: string;
}

export interface Expense {
  id: string;
  created_date?: string;
}

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
