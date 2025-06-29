import apiClient from '../apiClient';
import type { BaseEntity } from './types';

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  team_id: string;
  category?: string;
  image_url?: string;
  is_active: boolean;
  unit?: string;
  minimum_quantity?: number;
  maximum_quantity?: number;
}

export interface Service extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  team_id: string;
  category?: string;
  image_url?: string;
  is_active: boolean;
  duration_minutes?: number;
  requires_appointment?: boolean;
}

export interface ProductCostHistory extends BaseEntity {
  product_id: string;
  old_price: number;
  new_price: number;
  change_reason?: string;
  changed_by: string;
}

export interface PriceUpdate extends BaseEntity {
  product_id?: string;
  service_id?: string;
  old_price: number;
  new_price: number;
  change_reason?: string;
  applied_date?: string;
  team_id: string;
}

export const ProductAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<Product[]>('/products', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<Product>(`/products/${id}`).then((res: any) => res.data),

  create: (data: Partial<Product>) =>
    apiClient.post<Product>('/products', data).then((res: any) => res.data),

  update: (id: string, data: Partial<Product>) =>
    apiClient.put<Product>(`/products/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/products/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<Product[]>('/products', { params }).then((res: any) => res.data),
};

export const ServiceAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<Service[]>('/services', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<Service>(`/services/${id}`).then((res: any) => res.data),

  create: (data: Partial<Service>) =>
    apiClient.post<Service>('/services', data).then((res: any) => res.data),

  update: (id: string, data: Partial<Service>) =>
    apiClient.put<Service>(`/services/${id}`, data).then((res: any) => res.data),

  delete: (id: string) => apiClient.delete(`/services/${id}`).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<Service[]>('/services', { params }).then((res: any) => res.data),
};

export const ProductCostHistoryAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<ProductCostHistory[]>('/product-cost-histories', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<ProductCostHistory>(`/product-cost-histories/${id}`).then((res: any) => res.data),

  create: (data: Partial<ProductCostHistory>) =>
    apiClient.post<ProductCostHistory>('/product-cost-histories', data).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<ProductCostHistory[]>('/product-cost-histories', { params }).then((res: any) => res.data),
};

export const PriceUpdateAPI = {
  list: (orderBy: string = '-created_date', limit: number = 50) =>
    apiClient.get<PriceUpdate[]>('/price-updates', { params: { orderBy, limit } }).then((res: any) => res.data),

  get: (id: string) => apiClient.get<PriceUpdate>(`/price-updates/${id}`).then((res: any) => res.data),

  create: (data: Partial<PriceUpdate>) =>
    apiClient.post<PriceUpdate>('/price-updates', data).then((res: any) => res.data),

  filter: (params: any) => apiClient.get<PriceUpdate[]>('/price-updates', { params }).then((res: any) => res.data),
};
