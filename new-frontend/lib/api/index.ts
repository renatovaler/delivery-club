// Re-export all types
export * from './types';

// Re-export all APIs and their types
export * from './financial';
export * from './plan';
export * from './product';
export * from './subscription';
export * from './support';
export * from './team';
export * from './user';

// Export a central API object that contains all APIs
import { ExpenseAPI, InvoiceAPI } from './financial';
import { DeliveryAreaAPI, PlanAPI, ProcessedEventAPI, TeamChangeHistoryAPI, TeamMemberAPI, TeamSubscriptionHistoryAPI } from './plan';
import { PriceUpdateAPI, ProductAPI, ProductCostHistoryAPI, ServiceAPI } from './product';
import { SubscriptionAPI, SubscriptionItemAPI } from './subscription';
import { NotificationAPI, PlatformReportAPI, SupportTicketAPI, TicketMessageAPI } from './support';
import { TeamAPI } from './team';
import { UserAPI } from './user';

export const API = {
  users: UserAPI,
  teams: TeamAPI,
  teamMembers: TeamMemberAPI,
  teamSubscriptionHistory: TeamSubscriptionHistoryAPI,
  teamChangeHistory: TeamChangeHistoryAPI,
  subscriptions: SubscriptionAPI,
  subscriptionItems: SubscriptionItemAPI,
  products: ProductAPI,
  services: ServiceAPI,
  productCostHistory: ProductCostHistoryAPI,
  priceUpdates: PriceUpdateAPI,
  invoices: InvoiceAPI,
  expenses: ExpenseAPI,
  supportTickets: SupportTicketAPI,
  ticketMessages: TicketMessageAPI,
  platformReports: PlatformReportAPI,
  notifications: NotificationAPI,
  plans: PlanAPI,
  deliveryAreas: DeliveryAreaAPI,
  processedEvents: ProcessedEventAPI,
};

export default API;
