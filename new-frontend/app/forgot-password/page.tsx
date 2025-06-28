'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '../../components/ui/use-toast';
import { Button } from '../../components/ui/Button';
import apiClient from '../../lib/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setEmailSent(true);
      toast({
        title: 'Email enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o email de recuperação',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Email enviado!
          </h1>
          <p className="text-slate-600 mb-6">
            Enviamos instruções para redefinir sua senha para {email}. 
            Verifique sua caixa de entrada.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Recuperar senha
        </h1>

        <p className="text-slate-600 mb-6 text-center">
          Digite seu email e enviaremos instruções para redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span className="ml-2">Enviando...</span>
              </div>
            ) : (
              'Enviar instruções'
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Lembrou sua senha?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
