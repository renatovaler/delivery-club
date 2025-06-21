import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingBasket, User as UserIcon, ArrowRight, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Onboarding() {
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
            } catch (error) {
                console.error("Erro ao buscar usuário para onboarding:", error);
            }
        };
        fetchUser();
    }, []);

    const handleSelectRole = (role) => {
        setSelectedRole(role);
    };

    const handleSubmit = async () => {
        if (!selectedRole) {
            toast({ title: 'Selecione um perfil', description: 'Você precisa escolher entre ser uma empresa ou um cliente.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            await User.updateMyUserData({
                user_type: selectedRole === 'business' ? 'business_owner' : 'customer'
            });
            
            toast({ 
                title: 'Perfil selecionado!', 
                description: selectedRole === 'business' 
                    ? 'Agora vamos configurar os detalhes da sua empresa.' 
                    : 'Seu perfil de cliente foi configurado com sucesso!'
            });
            
            // Recarrega a página para que o componente Layout possa direcionar
            // para o wizard da empresa ou para o dashboard do cliente.
            window.location.reload();

        } catch (error) {
            console.error("Erro ao configurar perfil:", error);
            toast({ title: 'Erro', description: 'Não foi possível salvar seu perfil. Tente novamente.', variant: 'destructive' });
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <div className="animate-pulse text-amber-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl mx-auto"
            >
                <Card className="shadow-2xl border-amber-200">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <ShoppingBasket className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-amber-900">Bem-vindo(a) ao Delivery Club!</CardTitle>
                        <CardDescription className="text-lg text-amber-600">Para começar, diga-nos quem você é.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <h3 className="text-xl font-semibold text-center text-amber-800 mb-6">Eu sou...</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <Card 
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedRole === 'business' ? 'border-amber-500 border-2 shadow-xl' : 'border-amber-200'}`}
                                onClick={() => handleSelectRole('business')}
                            >
                                <CardContent className="p-6 text-center">
                                    <Building className="w-12 h-12 text-amber-500 mx-auto mb-4"/>
                                    <h4 className="text-lg font-bold text-amber-900">Uma Empresa</h4>
                                    <p className="text-sm text-amber-600">Quero vender e gerenciar assinaturas.</p>
                                </CardContent>
                            </Card>
                            <Card 
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${selectedRole === 'customer' ? 'border-amber-500 border-2 shadow-xl' : 'border-amber-200'}`}
                                onClick={() => handleSelectRole('customer')}
                            >
                                <CardContent className="p-6 text-center">
                                    <UserIcon className="w-12 h-12 text-amber-500 mx-auto mb-4"/>
                                    <h4 className="text-lg font-bold text-amber-900">Um Cliente</h4>
                                    <p className="text-sm text-amber-600">Quero assinar e receber produtos em casa.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Button 
                            onClick={handleSubmit} 
                            disabled={!selectedRole || isSaving} 
                            className="w-full h-12 text-lg bg-amber-600 hover:bg-amber-700"
                        >
                            {isSaving ? 'Salvando...' : 'Continuar'}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}