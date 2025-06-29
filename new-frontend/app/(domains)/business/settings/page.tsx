'use client';

import { useRequireAuth } from '@/lib/auth';
import { useEffect } from 'react';

export default function BusinessSettingsPage(): JSX.Element | null {
  const authData = useRequireAuth();

  useEffect(() => {
    // Carregar configurações da empresa
  }, []);

  if (!authData) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configurações da Empresa</h1>
      </div>

      <div className="grid gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Informações Gerais</h2>
          </div>
          <div className="card-content">
            <form className="space-y-4">
              <div>
                <label className="label" htmlFor="companyName">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="companyName"
                  className="input"
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div>
                <label className="label" htmlFor="businessType">
                  Tipo de Negócio
                </label>
                <select id="businessType" className="input">
                  <option value="">Selecione o tipo de negócio</option>
                  <option value="restaurant">Restaurante</option>
                  <option value="store">Loja</option>
                  <option value="service">Serviço</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor="address">
                  Endereço
                </label>
                <textarea
                  id="address"
                  className="input min-h-[100px]"
                  placeholder="Endereço completo"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Configurações de Notificação</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificações por Email</h3>
                  <p className="text-sm text-gray-500">Receba atualizações importantes por email</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificações Push</h3>
                  <p className="text-sm text-gray-500">Receba notificações em tempo real</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Zona de Perigo</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-600">Desativar Conta</h3>
                <p className="text-sm text-gray-500">
                  Temporariamente desative sua conta. Você pode reativá-la a qualquer momento.
                </p>
                <button className="btn btn-outline mt-4 border-red-600 text-red-600 hover:bg-red-50">
                  Desativar Conta
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
