import apiClient from '../apiClient';
import type { BaseEntity, PlanStatus } from './types';

export interface Plan extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  max_subscriptions: number;
  max_products: number | null;
  max_services: number | null;
  status: PlanStatus;
  features: string[];
  billing_cycle: 'monthly' | 'yearly';
  trial_days?: number;
  is_popular?: boolean;
  stripe_price_id?: string;
}

export interface DeliveryArea extends BaseEntity {
  team_id: string;
  name: string;
  description?: string;
  polygon_coordinates: Array<{ lat: number; lng: number }>;
  delivery_fee: number;
  minimum_order_value?: number;
  estimated_delivery_time_minutes: number;
  is_active: boolean;
  delivery_days: string[];
  delivery_hours: {
    start: string;
    end: string;
  };
}

export interface TeamMember extends BaseEntity {
  team_id: string;
  user_email: string;
  role: 'admin' | 'manager' | 'employee';
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  invited_by: string;
  invited_date: string;
  joined_date?: string;
}

export interface TeamSubscriptionHistory extends BaseEntity {
  team_id: string;
  plan_id: string;
  action: 'subscribed' | 'upgraded' | 'downgraded' | 'cancelled' | 'renewed';
  previous_plan_id?: string;
  effective_date: string;
  amount_paid?: number;
  payment_method?: string;
  notes?: string;
}

export interface TeamChangeHistory extends BaseEntity {
  team_id: string;
  changed_by: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  change_reason?: string;
}

export interface ProcessedEvent extends BaseEntity {
  event_type: string;
  event_id: string;
  source: 'stripe' | 'internal' | 'webhook';
  status: 'processed' | 'failed' | 'pending';
  data: any;
  error_message?: string;
  retry_count: number;
  processed_date?: string;
}

export const PlanAPI = {
  list: (orderBy: string = '-created_date') =>
    apiClient.get<Plan[]>('/plans', { params: { orderBy } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<Plan>(`/plans/${id}`).then((res: any) => res.data),

  create: (data: Partial<Plan>) =>
    apiClient.post<Plan>('/plans', data).then((res: any) => res.data),

  update: (id: string, data: Partial<Plan>) =>
    apiClient.put<Plan>(`/plans/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/plans/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<Plan[]>('/plans', { params }).then((res: any) => res.data),
};

export const DeliveryAreaAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<DeliveryArea[]>('/delivery-areas', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<DeliveryArea>(`/delivery-areas/${id}`).then((res: any) => res.data),

  create: (data: Partial<DeliveryArea>) =>
    apiClient.post<DeliveryArea>('/delivery-areas', data).then((res: any) => res.data),

  update: (id: string, data: Partial<DeliveryArea>) =>
    apiClient.put<DeliveryArea>(`/delivery-areas/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/delivery-areas/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<DeliveryArea[]>('/delivery-areas', { params }).then((res: any) => res.data),
};

export const TeamMemberAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<TeamMember[]>('/team-members', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<TeamMember>(`/team-members/${id}`).then((res: any) => res.data),

  create: (data: Partial<TeamMember>) =>
    apiClient.post<TeamMember>('/team-members', data).then((res: any) => res.data),

  update: (id: string, data: Partial<TeamMember>) =>
    apiClient.put<TeamMember>(`/team-members/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/team-members/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<TeamMember[]>('/team-members', { params }).then((res: any) => res.data),

  invite: (teamId: string, email: string, role: string) =>
    apiClient.post<TeamMember>(`/teams/${teamId}/invite`, { email, role }).then((res: any) => res.data),

  acceptInvite: (inviteToken: string) =>
    apiClient.post<TeamMember>('/team-members/accept-invite', { token: inviteToken }).then((res: any) => res.data),
};

export const TeamSubscriptionHistoryAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<TeamSubscriptionHistory[]>('/team-subscription-histories', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<TeamSubscriptionHistory>(`/team-subscription-histories/${id}`).then((res: any) => res.data),

  create: (data: Partial<TeamSubscriptionHistory>) =>
    apiClient.post<TeamSubscriptionHistory>('/team-subscription-histories', data).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<TeamSubscriptionHistory[]>('/team-subscription-histories', { params }).then((res: any) => res.data),
};

export const TeamChangeHistoryAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<TeamChangeHistory[]>('/team-change-histories', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<TeamChangeHistory>(`/team-change-histories/${id}`).then((res: any) => res.data),

  create: (data: Partial<TeamChangeHistory>) =>
    apiClient.post<TeamChangeHistory>('/team-change-histories', data).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<TeamChangeHistory[]>('/team-change-histories', { params }).then((res: any) => res.data),
};

export const ProcessedEventAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<ProcessedEvent[]>('/processed-events', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<ProcessedEvent>(`/processed-events/${id}`).then((res: any) => res.data),

  create: (data: Partial<ProcessedEvent>) =>
    apiClient.post<ProcessedEvent>('/processed-events', data).then((res: any) => res.data),

  update: (id: string, data: Partial<ProcessedEvent>) =>
    apiClient.put<ProcessedEvent>(`/processed-events/${id}`, data).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<ProcessedEvent[]>('/processed-events', { params }).then((res: any) => res.data),

  retry: (id: string) =>
    apiClient.post<ProcessedEvent>(`/processed-events/${id}/retry`).then((res: any) => res.data),
};
