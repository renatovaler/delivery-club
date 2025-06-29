'use client';

import { useState, useEffect } from 'react';
import AdminDashboardPart1 from './page-part1';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboardPart2() {
  // Receber os dados da parte 1 via props ou contexto (a implementar)
  // Aqui vamos simular com estados locais para exemplo

  const [dashboardStats, setDashboardStats] = useState({
    totalBusinesses: 100,
    activeBusinesses: 80,
    trialBusinesses: 10,
    totalCustomers: 500,
    activeCustomers: 450,
    totalRevenue: 100000,
    monthlyRevenue: 8000,
    totalProducts: 200,
    activeSubscriptions: 300,
    pendingSupport: 5,
    pendingReports: 2,
    recentPriceUpdates: 7
  });

  const [platformHealth, setPlatformHealth] = useState({
    businessGrowthRate: 12.5,
    customerSatisfaction: 4.2,
    averageTicketValue: 150,
    churnRate: 5.2
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      type: 'business_registered',
      description: 'Nova empresa cadastrada: Empresa A',
      date: new Date().toISOString(),
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      type: 'customer_registered',
      description: 'Novo cliente: João Silva',
      date: new Date().toISOString(),
      icon: Users,
      color: 'text-green-600'
    },
    {
      type: 'support_ticket',
      description: 'Ticket de suporte: Problema no pagamento',
      date: new Date().toISOString(),
      icon: MessageCircle,
      color: 'text-orange-600'
    }
  ]);

  return (
    <>
      {/* Cards principais de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Empresas Totais
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalBusinesses}</div>
            <div className="flex justify-between text-xs text-blue-200 mt-2">
              <span>{dashboardStats.activeBusinesses} ativas</span>
              <span>{dashboardStats.trialBusinesses} trial</span>
            </div>
            <Progress 
              value={(dashboardStats.activeBusinesses / dashboardStats.totalBusinesses) * 100} 
              className="mt-2 bg-blue-400"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</div>
            <p className="text-xs text-green-200 mt-1">
              Este mês: {formatCurrency(dashboardStats.monthlyRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeCustomers}</div>
            <p className="text-xs text-purple-200 mt-1">
              De {dashboardStats.totalCustomers} cadastrados
            </p>
            <Progress 
              value={(dashboardStats.activeCustomers / dashboardStats.totalCustomers) * 100} 
              className="mt-2 bg-purple-400"
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">
              Assinaturas Ativas
            </CardTitle>
            <CreditCard className="h-4 w-4 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeSubscriptions}</div>
            <p className="text-xs text-orange-200 mt-1">
              Ticket médio: {formatCurrency(platformHealth.averageTicketValue)}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
