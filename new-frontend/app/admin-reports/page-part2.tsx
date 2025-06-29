'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Label } from '../../components/ui/Label';
import Progress from '../../components/ui/Progress';
import { Select, SelectItem } from '../../components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { formatCurrency } from '../../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  DollarSign,
  Users,
  Building2,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

interface Props {
  stats: any;
  chartData: any;
  selectedPeriod: string;
  setSelectedPeriod: (value: string) => void;
  isGenerating: boolean;
  generateReport: (reportType: string) => void;
  platformMetrics: any;
}

export default function AdminReportsPart2({
  stats,
  chartData,
  selectedPeriod,
  setSelectedPeriod,
  isGenerating,
  generateReport,
  platformMetrics
}: Props) {
  return (
    <>
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total de Empresas
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
            <p className="text-xs text-blue-200 mt-1">
              {stats.activeBusinesses} ativas
            </p>
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
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-200 mt-1">
              Este mês: {formatCurrency(stats.monthlyRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Usuários Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-purple-200 mt-1">
              {stats.newUsersThisMonth} novos este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e relatórios */}
      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <TrendingUp className="w-5 h-5" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="Receita" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="w-5 h-5" />
              Relatórios Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => generateReport('businesses')}
                className="w-full justify-start bg-slate-800 hover:bg-slate-900 text-white"
                disabled={isGenerating}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Relatório de Empresas
              </Button>
              <Button
                onClick={() => generateReport('revenue')}
                className="w-full justify-start bg-slate-800 hover:bg-slate-900 text-white"
                disabled={isGenerating}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Relatório Financeiro
              </Button>
              <Button
                onClick={() => generateReport('users')}
                className="w-full justify-start bg-slate-800 hover:bg-slate-900 text-white"
                disabled={isGenerating}
              >
                <Users className="w-4 h-4 mr-2" />
                Relatório de Usuários
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
