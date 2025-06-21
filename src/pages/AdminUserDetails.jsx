
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
import { ArrowLeft, Settings, Save, AlertTriangle, Trash2 } from "lucide-react";
import { translate } from "@/components/lib";

export default function AdminUserDetails() {
    const location = useLocation();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
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
            setUser(userData);
            setTeams(allTeams);

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
                // Only set team if user is owner, otherwise clear it
                current_team_id: userType === 'business_owner' ? teamId : null 
            };
            
            await User.update(userId, updateData);
            
            toast({ title: "Usuário atualizado", description: "As informações do usuário foram salvas." });
            loadData(); // Reload data to show changes
        } catch (error) {
            console.error("Error saving user details:", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar as alterações.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
          <div className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-amber-200 rounded w-1/4"></div>
              <div className="h-24 bg-amber-200 rounded-xl"></div>
              <div className="h-48 bg-amber-200 rounded-xl"></div>
            </div>
          </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Usuário não encontrado</h2>
                <p className="text-gray-500">O ID do usuário não é válido ou o usuário foi removido.</p>
                <Link to={createPageUrl("AdminUsers")}>
                    <Button className="mt-4 bg-amber-600 hover:bg-amber-700"><ArrowLeft className="mr-2 h-4 w-4"/> Voltar para a lista</Button>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="p-6 md:p-8 space-y-8">
            <div>
                <Link to={createPageUrl("AdminUsers")}>
                    <Button variant="outline" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4"/> Voltar para Usuários
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-amber-900">Detalhes do Usuário</h1>
            </div>

            <Card className="shadow-lg border-amber-200">
                 <CardContent className="p-6 flex items-center gap-6">
                    <Avatar className="w-20 h-20">
                        <AvatarImage src={user.profile_picture} />
                        <AvatarFallback className="bg-amber-200 text-amber-800 text-3xl">
                            {user.full_name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold text-amber-900">{user.full_name || 'Nome não informado'}</h2>
                        <p className="text-amber-600">{user.email}</p>
                        <Badge className="mt-2" variant={user.user_type === 'system_admin' ? 'default' : 'secondary'}>{translate('userTypes', user.user_type)}</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
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
                        <Button onClick={handleSave} disabled={isSaving} className="bg-amber-600 hover:bg-amber-700">
                            <Save className="mr-2 h-4 w-4"/> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="border-red-500">
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
