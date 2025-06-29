'use client';

import { useState, useEffect } from 'react';
import { UserAPI, SubscriptionAPI, TeamAPI } from '../../lib/api';
import { InvoiceAPI, ProductAPI, SupportTicketAPI, PlatformReportAPI, PriceUpdateAPI, ExpenseAPI } from '../../lib/api-extended';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import Progress from '../../components/ui/Progress';
import { formatCurrency } from '../../lib/utils';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Shield,
  Star,
  Activity,
  BarChart3
} from 'lucide-react';
import { subDays, format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboardPart1() {
  const [dashboardStats, setDashboardStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    trialBusinesses: 0,
    totalCustomers: 0,
    activeCustomers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    activeSubscriptions: 0,
    pendingSupport: 0,
    pendingReports: 0,
    recentPriceUpdates: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [platformHealth, setPlatformHealth] = useState({
    businessGrowthRate: 0,
    customerSatisfaction: 0,
    averageTicketValue: 0,
    churnRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const userData = await UserAPI.me();

        const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthStart = startOfMonth(new Date()).toISOString().split('T')[0];
        const monthEnd = endOfMonth(new Date()).toISOString().split('T')[0];

        const [
          allBusinesses,
          allUsers,
          recentInvoices,
          allSubscriptions,
          allProducts,
          supportTickets,
          platformReports,
          priceUpdates,
          expenses
        ] = await Promise.all([
          TeamAPI.list('-created_date', 200),
          UserAPI.list('-created_date', 500),
          InvoiceAPI.list('-created_date', 300),
          SubscriptionAPI.list('-created_date', 300),
          ProductAPI.list('-created_date', 100),
          SupportTicketAPI.list('-created_date', 50),
          PlatformReportAPI.list('-created_date', 50),
          PriceUpdateAPI.list('-created_date', 50),
          ExpenseAPI.list('-created_date', 100)
        ]);

        // Processar dados e atualizar estados (continua na próxima parte)
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return null; // Conteúdo principal será na próxima parte
}
