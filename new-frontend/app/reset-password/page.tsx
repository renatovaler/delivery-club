'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../../components/ui/use-toast';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import apiClient from '../../lib/apiClient';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Obter o token da URL
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: 'Erro',
        description: 'Token de redefinição inválido',
        variant: 'destructive',
      });
      return;
    }

    if (password !== passwordConfirmation) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast({
        title: 'Senha redefinida',
        description: 'Sua senha foi alterada com sucesso',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível redefinir sua senha',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Link inválido
          </h1>
          <p className="text-slate-600 mb-6">
            Este link de redefinição de senha é inválido ou expirou.
          </p>
          <Button
            onClick={() => router.push('/forgot-password')}
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            Solicitar novo link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Redefinir senha
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar nova senha
            </label>
            <input
              id="password_confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
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
                <LoadingSpinner size="sm" light />
                <span className="ml-2">Redefinindo senha...</span>
              </div>
            ) : (
              'Redefinir senha'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
