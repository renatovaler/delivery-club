
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Team } from "@/api/entities";
import { TeamMember } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Users, Trash2, Crown, Plus } from "lucide-react";
import { translate } from "@/components/lib"; // Adicionar translate

export default function TeamManagement() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allUsers, setAllUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  // Usar traduções centralizadas
  const translateRole = (role) => translate('teamRoles', role);
  const translateStatus = (status) => translate('memberStatuses', status);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      if (userData.current_team_id) {
        const teamData = await Team.get(userData.current_team_id);
        setTeam(teamData);

        const members = await TeamMember.filter({ team_id: teamData.id });
        setTeamMembers(members);

        // Carregar dados dos usuários para mostrar nomes
        const userIds = members.filter(m => m.user_id).map(m => m.user_id);
        const users = await Promise.all(
          userIds.map(async (id) => {
            try {
              return await User.get(id);
            } catch {
              return null;
            }
          })
        );
        
        const usersMap = {};
        users.forEach(user => {
          if (user) usersMap[user.id] = user;
        });
        setAllUsers(usersMap);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da equipe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({ 
        title: "Email inválido ❌", 
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);
    try {
      await TeamMember.create({
        team_id: team.id,
        user_email: inviteEmail,
        role: 'employee',
        status: 'pending',
      });
      toast({ 
        title: "Convite enviado com sucesso! ✅", 
        description: `Um convite foi enviado para ${inviteEmail}. Eles receberão instruções por email.`
      });
      setInviteEmail("");
      await loadTeamData();
    } catch (error) {
      console.error("Erro ao convidar membro:", error);
      
      let errorMessage = "Verifique se o e-mail é válido e tente novamente.";
      
      if (error.message?.includes('already exists')) {
        errorMessage = "Este usuário já foi convidado ou já faz parte da equipe.";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "O formato do email não é válido.";
      } else if (error.message?.includes('permission')) {
        errorMessage = "Você não tem permissão para convidar novos membros.";
      }
      
      toast({ 
        title: "Erro ao enviar convite ❌", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    if (user.id !== team.owner_id) {
      toast({ 
        title: "Acesso negado ❌", 
        description: "Apenas o proprietário da padaria pode remover membros da equipe.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await TeamMember.delete(memberId);
      toast({ 
        title: "Membro removido ✅", 
        description: "O membro foi removido da equipe com sucesso."
      });
      await loadTeamData();
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      
      let errorMessage = "Tente novamente em alguns instantes.";
      
      if (error.message?.includes('not found')) {
        errorMessage = "Este membro não foi encontrado na equipe.";
      } else if (error.message?.includes('permission')) {
        errorMessage = "Você não tem permissão para remover este membro.";
      }
      
      toast({ 
        title: "Erro ao remover membro ❌", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMemberDisplayInfo = (member) => {
    if (member.user_id && allUsers[member.user_id]) {
      const userData = allUsers[member.user_id];
      return {
        name: userData.full_name,
        email: userData.email,
        isOwner: member.user_id === team.owner_id
      };
    }
    return {
      name: member.user_email,
      email: member.user_email,
      isOwner: false
    };
  };

  if (isLoading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Gerenciamento da Equipe</h1>
        <p className="text-amber-600">Convide e remova membros da sua padaria.</p>
      </div>
      
      <Card className="shadow-lg border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membros da Equipe ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Input
              placeholder="Email do novo membro"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleInviteMember} disabled={isProcessing}>
              {isProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              <Plus className="w-4 h-4 mr-2" />
              Convidar
            </Button>
          </div>

          <div className="space-y-4">
            {teamMembers.length === 0 ? (
              <p className="text-amber-600 text-center py-8">Nenhum membro na equipe ainda.</p>
            ) : (
              teamMembers.map((member) => {
                const memberInfo = getMemberDisplayInfo(member);
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                    <div>
                      <p className="font-medium">{memberInfo.name}</p>
                      <p className="text-sm text-gray-500">{memberInfo.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{translateRole(member.role)}</Badge>
                        <Badge className={
                          member.status === 'active' ? 'bg-green-500 hover:bg-green-500' :
                          member.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-500' :
                          'bg-gray-500 hover:bg-gray-500'
                        }>
                          {translateStatus(member.status)}
                        </Badge>
                        {memberInfo.isOwner && <Crown className="w-4 h-4 text-amber-600" />}
                      </div>
                    </div>
                    {user.id === team.owner_id && !memberInfo.isOwner && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
