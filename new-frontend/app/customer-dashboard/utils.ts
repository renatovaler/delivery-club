import { User, Subscription, SubscriptionItem, UserAPI, SubscriptionAPI, SubscriptionItemAPI, TeamAPI } from '../../lib/api';
import { DeliveryGroup, SubscriptionSummary } from './types';
import { addDays, differenceInCalendarWeeks, format } from 'date-fns';

export async function loadDashboardData(currentUser: User) {
  if (!currentUser) {
    return {
      subscriptions: [],
      upcomingDeliveries: [],
      totalSubscribedItems: 0,
      subscriptionSummaries: {},
    };
  }

  const userSubscriptions = await SubscriptionAPI.filter({
    customer_id: currentUser.id,
    status: 'active',
  });

  if (userSubscriptions.length === 0) {
    return {
      subscriptions: [],
      upcomingDeliveries: [],
      totalSubscribedItems: 0,
      subscriptionSummaries: {},
    };
  }

  const teamIds = [...new Set(userSubscriptions.map((s) => s.team_id))];
  const teams = await Promise.all(teamIds.map((id) => TeamAPI.get(id).catch(() => null)));
  const validTeams = teams.filter((team) => team !== null);

  const allItems = (
    await Promise.all(userSubscriptions.map((s) => SubscriptionItemAPI.filter({ subscription_id: s.id })))
  ).flat();

  const totalItems = allItems.reduce((sum, item) => sum + (item.quantity_per_delivery || 0), 0);

  const summaries = userSubscriptions.reduce<Record<string, SubscriptionSummary>>((acc, sub) => {
    const itemsForSub = allItems.filter((item) => item.subscription_id === sub.id);
    acc[sub.id] = {
      totalQuantity: itemsForSub.reduce((sum, item) => sum + (item.quantity_per_delivery || 0), 0),
      itemCount: itemsForSub.length,
    };
    return acc;
  }, {});

  const dayMappingJsToEn: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  const deliveries: Array<{
    date: Date;
    subscription: Subscription;
    quantity: number;
    address: string;
  }> = [];

  const today = new Date();
  const subscriptionsById = userSubscriptions.reduce<Record<string, Subscription>>((acc, sub) => {
    acc[sub.id] = sub;
    return acc;
  }, {});

  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    const dayOfWeekEn = dayMappingJsToEn[date.getDay()];
    const dayOfMonth = date.getDate();

    allItems.forEach((item) => {
      if (!item || !item.subscription_id) return;

      const subscription = subscriptionsById[item.subscription_id];
      if (!subscription || subscription.status !== 'active' || !subscription.start_date) return;

      let isDeliveryDay = false;
      if (item.frequency === 'weekly') {
        if (Array.isArray(item.delivery_days) && item.delivery_days.includes(dayOfWeekEn)) {
          isDeliveryDay = true;
        }
      } else if (item.frequency === 'bi-weekly' && item.biweekly_delivery_day === dayOfWeekEn) {
        try {
          const startDate = new Date(subscription.start_date.replace(/-/g, '/') + 'T00:00:00');
          const weeksDiff = differenceInCalendarWeeks(date, startDate, { weekStartsOn: 1 });
          if (weeksDiff >= 0 && weeksDiff % 2 === 0) {
            isDeliveryDay = true;
          }
        } catch (error) {
          console.error('Erro ao calcular data quinzenal:', error);
        }
      } else if (item.frequency === 'monthly' && item.monthly_delivery_day === dayOfMonth) {
        isDeliveryDay = true;
      }

      if (isDeliveryDay) {
        const address = subscription.delivery_address
          ? `${subscription.delivery_address.street}, ${subscription.delivery_address.number} - ${subscription.delivery_address.neighborhood}`
          : 'Endereço não informado';

        deliveries.push({
          date,
          subscription,
          quantity: item.quantity_per_delivery || 0,
          address,
        });
      }
    });
  }

  const groupedDeliveries = deliveries.reduce<Record<string, DeliveryGroup>>((acc, delivery) => {
    const dateKey = format(delivery.date, 'yyyy-MM-dd');
    const groupKey = `${dateKey}_${delivery.address}`;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        date: delivery.date,
        address: delivery.address,
        totalQuantity: 0,
        subscriptions: [],
      };
    }

    acc[groupKey].totalQuantity += delivery.quantity;
    if (!acc[groupKey].subscriptions.some((s) => s.id === delivery.subscription.id)) {
      acc[groupKey].subscriptions.push(delivery.subscription);
    }

    return acc;
  }, {});

  const upcomingDeliveries = Object.values(groupedDeliveries)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return {
    subscriptions: userSubscriptions,
    upcomingDeliveries,
    totalSubscribedItems: totalItems,
    subscriptionSummaries: summaries,
  };
}

export function calculateTotalWeeklyValue(subscriptions: Subscription[]): number {
  return subscriptions.reduce((sum, sub) => {
    const price = parseFloat(sub.weekly_price) || 0;
    return sum + price;
  }, 0);
}
