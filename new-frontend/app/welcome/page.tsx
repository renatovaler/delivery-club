'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/ui/Button';

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/customer-dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-3xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Bem-vindo ao Sistema de Assinaturas
        </h1>
        
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Gerencie suas assinaturas, acompanhe entregas e mantenha o controle de seus serviços em um só lugar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push('/login')}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg text-lg"
          >
            Entrar na sua conta
          </Button>
          
          <Button
            onClick={() => router.push('/register')}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-lg text-lg"
          >
            Criar nova conta
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Gestão Simplificada
            </h3>
            <p className="text-slate-600">
              Controle todas as suas assinaturas em uma única interface intuitiva.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Acompanhamento em Tempo Real
            </h3>
            <p className="text-slate-600">
              Monitore entregas e status dos serviços com atualizações instantâneas.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Suporte Dedicado
            </h3>
            <p className="text-slate-600">
              Conte com nossa equipe para ajudar em qualquer necessidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
