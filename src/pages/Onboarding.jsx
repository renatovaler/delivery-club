import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/api/entities';
import { Team } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { ShoppingBasket, User as UserIcon, ArrowRight, Building, Loader2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { BUSINESS_CATEGORIES, BRAZILIAN_STATES } from "@/components/lib";

const RoleSelection = ({ onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <Card className="shadow-2xl border-0">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <ShoppingBasket className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-slate-900">Bem-vindo(a) ao Delivery Club!</CardTitle>
        <CardDescription className="text-lg text-slate-600">Para começar, diga-nos quem você é.</CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <h3 className="text-xl font-semibold text-center text-slate-800 mb-6">Eu sou...</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedRole === 'business' ? 'border-blue-500 border-2 shadow-xl' : 'border-slate-200'}`}
            onClick={() => setSelectedRole('business')}
          >
            <CardContent className="p-6 text-center">
              <Building className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-slate-900">Uma Empresa</h4>
              <p className="text-sm text-slate-600">Quero vender e gerenciar assinaturas.</p>
            </CardContent>
          </Card>
          <Card
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedRole === 'customer' ? 'border-blue-500 border-2 shadow-xl' : 'border-slate-200'}`}
            onClick={() => setSelectedRole('customer')}
          >
            <CardContent className="p-6 text-center">
              <UserIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-slate-900">Um Cliente</h4>
              <p className="text-sm text-slate-600">Quero assinar e receber produtos em casa.</p>
            </CardContent>
          </Card>
        </div>
        <Button
          onClick={() => onSelectRole(selectedRole)}
          disabled={!selectedRole}
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          Continuar
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

const BusinessSetup = ({ user }) => {
  const { toast } = useToast();
  const [teamData, setTeamData] = useState({
    name: '',
    cnpj_cpf: '',
    category: '',
    contact: { email: '', whatsapp_numbers: [''] },
    address: { street: '', number: '', neighborhood: '', city: '', state: '', zip_code: '' },
  });
  const [isSaving, setIsSaving] = useState(false);
  const idempotencyKey = useRef(null);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setTeamData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setTeamData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCreateTeam = async () => {
    // Validar campos obrigatórios
    const requiredFields = ['name', 'cnpj_cpf', 'category'];
    for (const field of requiredFields) {
      if (!teamData[field]) {
        toast({ title: "Campo obrigatório", description: `O campo "${field}" precisa ser preenchido.`, variant: "destructive" });
        return;
      }
    }

    setIsSaving(true);
    // Gere a chave de idempotência apenas na primeira tentativa de envio
    if (!idempotencyKey.current) {
      idempotencyKey.current = crypto.randomUUID();
    }

    try {
      // 1. Verifique se a empresa já foi criada com esta chave
      const existingTeams = await Team.filter({ idempotency_key: idempotencyKey.current });

      let team;
      if (existingTeams.length > 0) {
        // A empresa já existe, use a existente
        team = existingTeams[0];
        toast({ title: "Recuperando sessão...", description: "Parece que você já havia iniciado. Continuando de onde parou." });
      } else {
        // 2. Crie a empresa se ela não existir
        const newTeamData = {
          ...teamData,
          owner_id: user.id,
          contact: {
            ...teamData.contact,
            email: teamData.contact.email || user.email
          },
          idempotency_key: idempotencyKey.current,
        };
        team = await Team.create(newTeamData);
      }

      // 3. Associe a empresa criada ao usuário
      await User.updateMyUserData({ current_team_id: team.id });
      
      toast({ title: "Empresa criada com sucesso!", description: "Você será redirecionado para o seu painel." });
      window.location.reload();
    } catch (error) {
      console.error("Erro ao criar empresa:", error);
      toast({ title: "Erro ao criar empresa", description: "Ocorreu um erro. Verifique os dados e tente novamente.", variant: "destructive" });
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-2xl border-0">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Package className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-slate-900">Configure sua Empresa</CardTitle>
        <CardDescription className="text-lg text-slate-600">Preencha os dados básicos para começar a vender.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Nome da Empresa *</Label><Input value={teamData.name} onChange={(e) => handleInputChange('name', e.target.value)} /></div>
            <div className="space-y-1"><Label>CNPJ / CPF *</Label><Input value={teamData.cnpj_cpf} onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)} /></div>
            <div className="space-y-1"><Label>Categoria *</Label><Select value={teamData.category} onValueChange={(v) => handleInputChange('category', v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{BUSINESS_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1"><Label>Email de Contato</Label><Input type="email" value={teamData.contact.email} onChange={(e) => handleInputChange('contact.email', e.target.value)} placeholder={user?.email}/></div>
        </div>
        <div className="space-y-2 pt-4 border-t">
          <Label className="font-semibold">Endereço da Sede *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Rua</Label><Input value={teamData.address.street} onChange={(e) => handleInputChange('address.street', e.target.value)} /></div>
              <div className="space-y-1"><Label>Número</Label><Input value={teamData.address.number} onChange={(e) => handleInputChange('address.number', e.target.value)} /></div>
              <div className="space-y-1"><Label>Bairro</Label><Input value={teamData.address.neighborhood} onChange={(e) => handleInputChange('address.neighborhood', e.target.value)} /></div>
              <div className="space-y-1"><Label>Cidade</Label><Input value={teamData.address.city} onChange={(e) => handleInputChange('address.city', e.target.value)} /></div>
              <div className="space-y-1"><Label>Estado</Label><Select value={teamData.address.state} onValueChange={(v) => handleInputChange('address.state', v)}><SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger><SelectContent>{BRAZILIAN_STATES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label>CEP</Label><Input value={teamData.address.zip_code} onChange={(e) => handleInputChange('address.zip_code', e.target.value)} /></div>
          </div>
        </div>
        <Button onClick={handleCreateTeam} disabled={isSaving} className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando Empresa...</> : "Finalizar e Criar Empresa"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function Onboarding({ isBusinessSetup = false }) {
  const [user, setUser] = useState(null);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        // Se não conseguir buscar o usuário, provavelmente não está logado.
        // O Layout cuidará do redirecionamento para o login, se necessário.
        console.error("Usuário não logado para onboarding:", error);
      }
    };
    fetchUser();
  }, []);

  const handleSelectRole = async (role) => {
    if (!role) {
      toast({ title: 'Selecione um perfil', description: 'Você precisa escolher entre ser uma empresa ou um cliente.', variant: 'destructive' });
      return;
    }

    setIsSavingRole(true);
    try {
      await User.updateMyUserData({
        user_type: role === 'business' ? 'business_owner' : 'customer'
      });
      toast({ title: 'Perfil selecionado!', description: 'Configuração concluída.' });
      window.location.reload();
    } catch (error) {
      console.error("Erro ao configurar perfil:", error);
      toast({ title: 'Erro', description: 'Não foi possível salvar seu perfil. Tente novamente.', variant: 'destructive' });
      setIsSavingRole(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando informações do usuário...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (isSavingRole) {
      return (
         <div className="flex items-center space-x-2 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Salvando seu perfil...</span>
        </div>
      );
    }
    if (isBusinessSetup) {
      return <BusinessSetup user={user} />;
    }
    return <RoleSelection onSelectRole={handleSelectRole} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}