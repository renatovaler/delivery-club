import { User, Subscription } from '../../lib/api';

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

export interface DashboardState {
  user: User | null;
  subscriptions: Subscription[];
  upcomingDeliveries: DeliveryGroup[];
  totalSubscribedItems: number;
  subscriptionSummaries: Record<string, SubscriptionSummary>;
  isLoading: boolean;
}
