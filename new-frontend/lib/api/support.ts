import apiClient from '../apiClient';
import type { BaseEntity, SupportTicketStatus } from './types';

export interface SupportTicket extends BaseEntity {
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'feature_request' | 'bug_report';
  user_id: string;
  team_id?: string;
  assigned_to?: string;
  resolution?: string;
  resolved_date?: string;
}

export interface TicketMessage extends BaseEntity {
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  attachments?: string[];
}

export interface PlatformReport extends BaseEntity {
  reporter_id: string;
  reported_team_id?: string;
  reported_user_id?: string;
  type: 'inappropriate_content' | 'fraud' | 'harassment' | 'spam' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  evidence_urls?: string[];
  resolution?: string;
  resolved_date?: string;
  resolved_by?: string;
}

export interface Notification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  action_url?: string;
  expires_at?: string;
}

export const SupportTicketAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<SupportTicket[]>('/support-tickets', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<SupportTicket>(`/support-tickets/${id}`).then((res: any) => res.data),

  create: (data: Partial<SupportTicket>) =>
    apiClient.post<SupportTicket>('/support-tickets', data).then((res: any) => res.data),

  update: (id: string, data: Partial<SupportTicket>) =>
    apiClient.put<SupportTicket>(`/support-tickets/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/support-tickets/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<SupportTicket[]>('/support-tickets', { params }).then((res: any) => res.data),

  resolve: (id: string, resolution: string) =>
    apiClient.post<SupportTicket>(`/support-tickets/${id}/resolve`, { resolution }).then((res: any) => res.data),

  assign: (id: string, assignedTo: string) =>
    apiClient.post<SupportTicket>(`/support-tickets/${id}/assign`, { assigned_to: assignedTo }).then((res: any) => res.data),
};

export const TicketMessageAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<TicketMessage[]>('/ticket-messages', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<TicketMessage>(`/ticket-messages/${id}`).then((res: any) => res.data),

  create: (data: Partial<TicketMessage>) =>
    apiClient.post<TicketMessage>('/ticket-messages', data).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<TicketMessage[]>('/ticket-messages', { params }).then((res: any) => res.data),

  getByTicket: (ticketId: string) =>
    apiClient.get<TicketMessage[]>(`/support-tickets/${ticketId}/messages`).then((res: any) => res.data),
};

export const PlatformReportAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<PlatformReport[]>('/platform-reports', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<PlatformReport>(`/platform-reports/${id}`).then((res: any) => res.data),

  create: (data: Partial<PlatformReport>) =>
    apiClient.post<PlatformReport>('/platform-reports', data).then((res: any) => res.data),

  update: (id: string, data: Partial<PlatformReport>) =>
    apiClient.put<PlatformReport>(`/platform-reports/${id}`, data).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<PlatformReport[]>('/platform-reports', { params }).then((res: any) => res.data),

  resolve: (id: string, resolution: string) =>
    apiClient.post<PlatformReport>(`/platform-reports/${id}/resolve`, { resolution }).then((res: any) => res.data),

  dismiss: (id: string, reason: string) =>
    apiClient.post<PlatformReport>(`/platform-reports/${id}/dismiss`, { reason }).then((res: any) => res.data),
};

export const NotificationAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<Notification[]>('/notifications', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<Notification>(`/notifications/${id}`).then((res: any) => res.data),

  create: (data: Partial<Notification>) =>
    apiClient.post<Notification>('/notifications', data).then((res: any) => res.data),

  update: (id: string, data: Partial<Notification>) =>
    apiClient.put<Notification>(`/notifications/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/notifications/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<Notification[]>('/notifications', { params }).then((res: any) => res.data),

  markAsRead: (id: string) =>
    apiClient.post<Notification>(`/notifications/${id}/read`).then((res: any) => res.data),

  markAllAsRead: (userId: string) =>
    apiClient.post<{ updated: number }>(`/users/${userId}/notifications/read-all`).then((res: any) => res.data),

  getUnreadCount: (userId: string) =>
    apiClient.get<{ count: number }>(`/users/${userId}/notifications/unread-count`).then((res: any) => res.data),
};
