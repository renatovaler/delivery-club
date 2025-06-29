'use client';

import { useRequireAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function CustomersPage(): void {
  const authData = useRequireAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (!authData)  {return null;

  if (loading) { {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='border-primary h-32 w-32 animate-spin rounded-full border-b-2'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Gestão de Clientes</h1>
        <button className='btn btn-primary'>Adicionar Cliente</button>
      </div>

      <div className='card'>
        <div className='card-header'>
          <h2 className='text-xl font-semibold'>Lista de Clientes</h2>
        </div>
        <div className='card-content'>
          <p className='text-gray-600'>
            Aqui você pode gerenciar todos os seus clientes, visualizar histórico de pedidos e
            status de assinaturas.
          </p>

          <div className='mt-6 space-y-4'>
            <div className='rounded-lg border p-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='font-semibold'>João Silva</h3>
                  <p className='text-sm text-gray-600'>joao@email.com</p>
                  <p className='text-sm text-gray-600'>(11) 99999-9999</p>
                </div>
                <span className='badge badge-primary'>Ativo</span>
              </div>
              <div className='mt-2 text-sm text-gray-500'>
                15 pedidos • Último pedido: 20/12/2024
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='font-semibold'>Maria Santos</h3>
                  <p className='text-sm text-gray-600'>maria@email.com</p>
                  <p className='text-sm text-gray-600'>(11) 88888-8888</p>
                </div>
                <span className='badge badge-secondary'>Inativo</span>
              </div>
              <div className='mt-2 text-sm text-gray-500'>
                8 pedidos • Último pedido: 15/12/2024
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <div className='card'>
          <div className='card-content'>
            <div className='text-2xl font-bold text-green-600'>12</div>
            <div className='text-sm text-gray-500'>Clientes Ativos</div>
          </div>
        </div>
        <div className='card'>
          <div className='card-content'>
            <div className='text-2xl font-bold text-blue-600'>156</div>
            <div className='text-sm text-gray-500'>Total de Pedidos</div>
          </div>
        </div>
        <div className='card'>
          <div className='card-content'>
            <div className='text-2xl font-bold text-purple-600'>3</div>
            <div className='text-sm text-gray-500'>Pendentes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
