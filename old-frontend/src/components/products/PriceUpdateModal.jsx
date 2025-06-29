import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { PriceUpdate } from "@/api/entities";
import { SubscriptionItem } from "@/api/entities";
import { Subscription } from "@/api/entities";
import { User } from "@/api/entities";
import { createNotification, formatCurrency } from "@/components/lib";
import { Calendar, DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";

export default function PriceUpdateModal({ product, team, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    new_price: product?.price_per_unit || '',
    effective_date: '',
    reason: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [affectedSubscriptions, setAffectedSubscriptions] = useState(0);
  const { toast } = useToast();

  React.useEffect(() => {
    if (product && isOpen) {
      setFormData({
        new_price: product.price_per_unit,
        effective_date: '',
        reason: ''
      });
      loadAffectedSubscriptions();
    }
  }, [product, isOpen]);

  const loadAffectedSubscriptions = async () => {
    if (!product) return;
    try {
      const items = await SubscriptionItem.filter({ product_id: product.id });
      const subscriptionIds = [...new Set(items.map(item => item.subscription_id))];
      
      let activeCount = 0;
      for (const subId of subscriptionIds) {
        const sub = await Subscription.get(subId);
        if (sub && sub.status === 'active') {
          activeCount++;
        }
      }
      setAffectedSubscriptions(activeCount);
    } catch (error) {
      console.error("Erro ao carregar assinaturas afetadas:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!product || !team) return;

    const newPrice = parseFloat(formData.new_price);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, informe um preço válido.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.effective_date) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, informe a data de vigência da mudança.",
        variant: "destructive"
      });
      return;
    }

    const effectiveDate = new Date(formData.effective_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (effectiveDate < today) {
      toast({
        title: "Data inválida",
        description: "A data de vigência deve ser hoje ou uma data futura.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Criar registro de atualização de preço
      await PriceUpdate.create({
        product_id: product.id,
        team_id: team.id,
        old_price: product.price_per_unit,
        new_price: newPrice,
        effective_date: formData.effective_date,
        reason: formData.reason.trim() || null
      });

      // Se a data de vigência é hoje, aplicar imediatamente
      if (formData.effective_date === today.toISOString().split('T')[0]) {
        await applyPriceUpdateImmediately(newPrice);
      }

      const isIncrease = newPrice > product.price_per_unit;
      toast({
        title: `${isIncrease ? 'Aumento' : 'Redução'} de preço agendado! ✅`,
        description: `A mudança entrará em vigor em ${new Date(formData.effective_date).toLocaleDateString('pt-BR')}.`
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Erro ao agendar atualização de preço:", error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar a atualização de preço.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const applyPriceUpdateImmediately = async (newPrice) => {
    try {
      // Buscar assinaturas ativas que contêm este produto
      const subscriptionItems = await SubscriptionItem.filter({ product_id: product.id });
      const affectedCustomers = new Set();

      for (const item of subscriptionItems) {
        const subscription = await Subscription.get(item.subscription_id);
        if (subscription && subscription.status === 'active') {
          affectedCustomers.add(subscription.customer_id);
          
          // Atualizar preço do item na assinatura
          await SubscriptionItem.update(item.id, { unit_price: newPrice });
          
          // Recalcular valor semanal da assinatura
          const allItems = await SubscriptionItem.filter({ subscription_id: subscription.id });
          let totalWeeklyPrice = 0;
          
          for (const subItem of allItems) {
            let deliveriesPerWeek = 0;
            if (subItem.frequency === 'weekly') {
              deliveriesPerWeek = subItem.delivery_days ? subItem.delivery_days.length : 0;
            } else if (subItem.frequency === 'bi-weekly') {
              deliveriesPerWeek = 0.5;
            } else if (subItem.frequency === 'monthly') {
              deliveriesPerWeek = 1 / 4.333;
            }
            const itemPrice = subItem.product_id === product.id ? newPrice : subItem.unit_price;
            totalWeeklyPrice += (subItem.quantity_per_delivery || 0) * itemPrice * deliveriesPerWeek;
          }
          
          await Subscription.update(subscription.id, { weekly_price: totalWeeklyPrice });
        }
      }

      // Notificar clientes afetados
      const priceChangePercent = ((newPrice - product.price_per_unit) / product.price_per_unit * 100).toFixed(1);
      const isIncrease = newPrice > product.price_per_unit;
      
      for (const customerId of affectedCustomers) {
        await createNotification({
          userId: customerId,
          title: `${isIncrease ? 'Aumento' : 'Redução'} de Preço - ${team.name}`,
          message: `O preço do produto "${product.name}" foi ${isIncrease ? 'aumentado' : 'reduzido'} em ${Math.abs(priceChangePercent)}% (de ${formatCurrency(product.price_per_unit)} para ${formatCurrency(newPrice)}). ${formData.reason ? `Motivo: ${formData.reason}` : ''} A mudança já está em vigor.`,
          linkTo: '/my-subscriptions',
          icon: isIncrease ? 'AlertTriangle' : 'TrendingDown'
        });
      }

    } catch (error) {
      console.error("Erro ao aplicar atualização imediata:", error);
    }
  };

  if (!product) return null;

  const newPrice = parseFloat(formData.new_price) || 0;
  const oldPrice = product.price_per_unit || 0;
  const priceChange = newPrice - oldPrice;
  const priceChangePercent = oldPrice > 0 ? (priceChange / oldPrice * 100) : 0;
  const isIncrease = priceChange > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Atualizar Preço
          </DialogTitle>
          <DialogDescription>
            Atualize o preço de "{product.name}" e defina quando a mudança deve entrar em vigor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço Atual</Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm font-medium">
                {formatCurrency(oldPrice)}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new_price">Novo Preço *</Label>
              <Input
                id="new_price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.new_price}
                onChange={(e) => handleInputChange('new_price', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          {Math.abs(priceChange) > 0.01 && (
            <div className={`p-3 rounded-lg border ${isIncrease ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 text-sm font-medium">
                {isIncrease ? <TrendingUp className="w-4 h-4 text-red-600" /> : <TrendingDown className="w-4 h-4 text-green-600" />}
                <span className={isIncrease ? 'text-red-700' : 'text-green-700'}>
                  {isIncrease ? 'Aumento' : 'Redução'} de {formatCurrency(Math.abs(priceChange))} ({Math.abs(priceChangePercent).toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="effective_date">Data de Vigência *</Label>
            <Input
              id="effective_date"
              type="date"
              value={formData.effective_date}
              onChange={(e) => handleInputChange('effective_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo da Mudança (opcional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              placeholder="Ex: Aumento dos custos de produção, promoção sazonal..."
              rows={3}
            />
          </div>

          {affectedSubscriptions > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Users className="w-4 h-4" />
                <span>
                  Esta mudança afetará {affectedSubscriptions} assinatura{affectedSubscriptions > 1 ? 's' : ''} ativa{affectedSubscriptions > 1 ? 's' : ''}.
                  Os clientes serão notificados automaticamente.
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Agendando...' : 'Agendar Mudança'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}