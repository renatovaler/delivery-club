'use client';

import { useEffect, useState } from 'react';
import { User, Subscription } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../lib/lib';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeliveryGroup, SubscriptionSummary } from './types';

interface DashboardContentProps {
  upcomingDeliveries: DeliveryGroup[];
  subscriptions: Subscription[];
  subscriptionSummaries: Record<string, SubscriptionSummary>;
}

export function DashboardContent({ upcomingDeliveries, subscriptions, subscriptionSummaries }: DashboardContentProps) {
  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">Próximas Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeliveries.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeliveries.map((delivery, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      delivery.date.toDateString() === new Date().toDateString()
                        ? 'bg-slate-100 border-slate-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {format(delivery.date, 'EEEE, d MMMM', { locale: ptBR })}
                        </p>
                        <p className="text-sm text-slate-600 font-semibold">{delivery.totalQuantity} produtos</p>
                        <div className="mt-2">
                          <p className="text-xs text-slate-500 flex items-center gap-1">{delivery.address}</p>
                          {delivery.subscriptions.length > 1 && (
                            <p className="text-xs text-blue-600 mt-1">{delivery.subscriptions.length} assinaturas neste local</p>
                          )}
                        </div>
                      </div>
                      {delivery.date.toDateString() === new Date().toDateString() && (
                        <Badge className="bg-blue-500 hover:bg-blue-600 ml-3">Hoje</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">Nenhuma entrega programada</p>
                <Button className="mt-4 bg-slate-800 hover:bg-slate-900 text-white">
                  Criar Assinatura
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">Minhas Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.slice(0, 3).map((subscription) => (
                  <div key={subscription.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {subscriptionSummaries[subscription.id]?.totalQuantity || 0} itens por entrega
                        </p>
                        <p className="text-sm text-slate-600">
                          {subscriptionSummaries[subscription.id]?.itemCount || 0} produtos diferentes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(subscription.weekly_price)}</p>
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Ativa
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                  Ver Todas as Assinaturas
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-4">Você ainda não tem assinaturas</p>
                <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                  Criar Primeira Assinatura
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-slate-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="w-full h-16 bg-slate-800 hover:bg-slate-900 text-white flex-col gap-2">
              Nova Assinatura
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              Gerenciar Assinaturas
            </Button>
            <Button variant="outline" className="w-full h-16 border-slate-300 text-slate-700 hover:bg-slate-50 flex-col gap-2">
              Histórico Financeiro
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
