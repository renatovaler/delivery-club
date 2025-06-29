'use client';

import { useRequireAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function DeliveryManagementPage(): void {
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
        <h1 className='text-3xl font-bold'>Gestão de Entregas</h1>
        <button className='btn btn-primary'>Nova Entrega</button>
      </div>

      {/* Status das Entregas */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='card'>
          <div className='card-content'>
            <div className='text-2xl font-bold text-blue-600'>8</div>
            <div className='text-sm text-gray-500'>Pendentes</div>
          </div>
        </div>
        <div className='card'>
          <div className='card-content'>
            <div className='text-2xl font-bold text-yellow-600'>5</div>
            <div className='text-sm text-gray-500'>Em Rota</div>
          </div>
        </div>
        <div className='card'>
          <div className='card-content'>
            <div className='text-2xl font-bold text-green-600'>23</div>
            <div className='text-sm text-gray-500'>Entregues</div>
          </div>
        </div>
        <div className='card'>
          <div className='card-content'>
            <div className='text-2xl font-bold text-red-600'>2</div>
            <div className='text-sm text-gray-500'>Problemas</div>
          </div>
        </div>
      </div>

      {/* Lista de Entregas */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-xl font-semibold'>Entregas de Hoje</h2>
        </div>
        <div className='card-content'>
          <div className='space-y-4'>
            <div className='rounded-lg border p-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='font-semibold'>#ENT001 - João Silva</h3>
                  <p className='text-sm text-gray-600'>Rua das Flores, 123 - Vila Nova</p>
                  <p className='text-sm text-gray-600'>Produtos: Frutas e Verduras</p>
                </div>
                <span className='badge bg-yellow-500 text-white'>Em Rota</span>
              </div>
              <div className='mt-2 flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Previsão: 14:30</span>
                <div className='space-x-2'>
                  <button className='btn btn-outline btn-sm'>Rastrear</button>
                  <button className='btn btn-primary btn-sm'>Confirmar</button>
                </div>
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='font-semibold'>#ENT002 - Maria Santos</h3>
                  <p className='text-sm text-gray-600'>Av. Principal, 456 - Centro</p>
                  <p className='text-sm text-gray-600'>Produtos: Carnes e Laticínios</p>
                </div>
                <span className='badge badge-primary'>Pendente</span>
              </div>
              <div className='mt-2 flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Agendado: 16:00</span>
                <div className='space-x-2'>
                  <button className='btn btn-outline btn-sm'>Editar</button>
                  <button className='btn btn-primary btn-sm'>Iniciar</button>
                </div>
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='font-semibold'>#ENT003 - Carlos Oliveira</h3>
                  <p className='text-sm text-gray-600'>Rua do Comércio, 789 - Jardim</p>
                  <p className='text-sm text-gray-600'>Produtos: Bebidas e Snacks</p>
                </div>
                <span className='badge badge-secondary'>Entregue</span>
              </div>
              <div className='mt-2 flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Entregue às: 13:45</span>
                <div className='space-x-2'>
                  <button className='btn btn-outline btn-sm'>Ver Detalhes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa de Entregas */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-xl font-semibold'>Mapa de Entregas</h2>
        </div>
        <div className='card-content'>
          <div className='flex h-64 items-center justify-center rounded-lg bg-gray-100'>
            <p className='text-gray-500'>Mapa de entregas será carregado aqui</p>
          </div>
        </div>
      </div>

      {/* Configurações de Entrega */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-xl font-semibold'>Configurações de Entrega</h2>
        </div>
        <div className='card-content'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div>
              <label className='label' htmlFor='deliveryTime'>
                Horário de Entrega
              </label>
              <select id='deliveryTime' className='input'>
                <option value='morning'>Manhã (8h - 12h)</option>
                <option value='afternoon'>Tarde (13h - 17h)</option>
                <option value='evening'>Noite (18h - 22h)</option>
              </select>
            </div>
            <div>
              <label className='label' htmlFor='deliveryRadius'>
                Raio de Entrega (km)
              </label>
              <input
                type='number'
                id='deliveryRadius'
                className='input'
                placeholder='Ex: 10'
                min='1'
                max='50'
              />
            </div>
            <div>
              <label className='label' htmlFor='deliveryFee'>
                Taxa de Entrega (R$)
              </label>
              <input
                type='number'
                id='deliveryFee'
                className='input'
                placeholder='Ex: 5.00'
                step='0.01'
                min='0'
              />
            </div>
            <div>
              <label className='label' htmlFor='minOrder'>
                Pedido Mínimo (R$)
              </label>
              <input
                type='number'
                id='minOrder'
                className='input'
                placeholder='Ex: 30.00'
                step='0.01'
                min='0'
              />
            </div>
          </div>
          <div className='mt-6'>
            <button className='btn btn-primary'>Salvar Configurações</button>
          </div>
        </div>
      </div>
    </div>
  );
}
