
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { DeliveryArea } from "@/api/entities";
import { Team } from "@/api/entities";
import { Plan } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Plus,
  Edit,
  MoreVertical,
  Search,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { BRAZILIAN_STATES, DEFAULT_MESSAGES, formatCurrency } from "@/components/lib";

export default function DeliveryAreas() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    state: "all"
  });

  const [formData, setFormData] = useState({
    state: "",
    city: "",
    neighborhood: "",
    condominium: "",
    status: "active",
    notes: "",
    delivery_fee: ""
  });

  useEffect(() => {
    loadDeliveryAreasData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [areas, filters]);

  const loadDeliveryAreasData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      // VALIDAÇÃO DE PERMISSÃO CORRIGIDA
      if (userData.user_type !== 'business_owner') {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive"
        });
        setIsLoading(false); // Ensure loading state is reset
        return;
      }

      if (userData.current_team_id) {
        const teamData = await Team.get(userData.current_team_id);
        
        // VALIDAÇÃO: Verificar se o usuário é realmente o dono desta empresa
        if (teamData.owner_id !== userData.id) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar os dados desta empresa.",
            variant: "destructive"
          });
          setIsLoading(false); // Ensure loading state is reset
          return;
        }
        
        setTeam(teamData);

        if (teamData.plan_id) {
          try {
            const planData = await Plan.get(teamData.plan_id);
            setCurrentPlan(planData);
          } catch (error) {
            console.error("Erro ao carregar plano:", error);
            setCurrentPlan(null); 
          }
        } else {
            setCurrentPlan(null);
        }

        const teamAreas = await DeliveryArea.filter({
          team_id: userData.current_team_id
        }, '-created_date');
        setAreas(teamAreas);
      }
    } catch (error) {
      console.error("Erro ao carregar áreas de entrega:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as áreas de entrega.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...areas];

    if (filters.search) {
      filtered = filtered.filter(area => 
        area.city?.toLowerCase().includes(filters.search.toLowerCase()) ||
        area.neighborhood?.toLowerCase().includes(filters.search.toLowerCase()) ||
        area.state?.toLowerCase().includes(filters.search.toLowerCase()) ||
        area.condominium?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter(area => area.status === filters.status);
    }

    if (filters.state !== "all") {
      filtered = filtered.filter(area => area.state === filters.state);
    }

    setFilteredAreas(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({
      state: "",
      city: "",
      neighborhood: "",
      condominium: "",
      status: "active",
      notes: "",
      delivery_fee: ""
    });
    setEditingArea(null);
  };

  const canAddNewArea = () => {
    if (!currentPlan) return true; 
    return areas.length < currentPlan.max_delivery_areas;
  };

  const handleOpenModal = (area = null) => {
    if (!area && !canAddNewArea()) {
      toast({
        title: "Limite atingido",
        description: `Seu plano permite apenas ${currentPlan?.max_delivery_areas || 0} áreas de entrega. Atualize seu plano para adicionar mais áreas.`,
        variant: "destructive",
      });
      return;
    }

    if (area) {
      setEditingArea(area);
      setFormData({
        state: area.state,
        city: area.city,
        neighborhood: area.neighborhood,
        condominium: area.condominium || "",
        status: area.status,
        notes: area.notes || "",
        delivery_fee: area.delivery_fee != null ? String(area.delivery_fee) : ""
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.state || !formData.city || !formData.neighborhood) {
      toast({
        title: "Dados incompletos",
        description: "Preencha pelo menos Estado, Cidade e Bairro.",
        variant: "destructive",
      });
      return;
    }

    if (formData.delivery_fee === "" || parseFloat(formData.delivery_fee) < 0) {
      toast({
        title: "Taxa de Entrega Inválida",
        description: "A taxa de entrega deve ser um número igual ou maior que zero.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const areaData = {
        team_id: user.current_team_id,
        state: formData.state,
        city: formData.city,
        neighborhood: formData.neighborhood,
        condominium: formData.condominium || null,
        status: formData.status,
        notes: formData.notes || null,
        delivery_fee: parseFloat(formData.delivery_fee)
      };

      if (editingArea) {
        await DeliveryArea.update(editingArea.id, areaData);
        toast({
          title: DEFAULT_MESSAGES.SUCCESS_UPDATE + " ✅",
          description: "A área de entrega foi atualizada com sucesso.",
        });
      } else {
        await DeliveryArea.create(areaData);
        toast({
          title: DEFAULT_MESSAGES.SUCCESS_SAVE + " ✅",
          description: "A área de entrega foi criada com sucesso.",
        });
      }

      await loadDeliveryAreasData();
      handleCloseModal();

    } catch (error) {
      console.error("Erro ao salvar área:", error);
      toast({
        title: "Erro ao salvar ❌",
        description: `Não foi possível salvar a área de entrega. ${error.message || 'Tente novamente.'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (area) => {
    setIsProcessing(true);
    try {
      const newStatus = area.status === "active" ? "inactive" : "active";
      await DeliveryArea.update(area.id, { status: newStatus });
      
      toast({
        title: "Status atualizado ✅",
        description: `Área ${newStatus === "active" ? "ativada" : "desativada"} com sucesso.`,
      });
      
      await loadDeliveryAreasData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar ❌",
        description: "Não foi possível atualizar o status da área. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    return status === "active" 
      ? <Badge className="bg-green-500 hover:bg-green-600">Ativa</Badge>
      : <Badge variant="secondary">Inativa</Badge>;
  };

  const getActiveAreasCount = () => {
    return areas.filter(area => area.status === "active").length;
  };

  const getUniqueStates = () => {
    return new Set(areas.map(area => area.state)).size;
  };

  const getUniqueCities = () => {
    return new Set(areas.map(area => `${area.city}-${area.state}`)).size;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-amber-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-amber-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Áreas de Cobertura</h1>
          <p className="text-amber-600">Gerencie as áreas onde sua padaria faz entregas</p>
          {currentPlan && (
            <p className="text-sm text-amber-500 mt-1">
              Plano {currentPlan.name}: {areas.length}/{currentPlan.max_delivery_areas} áreas utilizadas
            </p>
          )}
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          disabled={!canAddNewArea()}
          className={`${canAddNewArea() ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Área
          {!canAddNewArea() && " (Limite atingido)"}
        </Button>
      </div>

      {currentPlan && areas.length >= currentPlan.max_delivery_areas && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-900">Limite de áreas atingido</p>
                <p className="text-sm text-amber-700">
                  Você está usando {areas.length} de {currentPlan.max_delivery_areas} áreas permitidas pelo seu plano {currentPlan.name}.
                  Para adicionar mais áreas, considere fazer upgrade do seu plano.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">
              Áreas Ativas
            </CardTitle>
            <Eye className="h-4 w-4 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveAreasCount()}</div>
            <p className="text-xs text-green-200 mt-1">
              de {areas.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Estados Atendidos
            </CardTitle>
            <MapPin className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUniqueStates()}</div>
            <p className="text-xs text-blue-200 mt-1">
              diferentes estados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Cidades Atendidas
            </CardTitle>
            <MapPin className="h-4 w-4 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUniqueCities()}</div>
            <p className="text-xs text-purple-200 mt-1">
              diferentes cidades
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Estado, cidade, bairro ou condomínio"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado</Label>
              <Select value={filters.state} onValueChange={(value) => handleFilterChange('state', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  {BRAZILIAN_STATES.map(state => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <MapPin className="w-5 h-5" />
            Áreas de Entrega ({filteredAreas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAreas.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-amber-900 mb-2">
                {areas.length === 0 ? "Nenhuma área cadastrada" : "Nenhuma área encontrada"}
              </h3>
              <p className="text-amber-600 mb-6">
                {areas.length === 0 
                  ? "Comece cadastrando sua primeira área de entrega"
                  : "Tente ajustar os filtros para ver mais resultados"
                }
              </p>
              {areas.length === 0 && (
                <Button 
                  onClick={() => handleOpenModal()}
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={!canAddNewArea()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeira Área
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-amber-50">
                    <TableHead>Estado</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Taxa de Entrega</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAreas.map((area) => (
                      <TableRow key={area.id} className="hover:bg-amber-25">
                        <TableCell className="font-medium">{area.state}</TableCell>
                        <TableCell>{area.city}</TableCell>
                        <TableCell>{area.condominium ? `${area.neighborhood} (${area.condominium})` : area.neighborhood}</TableCell>
                        <TableCell>
                          <span className="font-medium text-green-700">{formatCurrency(area.delivery_fee)}</span>
                        </TableCell>
                        <TableCell>{getStatusBadge(area.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenModal(area)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(area)}
                                disabled={isProcessing}
                                className={area.status === "active" ? "text-amber-600" : "text-green-600"}
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processando...
                                  </>
                                ) : area.status === "active" ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArea ? "Editar Área de Entrega" : "Nova Área de Entrega"}
            </DialogTitle>
            <DialogDescription>
              Configure uma nova área onde sua padaria fará entregas
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map(state => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Nome da cidade"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                placeholder="Nome do bairro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condominium">Condomínio (opcional)</Label>
              <Input
                id="condominium"
                value={formData.condominium}
                onChange={(e) => handleInputChange('condominium', e.target.value)}
                placeholder="Nome do condomínio"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Taxa de Entrega *</Label>
              <Input
                id="delivery_fee"
                type="number"
                value={formData.delivery_fee}
                onChange={(e) => handleInputChange('delivery_fee', e.target.value)}
                placeholder="Ex: 5.00"
                step="0.01"
                min="0"
                required
              />
              <p className="text-xs text-amber-600">
                Valor cobrado por cada entrega nesta área.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações sobre esta área de entrega"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700 relative"
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSaving ? 'Salvando...' : editingArea ? 'Atualizar' : 'Criar Área'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
