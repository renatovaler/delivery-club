
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  User as UserIcon,
  MapPin,
  Phone,
  Mail,
  Camera,
  Save,
  Lock,
  Shield,
  LogOut,
  ExternalLink
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: ""
    }
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await User.logout();
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso.",
      });
      // A página será recarregada automaticamente pelo logout
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar a sessão. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const openGoogleSecurity = () => {
    window.open('https://myaccount.google.com/security', '_blank');
  };

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        phone: userData.phone || "",
        address: userData.address || {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zip_code: ""
        }
      });
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    // Validação de nome completo obrigatório
    if (!formData.full_name?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome completo é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    // Validações específicas para clientes
    if (user?.user_type === 'customer') {
        const requiredAddressFields = {
          street: "Rua",
          number: "Número",
          neighborhood: "Bairro",
          city: "Cidade",
          state: "Estado",
          zip_code: "CEP"
        };
        const missingFields = Object.keys(requiredAddressFields).filter(field =>
          !formData.address[field] || formData.address[field].trim() === ''
        );

        if (missingFields.length > 0) {
          const fieldNames = missingFields.map(field => requiredAddressFields[field]);
          toast({
            title: "Endereço incompleto",
            description: `Preencha os campos obrigatórios de endereço: ${fieldNames.join(', ')}.`,
            variant: "destructive",
          });
          return;
        }

        if (!formData.phone || formData.phone.trim() === '') {
            toast({
                title: "Telefone obrigatório",
                description: "Por favor, informe seu número de telefone para contato.",
                variant: "destructive",
            });
            return;
        }
    }

    setIsSaving(true);
    try {
      await User.updateMyUserData(formData);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-amber-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-32 bg-amber-200 rounded-xl"></div>
            <div className="h-64 bg-amber-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-amber-900 mb-2">Meu Perfil</h1>
        <p className="text-amber-600">Gerencie suas informações pessoais</p>
      </div>

      {/* Header do perfil */}
      <Card className="shadow-lg border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.profile_picture} />
                <AvatarFallback className="bg-amber-200 text-amber-800 text-2xl">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-amber-900">{user?.full_name}</h2>
              <p className="text-amber-600 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <p className="text-sm text-amber-500 mt-2">
                {user?.user_type === 'system_admin' && 'Administrador do Sistema'}
                {user?.user_type === 'bakery_owner' && 'Proprietário de Padaria'}
                {user?.user_type === 'customer' && 'Cliente'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Endereço
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="phone">
                    Telefone {user?.user_type === 'customer' && '*'}
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    required={user?.user_type === 'customer'}
                  />
                   {user?.user_type === 'customer' && (
                     <p className="text-xs text-amber-600">
                        Obrigatório para contato sobre entregas.
                     </p>
                   )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={user?.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-amber-600">
                    O e-mail não pode ser alterado
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card className="shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">Endereço de Entrega</CardTitle>
              <CardDescription>
                {user?.user_type === 'customer' 
                  ? "Este é seu endereço principal para entregas. É obrigatório para criar assinaturas."
                  : "Este é seu endereço cadastrado."
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Endereço'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">Segurança da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 mb-2">Autenticação Google</h4>
                      <p className="text-sm text-green-700 mb-4">
                        Sua conta está protegida pela autenticação segura do Google.
                        Para alterar sua senha ou configurações de segurança,
                        acesse o painel de controle da sua conta Google.
                      </p>
                      <Button
                        onClick={openGoogleSecurity}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir Configurações do Google
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">E-mail da Conta</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>E-mail atual:</strong> {user?.email}
                      </p>
                      <p className="text-sm text-blue-600">
                        O e-mail não pode ser alterado diretamente no Delivery Club.
                        Para alterar o e-mail, faça essa alteração na sua conta Google.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900 mb-2">Tipo de Conta</h4>
                      <p className="text-sm text-amber-700 mb-2">
                        <strong>Perfil:</strong> {
                          user?.user_type === 'system_admin' ? 'Administrador do Sistema' :
                          user?.user_type === 'bakery_owner' ? 'Proprietário de Padaria' :
                          user?.user_type === 'customer' ? 'Cliente' : 'Não definido'
                        }
                      </p>
                      <p className="text-sm text-amber-600">
                        O tipo de conta determina suas permissões no sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-3">
                    <LogOut className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 mb-2">Encerrar Sessão</h4>
                      <p className="text-sm text-red-700 mb-4">
                        Desconecte-se da sua conta no Delivery Club.
                        Você precisará fazer login novamente para acessar o sistema.
                      </p>
                      <Button
                        onClick={handleLogout}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
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
