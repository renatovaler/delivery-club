import type { User as APIUser, Subscription as APISubscription } from '@/lib/api';

export type User = APIUser;

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
}

export type Subscription = APISubscription;

export interface SubscriptionItem {
  subscription_id: string;
  quantity_per_delivery: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  delivery_days?: string[];
  biweekly_delivery_day?: string;
  monthly_delivery_day?: number;
}

export interface DeliveryGroup {
  date: Date;
  address: string;
  totalQuantity: number;
  subscriptions: Subscription[];
}

export interface SubscriptionSummary {
  totalQuantity: number;
  itemCount: number;
}

export interface DashboardData {
  subscriptions: Subscription[];
  upcomingDeliveries: DeliveryGroup[];
  totalSubscribedItems: number;
  subscriptionSummaries: Record<string, SubscriptionSummary>;
}
