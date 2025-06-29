import apiClient from '../apiClient';
import type { BaseEntity, DefaultLocation, UserType } from './types';

export interface User extends BaseEntity {
  full_name: string;
  email: string;
  user_type: UserType;
  profile_picture?: string;
  current_team_id?: string;
  default_location?: DefaultLocation;
}

export const UserAPI = {
  me: () => apiClient.get<User>('/users/me').then((res: any) => res.data),

  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<User[]>('/users', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<User>(`/users/${id}`).then((res: any) => res.data),

  create: (data: Partial<User>) =>
    apiClient.post<User>('/users', data).then((res: any) => res.data),

  update: (id: string, data: Partial<User>) =>
    apiClient.put<User>(`/users/${id}`, data).then((res: any) => res.data),

  updateMyUserData: (data: Partial<User>) =>
    apiClient.put<User>('/users/me', data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/users/${id}`).then((res: any) => res.data),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
  },

  filter: (params: any) => apiClient.get<User[]>('/users', { params }).then((res: any) => res.data),
};
