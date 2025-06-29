
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
import { translate } from "@/components/lib";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function TeamManagement() {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]); // Changed from teamMembers
  const [allUsers, setAllUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false); // New state
  const [selectedMember, setSelectedMember] = useState(null); // New state
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false); // New state
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

        const fetchedMembers = await TeamMember.filter({ team_id: teamData.id });

        // Carregar dados dos usuários para mostrar nomes
        const userIds = fetchedMembers.filter(m => m.user_id).map(m => m.user_id);
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

        // Enrich members with user full name and email
        const enrichedMembers = fetchedMembers.map(m => {
          const userInfo = usersMap[m.user_id];
          return {
            ...m,
            user_full_name: userInfo ? userInfo.full_name : (m.user_email || 'Usuário Desconhecido'),
            user_email: userInfo ? userInfo.email : m.user_email,
            is_owner_member: m.user_id === teamData.owner_id // Flag if this member is the team owner
          };
        });
        setMembers(enrichedMembers);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da equipe:", error);
      toast({ 
        title: "Erro ao carregar dados ❌", 
        description: "Não foi possível carregar os dados da equipe. Tente novamente mais tarde.",
        variant: "destructive" 
      });
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
      setShowAddMemberModal(false); // Close modal on success
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
    // Only allow owner to remove members, and not themselves if they are the owner role
    const memberToRemove = members.find(m => m.id === memberId);
    if (!memberToRemove) {
      toast({ 
        title: "Membro não encontrado ❌", 
        description: "Não foi possível encontrar o membro para remover.", 
        variant: "destructive" 
      });
      return;
    }

    if (user.id !== team.owner_id) {
      toast({ 
        title: "Acesso negado ❌", 
        description: "Apenas o proprietário da empresa pode remover membros da equipe.", 
        variant: "destructive" 
      });
      return;
    }

    // Prevent owner from removing themselves if they have the 'owner' role.
    // The outline's button disables for `member.role === 'owner'`, so this check is redundant if the button is disabled.
    // However, if the owner is trying to remove themselves via another path or if the role logic differs from team owner id.
    if (memberToRemove.user_id === user.id && memberToRemove.role === 'owner') {
        toast({ 
            title: "Ação não permitida ❌", 
            description: "Você não pode remover a si mesmo se você for o proprietário principal da equipe.", 
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

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Equipe</h1>
          <p className="text-slate-600">Adicione e gerencie os membros da sua equipe.</p>
        </div>
        <Button onClick={() => setShowAddMemberModal(true)} className="bg-slate-800 hover:bg-slate-900 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Membro
        </Button>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="w-5 h-5" />
            Membros da Equipe ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <p>Nenhum membro na equipe ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">{member.user_full_name || 'N/A'}</TableCell>
                      <TableCell>{member.user_email}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className={member.role === 'owner' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}>
                          {translateRole(member.role)}
                          {member.is_team_owner && <Crown className="w-3 h-3 ml-1 inline-block" />}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          member.status === 'active' ? 'bg-green-500 hover:bg-green-500 text-white' :
                          member.status === 'pending' ? 'bg-yellow-500 hover:bg-yellow-500 text-white' :
                          'bg-gray-500 hover:bg-gray-500 text-white'
                        }>
                          {translateStatus(member.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user && team && user.id === team.owner_id && member.role !== 'owner' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setSelectedMember(member);
                              setShowRemoveConfirm(true);
                            }}
                            disabled={isProcessing}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remover
                          </Button>
                        )}
                        {user && team && user.id === team.owner_id && member.role === 'owner' && (
                            <Badge variant="outline" className="border-gray-300 text-gray-500">
                                Não Removível
                            </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Adicionar Novo Membro</h2>
            <p className="text-slate-600 mb-4">Insira o email do novo membro para enviar um convite.</p>
            <Input
              placeholder="Email do novo membro"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                  setShowAddMemberModal(false);
                  setInviteEmail(""); // Clear email on close
              }}>
                Cancelar
              </Button>
              <Button onClick={handleInviteMember} disabled={isProcessing} className="bg-slate-800 hover:bg-slate-900 text-white">
                {isProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                Convidar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Confirmar Remoção</h2>
            <p className="mb-6 text-slate-700">Tem certeza que deseja remover <span className="font-bold text-slate-900">{selectedMember.user_full_name}</span> da equipe?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowRemoveConfirm(false); setSelectedMember(null); }}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={async () => {
                await handleRemoveMember(selectedMember.id);
                setShowRemoveConfirm(false);
                setSelectedMember(null);
              }} disabled={isProcessing}>
                {isProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                Remover
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
