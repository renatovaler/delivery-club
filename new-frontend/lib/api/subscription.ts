import apiClient from '../apiClient';
import type { BaseEntity, DeliveryFrequency } from './types';

export interface SubscriptionDeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
}

export interface Subscription extends BaseEntity {
  customer_id: string;
  team_id: string;
  status: 'active' | 'pending_payment' | 'cancelled';
  weekly_price: number;
  start_date: string;
  delivery_address: SubscriptionDeliveryAddress;
}

export interface SubscriptionItem extends BaseEntity {
  subscription_id: string;
  quantity_per_delivery: number;
  frequency: DeliveryFrequency;
  delivery_days: string[];
  biweekly_delivery_day?: string;
  monthly_delivery_day?: number;
}

export const SubscriptionAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<Subscription[]>('/subscriptions', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<Subscription>(`/subscriptions/${id}`).then((res: any) => res.data),

  create: (data: Partial<Subscription>) =>
    apiClient.post<Subscription>('/subscriptions', data).then((res: any) => res.data),

  update: (id: string, data: Partial<Subscription>) =>
    apiClient.put<Subscription>(`/subscriptions/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/subscriptions/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<Subscription[]>('/subscriptions', { params }).then((res: any) => res.data),
};

export const SubscriptionItemAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<SubscriptionItem[]>('/subscription-items', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<SubscriptionItem>(`/subscription-items/${id}`).then((res: any) => res.data),

  create: (data: Partial<SubscriptionItem>) =>
    apiClient.post<SubscriptionItem>('/subscription-items', data).then((res: any) => res.data),

  update: (id: string, data: Partial<SubscriptionItem>) =>
    apiClient.put<SubscriptionItem>(`/subscription-items/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/subscription-items/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<SubscriptionItem[]>('/subscription-items', { params }).then((res: any) => res.data),
};
