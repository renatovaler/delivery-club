
import React, { useState, useEffect } from 'react';
import { Plan } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, MoreVertical, Trash2, CreditCard } from 'lucide-react';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    max_delivery_areas: '',
    max_subscriptions: '',
    max_products: '', // Novo campo
  });
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const data = await Plan.list('-created_date');
      setPlans(data);
    } catch (error) {
      toast({ title: 'Erro ao carregar planos', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        max_delivery_areas: plan.max_delivery_areas,
        max_subscriptions: plan.max_subscriptions,
        max_products: plan.max_products || '', // Novo campo
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        max_delivery_areas: '',
        max_subscriptions: '',
        max_products: '', // Novo campo
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const planData = {
      ...formData,
      price: parseFloat(formData.price),
      max_delivery_areas: parseInt(formData.max_delivery_areas, 10),
      max_subscriptions: parseInt(formData.max_subscriptions, 10),
      max_products: parseInt(formData.max_products, 10), // Novo campo
    };

    try {
      if (editingPlan) {
        await Plan.update(editingPlan.id, planData);
        toast({ title: 'Plano atualizado com sucesso!' });
      } else {
        await Plan.create(planData);
        toast({ title: 'Plano criado com sucesso!' });
      }
      setIsDialogOpen(false);
      loadPlans();
    } catch (error) {
      toast({ title: 'Erro ao salvar o plano', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (plan) => {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      await Plan.update(plan.id, { status: newStatus });
      toast({ title: `Plano ${newStatus === 'active' ? 'ativado' : 'desativado'}.` });
      loadPlans();
    } catch (error) {
      toast({ title: 'Erro ao alterar status do plano.', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Planos de Assinatura</h1>
          <p className="text-amber-600">Gerencie os planos disponíveis para as empresas.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-amber-600 hover:bg-amber-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <CreditCard className="w-5 h-5" />
            Planos Existentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Max Áreas</TableHead>
                <TableHead>Max Assinaturas</TableHead>
                <TableHead>Max Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map(plan => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>R$ {plan.price.toFixed(2)}/mês</TableCell>
                  <TableCell>{plan.max_delivery_areas}</TableCell>
                  <TableCell>{plan.max_subscriptions}</TableCell>
                  <TableCell>{plan.max_products || 'Ilimitado'}</TableCell>
                  <TableCell>
                    <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                      {plan.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleOpenDialog(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeactivate(plan)}>
                          {plan.status === 'active' ? <Trash2 className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                          {plan.status === 'active' ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do plano de assinatura.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Preço (R$)</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="max_delivery_areas" className="text-right">Max Áreas</Label>
              <Input id="max_delivery_areas" type="number" value={formData.max_delivery_areas} onChange={e => setFormData({...formData, max_delivery_areas: e.target.value})} className="col-span-3" />
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
