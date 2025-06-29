
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { Service } from "@/api/entities";
import { DeliveryArea } from "@/api/entities";
import { Plan } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Wrench, Plus, Edit, Trash2, Eye, EyeOff, MapPin, Upload, X, ImageIcon, AlertTriangle, DollarSign } from "lucide-react";
import { formatCurrency, DAYS_OF_WEEK } from "@/components/lib";
import { UploadFile } from "@/api/integrations";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SERVICE_CATEGORIES = [
  { value: "limpeza", label: "Limpeza" },
  { value: "manutencao", label: "Manutenção Residencial" },
  { value: "consultoria", label: "Consultoria e Aulas" },
  { value: "beleza", label: "Beleza e Estética" },
  { value: "saude", label: "Saúde e Bem-estar" },
  { value: "eventos", label: "Eventos" },
  { value: "outros", label: "Outros" }
];

export default function ServiceManagement() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [services, setServices] = useState([]);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price_per_session: "",
    duration_minutes: "",
    available_days: [],
    available_area_ids: [],
    image_url: "",
    status: "active",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      if (userData.user_type !== 'business_owner') {
        toast({ title: "Acesso negado", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (userData.current_team_id) {
        const [teamData, teamServices, teamAreas] = await Promise.all([
          Team.get(userData.current_team_id),
          Service.filter({ team_id: userData.current_team_id }, '-created_date'),
          DeliveryArea.filter({ team_id: userData.current_team_id, status: 'active' })
        ]);
        
        setTeam(teamData);
        setServices(teamServices);
        setDeliveryAreas(teamAreas);

        if (teamData.plan_id) {
          const planData = await Plan.get(teamData.plan_id);
          setCurrentPlan(planData);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    if (team) {
      const teamServices = await Service.filter({ team_id: team.id }, '-created_date');
      setServices(teamServices);
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleDayToggle = (day, checked) => {
    setFormData(prev => ({ ...prev, available_days: checked ? [...prev.available_days, day] : prev.available_days.filter(d => d !== day) }));
  };

  const handleAreaToggle = (areaId, checked) => {
    setFormData(prev => ({ ...prev, available_area_ids: checked ? [...prev.available_area_ids, areaId] : prev.available_area_ids.filter(id => id !== areaId) }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
      toast({ title: "Imagem carregada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro no upload", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const removeImage = () => setFormData(prev => ({ ...prev, image_url: "" }));

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price_per_session: "",
      duration_minutes: "",
      available_days: [],
      available_area_ids: [],
      image_url: "",
      status: "active",
    });
    setEditingService(null);
  };

  const canAddNewService = () => {
    if (!currentPlan) return true;
    if (currentPlan.max_services === null || currentPlan.max_services === undefined) return true;
    return services.length < currentPlan.max_services;
  };
  
  const handleOpenModal = (service = null) => {
    if (!service && !canAddNewService()) {
      toast({ title: "Limite de serviços atingido", description: `Seu plano atual permite até ${currentPlan.max_services} serviços.`, variant: "destructive" });
      return;
    }

    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        category: service.category || "",
        price_per_session: service.price_per_session || "",
        duration_minutes: service.duration_minutes || "",
        available_days: service.available_days || [],
        available_area_ids: service.available_area_ids || [],
        image_url: service.image_url || "",
        status: service.status || "active",
      });
      setEditingService(service);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!formData.name.trim() || !formData.category || !formData.price_per_session || !formData.duration_minutes) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos marcados com *.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const serviceData = {
        ...formData,
        team_id: team.id,
        price_per_session: parseFloat(formData.price_per_session),
        duration_minutes: parseInt(formData.duration_minutes),
      };

      if (editingService) {
        await Service.update(editingService.id, serviceData);
        toast({ title: "Serviço atualizado com sucesso!" });
      } else {
        await Service.create(serviceData);
        toast({ title: "Serviço criado com sucesso!" });
      }

      setIsModalOpen(false);
      resetForm();
      await loadServices();
    } catch (error) {
      toast({ title: "Erro ao salvar serviço", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (service) => {
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    await Service.update(service.id, { status: newStatus });
    toast({ title: `Serviço ${newStatus === 'active' ? 'ativado' : 'desativado'}` });
    await loadServices();
  };

  const handleDeleteService = async (service) => {
    if (!confirm(`Tem certeza que deseja excluir "${service.name}"?`)) return;
    await Service.delete(service.id);
    toast({ title: "Serviço excluído com sucesso!" });
    await loadServices();
  };
  
  const getCategoryLabel = (category) => SERVICE_CATEGORIES.find(c => c.value === category)?.label || category;
  
  if (isLoading) return <div>Carregando...</div>;
  
  const offeringType = team?.offering_type;
  if (offeringType === 'products') {
    return (
        <div className="w-full p-6 md:p-8 text-center">
            <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-400"/>
            <h1 className="text-2xl font-bold text-slate-800">Serviços Desativados</h1>
            <p className="text-slate-600 mt-2">Sua empresa está configurada para vender apenas produtos. Para gerenciar serviços, altere o "Tipo de Oferta" nas Configurações da Empresa.</p>
            <Link to={createPageUrl('BusinessSettings')}>
                <Button className="mt-4">Ir para Configurações</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Serviços</h1>
          <p className="text-slate-600">Adicione, edite e organize os serviços oferecidos.</p>
           {currentPlan && (
            <p className="text-sm text-slate-500 mt-1">
              Plano {currentPlan.name}: {services.length}/{currentPlan.max_services || '∞'} serviços utilizados
            </p>
          )}
        </div>
        <Button onClick={() => handleOpenModal()} disabled={!canAddNewService()} className="bg-slate-800 hover:bg-slate-900 text-white">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Serviço
        </Button>
      </div>

       <Table>
          <TableHeader><TableRow><TableHead>Serviço</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Duração</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell><Badge variant="outline">{getCategoryLabel(service.category)}</Badge></TableCell>
                <TableCell>{formatCurrency(service.price_per_session)}</TableCell>
                <TableCell>{service.duration_minutes} min</TableCell>
                <TableCell><Badge className={service.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>{service.status === 'active' ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenModal(service)}><Edit className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleStatus(service)}>{service.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteService(service)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Nome do Serviço*</Label><Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Categoria*</Label><Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{SERVICE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Preço por Sessão*</Label><Input type="number" value={formData.price_per_session} onChange={(e) => handleInputChange('price_per_session', e.target.value)} /></div>
                <div className="space-y-2"><Label>Duração (minutos)*</Label><Input type="number" value={formData.duration_minutes} onChange={(e) => handleInputChange('duration_minutes', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Áreas de Atendimento*</Label><div className="space-y-2 border p-4 rounded-md">{deliveryAreas.map((area) => (<div key={area.id} className="flex items-center space-x-2"><Checkbox id={`area-${area.id}`} checked={formData.available_area_ids.includes(area.id)} onCheckedChange={(c) => handleAreaToggle(area.id, c)} /><Label htmlFor={`area-${area.id}`}>{area.neighborhood}</Label></div>))}</div></div>
            <div className="space-y-2"><Label>Dias Disponíveis</Label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{DAYS_OF_WEEK.map((day) => (<div key={day.value} className="flex items-center space-x-2"><Checkbox id={day.value} checked={formData.available_days.includes(day.value)} onCheckedChange={(c) => handleDayToggle(day.value, c)} /><Label htmlFor={day.value}>{day.label}</Label></div>))}</div></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveService} disabled={isSaving}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
