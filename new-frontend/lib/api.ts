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
  weekly_price: string;
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
}

// API Functions
export const UserAPI = {
  me: () => apiClient.get<User>('/users/me').then(res => res.data),
};

export const SubscriptionAPI = {
  filter: (params: any) => apiClient.get<Subscription[]>('/subscriptions', { params }).then(res => res.data),
};

export const SubscriptionItemAPI = {
  filter: (params: any) => apiClient.get<SubscriptionItem[]>('/subscription-items', { params }).then(res => res.data),
};

export const TeamAPI = {
  get: (id: string) => apiClient.get<Team>(`/teams/${id}`).then(res => res.data),
};
