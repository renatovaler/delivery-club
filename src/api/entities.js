import apiClient from './apiClient';

export const TeamMember = {
  get: (id) => apiClient.get(`/team-members/${id}`).then(res => res.data),
  list: () => apiClient.get('/team-members').then(res => res.data),
  create: (data) => apiClient.post('/team-members', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/team-members/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/team-members/${id}`).then(res => res.data),
};

export const Team = {
  get: (id) => apiClient.get(`/teams/${id}`).then(res => res.data),
  list: () => apiClient.get('/teams').then(res => res.data),
  create: (data) => apiClient.post('/teams', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/teams/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/teams/${id}`).then(res => res.data),
};

export const DeliveryArea = {
  get: (id) => apiClient.get(`/delivery-areas/${id}`).then(res => res.data),
  list: () => apiClient.get('/delivery-areas').then(res => res.data),
  create: (data) => apiClient.post('/delivery-areas', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/delivery-areas/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/delivery-areas/${id}`).then(res => res.data),
};

export const Subscription = {
  get: (id) => apiClient.get(`/subscriptions/${id}`).then(res => res.data),
  list: () => apiClient.get('/subscriptions').then(res => res.data),
  create: (data) => apiClient.post('/subscriptions', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/subscriptions/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/subscriptions/${id}`).then(res => res.data),
};

export const Invoice = {
  get: (id) => apiClient.get(`/invoices/${id}`).then(res => res.data),
  list: () => apiClient.get('/invoices').then(res => res.data),
  create: (data) => apiClient.post('/invoices', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/invoices/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/invoices/${id}`).then(res => res.data),
};

export const Plan = {
  get: (id) => apiClient.get(`/plans/${id}`).then(res => res.data),
  list: () => apiClient.get('/plans').then(res => res.data),
  create: (data) => apiClient.post('/plans', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/plans/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/plans/${id}`).then(res => res.data),
};

export const Expense = {
  get: (id) => apiClient.get(`/expenses/${id}`).then(res => res.data),
  list: () => apiClient.get('/expenses').then(res => res.data),
  create: (data) => apiClient.post('/expenses', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/expenses/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/expenses/${id}`).then(res => res.data),
};

export const ProcessedEvent = {
  get: (id) => apiClient.get(`/processed-events/${id}`).then(res => res.data),
  list: () => apiClient.get('/processed-events').then(res => res.data),
  create: (data) => apiClient.post('/processed-events', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/processed-events/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/processed-events/${id}`).then(res => res.data),
};

export const Notification = {
  get: (id) => apiClient.get(`/notifications/${id}`).then(res => res.data),
  list: () => apiClient.get('/notifications').then(res => res.data),
  create: (data) => apiClient.post('/notifications', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/notifications/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/notifications/${id}`).then(res => res.data),
};

export const Product = {
  get: (id) => apiClient.get(`/products/${id}`).then(res => res.data),
  list: () => apiClient.get('/products').then(res => res.data),
  create: (data) => apiClient.post('/products', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/products/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/products/${id}`).then(res => res.data),
};

export const SubscriptionItem = {
  get: (id) => apiClient.get(`/subscription-items/${id}`).then(res => res.data),
  list: () => apiClient.get('/subscription-items').then(res => res.data),
  create: (data) => apiClient.post('/subscription-items', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/subscription-items/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/subscription-items/${id}`).then(res => res.data),
};

export const PriceUpdate = {
  // Implement similarly if needed
};

export const SupportTicket = {
  get: (id) => apiClient.get(`/support-tickets/${id}`).then(res => res.data),
  list: () => apiClient.get('/support-tickets').then(res => res.data),
  create: (data) => apiClient.post('/support-tickets', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/support-tickets/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/support-tickets/${id}`).then(res => res.data),
};

export const TicketMessage = {
  get: (id) => apiClient.get(`/ticket-messages/${id}`).then(res => res.data),
  list: () => apiClient.get('/ticket-messages').then(res => res.data),
  create: (data) => apiClient.post('/ticket-messages', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/ticket-messages/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/ticket-messages/${id}`).then(res => res.data),
};

export const PlatformReport = {
  get: (id) => apiClient.get(`/platform-reports/${id}`).then(res => res.data),
  list: () => apiClient.get('/platform-reports').then(res => res.data),
  create: (data) => apiClient.post('/platform-reports', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/platform-reports/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/platform-reports/${id}`).then(res => res.data),
};

export const ProductCostHistory = {
  // Implement similarly if needed
};

export const TeamSubscriptionHistory = {
  get: (id) => apiClient.get(`/team-subscription-histories/${id}`).then(res => res.data),
  list: () => apiClient.get('/team-subscription-histories').then(res => res.data),
  create: (data) => apiClient.post('/team-subscription-histories', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/team-subscription-histories/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/team-subscription-histories/${id}`).then(res => res.data),
};

export const TeamChangeHistory = {
  get: (id) => apiClient.get(`/team-change-histories/${id}`).then(res => res.data),
  list: () => apiClient.get('/team-change-histories').then(res => res.data),
  create: (data) => apiClient.post('/team-change-histories', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/team-change-histories/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/team-change-histories/${id}`).then(res => res.data),
};

export const Service = {
  get: (id) => apiClient.get(`/services/${id}`).then(res => res.data),
  list: () => apiClient.get('/services').then(res => res.data),
  create: (data) => apiClient.post('/services', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/services/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/services/${id}`).then(res => res.data),
};

// auth sdk:
export const User = {
  // Implement authentication related methods if needed
};
