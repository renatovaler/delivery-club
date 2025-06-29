import apiClient from '../apiClient';
import type { Address, BaseEntity, BusinessCategory, Contact, OfferingType, SubscriptionStatus, TeamStatus } from './types';

export interface TeamSettings {
  bread_price?: number;
  min_order_quantity?: number;
  max_order_quantity?: number;
}

export interface Team extends BaseEntity {
  name: string;
  offering_type: OfferingType;
  cnpj_cpf: string;
  description?: string;
  logo?: string;
  category: BusinessCategory;
  owner_id: string;
  contact: Contact;
  address: Address;
  status: TeamStatus;
  subscription_status: SubscriptionStatus;
  plan_id?: string;
  cancellation_effective_date?: string;
  settings?: TeamSettings;
  stripe_public_key?: string;
  stripe_secret_key?: string;
  idempotency_key?: string;
}

export const TeamAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<Team[]>('/teams', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<Team>(`/teams/${id}`).then((res: any) => res.data),

  create: (data: Partial<Team>) =>
    apiClient.post<Team>('/teams', data).then((res: any) => res.data),

  update: (id: string, data: Partial<Team>) =>
    apiClient.put<Team>(`/teams/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/teams/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<Team[]>('/teams', { params }).then((res: any) => res.data),
};
