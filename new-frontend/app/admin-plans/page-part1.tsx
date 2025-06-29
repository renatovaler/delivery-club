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

export default function AdminPlansPart1() {
  const [plans, setPlans] = useState([]);
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

  // Funções para editar, salvar, alternar status e formatar moeda serão implementadas na parte 2

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

  return null; // Conteúdo principal será na próxima parte
}
