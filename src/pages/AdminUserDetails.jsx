import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Settings, Save, AlertTriangle, Trash2, Building2, CreditCard } from "lucide-react";
import { translate } from "@/components/lib";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock function to simulate fetching user-specific subscriptions
const mockGetUserSubscriptions = async (userId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return some mock data
    return [
        { id: 'sub_xyz_1', weekly_price: 120.00, status: 'active', user_id: userId },
        { id: 'sub_xyz_2', weekly_price: 90.00, status: 'cancelled', user_id: userId }
    ].filter(sub => sub.user_id === userId);
};

export default function AdminUserDetails() {
    const location = useLocation();
    const { toast } = useToast();
    const [selectedUser, setSelectedUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [userTeams, setUserTeams] = useState([]);
    const [userSubscriptions, setUserSubscriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // State for editable fields
    const [userType, setUserType] = useState("");
    const [teamId, setTeamId] = useState("");

    const userId = new URLSearchParams(location.search).get("id");

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
                User.get(userId),
                Team.list()
            ]);
            setSelectedUser(userData);
            setTeams(allTeams);

            // Determine teams owned by this user (if business_owner)
            let teamsForUser = [];
            if (userData.user_type === 'business_owner') {
                teamsForUser = allTeams.filter(team => team.owner_id === userData.id);
            }
            setUserTeams(teamsForUser);

            // Fetch subscriptions for this user (if customer)
            let subscriptionsForUser = [];
            if (userData.user_type === 'customer') {
                subscriptionsForUser = await mockGetUserSubscriptions(userData.id);
            }
            setUserSubscriptions(subscriptionsForUser);

            // Initialize form state
            setUserType(userData.user_type || 'customer');
            setTeamId(userData.current_team_id || "");

        } catch (error) {
            console.error("Error loading user details:", error);
            toast({ title: "Erro ao carregar usuário", description: "Não foi possível encontrar os dados do usuário.", variant: "destructive" });
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
            
            await User.update(userId, updateData);
            
            toast({ title: "Usuário atualizado", description: "As informações do usuário foram salvas." });
            loadData();
        } catch (error) {
            console.error("Error saving user details:", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar as alterações.", variant: "destructive" });
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
                <Link to={createPageUrl("AdminUsers")}>
                    <Button className="mt-4 bg-slate-800 hover:bg-slate-900 text-white">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Voltar para a lista
                    </Button>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="w-full p-6 md:p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link to={createPageUrl("AdminUsers")}>
                    <Button variant="outline" size="icon" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Detalhes do Usuário</h1>
                    <p className="text-slate-600">Informações completas e histórico de atividades</p>
                </div>
            </div>

            {/* Informações do usuário */}
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
                                {translate('userTypes', selectedUser.user_type)}
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

            {/* Account Settings */}
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
                                    <SelectItem value="customer">{translate('userTypes', 'customer')}</SelectItem>
                                    <SelectItem value="business_owner">{translate('userTypes', 'business_owner')}</SelectItem>
                                    <SelectItem value="system_admin">{translate('userTypes', 'system_admin')}</SelectItem>
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
    )
}