'use client';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ProductAPI, SubscriptionAPI, SubscriptionItemAPI, TeamAPI, UserAPI } from '@/lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, MapPin, Package, Pause, Play, Plus, ShoppingCart, Wrench, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Função utilitária para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Constantes
const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

// Função para tradução de status
const translateStatus = (status: string): string => {
  const translations: { [key: string]: string } = {
    active: 'Ativa',
    paused: 'Pausada',
    cancelled: 'Cancelada',
    pending_payment: 'Aguardando Pagamento',
  };
  return translations[status] || status;
};

interface AddressFormData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference?: string;
}

export default function MySubscriptions() {
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{ [key: string]: any }>({});
  const [teams, setTeams] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    reference: '',
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const userData = await UserAPI.me();
      setUser(userData);

      const userSubscriptions = await SubscriptionAPI.filter({ customer_id: userData.id });
      setSubscriptions(userSubscriptions);

      if (userSubscriptions.length === 0) {
        setIsLoading(false);
        return;
      }

      // Carregar times
      const teamIds = [...new Set(userSubscriptions.map((s: any) => s.team_id))];
      const teamsData = await Promise.all(teamIds.map((id) => TeamAPI.get(id).catch(() => null)));
      const teamsMap = teamsData.filter(Boolean).reduce((acc: any, team: any) => {
        acc[team.id] = team;
        return acc;
      }, {});
      setTeams(teamsMap);

      // Carregar itens das assinaturas
      const subscriptionIds = userSubscriptions.map((s: any) => s.id);
      const itemPromises = subscriptionIds.map((id) =>
        SubscriptionItemAPI.filter({ subscription_id: id })
      );
      const allItemsArrays = await Promise.all(itemPromises);
      const allItems = allItemsArrays.flat();

      const detailsMap: { [key: string]: any[] } = {};

      if (allItems.length > 0) {
        // Buscar produtos
        const productIds = [
          ...new Set(allItems.map((item: any) => item.product_id).filter(Boolean)),
        ];
        const productsData = await ProductAPI.list('created_date', 100);
        const productsMap = productsData.reduce((acc: any, p: any) => {
          if (p) acc[p.id] = p;
          return acc;
        }, {});

        // Agrupar itens por assinatura
        for (const item of allItems) {
          if (!detailsMap[item.subscription_id]) {
            detailsMap[item.subscription_id] = [];
          }

          let itemData = null;
          let itemType = 'unknown';

          if (item.product_id) {
            itemData = productsMap[item.product_id];
            itemType = 'product';
          }

          const detailedItem = {
            ...item,
            item_type: itemType,
            item_data: itemData || {
              id: item.product_id || 'unknown',
              name: 'Produto Indisponível',
              description:
                'Este produto não pôde ser carregado ou não está mais disponível no catálogo.',
              price_per_unit: item.unit_price || 0,
              status: 'inactive',
            },
          };
          detailsMap[item.subscription_id].push(detailedItem);
        }
      }

      setSubscriptionDetails(detailsMap);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      alert('Não foi possível carregar suas assinaturas.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFrequencyForItem = (item: any) => {
    const weekDaysShort = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom',
    };
    const dayLabel =
      DAYS_OF_WEEK.find((d) => d.value === item.biweekly_delivery_day)?.label ||
      item.biweekly_delivery_day;

    switch (item.frequency) {
      case 'weekly':
        return `Semanal (${item.delivery_days.map((d: string) => weekDaysShort[d as keyof typeof weekDaysShort]).join(', ') || 'Nenhum dia'})`;
      case 'bi-weekly':
        return `Quinzenal (${dayLabel})`;
      case 'monthly':
        return `Mensal (Todo dia ${item.monthly_delivery_day})`;
      default:
        return 'Não definido';
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      await SubscriptionAPI.update(subscriptionId, { status: 'paused' });
      alert('Assinatura pausada com sucesso! ⏸️');
      await loadSubscriptions();
    } catch (error) {
      alert('Erro ao pausar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    setActionLoading(subscriptionId);
    try {
      await SubscriptionAPI.update(subscriptionId, { status: 'active' });
      alert('Assinatura reativada! ✅');
      await loadSubscriptions();
    } catch (error) {
      alert('Erro ao reativar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (
      !confirm('Tem certeza que deseja cancelar esta assinatura? Esta ação não pode ser desfeita.')
    )
      return;
    setActionLoading(subscriptionId);
    try {
      await SubscriptionAPI.update(subscriptionId, { status: 'cancelled' });
      alert('Assinatura cancelada.');
      await loadSubscriptions();
    } catch (error) {
      alert('Erro ao cancelar assinatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenAddressModal = (subscription: any) => {
    setEditingSubscription(subscription);
    setAddressFormData(
      subscription.delivery_address || {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        reference: '',
      }
    );
    setIsAddressModalOpen(true);
  };

  const handleAddressInputChange = (field: keyof AddressFormData, value: string) => {
    setAddressFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateAddress = async () => {
    const requiredFields = {
      street: 'Rua',
      number: 'Número',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
      zip_code: 'CEP',
    };
    const missingFields = Object.keys(requiredFields).filter(
      (field) => !addressFormData[field as keyof AddressFormData]?.trim()
    );
    if (missingFields.length > 0) {
      alert(
        `Preencha: ${missingFields.map((f) => requiredFields[f as keyof typeof requiredFields]).join(', ')}.`
      );
      return;
    }

    setIsSavingAddress(true);
    try {
      await SubscriptionAPI.update(editingSubscription.id, { delivery_address: addressFormData });
      alert('Endereço atualizado! ✅');
      await loadSubscriptions();
      setIsAddressModalOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      alert('Erro ao atualizar endereço');
    } finally {
      setIsSavingAddress(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-slate-200"></div>
          <div className="h-64 rounded-xl bg-slate-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-6 md:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Minhas Assinaturas</h1>
        <p className="text-slate-600">
          Gerencie suas assinaturas mensais, pause, cancele ou altere detalhes.
        </p>
      </div>

      <div className="space-y-6">
        {subscriptions.map((sub: any) => (
          <Card key={sub.id} className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900">
                    {teams[sub.team_id]?.name || 'Empresa não encontrada'}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Assinatura #{sub.id.slice(-8)} • Criada em{' '}
                    {format(new Date(sub.created_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  {sub.next_billing_date && (
                    <p className="mt-1 text-sm text-blue-600">
                      Próxima cobrança:{' '}
                      {format(new Date(sub.next_billing_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${
                      sub.status === 'active'
                        ? 'bg-green-500 text-white'
                        : sub.status === 'paused'
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                    }`}
                  >
                    {translateStatus(sub.status)}
                  </Badge>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (sub.status === 'active') handlePauseSubscription(sub.id);
                        else if (sub.status === 'paused') handleResumeSubscription(sub.id);
                      }}
                      disabled={actionLoading === sub.id || sub.status === 'cancelled'}
                    >
                      {actionLoading === sub.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : sub.status === 'active' ? (
                        <Pause className="h-4 w-4" />
                      ) : sub.status === 'paused' ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Resumo Financeiro */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-700">Valor Mensal Total</span>
                  <span className="text-2xl font-bold text-green-800">
                    {formatCurrency(sub.monthly_price || 0)}
                  </span>
                </div>
              </div>

              {/* Produtos/Serviços da Assinatura */}
              <div>
                <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Package className="h-5 w-5" />
                  Itens Inclusos ({(subscriptionDetails[sub.id] || []).length})
                </h4>

                {(subscriptionDetails[sub.id] || []).length > 0 ? (
                  <div className="space-y-3">
                    {subscriptionDetails[sub.id].map((item: any) => {
                      const itemData = item.item_data;
                      const isUnavailable = !itemData || itemData.status === 'inactive';
                      const isService = item.item_type === 'service';

                      return (
                        <div
                          key={item.id}
                          className={`rounded-lg border p-4 transition-colors ${
                            isUnavailable
                              ? 'border-red-200 bg-red-50'
                              : 'border-slate-100 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                {isService ? (
                                  <Wrench className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Package className="h-4 w-4 text-green-600" />
                                )}
                                <h5
                                  className={`text-base font-bold ${
                                    isUnavailable ? 'text-red-700' : 'text-slate-900'
                                  }`}
                                >
                                  {itemData?.name || 'Item não identificado'}
                                </h5>
                                <Badge variant="outline" className="text-xs">
                                  {isService ? 'Serviço' : 'Produto'}
                                </Badge>
                                {isUnavailable && (
                                  <Badge variant="outline" className="border-red-300 text-red-600">
                                    Indisponível
                                  </Badge>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                                <div>
                                  <span className="font-medium text-slate-700">Quantidade:</span>
                                  <p className="text-slate-800">
                                    {item.quantity_per_delivery}{' '}
                                    {isService
                                      ? 'sessões'
                                      : itemData?.unit_type === 'unidade'
                                        ? 'unidades'
                                        : itemData?.unit_type || 'unidades'}
                                  </p>
                                </div>

                                <div>
                                  <span className="font-medium text-slate-700">Frequência:</span>
                                  <p className="text-slate-800">{formatFrequencyForItem(item)}</p>
                                </div>

                                <div>
                                  <span className="font-medium text-slate-700">Preço Mensal:</span>
                                  <p className="text-slate-800">
                                    {formatCurrency(item.monthly_subtotal || 0)}
                                  </p>
                                </div>
                              </div>

                              {itemData?.description && (
                                <p className="mt-2 text-xs italic text-slate-600">
                                  {itemData.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-600">
                    <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>Nenhum item encontrado nesta assinatura</p>
                  </div>
                )}
              </div>

              {/* Endereço de Entrega */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </h4>
                  {sub.status !== 'cancelled' && (
                    <Button variant="outline" size="sm" onClick={() => handleOpenAddressModal(sub)}>
                      Alterar
                    </Button>
                  )}
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  {sub.delivery_address ? (
                    <div className="space-y-1 text-blue-800">
                      <p className="font-medium">
                        {sub.delivery_address.street}, {sub.delivery_address.number}
                        {sub.delivery_address.complement
                          ? ` - ${sub.delivery_address.complement}`
                          : ''}
                      </p>
                      <p>
                        {sub.delivery_address.neighborhood}, {sub.delivery_address.city} -{' '}
                        {sub.delivery_address.state}
                      </p>
                      <p className="font-mono text-sm">{sub.delivery_address.zip_code}</p>
                      {sub.delivery_address.reference && (
                        <p className="mt-2 text-sm italic">
                          <strong>Referência:</strong> {sub.delivery_address.reference}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="italic text-blue-600">Endereço não informado</p>
                  )}
                </div>
              </div>

              {/* Ações */}
              {sub.status !== 'cancelled' && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenAddressModal(sub)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Alterar Endereço
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCancelSubscription(sub.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar Assinatura
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {subscriptions.length === 0 && (
          <Card className="border-0">
            <CardContent className="py-16 text-center">
              <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-slate-400" />
              <h3 className="mb-2 text-xl font-semibold text-slate-900">
                Nenhuma assinatura encontrada
              </h3>
              <p className="mb-6 text-slate-600">
                Parece que você ainda não tem nenhuma assinatura ativa.
              </p>
              <Link href="/new-subscription">
                <Button className="bg-slate-800 text-white hover:bg-slate-900">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Assinatura
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Endereço de Entrega</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Rua*</Label>
              <Input
                value={addressFormData.street}
                onChange={(e) => handleAddressInputChange('street', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Número*</Label>
              <Input
                value={addressFormData.number}
                onChange={(e) => handleAddressInputChange('number', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CEP*</Label>
              <Input
                value={addressFormData.zip_code}
                onChange={(e) => handleAddressInputChange('zip_code', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Bairro*</Label>
              <Input
                value={addressFormData.neighborhood}
                onChange={(e) => handleAddressInputChange('neighborhood', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Cidade*</Label>
              <Input
                value={addressFormData.city}
                onChange={(e) => handleAddressInputChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado*</Label>
              <Input
                value={addressFormData.state}
                onChange={(e) => handleAddressInputChange('state', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Complemento</Label>
              <Input
                value={addressFormData.complement}
                onChange={(e) => handleAddressInputChange('complement', e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Referência</Label>
              <Input
                value={addressFormData.reference}
                onChange={(e) => handleAddressInputChange('reference', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddressModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateAddress} disabled={isSavingAddress}>
              {isSavingAddress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Endereço
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
