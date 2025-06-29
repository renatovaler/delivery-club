'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { UserAPI } from '@/lib/api';
import {
  Camera,
  ExternalLink,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Save,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface FormData {
  full_name: string;
  phone: string;
  address: Address;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: '',
    },
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Implementar logout quando disponível na API
      alert('Você foi desconectado com sucesso.');
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Não foi possível encerrar a sessão. Tente novamente.');
    }
  };

  const openGoogleSecurity = () => {
    window.open('https://myaccount.google.com/security', '_blank');
  };

  const loadUserData = async () => {
    try {
      const userData = await UserAPI.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        address: userData.address || {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zip_code: '',
        },
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.full_name?.trim()) {
      alert('O nome completo é obrigatório.');
      return;
    }

    if (user?.user_type === 'customer') {
      const requiredAddressFields = {
        street: 'Rua',
        number: 'Número',
        neighborhood: 'Bairro',
        city: 'Cidade',
        state: 'Estado',
        zip_code: 'CEP',
      };
      const missingFields = Object.keys(requiredAddressFields).filter(
        (field) =>
          !formData.address[field as keyof Address] ||
          formData.address[field as keyof Address].trim() === ''
      );

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(
          (field) => requiredAddressFields[field as keyof typeof requiredAddressFields]
        );
        alert(`Preencha os campos obrigatórios de endereço: ${fieldNames.join(', ')}.`);
        return;
      }

      if (!formData.phone || formData.phone.trim() === '') {
        alert('Por favor, informe seu número de telefone para contato.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await UserAPI.update(formData);
      alert('Suas informações foram salvas com sucesso!');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Não foi possível atualizar seu perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-slate-200"></div>
          <div className="space-y-4">
            <div className="h-32 rounded-xl bg-slate-200"></div>
            <div className="h-64 rounded-xl bg-slate-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-6 md:p-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-slate-600">Gerencie suas informações pessoais</p>
      </div>

      {/* Header do perfil */}
      <Card className="border-0 bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profile_picture} />
                <AvatarFallback className="bg-blue-100 text-2xl text-blue-800">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{user?.full_name}</h2>
              <p className="mt-1 flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {user?.user_type === 'system_admin' && 'Administrador do Sistema'}
                {user?.user_type === 'business_owner' && 'Proprietário de Empresa'}
                {user?.user_type === 'customer' && 'Cliente'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100">
          <TabsTrigger
            value="personal"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900"
          >
            <UserIcon className="h-4 w-4" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger
            value="address"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900"
          >
            <MapPin className="h-4 w-4" />
            Endereço
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900"
          >
            <Lock className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone {user?.user_type === 'customer' && '*'}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required={user?.user_type === 'customer'}
                  />
                  {user?.user_type === 'customer' && (
                    <p className="text-xs text-slate-600">
                      Obrigatório para contato sobre entregas.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value={user?.email} disabled className="bg-slate-50" />
                  <p className="text-xs text-slate-600">O e-mail não pode ser alterado</p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-slate-800 text-white hover:bg-slate-900"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900">Endereço de Entrega</CardTitle>
              <p className="text-slate-600">
                {user?.user_type === 'customer'
                  ? 'Este é seu endereço principal para entregas. É obrigatório para criar assinaturas.'
                  : 'Este é seu endereço cadastrado.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP *</Label>
                  <Input
                    id="zip_code"
                    value={formData.address.zip_code}
                    onChange={(e) => handleInputChange('address.zip_code', e.target.value)}
                    placeholder="00000-000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    placeholder="São Paulo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="São Paulo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                    placeholder="Centro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Rua das Flores"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address.number', e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) => handleInputChange('address.complement', e.target.value)}
                    placeholder="Apto 45, Bloco B"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-slate-800 text-white hover:bg-slate-900"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Endereço'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900">Segurança da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <h4 className="mb-2 font-medium text-green-900">Autenticação Google</h4>
                      <p className="mb-4 text-sm text-green-700">
                        Sua conta está protegida pela autenticação segura do Google. Para alterar
                        sua senha ou configurações de segurança, acesse o painel de controle da sua
                        conta Google.
                      </p>
                      <Button
                        onClick={openGoogleSecurity}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir Configurações do Google
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="mb-2 font-medium text-blue-900">E-mail da Conta</h4>
                      <p className="mb-2 text-sm text-blue-700">
                        <strong>E-mail atual:</strong> {user?.email}
                      </p>
                      <p className="text-sm text-blue-600">
                        O e-mail não pode ser alterado diretamente no Delivery Club. Para alterar o
                        e-mail, faça essa alteração na sua conta Google.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-5 w-5 text-slate-600" />
                    <div className="flex-1">
                      <h4 className="mb-2 font-medium text-slate-900">Tipo de Conta</h4>
                      <p className="mb-2 text-sm text-slate-700">
                        <strong>Perfil:</strong>{' '}
                        {user?.user_type === 'system_admin'
                          ? 'Administrador do Sistema'
                          : user?.user_type === 'business_owner'
                            ? 'Proprietário de Empresa'
                            : user?.user_type === 'customer'
                              ? 'Cliente'
                              : 'Não definido'}
                      </p>
                      <p className="text-sm text-slate-600">
                        O tipo de conta determina suas permissões no sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <LogOut className="mt-0.5 h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <h4 className="mb-2 font-medium text-red-900">Encerrar Sessão</h4>
                      <p className="mb-4 text-sm text-red-700">
                        Desconecte-se da sua conta no Delivery Club. Você precisará fazer login
                        novamente para acessar o sistema.
                      </p>
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair da Conta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
