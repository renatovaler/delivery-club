'use client';

import { useRequireAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function CustomerSupportPage(): void {
  const authData = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');

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
        <h1 className='text-3xl font-bold'>Suporte ao Cliente</h1>
        <button className='btn btn-primary'>Novo Ticket</button>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'tickets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Meus Tickets
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'faq'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === 'contact'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Contato
          </button>
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'tickets' && (
        <div className='space-y-4'>
          <div className='card'>
            <div className='card-header'>
              <h2 className='text-xl font-semibold'>Tickets de Suporte</h2>
            </div>
            <div className='card-content'>
              <div className='space-y-4'>
                <div className='rounded-lg border p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-semibold'>#TICK001 - Problema com entrega</h3>
                      <p className='text-sm text-gray-600'>
                        Minha entrega não chegou no horário previsto...
                      </p>
                      <p className='mt-1 text-xs text-gray-500'>Criado em: 25/12/2024 às 14:30</p>
                    </div>
                    <span className='badge bg-yellow-500 text-white'>Em Andamento</span>
                  </div>
                  <div className='mt-3 flex space-x-2'>
                    <button className='btn btn-outline btn-sm'>Ver Detalhes</button>
                    <button className='btn btn-primary btn-sm'>Responder</button>
                  </div>
                </div>

                <div className='rounded-lg border p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-semibold'>#TICK002 - Dúvida sobre cobrança</h3>
                      <p className='text-sm text-gray-600'>
                        Gostaria de entender melhor a cobrança do mês...
                      </p>
                      <p className='mt-1 text-xs text-gray-500'>Criado em: 23/12/2024 às 10:15</p>
                    </div>
                    <span className='badge badge-secondary'>Resolvido</span>
                  </div>
                  <div className='mt-3 flex space-x-2'>
                    <button className='btn btn-outline btn-sm'>Ver Detalhes</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className='space-y-4'>
          <div className='card'>
            <div className='card-header'>
              <h2 className='text-xl font-semibold'>Perguntas Frequentes</h2>
            </div>
            <div className='card-content'>
              <div className='space-y-4'>
                <div className='border-b pb-4'>
                  <h3 className='mb-2 font-semibold'>Como funciona a entrega?</h3>
                  <p className='text-gray-600'>
                    Nossas entregas são realizadas de segunda a sábado, nos horários de 8h às 18h.
                    Você pode acompanhar o status da sua entrega em tempo real através do nosso
                    sistema.
                  </p>
                </div>

                <div className='border-b pb-4'>
                  <h3 className='mb-2 font-semibold'>Como alterar minha assinatura?</h3>
                  <p className='text-gray-600'>
                    Você pode alterar sua assinatura a qualquer momento através da página 'Minhas
                    Assinaturas'. As alterações entram em vigor no próximo ciclo de cobrança.
                  </p>
                </div>

                <div className='border-b pb-4'>
                  <h3 className='mb-2 font-semibold'>Como cancelar minha assinatura?</h3>
                  <p className='text-gray-600'>
                    Para cancelar sua assinatura, acesse 'Minhas Assinaturas' e clique em
                    'Cancelar'. Você continuará recebendo os produtos até o final do período já
                    pago.
                  </p>
                </div>

                <div className='border-b pb-4'>
                  <h3 className='mb-2 font-semibold'>Qual é a política de reembolso?</h3>
                  <p className='text-gray-600'>
                    Oferecemos reembolso total em caso de produtos danificados ou não entregues.
                    Entre em contato conosco em até 24h após a entrega.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className='space-y-4'>
          <div className='card'>
            <div className='card-header'>
              <h2 className='text-xl font-semibold'>Entre em Contato</h2>
            </div>
            <div className='card-content'>
              <form className='space-y-4'>
                <div>
                  <label className='label' htmlFor='subject'>
                    Assunto
                  </label>
                  <select id='subject' className='input'>
                    <option value=''>Selecione o assunto</option>
                    <option value='delivery'>Problema com entrega</option>
                    <option value='billing'>Dúvida sobre cobrança</option>
                    <option value='product'>Problema com produto</option>
                    <option value='subscription'>Alteração de assinatura</option>
                    <option value='other'>Outro</option>
                  </select>
                </div>

                <div>
                  <label className='label' htmlFor='priority'>
                    Prioridade
                  </label>
                  <select id='priority' className='input'>
                    <option value='low'>Baixa</option>
                    <option value='medium'>Média</option>
                    <option value='high'>Alta</option>
                    <option value='urgent'>Urgente</option>
                  </select>
                </div>

                <div>
                  <label className='label' htmlFor='message'>
                    Mensagem
                  </label>
                  <textarea
                    id='message'
                    className='input min-h-[120px]'
                    placeholder='Descreva seu problema ou dúvida...'
                  />
                </div>

                <div>
                  <label className='label' htmlFor='attachment'>
                    Anexar arquivo (opcional)
                  </label>
                  <input
                    type='file'
                    id='attachment'
                    className='input'
                    accept='image/*,.pdf,.doc,.docx'
                  />
                </div>

                <button type='submit' className='btn btn-primary'>
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='card'>
              <div className='card-content'>
                <h3 className='mb-2 font-semibold'>Telefone</h3>
                <p className='text-gray-600'>(11) 3000-0000</p>
                <p className='text-sm text-gray-500'>Segunda a Sexta, 8h às 18h</p>
              </div>
            </div>

            <div className='card'>
              <div className='card-content'>
                <h3 className='mb-2 font-semibold'>Email</h3>
                <p className='text-gray-600'>suporte@empresa.com</p>
                <p className='text-sm text-gray-500'>Resposta em até 24h</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
