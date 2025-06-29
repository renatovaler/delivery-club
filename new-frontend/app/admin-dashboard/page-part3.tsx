'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertTriangle,
  MessageCircle,
  Shield,
  CheckCircle,
  Activity,
  BarChart3,
  Building2,
  Users,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

interface Activity {
  type: string;
  description: string;
  date: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface DashboardStats {
  pendingSupport: number;
  pendingReports: number;
  recentPriceUpdates: number;
}

interface PlatformHealth {
  averageTicketValue: number;
}

interface Props {
  dashboardStats: DashboardStats;
  recentActivities: Activity[];
  platformHealth: PlatformHealth;
}

export default function AdminDashboardPart3({ dashboardStats, recentActivities, platformHealth }: Props) {
  return (
    <>
      {/* Alertas e atividades */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Alertas do sistema */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <AlertTriangle className="w-5 h-5" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.pendingSupport > 0 && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <MessageCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-900">Tickets de Suporte Pendentes</p>
                    <p className="text-sm text-orange-600 mt-1">
                      {dashboardStats.pendingSupport} tickets aguardando atendimento
                    </p>
                  </div>
                </div>
              )}

              {dashboardStats.pendingReports > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Denúncias Pendentes</p>
                    <p className="text-sm text-red-600 mt-1">
                      {dashboardStats.pendingReports} denúncias para investigar
                    </p>
                  </div>
                </div>
              )}

              {dashboardStats.recentPriceUpdates > 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Atualizações de Preço Recentes</p>
                    <p className="text-sm text-blue-600 mt-1">
                      {dashboardStats.recentPriceUpdates} produtos tiveram preços atualizados nos últimos 30 dias
                    </p>
                  </div>
                </div>
              )}

              {dashboardStats.pendingSupport === 0 && dashboardStats.pendingReports === 0 && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Sistema Funcionando Bem</p>
                    <p className="text-sm text-green-600 mt-1">
                      Não há alertas urgentes no momento
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividades recentes */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="w-5 h-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma atividade recente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-slate-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="w-full h-16 bg-slate-800 hover:bg-slate-900 text-white flex-col gap-2">
              <Building2 className="w-5 h-5" />
              Gerenciar Empresas
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              <Users className="w-5 h-5" />
              Usuários
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              <TrendingUp className="w-5 h-5" />
              Relatórios
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              <CreditCard className="w-5 h-5" />
              Assinaturas
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
