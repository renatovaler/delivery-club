'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { UserAPI, TeamAPI, SubscriptionAPI, ProductAPI, PlanAPI } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select, SelectItem } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Separator } from '../../components/ui/Separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { useToast } from '../../components/ui/use-toast';
import { ArrowLeft, Settings, Save, AlertTriangle, Trash2, Building2, CreditCard, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminUserDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const userId = searchParams.get('id');

  const [selectedUser, setSelectedUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [userType, setUserType] = useState('');
  const [teamId, setTeamId] = useState('');

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    loadData();
  }, [userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userData, allTeams] = await Promise.all([
        UserAPI.get(userId),
        TeamAPI.list('-created_date', 500)
      ]);
      setSelectedUser(userData);
      setTeams(allTeams);

      let teamsForUser = [];
      if (userData.user_type === 'business_owner') {
        teamsForUser = allTeams.filter(team => team.owner_id === userData.id);
      }
      setUserTeams(teamsForUser);

      let subscriptionsForUser = [];
      if (userData.user_type === 'customer') {
        subscriptionsForUser = await SubscriptionAPI.filter({ customer_id: userData.id });
      }
      setUserSubscriptions(subscriptionsForUser);

      setUserType(userData.user_type || 'customer');
      setTeamId(userData.current_team_id || '');

    } catch (error) {
      toast({ title: 'Erro ao carregar usuário', description: 'Não foi possível encontrar os dados do usuário.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        user_type: userType,
        current_team_id: userType === 'business_owner' ? teamId : null
      };
      await UserAPI.update(userId, updateData);
      toast({ title: 'Usuário atualizado', description: 'As informações do usuário foram salvas.' });
      loadData();
    } catch (error) {
      toast({ title: 'Erro ao salvar', description: 'Não foi possível salvar as alterações.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const getUserTypeBadgeClass = (type) => {
    switch (type) {
      case 'system_admin':
        return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'business_owner':
        return 'bg-indigo-600 text-white hover:bg-indigo-700';
      case 'customer':
        return 'bg-green-600 text-white hover:bg-green-700';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="w-full p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Usuário não encontrado</h2>
        <p className="text-gray-500">O ID do usuário não é válido ou o usuário foi removido.</p>
        <Button onClick={() => router.push('/admin-users')} className="mt-4 bg-slate-800 hover:bg-slate-900 text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin-users')} className="border-slate-300 text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Detalhes do Usuário</h1>
          <p className="text-slate-600">Informações completas e histórico de atividades</p>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={selectedUser.profile_picture} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl">
                {selectedUser.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-slate-900">{selectedUser.full_name || 'Nome não informado'}</CardTitle>
              <p className="text-slate-600">{selectedUser.email}</p>
              <Badge className={`mt-2 ${getUserTypeBadgeClass(selectedUser.user_type)}`}>
                {selectedUser.user_type}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Informações Pessoais</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <div><strong>Email:</strong> {selectedUser.email}</div>
                <div><strong>Telefone:</strong> {selectedUser.phone || 'Não informado'}</div>
                <div><strong>Cadastrado em:</strong> {selectedUser.created_date ? format(new Date(selectedUser.created_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</div>
                <div><strong>Última atualização:</strong> {selectedUser.updated_date ? format(new Date(selectedUser.updated_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</div>
              </div>
            </div>

            {selectedUser.address && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Endereço</h4>
                <div className="text-sm text-slate-600">
                  <p>{selectedUser.address.street}, {selectedUser.address.number}</p>
                  {selectedUser.address.complement && <p>{selectedUser.address.complement}</p>}
                  <p>{selectedUser.address.neighborhood}</p>
                  <p>{selectedUser.address.city} - {selectedUser.address.state}</p>
                  <p>CEP: {selectedUser.address.zip_code}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Settings className="w-5 h-5"/> Configurações da Conta
          </CardTitle>
          <CardDescription>
            Altere o tipo de usuário e outras configurações importantes da conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <Label htmlFor="userType">Tipo de Usuário</Label>
                  <Select value={userType} onValueChange={setUserType}>
                      <SelectTrigger id="userType">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="customer">Cliente</SelectItem>
                          <SelectItem value="business_owner">Proprietário</SelectItem>
                          <SelectItem value="system_admin">Administrador</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              
              {userType === 'business_owner' && (
                  <div className="space-y-2">
                      <Label htmlFor="team">Empresa Associada</Label>
                      <Select value={teamId} onValueChange={setTeamId}>
                          <SelectTrigger id="team">
                              <SelectValue placeholder="Selecione uma empresa..."/>
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value={null}>Nenhuma</SelectItem>
                              {teams.map(team => (
                                  <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
              )}
          </div>
           <Separator />
           <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="bg-slate-800 hover:bg-slate-900 text-white">
                  <Save className="mr-2 h-4 w-4"/> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas específicas por tipo de usuário - Empresas */}
      {selectedUser.user_type === 'business_owner' && userTeams.length > 0 && (
          <Card className="shadow-lg border-0">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Building2 className="w-5 h-5" />
                      Empresas ({userTeams.length})
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid gap-4">
                      {userTeams.map((team) => (
                          <div key={team.id} className="p-4 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h5 className="font-medium text-slate-900">{team.name}</h5>
                                      <p className="text-sm text-slate-600">{team.description || 'Nenhuma descrição.'}</p>
                                      <Badge className={`mt-2 ${team.subscription_status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                          {team.subscription_status === 'active' ? 'Ativa' : team.subscription_status}
                                      </Badge>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>
      )}

      {/* Estatísticas específicas por tipo de usuário - Assinaturas */}
      {selectedUser.user_type === 'customer' && userSubscriptions.length > 0 && (
          <Card className="shadow-lg border-0">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                      <CreditCard className="w-5 h-5" />
                      Assinaturas ({userSubscriptions.length})
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      {userSubscriptions.map((subscription) => (
                          <div key={subscription.id} className="p-4 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h5 className="font-medium text-slate-900">
                                          Assinatura #{subscription.id.slice(-8)}
                                      </h5>
                                      <p className="text-sm text-slate-600">
                                          Valor semanal: {formatCurrency(subscription.weekly_price)}
                                      </p>
                                      <Badge className={`mt-2 ${subscription.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                          {subscription.status === 'active' ? 'Ativa' : subscription.status}
                                      </Badge>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>
      )}
      
      {/* Danger Zone */}
      <Card className="border-red-200 shadow-lg border-0">
          <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5"/> Zona de Perigo
              </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
              <p className="text-red-700">A exclusão de um usuário é permanente e não pode ser desfeita.</p>
              <Button variant="destructive" disabled>
                  <Trash2 className="mr-2 h-4 w-4"/> Excluir Usuário
              </Button>
          </CardContent>
      </Card>
    </div>
  );
}
