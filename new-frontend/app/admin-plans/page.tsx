'use client';

import { useState, useEffect } from 'react';
import { PlanAPI } from '../../lib/api-extended';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Separator } from '../../components/ui/Separator';
import { Edit, MoreVertical, Plus, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

export default function AdminPlans() {
  interface Plan {
    id: string;
    name: string;
    description?: string;
    price: number;
    max_subscriptions: number;
    max_products: number | null;
    status: 'active' | 'inactive';
  }

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    max_subscriptions: '',
    max_products: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await PlanAPI.list('-created_date');
      setPlans(data);
    } catch (error) {
      toast({ title: 'Erro ao carregar planos', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      max_subscriptions: plan.max_subscriptions,
      max_products: plan.max_products === null ? '' : plan.max_products.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const planData = {
      ...formData,
      price: parseFloat(formData.price),
      max_subscriptions: parseInt(formData.max_subscriptions, 10),
      max_products: formData.max_products === '' ? null : parseInt(formData.max_products, 10),
    };

    try {
      if (editingPlan) {
        await PlanAPI.update(editingPlan.id, planData);
        toast({ title: 'Plano atualizado com sucesso!' });
      } else {
        await PlanAPI.create(planData);
        toast({ title: 'Plano criado com sucesso!' });
      }
      setIsModalOpen(false);
      loadPlans();
    } catch (error) {
      toast({ title: 'Erro ao salvar o plano', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      await PlanAPI.update(plan.id, { status: newStatus });
      toast({ title: `Plano ${newStatus === 'active' ? 'ativado' : 'desativado'}.` });
      loadPlans();
    } catch (error) {
      toast({ title: 'Erro ao alterar status do plano.', variant: 'destructive' });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Planos da Plataforma</h1>
          <p className="text-slate-600">Gerencie os planos de assinatura disponíveis para as empresas</p>
        </div>
        <Button
          onClick={() => {
            setEditingPlan(null);
            setFormData({ name: '', description: '', price: '', max_subscriptions: '', max_products: '' });
            setIsModalOpen(true);
          }}
          className="bg-slate-800 hover:bg-slate-900 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`shadow-lg border-0 ${plan.status === 'inactive' ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-slate-900">{plan.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={plan.status === 'active' ? 'default' : 'secondary'}
                      className={plan.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}
                    >
                      {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditPlan(plan)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleToggleStatus(plan)}
                      className={plan.status === 'active' ? 'text-red-600' : 'text-green-600'}
                    >
                      {plan.status === 'active' ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">
                  {formatCurrency(plan.price)}
                </div>
                <div className="text-sm text-slate-600">por mês</div>
              </div>

              <div className="text-sm text-slate-600">
                {plan.description}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Assinaturas:</span>
                  <span className="font-medium text-slate-900">{plan.max_subscriptions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Produtos:</span>
                  <span className="font-medium text-slate-900">
                    {plan.max_products === null ? 'Ilimitado' : plan.max_products}
                  </span>
                </div>
              </div>

              <Separator />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Preço (R$)</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_subscriptions" className="text-right">Max Assinaturas</Label>
              <Input id="max_subscriptions" type="number" value={formData.max_subscriptions} onChange={e => setFormData({...formData, max_subscriptions: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_products" className="text-right">Max Produtos</Label>
              <Input id="max_products" type="number" value={formData.max_products} onChange={e => setFormData({...formData, max_products: e.target.value})} className="col-span-3" placeholder="Deixe vazio para ilimitado" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-slate-800 hover:bg-slate-900 text-white">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingPlan ? 'Atualizar' : 'Criar'} Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}</assistant
